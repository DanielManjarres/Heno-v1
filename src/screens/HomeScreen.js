import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image, Alert } from 'react-native';
import { useUser } from './UserContext'; // Cambiar ../UserContext por ./UserContext

const HomeScreen = ({ navigation }) => {
  const { user, setUser } = useUser();
  const { userId, username, role } = user || {};

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

  const handleLogout = () => {
    Alert.alert('Éxito', 'Sesión cerrada');
    setUser(null); // Limpiar el contexto al cerrar sesión
    navigation.reset({
      index: 0,
      routes: [{ name: 'LoginScreen' }],
    });
  };

  const isAdmin = role === 'Administrador';

  const handleActivityHistory = () => {
    navigation.navigate('ActivityHistoryScreen', { userId, username, role });
  };

  return (
    <ImageBackground
      source={require('../../assets/images/background1.jpg')}
      style={styles.background}
    >
      <View style={styles.header}>
        <Image source={require('../../assets/images/Logo.png')} style={styles.logo} />
        <Text style={styles.headerText}>Heno 1.0</Text>
        <Text style={styles.username}>{username}</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>MENÚ</Text>
        {isAdmin ? (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('WorkerManagementScreen', { userId, role })}
            >
              <Text style={styles.buttonText}>Gestión de Trabajador</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('RegisterWorkerScreen', { userId, role })}
            >
              <Text style={styles.buttonText}>Registrar Trabajador</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('SelectActivityScreen', { userId, username, role })}
            >
              <Text style={styles.buttonText}>Finalizar Actividad</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('SettingsScreen', { userId, role })}
            >
              <Text style={styles.buttonText}>Configuración</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('ActivitiesMenuScreen', { userId, username, role })}
            >
              <Text style={styles.buttonText}>Actividades</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('RegisterHayScreen', { userId, role })}
            >
              <Text style={styles.buttonText}>Registro de Heno</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('ControlReportScreen', { userId, role })}
            >
              <Text style={styles.buttonText}>Control de Reportes</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={handleActivityHistory}
        >
          <Text style={styles.buttonText}>Historial de Actividades</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

// Estilos (sin cambios)
const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  header: {
    backgroundColor: '#2E7D32',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    color: '#fff',
    fontSize: 16,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
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
  button: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#D32F2F',
  },
  buttonText: {
    fontFamily: 'timesbd',
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default HomeScreen;