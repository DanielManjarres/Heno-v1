import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ImageBackground, Image, TouchableOpacity, Alert } from 'react-native';
import { saveHayRecord } from '../services/dbService';
import { useUser } from './UserContext';

const RegisterHayScreen = ({ navigation }) => {
  const { user } = useUser();
  const { userId, username } = user || {};
  const [quantity, setQuantity] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;

    // Validar el campo
    const parsedQuantity = parseFloat(quantity);
    if (!quantity || isNaN(parsedQuantity) || parsedQuantity < 0) {
      Alert.alert('Error', 'Por favor, ingresa una cantidad válida en kilogramos (mayor o igual a 0).');
      return;
    }

    setIsSaving(true);
    try {
      const success = await saveHayRecord(parsedQuantity, userId);
      if (success) {
        Alert.alert(
          'Éxito',
          'Registro de heno guardado correctamente.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
          { cancelable: false }
        );
        setQuantity('');
      } else {
        Alert.alert('Error', 'No se pudo guardar el registro de heno.');
      }
    } catch (err) {
      console.log('Error al guardar registro de heno:', err);
      Alert.alert('Error', 'No se pudo guardar el registro de heno: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se ha iniciado sesión. Por favor, inicia sesión.</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => navigation.navigate('LoginScreen')}
        >
          <Text style={styles.buttonText}>Ir a Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
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
        <Text style={styles.title}>Registro de Heno</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Cantidad (kg)</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            placeholder="Ingresa la cantidad en kg"
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.disabledButton]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.buttonText}>
            {isSaving ? 'Guardando...' : 'GUARDAR'}
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

// Estilos (agregamos errorText para el mensaje de redirección)
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'timesbd',
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontFamily: 'times',
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  buttonText: {
    fontFamily: 'timesbd',
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    fontFamily: 'timesbd',
    fontSize: 18,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default RegisterHayScreen;