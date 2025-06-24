import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import { getWorkers } from '../services/dbService';
import { useUser } from './UserContext'; // Ajusta la ruta según la ubicación de UserContext.js

const WorkerManagementScreen = ({ navigation }) => {
  const { user } = useUser();
  const { role } = user || {};
  const [workers, setWorkers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return; // No hacemos fetch si no hay usuario logueado

    if (role !== 'Administrador') {
      Alert.alert('Acceso Denegado', 'Solo los administradores pueden gestionar trabajadores.');
      navigation.goBack();
      return;
    }

    const fetchWorkers = async () => {
      try {
        const data = await getWorkers();
        console.log('Trabajadores obtenidos en WorkerManagementScreen:', data);
        setWorkers(data);
        setError(null);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchWorkers();
  }, [role]);

  const handleWorkerSelect = (worker) => {
    console.log('Navegando a WorkerReportScreen con worker:', worker);
    navigation.navigate('WorkerReportScreen', { worker }); // No pasamos datos del usuario
  };

  const totalHeno = workers.reduce((sum, worker) => sum + worker.Heno_recolectado, 0);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se ha iniciado sesión. Por favor, inicia sesión.</Text>
        <TouchableOpacity
          style={styles.addButton}
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
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('RegisterWorkerScreen')} // No pasamos datos del usuario
        >
          <Text style={styles.buttonText}>Agregar Trabajador</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Gestión de Trabajadores</Text>
        <Text style={styles.subtitle}>Total Heno Recolectado: {totalHeno} kg</Text>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : workers.length === 0 ? (
          <Text style={styles.emptyText}>No hay trabajadores registrados</Text>
        ) : (
          <>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Nombre</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Cantidad (kg)</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Horas</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Ubicación</Text>
            </View>
            <FlatList
              data={workers}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? '#f5f5f5' : '#e0e0e0' }]}
                  onPress={() => handleWorkerSelect(item)}
                >
                  <Text style={[styles.tableCell, { flex: 2 }]}>{item.Nombre} {item.Apellido}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{item.Heno_recolectado.toFixed(2)}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{item.Horas_trabajadas.toFixed(2)}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{item.Nombre_ubicacion || 'Sin ubicación'}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.ID_usuario.toString()}
            />
          </>
        )}
      </View>
    </ImageBackground>
  );
};

// Estilos (sin cambios, ya que addButton y buttonText ya están definidos)
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
  addButton: {
    backgroundColor: '#388E3C',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    elevation: 3,
  },
  buttonText: {
    fontFamily: 'timesbd',
    color: '#fff',
    fontSize: 16,
  },
  container: {
    flex: 1,
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
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
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

export default WorkerManagementScreen;