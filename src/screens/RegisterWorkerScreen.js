import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Image, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getLocations, registerWorker, checkUsernameExists, checkIdentificationExists } from '../services/dbService';
import { useUser } from './UserContext';

const RegisterWorkerScreen = ({ navigation }) => {
  const { user } = useUser();
  const { role } = user || {};
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState(''); // Cambiado de edad
  const [identificacion, setIdentificacion] = useState('');
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [idUbicacion, setIdUbicacion] = useState(''); // Cambiado de ubicacion
  const [rol, setRol] = useState('Trabajador');
  const [ubicaciones, setUbicaciones] = useState([]);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!user) return;

    if (role !== 'Administrador') {
      Alert.alert('Acceso Denegado', 'Solo los administradores pueden registrar trabajadores.');
      navigation.goBack();
      return;
    }

    const fetchLocations = async () => {
      try {
        const data = await getLocations();
        setUbicaciones(data);
        if (data.length === 0) {
          setError('No hay ubicaciones disponibles. Por favor, agregue una ubicación primero.');
        } else {
          setError(null);
        }
      } catch (error) {
        setError('Error al cargar ubicaciones: ' + error.message);
      }
    };
    fetchLocations();
  }, [role]);

  const calculateAge = (birthDate) => {
    if (!birthDate) return -1;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const validateForm = async () => {
    const errors = {};

    if (!nombre.trim()) errors.nombre = 'El nombre es obligatorio';
    if (!apellido.trim()) errors.apellido = 'El apellido es obligatorio';
    if (!fechaNacimiento.trim()) {
      errors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
    } else {
      const age = calculateAge(fechaNacimiento);
      if (age < 18 || age === -1) errors.fechaNacimiento = 'Debe tener al menos 18 años';
    }
    if (!identificacion.trim()) errors.identificacion = 'La identificación es obligatoria';
    else {
      try {
        const identificationExists = await checkIdentificationExists(identificacion);
        if (identificationExists) errors.identificacion = 'La identificación ya existe';
      } catch (error) {
        errors.identificacion = 'Error al verificar la identificación';
      }
    }
    if (!usuario.trim()) errors.usuario = 'El nombre de usuario es obligatorio';
    else {
      try {
        const usernameExists = await checkUsernameExists(usuario);
        if (usernameExists) errors.usuario = 'El nombre de usuario ya existe';
      } catch (error) {
        errors.usuario = 'Error al verificar el nombre de usuario';
      }
    }
    if (!contrasena) errors.contrasena = 'La contraseña es obligatoria';
    else if (contrasena.length < 6) errors.contrasena = 'La contraseña debe tener al menos 6 caracteres';
    if (!confirmarContrasena) errors.confirmarContrasena = 'Debe confirmar la contraseña';
    else if (contrasena !== confirmarContrasena) errors.confirmarContrasena = 'Las contraseñas no coinciden';
    if (!idUbicacion) errors.idUbicacion = 'Debe seleccionar una ubicación';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    const isValid = await validateForm();
    if (!isValid) {
      Alert.alert('Error', 'Por favor corrija los errores en el formulario');
      return;
    }

    try {
      const success = await registerWorker(
        nombre,
        apellido,
        fechaNacimiento, // Reemplaza edad
        identificacion,
        parseInt(idUbicacion), // Alineado con ID_ubicacion
        usuario,
        contrasena,
        rol
      );
      if (success) {
        Alert.alert('Éxito', 'Trabajador registrado correctamente');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'No se pudo registrar el trabajador');
      }
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed: Usuarios.Identificacion')) {
        setFormErrors({ ...formErrors, identificacion: 'La identificación ya existe' });
        Alert.alert('Error', 'La identificación ya existe');
      } else if (error.message.includes('UNIQUE constraint failed: Usuarios.Usuario')) {
        setFormErrors({ ...formErrors, usuario: 'El nombre de usuario ya existe' });
        Alert.alert('Error', 'El nombre de usuario ya existe');
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  const handleCancel = () => navigation.goBack();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se ha iniciado sesión. Por favor, inicia sesión.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LoginScreen')}>
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
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Registrar Trabajador</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.label}>Nombre</Text>
          <TextInput style={[styles.input, formErrors.nombre && styles.inputError]} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
          {formErrors.nombre && <Text style={styles.errorText}>{formErrors.nombre}</Text>}

          <Text style={styles.label}>Apellido</Text>
          <TextInput style={[styles.input, formErrors.apellido && styles.inputError]} placeholder="Apellido" value={apellido} onChangeText={setApellido} />
          {formErrors.apellido && <Text style={styles.errorText}>{formErrors.apellido}</Text>}

          <Text style={styles.label}>Fecha de Nacimiento (YYYY-MM-DD)</Text>
          <TextInput
            style={[styles.input, formErrors.fechaNacimiento && styles.inputError]}
            placeholder="Ej: 1990-01-01"
            value={fechaNacimiento}
            onChangeText={setFechaNacimiento}
          />
          {formErrors.fechaNacimiento && <Text style={styles.errorText}>{formErrors.fechaNacimiento}</Text>}

          <Text style={styles.label}>Identificación</Text>
          <TextInput style={[styles.input, formErrors.identificacion && styles.inputError]} placeholder="Identificación" value={identificacion} onChangeText={setIdentificacion} />
          {formErrors.identificacion && <Text style={styles.errorText}>{formErrors.identificacion}</Text>}

          <Text style={styles.label}>Nombre de usuario</Text>
          <TextInput style={[styles.input, formErrors.usuario && styles.inputError]} placeholder="Nombre de usuario" value={usuario} onChangeText={setUsuario} />
          {formErrors.usuario && <Text style={styles.errorText}>{formErrors.usuario}</Text>}

          <Text style={styles.label}>Contraseña</Text>
          <TextInput style={[styles.input, formErrors.contrasena && styles.inputError]} placeholder="Contraseña" value={contrasena} onChangeText={setContrasena} secureTextEntry />
          {formErrors.contrasena && <Text style={styles.errorText}>{formErrors.contrasena}</Text>}

          <Text style={styles.label}>Confirmar Contraseña</Text>
          <TextInput style={[styles.input, formErrors.confirmarContrasena && styles.inputError]} placeholder="Confirmar Contraseña" value={confirmarContrasena} onChangeText={setConfirmarContrasena} secureTextEntry />
          {formErrors.confirmarContrasena && <Text style={styles.errorText}>{formErrors.confirmarContrasena}</Text>}

          <Text style={styles.label}>Ubicación:</Text>
          <Picker selectedValue={idUbicacion} onValueChange={(itemValue) => setIdUbicacion(itemValue)} style={[styles.picker, formErrors.idUbicacion && styles.inputError]} enabled={ubicaciones.length > 0}>
            <Picker.Item label="Seleccione una ubicación" value="" />
            {ubicaciones.map((loc) => <Picker.Item key={loc.ID_ubicacion} label={loc.Nombre} value={loc.ID_ubicacion.toString()} />)}
          </Picker>
          {formErrors.idUbicacion && <Text style={styles.errorText}>{formErrors.idUbicacion}</Text>}

          <Text style={styles.label}>Rol:</Text>
          <Picker selectedValue={rol} onValueChange={(itemValue) => setRol(itemValue)} style={styles.picker}>
            <Picker.Item label="Trabajador" value="Trabajador" />
            <Picker.Item label="Administrador" value="Administrador" />
          </Picker>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, ubicaciones.length === 0 && styles.disabledButton]} onPress={handleRegister} disabled={ubicaciones.length === 0}>
              <Text style={styles.buttonText}>Registrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

// Estilos (sin cambios, ya que button y buttonText ya están definidos)
const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  header: {
    backgroundColor: '#2E7D32',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { width: 50, height: 50, resizeMode: 'contain' },
  headerText: {
    fontFamily: 'timesbd',
    fontSize: 20,
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 20,
    borderRadius: 10,
  },
  title: { fontFamily: 'timesbd', fontSize: 24, marginBottom: 20, textAlign: 'center', color: '#333' },
  label: { fontFamily: 'timesbd', fontSize: 16, marginBottom: 5 },
  input: {
    fontFamily: 'times',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#D32F2F',
  },
  picker: {
    fontFamily: 'times',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#D32F2F',
  },
  disabledButton: {
    backgroundColor: '#B0BEC5',
  },
  buttonText: {
    fontFamily: 'timesbd',
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    fontFamily: 'timesbd',
    fontSize: 14,
    color: '#D32F2F',
    marginBottom: 10,
  },
});

export default RegisterWorkerScreen;