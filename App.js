import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { UserProvider } from './src/screens/UserContext'; // Ajustar la ruta
import AppNavigator from './src/navigation/AppNavigator'; // Ajustar la ruta

const App = () => {
  return (
    <UserProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </UserProvider>
  );
};

export default App;