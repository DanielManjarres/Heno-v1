import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Image, Alert, FlatList, Modal } from 'react-native';
import { getAllUsers, checkUsernameExists, updateUsername, updatePassword } from '../services/dbService';
import { useUser } from './UserContext'; // Ajusta la ruta según la ubicación de UserContext.js

const backgroundImage = require('../../assets/images/background3.jpg');
const logoImage = require('../../assets/images/Logo.png');

const ManageUsersScreen = ({ navigation }) => {
  const { user } = useUser();
  const { role, username } = user || {};
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    if (role !== 'Administrador') {
      Alert.alert('Acceso Denegado', 'Solo los administradores pueden gestionar usuarios.');
      navigation.goBack();
      return;
    }

    fetchUsers();
  }, [role]);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setNewUsername(user.Usuario);
    setNewPassword('');
    setModalVisible(true);
  };

  const handleSaveChanges = async () => {
    if (!newUsername && !newPassword) {
      Alert.alert('Error', 'Debe proporcionar al menos un nuevo nombre de usuario o contraseña.');
      return;
    }

    try {
      // Verificar si el nuevo nombre de usuario ya existe (si se cambió)
      if (newUsername && newUsername !== selectedUser.Usuario) {
        const usernameExists = await checkUsernameExists(newUsername);
        if (usernameExists) {
          Alert.alert('Error', 'El nombre de usuario ya existe.');
          return;
        }
        await updateUsername(selectedUser.ID_usuario, newUsername);
      }

      // Actualizar contraseña si se proporcionó una nueva
      if (newPassword) {
        await updatePassword(selectedUser.ID_usuario, newPassword);
      }

      Alert.alert('Éxito', 'Usuario actualizado correctamente.');
      setModalVisible(false);
      setSelectedUser(null);
      setNewUsername('');
      setNewPassword('');
      fetchUsers();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <Text style={styles.userText}>
        {item.Nombre} {item.Apellido} - {item.Rol} {item.Nombre_ubicacion ? `(${item.Nombre_ubicacion})` : '(Sin ubicación)'}
      </Text>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#2E7D32' }]}
          onPress={() => handleEditUser(item)}
        >
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
      </View>
    </View>
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

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.header}>
        <Image source={logoImage} style={styles.logo} />
        <Text style={styles.headerText}>Heno 1.0</Text>
        <Text style={styles.username}>{username}</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Gestionar Usuarios</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lista de Usuarios</Text>
          <FlatList
            data={users}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.ID_usuario.toString()}
            contentContainerStyle={styles.userList}
            showsVerticalScrollIndicator={true}
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Modal para editar usuario */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Editar Usuario</Text>
              {selectedUser && (
                <Text style={styles.modalSubtitle}>
                  {selectedUser.Nombre} {selectedUser.Apellido} ({selectedUser.Rol})
                </Text>
              )}
              <TextInput
                style={styles.input}
                placeholder="Nuevo nombre de usuario"
                value={newUsername}
                onChangeText={setNewUsername}
              />
              <TextInput
                style={styles.input}
                placeholder="Nueva contraseña (opcional)"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#2E7D32' }]}
                  onPress={handleSaveChanges}
                >
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#D32F2F' }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  },
  title: {
    fontFamily: 'timesbd',
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    flex: 1, // Asegura que la sección ocupe todo el espacio disponible
  },
  sectionTitle: {
    fontFamily: 'timesbd',
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  button: {
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
  userList: {
    paddingBottom: 20,
  },
  userItem: {
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
  userText: {
    fontFamily: 'timesbd',
    fontSize: 16,
    color: '#333',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  actionButtonText: {
    fontFamily: 'timesbd',
    color: '#fff',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'timesbd',
    fontSize: 20,
    marginBottom: 10,
    color: '#333',
  },
  modalSubtitle: {
    fontFamily: 'timesbd',
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  input: {
    fontFamily: 'times',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    width: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
});

export default ManageUsersScreen;