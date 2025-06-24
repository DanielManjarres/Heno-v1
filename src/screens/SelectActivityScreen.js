import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ImageBackground, Alert, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getActivities } from '../services/dbService';
import { useUser } from './UserContext'; // Ajusta la ruta según la ubicación de UserContext.js

const SelectActivityScreen = ({ navigation }) => {
  const { user } = useUser();
  const { userId, username, role } = user || {};
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivities = async () => {
    if (!user) return; // No hacemos fetch si no hay usuario logueado

    if (role !== 'Administrador') {
      Alert.alert('Acceso Denegado', 'Solo los administradores pueden seleccionar actividades.');
      navigation.goBack();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('Obteniendo actividades en curso para el administrador...');
      const activitiesData = await getActivities(userId, role, 'En curso');
      console.log('Actividades obtenidas:', activitiesData);
      setActivities(activitiesData);
    } catch (err) {
      console.log('Error al obtener actividades:', err);
      setError('No se pudieron cargar las actividades: ' + err.message);
      Alert.alert('Error', 'No se pudieron cargar las actividades: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchActivities();
    }, [userId, role])
  );

  const handleSelectActivity = (activity) => {
    console.log('Navegando a FinalizeActivityScreen con activityId:', activity.ID_registro);
    navigation.navigate('FinalizeActivityScreen', {
      activityId: activity.ID_registro,
    }); // No pasamos datos del usuario
  };

  const renderActivityItem = ({ item }) => (
    <TouchableOpacity
      style={styles.activityItem}
      onPress={() => handleSelectActivity(item)}
    >
      <Text style={styles.activityText}>
        {item.Nombre_actividad} - {item.Nombre_usuario} ({item.Ubicacion})
      </Text>
      <Text style={styles.activitySubText}>
        Fecha: {item.Fecha} | Hora Inicio: {item.Hora_inicio} | Estado: {item.Estado}
      </Text>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerText}>Heno 1.0</Text>
          <Text style={styles.username}>{username}</Text>
        </View>
        <View style={styles.container}>
          <Text style={styles.title}>Seleccionar Actividad</Text>
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
          <Text style={styles.title}>Seleccionar Actividad</Text>
          <Text style={styles.errorText}>{error}</Text>
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
        <Text style={styles.title}>Seleccionar Actividad</Text>
        {activities.length === 0 ? (
          <Text style={styles.noActivitiesText}>No hay actividades en curso.</Text>
        ) : (
          <FlatList
            data={activities}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.ID_registro.toString()}
            contentContainerStyle={styles.activityList}
          />
        )}
      </View>
    </ImageBackground>
  );
};

// Estilos (ya están completos y no necesitan cambios)
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
  activityList: {
    paddingBottom: 20,
  },
  activityItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityText: {
    fontFamily: 'timesbd',
    fontSize: 16,
    color: '#333',
  },
  activitySubText: {
    fontFamily: 'times',
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  noActivitiesText: {
    fontFamily: 'timesbd',
    fontSize: 18,
    color: '#D32F2F',
    textAlign: 'center',
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
  button: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontFamily: 'timesbd',
    color: '#fff',
    fontSize: 16,
  },
});

export default SelectActivityScreen;