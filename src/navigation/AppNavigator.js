import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import RegisterHayScreen from '../screens/RegisterHayScreen';
import ActivitiesMenuScreen from '../screens/ActivitiesMenuScreen';
import CorteScreen from '../screens/CorteScreen';
import RastrilloAireadorScreen from '../screens/RastrilloAireadorScreen';
import RastrilloHileradorScreen from '../screens/RastrilloHileradorScreen';
import EnfardadaScreen from '../screens/EnfardadaScreen';
import CargaScreen from '../screens/CargaScreen';
import PreparacionTerrenoScreen from '../screens/PreparacionTerrenoScreen';
import ControlReportScreen from '../screens/ControlReportScreen';
import WorkerManagementScreen from '../screens/WorkerManagementScreen';
import RegisterWorkerScreen from '../screens/RegisterWorkerScreen';
import FinalizeActivityScreen from '../screens/FinalizeActivityScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditWorkerScreen from '../screens/EditWorkerScreen';
import SelectActivityScreen from '../screens/SelectActivityScreen';
import ActivityHistoryScreen from '../screens/ActivityHistoryScreen';
import WorkerReportScreen from '../screens/WorkerReportScreen';
import ManageUsersScreen from '../screens/ManageUsersScreen';
import ManageLocationsScreen from '../screens/ManageLocationsScreen';
import DownloadReportsScreen from '../screens/DownloadReportsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="LoginScreen">
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RegisterHayScreen"
        component={RegisterHayScreen}
        options={{ title: 'Registro de Heno' }}
      />
      <Stack.Screen
        name="ActivitiesMenuScreen"
        component={ActivitiesMenuScreen}
        options={{ title: 'Actividades' }}
        initialParams={{ userId: null, username: null, role: null }}
      />
      <Stack.Screen
        name="CorteScreen"
        component={CorteScreen}
        options={{ title: 'Corte' }}
      />
      <Stack.Screen
        name="RastrilloAireadorScreen"
        component={RastrilloAireadorScreen}
        options={{ title: 'Rastrillo Aireador' }}
      />
      <Stack.Screen
        name="RastrilloHileradorScreen"
        component={RastrilloHileradorScreen}
        options={{ title: 'Rastrillo Hilerador' }}
      />
      <Stack.Screen
        name="EnfardadaScreen"
        component={EnfardadaScreen}
        options={{ title: 'Enfardada' }}
      />
      <Stack.Screen
        name="CargaScreen"
        component={CargaScreen}
        options={{ title: 'Carga' }}
      />
      <Stack.Screen
        name="PreparacionTerrenoScreen"
        component={PreparacionTerrenoScreen}
        options={{ title: 'Preparación de Terreno' }}
      />
      <Stack.Screen
        name="ControlReportScreen"
        component={ControlReportScreen}
        options={{ title: 'Control de Reportes' }}
      />
      <Stack.Screen
        name="WorkerManagementScreen"
        component={WorkerManagementScreen}
        options={{ title: 'Gestión de Trabajadores' }}
      />
      <Stack.Screen
        name="RegisterWorkerScreen"
        component={RegisterWorkerScreen}
        options={{ title: 'Registrar Trabajador' }}
      />
      <Stack.Screen
        name="FinalizeActivityScreen"
        component={FinalizeActivityScreen}
        options={{ title: 'Finalizar Actividad' }}
      />
      <Stack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{ title: 'Configuración' }}
      />
      <Stack.Screen
        name="EditWorkerScreen"
        component={EditWorkerScreen}
        options={{ title: 'Editar Trabajador' }}
      />
      <Stack.Screen
        name="SelectActivityScreen"
        component={SelectActivityScreen}
        options={{ title: 'Seleccionar Actividad' }}
      />
      <Stack.Screen
        name="ActivityHistoryScreen"
        component={ActivityHistoryScreen}
        options={{ title: 'Historial de Actividades' }}
      />
      <Stack.Screen
        name="WorkerReportScreen"
        component={WorkerReportScreen}
        options={{ title: 'Reporte de Trabajador' }}
      />
      <Stack.Screen
        name="ManageUsersScreen"
        component={ManageUsersScreen}
        options={{ title: 'Gestionar Usuarios' }}
      />
      <Stack.Screen
        name="ManageLocationsScreen"
        component={ManageLocationsScreen}
        options={{ title: 'Gestionar Ubicaciones' }}
      />
      <Stack.Screen
        name="DownloadReportsScreen"
        component={DownloadReportsScreen}
        options={{ title: 'Descargar Documentación' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;