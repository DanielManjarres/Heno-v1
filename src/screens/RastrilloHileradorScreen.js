import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { getLastActivity, getUserLocation, startActivity } from '../services/dbService';
import { useUser } from './UserContext';

const RastrilloHileradorScreen = ({ navigation }) => {
  const { user } = useUser();
  const { userId, username, role } = user || {};
  const [location, setLocation] = useState(null);
  const [lastActivity, setLastActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState('0h 0m');
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return; // No hacemos fetch si no hay usuario logueado

      try {
        setIsLoading(true);
        setError(null);

        console.log('Obteniendo ubicación del usuario con ID:', userId);
        const userLocation = await getUserLocation(userId);
        console.log('Ubicación del usuario cargada:', userLocation);
        setLocation(userLocation);

        console.log('Obteniendo último registro de actividad para ID_actividad: 3 y ID_trabajador:', userId);
        const activity = await getLastActivity(3, userId, 'En curso');
        console.log('Última actividad cargada:', activity);
        setLastActivity(activity);
      } catch (err) {
        console.log('Error al cargar datos:', err);
        setError('No se pudieron cargar los datos: ' + err.message);
        Alert.alert('Error', 'No se pudieron cargar los datos: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  useEffect(() => {
    if (lastActivity && lastActivity.Estado === 'En curso') {
      const interval = setInterval(() => {
        const startDateTime = new Date(`${lastActivity.Fecha}T${lastActivity.Hora_inicio}`);
        const now = new Date();
        const diffMs = now - startDateTime;
        const diffMins = Math.floor(diffMs / 1000 / 60);
        const hours = Math.floor(diffMins / 60);
        const minutes = diffMins % 60;
        setDuration(`${hours}h ${minutes}m`);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [lastActivity]);

  const handleStartActivity = async () => {
    if (isStarting) return;
    setIsStarting(true);

    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

      console.log('Iniciando actividad con:', {
        activityId: 3,
        userId,
        locationId: location.ID_ubicacion,
        date: currentDate,
        time: currentTime,
      });

      const result = await startActivity(3, userId, location.ID_ubicacion, currentDate, currentTime);
      console.log('Resultado de iniciar actividad:', result);

      Alert.alert('Éxito', 'Actividad iniciada correctamente.');

      console.log('Obteniendo última actividad después de iniciar para ID_actividad: 3 y ID_trabajador:', userId);
      const activity = await getLastActivity(3, userId, 'En curso');
      console.log('Última actividad después de iniciar:', activity);
      setLastActivity(activity);
    } catch (err) {
      console.log('Error al iniciar actividad:', err);
      Alert.alert('Error', 'No se pudo iniciar la actividad: ' + err.message);
    } finally {
      setIsStarting(false);
    }
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
          style={styles.startButton}
          onPress={() => navigation.navigate('LoginScreen')}
        >
          <Text style={styles.buttonText}>Ir a Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <ImageBackground
        source={require('../../assets/images/background1.jpg')}
        style={styles.background}
      >
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/Logo.png')}
            style={styles.logo}
          />
          <Text style={styles.headerText}>Eco Comercial SAS</Text>
          <Text style={styles.username}>{username}</Text>
        </View>
        <View style={styles.container}>
          <Text style={styles.title}>Actividades</Text>
          <Text style={styles.subtitle}>RASTRILLO HILERADOR</Text>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </ImageBackground>
    );
  }

  if (error) {
    return (
      <ImageBackground
        source={require('../../assets/images/background1.jpg')}
        style={styles.background}
      >
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/Logo.png')}
            style={styles.logo}
          />
          <Text style={styles.headerText}>Heno 1.0</Text>
          <Text style={styles.username}>{username}</Text>
        </View>
        <View style={styles.container}>
          <Text style={styles.title}>Actividades</Text>
          <Text style={styles.subtitle}>RASTRILLO HILERADOR</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </ImageBackground>
    );
  }

  if (!location) {
    return (
      <ImageBackground
        source={require('../../assets/images/background1.jpg')}
        style={styles.background}
      >
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/Logo.png')}
            style={styles.logo}
          />
          <Text style={styles.headerText}>Heno 1.0</Text>
          <Text style={styles.username}>{username}</Text>
        </View>
        <View style={styles.container}>
          <Text style={styles.title}>Actividades</Text>
          <Text style={styles.subtitle}>RASTRILLO HILERADOR</Text>
          <Text style={styles.errorText}>No se encontró la ubicación del usuario.</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background1.jpg')}
      style={styles.background}
    >
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/Logo.png')}
          style={styles.logo}
        />
        <Text style={styles.headerText}>Heno 1.0</Text>
        <Text style={styles.username}>{username}</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Actividades</Text>
        <Text style={styles.subtitle}>RASTRILLO HILERADOR</Text>
        <View style={styles.activityContainer}>
          <Text style={styles.activityLabel}>Área:</Text>
          <Text style={styles.activityValue}>{location.Area}mt2</Text>

          {lastActivity && lastActivity.Estado === 'En curso' ? (
            <>
              <Text style={styles.activityLabel}>Hora de inicio:</Text>
              <Text style={styles.activityValue}>{formatTime(lastActivity.Hora_inicio)}</Text>

              <Text style={styles.activityLabel}>Hora de fin:</Text>
              <Text style={styles.activityValue}>
                {lastActivity.Hora_fin ? formatTime(lastActivity.Hora_fin) : 'No disponible'}
              </Text>

              <Text style={styles.activityLabel}>Tiempo de duración:</Text>
              <Text style={styles.activityValue}>{duration}</Text>

              <Text style={styles.activityLabel}>Filas hileradas:</Text>
              <Text style={styles.activityValue}>
                {lastActivity.Filas_hileradas ? lastActivity.Filas_hileradas : 'No disponible'}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.activityLabel}>Hora de inicio:</Text>
              <Text style={styles.activityValue}>No disponible</Text>

              <Text style={styles.activityLabel}>Hora de fin:</Text>
              <Text style={styles.activityValue}>No disponible</Text>

              <Text style={styles.activityLabel}>Tiempo de duración:</Text>
              <Text style={styles.activityValue}>No disponible</Text>

              <Text style={styles.activityLabel}>Filas hileradas:</Text>
              <Text style={styles.activityValue}>No disponible</Text>

              <TouchableOpacity
                style={[styles.startButton, isStarting && styles.disabledButton]}
                onPress={handleStartActivity}
                disabled={isStarting}
              >
                <Text style={styles.buttonText}>
                  {isStarting ? 'Iniciando...' : 'Comenzar actividad'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ImageBackground>
  );
};

// Estilos (sin cambios, ya que startButton y buttonText ya están definidos)
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
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontFamily: 'timesbd',
    fontSize: 18,
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
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  activityValue: {
    fontFamily: 'times',
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  startButton: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
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
});

export default RastrilloHileradorScreen;