import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image, Alert } from 'react-native';
import { useUser } from './UserContext'; // Ajusta la ruta según la ubicación de UserContext.js

const backgroundImage = require('../../assets/images/background3.jpg');
const logoImage = require('../../assets/images/Logo.png');

const SettingsScreen = ({ navigation }) => {
  const { user } = useUser();
  const { role, username } = user || {};

  useEffect(() => {
    if (!user) return; // No hacemos nada si no hay usuario logueado

    if (role !== 'Administrador') {
      Alert.alert('Acceso Denegado', 'Solo los administradores pueden acceder a la configuración.');
      navigation.goBack();
      return;
    }
  }, [role]);

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
        <Text style={styles.title}>Configuración</Text>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('ManageLocationsScreen')}
          >
            <Text style={styles.buttonText}>Ubicaciones</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('ManageUsersScreen')}
          >
            <Text style={styles.buttonText}>Usuarios</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('DownloadReportsScreen')}
          >
            <Text style={styles.buttonText}>Descargar Documentación</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'timesbd',
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#2E7D32',
  },
  section: { marginBottom: 20 },
  button: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
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
    marginBottom: 20,
  },
});

export default SettingsScreen;