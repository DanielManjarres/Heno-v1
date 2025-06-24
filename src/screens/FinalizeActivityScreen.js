import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ImageBackground, Image, TextInput, Modal } from 'react-native';
import { getActivityDetails, finalizeActivity, cancelActivity } from '../services/dbService';
import { useUser } from './UserContext';

const FinalizeActivityScreen = ({ navigation, route }) => {
  const { activityId } = route.params; // Mantenemos activityId porque es específico de la actividad
  const { user } = useUser();
  const { userId, username, role } = user || {};
  const [activity, setActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState('0h 0m');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filasHileradas, setFilasHileradas] = useState('');
  const [pacasHeno, setPacasHeno] = useState('');

  useEffect(() => {
    if (!user) return; // No hacemos fetch si no hay usuario logueado

    if (role !== 'Administrador') {
      Alert.alert('Acceso Denegado', 'Solo los administradores pueden finalizar actividades.');
      navigation.goBack();
      return;
    }

    const fetchActivity = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Obteniendo detalles de la actividad con ID_registro:', activityId);
        const selectedActivity = await getActivityDetails(activityId);
        if (selectedActivity.Estado !== 'En curso') {
          throw new Error('La actividad no está en curso y no puede ser finalizada.');
        }
        setActivity(selectedActivity);
      } catch (err) {
        console.log('Error al cargar actividad:', err);
        setError('No se pudo cargar la actividad: ' + err.message);
        Alert.alert('Error', 'No se pudo cargar la actividad: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
  }, [activityId, role]);

  useEffect(() => {
    if (activity && activity.Estado === 'En curso') {
      const interval = setInterval(() => {
        const startDateTime = new Date(`${activity.Fecha}T${activity.Hora_inicio}`);
        const now = new Date();
        const diffMs = now - startDateTime;
        const diffMins = Math.floor(diffMs / 1000 / 60);
        const hours = Math.floor(diffMins / 60);
        const minutes = diffMins % 60;
        setDuration(`${hours}h ${minutes}m`);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activity]);

  const handleFinalizeActivity = async () => {
    if (activity.ID_actividad === 3) {
      if (!filasHileradas || isNaN(filasHileradas) || parseInt(filasHileradas) <= 0) {
        Alert.alert('Error', 'Por favor, ingresa un número válido de filas hileradas.');
        return;
      }
    }

    if (activity.ID_actividad === 4) {
      if (!pacasHeno || isNaN(pacasHeno) || parseInt(pacasHeno) <= 0) {
        Alert.alert('Error', 'Por favor, ingresa un número válido de pacas de heno.');
        return;
      }
    }

    try {
      console.log('Finalizando actividad con ID:', activity.ID_registro);
      const filas = activity.ID_actividad === 3 ? parseInt(filasHileradas) || 0 : 0;
      const pacas = activity.ID_actividad === 4 ? parseInt(pacasHeno) || 0 : 0;
      await finalizeActivity(activity.ID_registro, filas, pacas);

      let successMessage = 'Actividad finalizada correctamente.';
      if (activity.ID_actividad === 3) {
        successMessage = `Actividad finalizada. Filas hileradas: ${filasHileradas}`;
      } else if (activity.ID_actividad === 4) {
        successMessage = `Actividad finalizada. Pacas de heno: ${pacasHeno}`;
      }

      Alert.alert('Éxito', successMessage, [
        {
          text: 'OK',
          onPress: () => {
            setIsModalVisible(false);
            setFilasHileradas('');
            setPacasHeno('');
            navigation.navigate('SelectActivityScreen'); // Ya no pasamos userId, username, role
          },
        },
      ]);
    } catch (err) {
      console.log('Error al finalizar actividad:', err);
      Alert.alert('Error', 'No se pudo finalizar la actividad: ' + err.message);
    }
  };

  const handleCancelActivity = async () => {
    Alert.alert(
      'Confirmar Cancelación',
      '¿Estás seguro de que deseas cancelar esta actividad?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí',
          onPress: async () => {
            try {
              await cancelActivity(activity.ID_registro);
              Alert.alert('Éxito', 'Actividad cancelada correctamente.', [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.navigate('SelectActivityScreen'); // Ya no pasamos userId, username, role
                  },
                },
              ]);
            } catch (err) {
              Alert.alert('Error', 'No se pudo cancelar la actividad: ' + err.message);
            }
          },
        },
      ]
    );
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'No disponible';
    const date = new Date(`1970-01-01T${timeString}`);
    if (isNaN(date.getTime())) return 'No disponible';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se ha iniciado sesión. Por favor, inicia sesión.</Text>
        <TouchableOpacity
          style={styles.finalizeButton}
          onPress={() => navigation.navigate('LoginScreen')}
        >
          <Text style={styles.buttonText}>Ir a Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <ImageBackground source={require('../../assets/images/background1.jpg')} style={styles.background}>
        <View style={styles.header}>
          <Image source={require('../../assets/images/Logo.png')} style={styles.logo} />
          <Text style={styles.headerText}>Heno 1.0</Text>
          <Text style={styles.username}>{username}</Text>
        </View>
        <View style={styles.container}>
          <Text style={styles.title}>Finalizar Actividad</Text>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </ImageBackground>
    );
  }

  if (error) {
    return (
      <ImageBackground source={require('../../assets/images/background1.jpg')} style={styles.background}>
        <View style={styles.header}>
          <Image source={require('../../assets/images/Logo.png')} style={styles.logo} />
          <Text style={styles.headerText}>Eco Comercial SAS</Text>
          <Text style={styles.username}>{username}</Text>
        </View>
        <View style={styles.container}>
          <Text style={styles.title}>Finalizar Actividad</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </ImageBackground>
    );
  }

  if (!activity) {
    return (
      <ImageBackground source={require('../../assets/images/background1.jpg')} style={styles.background}>
        <View style={styles.header}>
          <Image source={require('../../assets/images/Logo.png')} style={styles.logo} />
          <Text style={styles.headerText}>Eco Comercial SAS</Text>
          <Text style={styles.username}>{username}</Text>
        </View>
        <View style={styles.container}>
          <Text style={styles.title}>Finalizar Actividad</Text>
          <Text style={styles.errorText}>Actividad no encontrada.</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require('../../assets/images/background1.jpg')} style={styles.background}>
      <View style={styles.header}>
        <Image source={require('../../assets/images/Logo.png')} style={styles.logo} />
        <Text style={styles.headerText}>Eco Comercial SAS</Text>
        <Text style={styles.username}>{username}</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Finalizar Actividad</Text>
        <View style={styles.activityContainer}>
          <Text style={styles.activityLabel}>{activity.Nombre_actividad}</Text>
          <Text style={styles.activityDetail}>Trabajador: {activity.Nombre_usuario}</Text>
          <Text style={styles.activityDetail}>Ubicación: {activity.Ubicacion}</Text>
          <Text style={styles.activityDetail}>Máquina: {activity.Maquina}</Text>
          <Text style={styles.activityDetail}>Área: {activity.Area}mt2</Text>
          <Text style={styles.activityDetail}>Hora de inicio: {formatTime(activity.Hora_inicio)}</Text>
          <Text style={styles.activityDetail}>Tiempo de duración: {duration}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.finalizeButton}
              onPress={() => setIsModalVisible(true)}
            >
              <Text style={styles.buttonText}>Finalizar actividad</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelActivity}
            >
              <Text style={styles.buttonText}>Cancelar actividad</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Finalizar Actividad</Text>
            {activity.ID_actividad === 3 && (
              <>
                <Text style={styles.modalLabel}>Filas hileradas:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={filasHileradas}
                  onChangeText={setFilasHileradas}
                  keyboardType="numeric"
                  placeholder="Ingresa el número de filas hileradas"
                />
              </>
            )}
            {activity.ID_actividad === 4 && (
              <>
                <Text style={styles.modalLabel}>Pacas de heno:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={pacasHeno}
                  onChangeText={setPacasHeno}
                  keyboardType="numeric"
                  placeholder="Ingresa el número de pacas de heno"
                />
              </>
            )}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={handleFinalizeActivity}>
                <Text style={styles.modalButtonText}>Finalizar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

// Estilos (sin cambios, ya que finalizeButton y buttonText ya están definidos)
const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  headerText: {
    fontFamily: 'timesbd',
    fontSize: 20,
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  username: {
    fontFamily: 'timesbd',
    fontSize: 16,
    color: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 20,
    borderRadius: 10,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'timesbd',
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  activityContainer: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  activityLabel: {
    fontFamily: 'timesbd',
    fontSize: 18,
    color: '#2E7D32',
    marginBottom: 10,
  },
  activityDetail: {
    fontFamily: 'times',
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  finalizeButton: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#D32F2F',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'timesbd',
    color: '#fff',
    fontSize: 16,
  },
  loadingText: {
    fontFamily: 'timesbd',
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'timesbd',
    fontSize: 18,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontFamily: 'timesbd',
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalLabel: {
    fontFamily: 'timesbd',
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontFamily: 'times',
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#D32F2F',
    marginRight: 0,
  },
  modalButtonText: {
    fontFamily: 'timesbd',
    color: '#fff',
    fontSize: 16,
  },
});

export default FinalizeActivityScreen;