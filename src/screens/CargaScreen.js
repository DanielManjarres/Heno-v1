import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Image } from 'react-native';
import { useUser } from './UserContext';
const CargaScreen = ({ navigation }) => {
  const { user } = useUser(); // Obtener el usuario desde el contexto
  const { username } = user || {};

  // Verificar si el usuario está autenticado
  if (!user) {
    navigation.reset({
      index: 0,
      routes: [{ name: 'LoginScreen' }],
    });
    return null;
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
        <Text style={styles.subtitle}>CARGA</Text>
        <Text style={styles.developmentText}>En desarrollo, próximamente</Text>
      </View>
    </ImageBackground>
  );
};

// Estilos (sin cambios)
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
    alignItems: 'center',
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
  developmentText: {
    fontFamily: 'timesbd',
    fontSize: 18,
    color: '#2E7D32',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CargaScreen;