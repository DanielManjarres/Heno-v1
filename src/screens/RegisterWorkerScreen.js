import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Image, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getLocations, registerWorker, checkUsernameExists, checkIdentificationExists } from '../services/dbService';
import { useUser } from './UserContext';

const RegisterWorkerScreen = ({ navigation }) => {
  const { user, setUser } = useUser();
  const { userId, role } = user || {};

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [usuario, setUsuario] = useState(''); // Estado para Nombre de usuario
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [idUbicacion, setIdUbicacion] = useState('');
  const [rol, setRol] = useState('Trabajador');
  const [ubicaciones, setUbicaciones] = useState([]);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      Alert.alert('Acceso Denegado', 'Debes iniciar sesión para acceder a esta pantalla.');
      navigation.navigate('LoginScreen');
      return;
    }

    if (role !== 'Administrador') {
      Alert.alert('Acceso Denegado', 'Solo los administradores pueden registrar trabajadores.');
      navigation.goBack();
      return;
    }

    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getLocations();
        setUbicaciones(data);
        if (data.length === 0) {
          setError('No hay ubicaciones disponibles. Por favor, agregue una ubicación primero.');
        }
      } catch (error) {
        setError('Error al cargar ubicaciones: ' + error.message);
        console.log('Error al cargar ubicaciones:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, [user, role]);

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
        fechaNacimiento,
        identificacion,
        parseInt(idUbicacion),
        usuario,
        contrasena,
        rol
      );
      if (success) {
        Alert.alert('Éxito', 'Trabajador registrado correctamente');
        navigation.navigate('HomeScreen', { userId, role });
      } else {
        Alert.alert('Error', 'No se pudo registrar el trabajador. Verifica los datos o contacta al administrador.');
      }
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed: Usuarios.Identificacion')) {
        setFormErrors({ ...formErrors, identificacion: 'La identificación ya existe' });
        Alert.alert('Error', 'La identificación ya existe');
      } else if (error.message.includes('UNIQUE constraint failed: Usuarios.Usuario')) {
        setFormErrors({ ...formErrors, usuario: 'El nombre de usuario ya existe' });
        Alert.alert('Error', 'El nombre de usuario ya existe');
      } else {
        Alert.alert('Error', 'Ocurrió un error inesperado: ' + error.message);
      }
    }
  };

  const handleCancel = () => navigation.navigate('HomeScreen', { userId, role });


  if (isLoading) {
    return (
      <ImageBackground source={require('../../assets/images/background3.jpg')} style={styles.background}>
        <View style={styles.header}>
          <Image source={require('../../assets/images/Logo.png')} style={styles.logo} />
          <Text style={styles.headerText}>Heno 1.0</Text>
        </View>
        <View style={styles.container}>
          <Text style={styles.title}>Registrar Trabajador</Text>
          <Text style={styles.loadingText}>Cargando ubicaciones...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require('../../assets/images/background3.jpg')} style={styles.background}>
      <View style={styles.header}>
        <Image source={require('../../assets/images/Logo.png')} style={styles.logo} />
        <Text style={styles.headerText}>Heno 1.0</Text>
        <Text style={styles.username}>{user?.username}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Registrar Trabajador</Text>
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
  username: {
    fontFamily: 'timesbd',
    fontSize: 16,
    color: '#fff',
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
  title: {
    fontFamily: 'timesbd',
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#2E7D32',
  },
  label: {
    fontFamily: 'times',
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    fontFamily: 'times',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    color: '#333',
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
    color: '#333',
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
    fontFamily: 'times',
    fontSize: 14,
    color: '#D32F2F',
    marginBottom: 10,
  },
  loadingText: {
    fontFamily: 'timesbd',
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
});

export default RegisterWorkerScreen;