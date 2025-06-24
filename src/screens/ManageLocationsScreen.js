import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Image, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getLocations, addLocation, deleteLocation, getMachines } from '../services/dbService';
import { useUser } from './UserContext'; // Ajusta la ruta según la ubicación de UserContext.js

const backgroundImage = require('../../assets/images/background3.jpg');
const logoImage = require('../../assets/images/Logo.png');

const ManageLocationsScreen = ({ navigation }) => {
  const { user } = useUser();
  const { role, username } = user || {};
  const [locationName, setLocationName] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('');
  const [area, setArea] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locations, setLocations] = useState([]);
  const [machines, setMachines] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return; // No hacemos fetch si no hay usuario logueado

    if (role !== 'Administrador') {
      Alert.alert('Acceso Denegado', 'Solo los administradores pueden gestionar ubicaciones.');
      navigation.goBack();
      return;
    }

    fetchLocations();
    fetchMachines();
  }, [role]);

  const fetchLocations = async () => {
    try {
      const data = await getLocations();
      setLocations(data);
      if (selectedLocation && !data.some(loc => loc.ID_ubicacion.toString() === selectedLocation)) {
        setSelectedLocation('');
      }
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchMachines = async () => {
    try {
      const data = await getMachines();
      setMachines(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAddLocation = async () => {
    if (!locationName || !selectedMachine || !area) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }
    if (isNaN(area) || parseInt(area) < 0) {
      Alert.alert('Error', 'El área debe ser un número mayor o igual a 0');
      return;
    }
    try {
      const trimmedLocationName = locationName.trim();
      const success = await addLocation(trimmedLocationName, selectedMachine, area);
      if (success) {
        Alert.alert('Éxito', 'Ubicación añadida');
        setLocationName('');
        setSelectedMachine('');
        setArea('');
        fetchLocations();
      } else {
        Alert.alert('Error', 'No se pudo añadir la ubicación');
      }
    } catch (error) {
      console.error('Error al añadir ubicación:', error.message);
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteLocation = async () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Por favor seleccione una ubicación para eliminar');
      return;
    }
    try {
      console.log('Eliminando ubicación con ID:', selectedLocation);
      const success = await deleteLocation(parseInt(selectedLocation));
      console.log('Resultado de eliminar ubicación:', success);
      if (success) {
        Alert.alert('Éxito', 'Ubicación eliminada');
        setSelectedLocation('');
        fetchLocations();
      } else {
        Alert.alert('Error', 'No se pudo eliminar la ubicación. Es posible que ya no exista.');
        fetchLocations();
      }
    } catch (error) {
      console.error('Error al eliminar ubicación:', error.message);
      Alert.alert('Error', error.message);
      fetchLocations();
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se ha iniciado sesión. Por favor, inicia sesión.</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('LoginScreen')}
        >
          <Text style={styles.buttonText}>Ir a Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.header}>
        <Image source={logoImage} style={styles.logo} />
        <Text style={styles.headerText}>Heno 1.0</Text>
        <Text style={styles.username}>{username}</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Gestionar Ubicaciones</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Añadir Ubicación</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre de la ubicación"
            value={locationName}
            onChangeText={setLocationName}
          />
          <Picker
            selectedValue={selectedMachine}
            onValueChange={(itemValue) => setSelectedMachine(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Seleccionar máquina" value="" />
            {machines.map((machine) => (
              <Picker.Item
                key={machine.ID_maquina}
                label={machine.Nombre}
                value={machine.ID_maquina.toString()}
              />
            ))}
          </Picker>
          <TextInput
            style={styles.input}
            placeholder="Área (en metros cuadrados)"
            value={area}
            onChangeText={setArea}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.button} onPress={handleAddLocation}>
            <Text style={styles.buttonText}>Añadir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eliminar Ubicación</Text>
          <Picker
            selectedValue={selectedLocation}
            onValueChange={(itemValue) => setSelectedLocation(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Seleccionar ubicación" value="" />
            {locations.map((location) => (
              <Picker.Item
                key={location.ID_ubicacion}
                label={location.Nombre}
                value={location.ID_ubicacion.toString()}
              />
            ))}
          </Picker>
          <TouchableOpacity
            style={[styles.button, !selectedLocation && styles.buttonDisabled]}
            onPress={handleDeleteLocation}
            disabled={!selectedLocation}
          >
            <Text style={styles.buttonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  header: {
    backgroundColor: '#2E7D32',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: { width: 50, height: 50, resizeMode: 'contain' },
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
  },
  title: {
    fontFamily: 'timesbd',
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontFamily: 'timesbd',
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  input: {
    fontFamily: 'times',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#cccccc' },
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
    marginBottom: 20,
  },
});

export default ManageLocationsScreen;