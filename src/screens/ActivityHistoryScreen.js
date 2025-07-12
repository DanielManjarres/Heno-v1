import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ImageBackground, Image, Alert } from 'react-native';
import { getActivityHistory, getActivities } from '../services/dbService';
import { useUser } from './UserContext';

const ActivityHistoryScreen = ({ navigation }) => {
  const { user } = useUser(); // Obtener el usuario desde el contexto
  const { userId, username, role } = user || {};
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si el usuario está autenticado
  if (!user) {
    navigation.reset({
      index: 0,
      routes: [{ name: 'LoginScreen' }],
    });
    return null;
  }

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Obteniendo actividades en curso y finalizadas...');

        // Obtener actividades en curso
        const activitiesInProgress = await getActivities(userId, role, 'En curso');
        console.log('Actividades en curso cargadas:', activitiesInProgress);

        // Obtener historial de actividades finalizadas
        const history = await getActivityHistory(userId, role);
        console.log('Historial de actividades cargado:', history);

        // Combinar ambas listas
        let combinedActivities = [...activitiesInProgress, ...history];

        // Ordenar las actividades por fecha y hora descendente
        combinedActivities = combinedActivities.sort((a, b) => {
          const dateA = new Date(`${a.Fecha}T${a.Hora_inicio}`);
          const dateB = new Date(`${b.Fecha}T${b.Hora_inicio}`);
          return dateB - dateA;
        });

        // Calcular el tiempo de duración para cada actividad
        const activitiesWithDuration = combinedActivities.map(activity => {
          if (activity.Estado === 'En curso') {
            const startDateTime = new Date(`${activity.Fecha}T${activity.Hora_inicio}`);
            const now = new Date();
            const diffMs = now - startDateTime;
            const diffMins = Math.floor(diffMs / 1000 / 60);
            const hours = Math.floor(diffMins / 60);
            const minutes = diffMins % 60;
            return { ...activity, duration: `${hours}h ${minutes}m` };
          } else {
            if (!activity.Hora_fin) {
              return { ...activity, duration: 'No disponible' };
            }
            const startDateTime = new Date(`1970-01-01T${activity.Hora_inicio}`);
            const endDateTime = new Date(`1970-01-01T${activity.Hora_fin}`);
            if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
              return { ...activity, duration: 'No disponible' };
            }
            const diffMs = endDateTime - startDateTime;
            if (diffMs < 0) {
              return { ...activity, duration: 'No disponible' };
            }
            const diffMins = Math.floor(diffMs / 1000 / 60);
            const hours = Math.floor(diffMins / 60);
            const minutes = diffMins % 60;
            return { ...activity, duration: `${hours}h ${minutes}m` };
          }
        });

        setActivities(activitiesWithDuration);
      } catch (err) {
        console.log('Error al cargar actividades:', err);
        setError('No se pudo cargar las actividades: ' + err.message);
        Alert.alert('Error', 'No se pudo cargar las actividades: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [userId, role]);

  // Actualizar el tiempo de duración de las actividades en curso cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prevActivities =>
        prevActivities.map(activity => {
          if (activity.Estado === 'En curso') {
            const startDateTime = new Date(`${activity.Fecha}T${activity.Hora_inicio}`);
            const now = new Date();
            const diffMs = now - startDateTime;
            const diffMins = Math.floor(diffMs / 1000 / 60);
            const hours = Math.floor(diffMins / 60);
            const minutes = diffMins % 60;
            return { ...activity, duration: `${hours}h ${minutes}m` };
          }
          return activity;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (timeString) => {
    if (!timeString) return 'No disponible';
    const date = new Date(`1970-01-01T${timeString}`);
    if (isNaN(date.getTime())) return 'No disponible';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityHeader}>
        <Text style={styles.activityTitle}>{item.Nombre_actividad}</Text>
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: item.Estado === 'Finalizada' ? '#2E7D32' : '#FF9800',
            },
          ]}
        />
      </View>
      <Text style={styles.activitySubtitle}>Trabajador: {item.Nombre_usuario}</Text>
      <Text style={styles.activityDetail}>Ubicación: {item.Ubicacion}</Text>
      <Text style={styles.activityDetail}>Máquina: {item.Maquina || 'No disponible'}</Text>
      <Text style={styles.activityDetail}>Área: {item.Area}mt²</Text>
      <Text style={styles.activityDetail}>Fecha: {item.Fecha}</Text>
      <View style={styles.timeContainer}>
        <Text style={styles.activityDetail}>Hora Inicio: {formatTime(item.Hora_inicio)}</Text>
        {item.Estado !== 'En curso' && (
          <Text style={styles.activityDetail}>Hora Fin: {formatTime(item.Hora_fin)}</Text>
        )}
      </View>
      <Text style={styles.activityDetail}>Tiempo de duración: {item.duration}</Text>
      {item.Estado !== 'En curso' && item.ID_actividad === 3 && (
        <Text style={styles.activityDetail}>Filas hileradas: {item.Filas_hileradas || 'No disponible'}</Text>
      )}
      {item.Estado !== 'En curso' && item.ID_actividad === 4 && (
        <Text style={styles.activityDetail}>Pacas de heno: {item.Pacas_heno || 'No disponible'}</Text>
      )}
      <Text style={styles.activityDetail}>Estado: {item.Estado}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <ImageBackground source={require('../../assets/images/background1.jpg')} style={styles.background}>
        <View style={styles.header}>
          <Image source={require('../../assets/images/Logo.png')} style={styles.logo} />
          <Text style={styles.headerText}>Heno 1.0</Text>
          <Text style={styles.username}>{username}</Text>
        </View>
        <View style={styles.container}>
          <Text style={styles.title}>Historial de Actividades</Text>
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
          <Text style={styles.headerText}>Heno 1.0</Text>
          <Text style={styles.username}>{username}</Text>
        </View>
        <View style={styles.container}>
          <Text style={styles.title}>Historial de Actividades</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require('../../assets/images/background1.jpg')} style={styles.background}>
      <View style={styles.header}>
        <Image source={require('../../assets/images/Logo.png')} style={styles.logo} />
        <Text style={styles.headerText}>Heno 1.0</Text>
        <Text style={styles.username}>{username}</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Historial de Actividades</Text>
        {activities.length === 0 ? (
          <Text style={styles.noActivitiesText}>No hay actividades para mostrar.</Text>
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
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#2E7D32',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityTitle: {
    fontFamily: 'timesbd',
    fontSize: 18,
    color: '#333',
    flex: 1,
  },
  statusIndicator: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
  },
  activitySubtitle: {
    fontFamily: 'timesbd',
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  activityDetail: {
    fontFamily: 'times',
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  noActivitiesText: {
    fontFamily: 'timesbd',
    fontSize: 18,
    color: '#333',
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
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default ActivityHistoryScreen;