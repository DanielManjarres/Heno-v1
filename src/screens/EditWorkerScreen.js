import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground, Image, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { updateWorker, deleteWorker, getLocations } from '../services/dbService';
import { useUser } from './UserContext';

const EditWorkerScreen = ({ route, navigation }) => {
  const { worker } = route.params;
  const { user } = useUser();
  const { userId, role } = user || {};

  const [nombre, setNombre] = useState(worker.Nombre || '');
  const [apellido, setApellido] = useState(worker.Apellido || '');
  const [fechaNacimiento, setFechaNacimiento] = useState(worker.Fecha_nacimiento || ''); // Cambiado de Edad
  const [identificacion, setIdentificacion] = useState(worker.Identificacion || '');
  const [idUbicacion, setIdUbicacion] = useState(worker.ID_ubicacion?.toString() || ''); // Cambiado de ubicacion
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await getLocations();
        setLocations(data);
      } catch (err) {
        setError('Error al cargar ubicaciones: ' + err.message);
      }
    };
    fetchLocations();
  }, []);

  const handleUpdate = async () => {
    if (!nombre.trim() || !apellido.trim()) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios (Nombre, Apellido).');
      return;
    }

    const updatedWorker = {
      Nombre: nombre.trim(),
      Apellido: apellido.trim(),
      Fecha_nacimiento: fechaNacimiento === worker.Fecha_nacimiento ? worker.Fecha_nacimiento : (fechaNacimiento ? fechaNacimiento : null), // Reemplaza Edad
      Identificacion: identificacion === worker.Identificacion ? worker.Identificacion : (identificacion ? identificacion.trim() : null),
      Ubicacion: parseInt(idUbicacion), // Asegura que sea ID_ubicacion
    };

    try {
      const success = await updateWorker(worker.ID_usuario, updatedWorker);
      if (success) {
        Alert.alert('Éxito', 'Trabajador actualizado correctamente');
      } else {
        Alert.alert('Error', 'No se pudo actualizar el trabajador');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al actualizar el trabajador: ' + error.message);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este trabajador?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteWorker(worker.ID_usuario);
              if (success) {
                Alert.alert('Éxito', 'Trabajador eliminado correctamente', [
                  { text: 'OK', onPress: () => navigation.navigate('WorkerManagementScreen', { userId, role }) },
                ]);
              } else {
                Alert.alert('Error', 'No se pudo eliminar el trabajador');
              }
            } catch (error) {
              Alert.alert('Error', 'Error al eliminar el trabajador: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const handleBackToMenu = () => navigation.navigate('HomeScreen');

  return (
    <ImageBackground source={require('../../assets/images/background3.jpg')} style={styles.background}>
      <View style={styles.header}>
        <Image source={require('../../assets/images/Logo.png')} style={styles.logo} />
        <Text style={styles.headerText}>Heno 1.0</Text>
      </View>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Editar Trabajador</Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <Text style={styles.label}>Nombre:</Text>
          <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
          <Text style={styles.label}>Apellido:</Text>
          <TextInput style={styles.input} placeholder="Apellido" value={apellido} onChangeText={setApellido} />
          <Text style={styles.label}>Fecha de Nacimiento (YYYY-MM-DD):</Text>
          <TextInput style={styles.input} placeholder="Ej: 1990-01-01" value={fechaNacimiento} onChangeText={setFechaNacimiento} />
          <Text style={styles.label}>Identificación:</Text>
          <TextInput style={styles.input} placeholder="Identificación (opcional)" value={identificacion} onChangeText={setIdentificacion} />
          <Text style={styles.label}>Ubicación:</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={idUbicacion} onValueChange={(itemValue) => setIdUbicacion(itemValue)} style={styles.picker}>
              <Picker.Item label="Selecciona una ubicación" value="" />
              {locations.map((location) => <Picker.Item key={location.ID_ubicacion} label={location.Nombre} value={location.ID_ubicacion.toString()} />)}
            </Picker>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleUpdate}>
              <Text style={styles.buttonText}>Guardar Cambios</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
              <Text style={styles.buttonText}>Eliminar Trabajador</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToMenu}>
            <Text style={styles.buttonText}>Volver al Menú</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  header: {
    backgroundColor: '#2E7D32',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 5,
  },
  logo: { width: 50, height: 50, resizeMode: 'contain' },
  headerText: {
    fontFamily: 'timesbd',
    fontSize: 22,
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  container: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 15,
    marginVertical: 20,
    borderRadius: 15,
    elevation: 5,
  },
  title: {
    fontFamily: 'timesbd',
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
    color: '#2E7D32',
  },
  label: {
    fontFamily: 'timesbd',
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    fontFamily: 'times',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  picker: {
    fontFamily: 'times',
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    elevation: 3,
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
    marginRight: 0,
  },
  backButton: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    marginBottom: 20,
  },
  buttonText: {
    fontFamily: 'timesbd',
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    fontFamily: 'timesbd',
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
});

export default EditWorkerScreen;