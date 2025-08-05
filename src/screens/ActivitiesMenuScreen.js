import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image, ScrollView } from 'react-native';
import { useUser } from './UserContext';

const ActivitiesMenuScreen = ({ navigation }) => {
  const { user } = useUser(); // Obtener el usuario desde el contexto
  const { userId, username, role } = user || {};

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
      source={require('../../assets/images/background3.jpg')}
      style={styles.background}
    >
      <View style={styles.header}>
        <Image source={require('../../assets/images/Logo.png')} style={styles.logo} />
        <Text style={styles.headerText}>Heno 1.0</Text>
        <Text style={styles.username}>{username}</Text>
      </View>
        <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Actividades</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('PreparacionTerrenoScreen', { userId, username, role })}
        >
          <Text style={styles.buttonText}>Preparación de terreno</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('CorteScreen', { userId, username, role })}
        >
          <Text style={styles.buttonText}>Corte</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('RastrilloAireadorScreen', { userId, username, role })}
        >
          <Text style={styles.buttonText}>Rastrillo aireador</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('RastrilloHileradorScreen', { userId, username, role })}
        >
          <Text style={styles.buttonText}>Rastrillo hilerador</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('EnfardadaScreen', { userId, username, role })}
        >
          <Text style={styles.buttonText}>Enfardada</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('CargaScreen', { userId, username, role })}
        >
          <Text style={styles.buttonText}>Carga</Text>
        </TouchableOpacity>
      </ScrollView>
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
    justifyContent: 'space-between',
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
    color: '#fff',
    fontSize: 16,
  },
  container: {
    flexGrow: 1,
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
  button: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'timesbd',
    color: '#fff',
    fontSize: 16,
  },
});
export default ActivitiesMenuScreen;