import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image, Alert, PermissionsAndroid, Platform, Linking } from 'react-native';
import ExcelJS from 'exceljs';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';
import { getDailyCombinedRecords } from '../services/dbService'; // Ajusta la ruta según tu estructura de carpetas
import { useUser } from './UserContext'; // Ajusta la ruta según la ubicación de UserContext.js

const backgroundImage = require('../../assets/images/background3.jpg');
const logoImage = require('../../assets/images/Logo.png');

const DownloadReportsScreen = ({ navigation }) => {
  const { user } = useUser();
  const { role, username } = user || {};

  useEffect(() => {
    if (!user) return;

    if (role !== 'Administrador') {
      Alert.alert('Acceso Denegado', 'Solo los administradores pueden descargar reportes.');
      navigation.goBack();
      return;
    }
  }, [role]);

  const requestStoragePermission = async () => {
    try {
      const permissionsToRequest = [];
      if (Platform.Version >= 33) {
        permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
        permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
        permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO);
      } else {
        permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      }

      const results = await PermissionsAndroid.requestMultiple(permissionsToRequest);
      const allGranted = Object.values(results).every(result => result === PermissionsAndroid.RESULTS.GRANTED);

      if (allGranted) {
        return true;
      } else {
        Alert.alert(
          'Permiso Denegado',
          'No se otorgaron los permisos de almacenamiento. Por favor, habilítalos en la configuración de la app.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Ir a Configuración', onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }
    } catch (err) {
      console.warn(err);
      Alert.alert('Error', 'Ocurrió un error al solicitar permisos de almacenamiento.');
      return false;
    }
  };

  const handleDownloadReport = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      return;
    }

    try {
      const records = await getDailyCombinedRecords();
      if (!records || records.length === 0) {
        Alert.alert('Error', 'No hay datos para generar el reporte');
        return;
      }

      console.log('Datos de registros diarios para el reporte:', records);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Reporte Diario');

      worksheet.columns = [
        { header: 'ID Registro', key: 'Activity_ID', width: 10 },
        { header: 'Fecha', key: 'Fecha', width: 15 },
        { header: 'Hora Inicio', key: 'Hora_inicio', width: 15 },
        { header: 'Hora Fin', key: 'Hora_fin', width: 15 },
        { header: 'Actividad', key: 'Nombre_actividad', width: 20 },
        { header: 'Trabajador', key: 'Nombre_trabajador', width: 20 },
        { header: 'Apellido', key: 'Apellido_trabajador', width: 20 },
        { header: 'Ubicación', key: 'Nombre_ubicacion', width: 20 },
        { header: 'Filas Hileradas', key: 'Filas_hileradas', width: 15 },
        { header: 'Pacas Heno', key: 'Pacas_heno', width: 15 },
        { header: 'Heno Recolectado (kg)', key: 'Cantidad_kg', width: 15 },
      ];

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDDDDDD' },
      };

      records.forEach(record => {
        worksheet.addRow({
          Activity_ID: record.Activity_ID,
          Fecha: record.Fecha,
          Hora_inicio: record.Hora_inicio,
          Hora_fin: record.Hora_fin,
          Nombre_actividad: record.Nombre_actividad,
          Nombre_trabajador: record.Nombre_trabajador,
          Apellido_trabajador: record.Apellido_trabajador,
          Nombre_ubicacion: record.Nombre_ubicacion,
          Filas_hileradas: record.Filas_hileradas,
          Pacas_heno: record.Pacas_heno,
          Cantidad_kg: record.Cantidad_kg,
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const filePath = `${RNFS.DownloadDirectoryPath}/Reporte_Diario_${new Date().toISOString().split('T')[0]}.xlsx`;
      const base64Data = Buffer.from(buffer).toString('base64');
      await RNFS.writeFile(filePath, base64Data, 'base64');
      Alert.alert('Éxito', `Reporte descargado en: ${filePath}`);
    } catch (error) {
      console.error('Error al descargar el reporte:', error);
      Alert.alert('Error', 'No se pudo descargar el reporte: ' + error.message);
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
        <Text style={styles.title}>Descargar Documentación</Text>

        <View style={styles.section}>
          <TouchableOpacity style={styles.button} onPress={handleDownloadReport}>
            <Text style={styles.buttonText}>Descargar Reporte Completo</Text>
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
    color: '#333',
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

export default DownloadReportsScreen;