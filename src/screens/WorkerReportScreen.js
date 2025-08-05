import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ImageBackground, Image, ScrollView, Alert } from 'react-native';
import { getWorkerHenoRecords, getActivityHistory } from '../services/dbService';
import { useUser } from './UserContext'; // Ajusta la ruta según la ubicación de UserContext.js

const WorkerReportScreen = ({ route, navigation }) => {
  const { user } = useUser();
  const { username, role } = user || {};
  const { worker } = route.params;
  const [henoRecords, setHenoRecords] = useState([]);
  const [activities, setActivities] = useState([]);
  const [totalHours, setTotalHours] = useState('0h 0m');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    if (role !== 'Administrador') {
      Alert.alert('Acceso Denegado', 'Solo los administradores pueden ver reportes de trabajadores.');
      navigation.goBack();
      return;
    }

    const fetchData = async () => {
      try {
        const henoData = await getWorkerHenoRecords(worker.ID_usuario);
        setHenoRecords(henoData);

        const history = await getActivityHistory(worker.ID_usuario, 'Trabajador');
        const sortedActivities = history.sort((a, b) => {
          const dateA = new Date(`${a.Fecha}T${a.Hora_inicio}`);
          const dateB = new Date(`${b.Fecha}T${b.Hora_inicio}`);
          return dateB - dateA;
        });

        const activitiesWithDuration = sortedActivities.map(activity => {
          if (!activity.Hora_fin) return { ...activity, duration: 'No disponible', durationMins: 0 };
          const startDateTime = new Date(`1970-01-01T${activity.Hora_inicio}`);
          const endDateTime = new Date(`1970-01-01T${activity.Hora_fin}`);
          if (isNaN(startDateTime) || isNaN(endDateTime)) return { ...activity, duration: 'No disponible', durationMins: 0 };
          const diffMs = endDateTime - startDateTime;
          if (diffMs < 0) return { ...activity, duration: 'No disponible', durationMins: 0 };
          const diffMins = Math.floor(diffMs / 1000 / 60);
          const hours = Math.floor(diffMins / 60);
          const minutes = diffMins % 60;
          return { ...activity, duration: `${hours}h ${minutes}m`, durationMins: diffMins };
        });

        const totalMins = activitiesWithDuration.reduce((sum, act) => sum + (act.durationMins || 0), 0);
        const totalHrs = Math.floor(totalMins / 60);
        const remainingMins = totalMins % 60;
        setTotalHours(`${totalHrs}h ${remainingMins}m`);
        setActivities(activitiesWithDuration);
        setError(null);
      } catch (err) {
        setError('Error al cargar los datos: ' + err.message);
      }
    };

    fetchData();
  }, [worker.ID_usuario, role]);

  const handleEdit = () => {
    navigation.navigate('EditWorkerScreen', { worker });
  };

  const totalHeno = henoRecords.reduce((sum, record) => sum + record.Cantidad, 0);

  const renderHenoItem = ({ item, index }) => (
    <View style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? '#f5f5f5' : '#e0e0e0' }]}>
      <Text style={[styles.tableCell, { flex: 1 }]}>{item.Fecha}</Text>
      <Text style={[styles.tableCell, { flex: 1 }]}>{item.Hora}</Text>
      <Text style={[styles.tableCell, { flex: 1 }]}>{item.Cantidad.toFixed(2)}</Text>
      <Text style={[styles.tableCell, { flex: 1 }]}>{item.Nombre_ubicacion}</Text>
    </View>
  );

  const renderActivityItem = ({ item, index }) => (
    <View style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? '#f5f5f5' : '#e0e0e0' }]}>
      <Text style={[styles.tableCell, { flex: 1 }]}>{item.Fecha}</Text>
      <Text style={[styles.tableCell, { flex: 1 }]}>{item.duration}</Text>
      <Text style={[styles.tableCell, { flex: 1 }]}>{item.Nombre_actividad}</Text>
      <Text style={[styles.tableCell, { flex: 1 }]}>{item.Ubicacion}</Text>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se ha iniciado sesión. Por favor, inicia sesión.</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('LoginScreen')}
        >
          <Text style={styles.buttonText}>Ir a Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ImageBackground source={require('../../assets/images/background3.jpg')} style={styles.background}>
      <View style={styles.header}>
        <Image source={require('../../assets/images/Logo.png')} style={styles.logo} />
        <Text style={styles.headerText}>Heno 1.0</Text>
        <Text style={styles.username}>{username}</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.title}>Reporte de {worker.Nombre} {worker.Apellido}</Text>
          <TouchableOpacity style={styles.editButtonTop} onPress={handleEdit}>
            <Text style={styles.buttonText}>Editar Información del Trabajador</Text>
          </TouchableOpacity>
          <Text style={styles.subtitle}>Total Heno Recolectado: {totalHeno.toFixed(2)} kg</Text>
          <Text style={styles.subtitle}>Total Horas Trabajadas: {totalHours}</Text>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Registros de Heno</Text>
              {henoRecords.length === 0 ? (
                <Text style={styles.emptyText}>No hay registros de heno.</Text>
              ) : (
                <>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Fecha</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Hora</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Cantidad (kg)</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Ubicación</Text>
                  </View>
                  <FlatList
                    data={henoRecords}
                    renderItem={renderHenoItem}
                    keyExtractor={(item, index) => index.toString()}
                    scrollEnabled={false}
                  />
                </>
              )}

              <Text style={styles.sectionTitle}>Actividades</Text>
              {activities.length === 0 ? (
                <Text style={styles.emptyText}>No hay actividades finalizadas.</Text>
              ) : (
                <>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Fecha</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Duración</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Actividad</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Ubicación</Text>
                  </View>
                  <FlatList
                    data={activities}
                    renderItem={renderActivityItem}
                    keyExtractor={(item, index) => index.toString()}
                    scrollEnabled={false}
                  />
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  scrollView: { flex: 1 },
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
  username: {
    fontFamily: 'timesbd',
    color: '#fff',
    fontSize: 16,
  },
  editButtonTop: {
  backgroundColor: '#388E3C',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 8,
  alignSelf: 'center',
  marginVertical: 10,
  elevation: 3,
},
  buttonText: {
    fontFamily: 'timesbd',
    color: '#fff',
    fontSize: 16,
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
    marginBottom: 10,
    textAlign: 'center',
    color: '#2E7D32',
  },
  subtitle: {
    fontFamily: 'timesbd',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    color: '#555',
  },
  sectionTitle: {
    fontFamily: 'timesbd',
    fontSize: 20,
    marginTop: 20,
    marginBottom: 10,
    color: '#2E7D32',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2E7D32',
    paddingVertical: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#999',
  },
  tableHeaderText: {
    fontFamily: 'timesbd',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  tableCell: {
    fontFamily: 'times',
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'timesbd',
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontFamily: 'timesbd',
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default WorkerReportScreen;
