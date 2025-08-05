import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, FlatList, Alert, ScrollView } from 'react-native';
import { getHayRecords, getActivityHistory } from '../services/dbService';
import { useUser } from './UserContext';

const ControlReportScreen = ({ navigation }) => {
  const { user } = useUser(); // Obtener el usuario desde el contexto
  const { userId, username, role } = user || {};
  const [hayRecords, setHayRecords] = useState([]);
  const [activities, setActivities] = useState([]);
  const [totalHay, setTotalHay] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
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
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Obteniendo registros de heno para el usuario:', userId);
        const hayData = await getHayRecords(userId);
        console.log('Registros de heno:', hayData);
        setHayRecords(hayData);

        // Calcular el total de heno recolectado
        const total = hayData.reduce((sum, record) => sum + record.Cantidad_kg, 0);
        setTotalHay(total);

        console.log('Obteniendo actividades finalizadas para el usuario:', userId, 'con rol:', role);
        // Obtener actividades finalizadas
        const history = await getActivityHistory(userId, role);
        console.log('Actividades finalizadas:', history);

        // Ordenar por fecha y hora de inicio (más reciente primero)
        const sortedActivities = history.sort((a, b) => {
          const dateA = new Date(`${a.Fecha}T${a.Hora_inicio}`);
          const dateB = new Date(`${b.Fecha}T${b.Hora_inicio}`);
          return dateB - dateA;
        });

        // Calcular la duración para cada actividad
        const activitiesWithDuration = sortedActivities.map(activity => {
          if (!activity.Hora_fin) {
            return { ...activity, duration: 'No disponible', durationMins: 0 };
          }
          const startDateTime = new Date(`1970-01-01T${activity.Hora_inicio}`);
          const endDateTime = new Date(`1970-01-01T${activity.Hora_fin}`);
          if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            return { ...activity, duration: 'No disponible', durationMins: 0 };
          }
          const diffMs = endDateTime - startDateTime;
          if (diffMs < 0) {
            return { ...activity, duration: 'No disponible', durationMins: 0 };
          }
          const diffMins = Math.floor(diffMs / 1000 / 60);
          const hours = Math.floor(diffMins / 60);
          const minutes = diffMins % 60;
          return { ...activity, duration: `${hours}h ${minutes}m`, durationMins: diffMins };
        });

        // Calcular el total de horas trabajadas
        const totalMins = activitiesWithDuration.reduce((sum, activity) => sum + (activity.durationMins || 0), 0);
        const totalHrs = Math.floor(totalMins / 60);
        const remainingMins = totalMins % 60;
        setTotalHours(`${totalHrs}h ${remainingMins}m`);

        setActivities(activitiesWithDuration);
      } catch (err) {
        console.log('Error al cargar datos:', err);
        setError('No se pudieron cargar los datos: ' + err.message);
        Alert.alert('Error', 'No se pudieron cargar los datos: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, role]);

  const renderHayRecord = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{item.Fecha}</Text>
      <Text style={styles.tableCell}>{item.Hora}</Text>
      <Text style={styles.tableCell}>{item.Cantidad_kg}</Text>
      <Text style={styles.tableCell}>{item.Ubicacion}</Text>
    </View>
  );

  const renderActivityItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{item.Fecha}</Text>
      <Text style={styles.tableCell}>{item.duration}</Text>
      <Text style={styles.tableCell}>{item.Nombre_actividad}</Text>
      <Text style={styles.tableCell}>{item.Ubicacion}</Text>
    </View>
  );

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
          <Text style={styles.title}>Control de Reportes</Text>
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
          <Text style={styles.headerText}>Eco Comercial SAS</Text>
          <Text style={styles.username}>{username}</Text>
        </View>
        <View style={styles.container}>
          <Text style={styles.title}>Control de Reportes</Text>
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.title}>Control de Reportes</Text>

          {/* Sección: Registros de Heno */}
          <Text style={styles.sectionTitle}>Registros de Heno</Text>
          <Text style={styles.totalText}>Total Heno Recolectado: {totalHay} kg</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Fecha</Text>
              <Text style={styles.tableHeaderCell}>Hora</Text>
              <Text style={styles.tableHeaderCell}>Cantidad (kg)</Text>
              <Text style={styles.tableHeaderCell}>Ubicación</Text>
            </View>
            <FlatList
              data={hayRecords}
              renderItem={renderHayRecord}
              keyExtractor={(item) => item.ID_registro.toString()}
              ListEmptyComponent={<Text style={styles.emptyText}>No hay registros de heno.</Text>}
              scrollEnabled={false}
            />
          </View>

          {/* Sección: Actividades */}
          <Text style={styles.sectionTitle}>Actividades</Text>
          <Text style={styles.totalText}>Total Horas Trabajadas: {totalHours}</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Fecha</Text>
              <Text style={styles.tableHeaderCell}>Duración</Text>
              <Text style={styles.tableHeaderCell}>Actividad</Text>
              <Text style={styles.tableHeaderCell}>Ubicación</Text>
            </View>
            <FlatList
              data={activities}
              renderItem={renderActivityItem}
              keyExtractor={(item) => item.ID_registro.toString()}
              ListEmptyComponent={<Text style={styles.emptyText}>No hay actividades finalizadas.</Text>}
              scrollEnabled={false}
            />
          </View>
        </View>
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
  scrollView: {
    flex: 1,
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
    color: '#2E7D32',
  },
  sectionTitle: {
    fontFamily: 'timesbd',
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  totalText: {
    fontFamily: 'timesbd',
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2E7D32',
    padding: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderCell: {
    flex: 1,
    fontFamily: 'timesbd',
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableCell: {
    flex: 1,
    fontFamily: 'times',
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: 'timesbd',
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    padding: 20,
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

export default ControlReportScreen;