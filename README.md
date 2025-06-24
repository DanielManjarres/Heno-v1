# Heno 1.0 - Aplicación de Gestión Agrícola

## Descripción
Heno 1.0 es una aplicación móvil desarrollada con React Native diseñada para gestionar actividades agrícolas y el registro de heno recolectado por trabajadores. Está orientada a administradores y trabajadores, permitiendo el seguimiento de tareas diarias, la finalización de actividades, el registro de producción de heno, y la generación de reportes detallados en formato Excel. La aplicación utiliza una base de datos remota (SQLite Cloud) para almacenar y consultar datos, ofreciendo una solución práctica para la administración de cultivos.

## Características Principales
- **Autenticación de Usuarios**: Inicio de sesión con roles de administrador y trabajador para un acceso controlado.
- **Gestión de Actividades**: Registro, inicio, finalización y cancelación de actividades agrícolas, con detalles como filas hileradas o pacas de heno según el tipo de actividad.
- **Registro de Heno**: Ingreso manual de la cantidad de heno recolectado (en kilogramos) por día por cada trabajador.
- **Reportes Detallados**: Descarga de reportes diarios en formato Excel que combinan datos de actividades y producción de heno por trabajador.
- **Permisos de Almacenamiento**: Solicitud dinámica de permisos para guardar archivos en el dispositivo.
- **Interfaz Amigable**: Diseño con fondos personalizados, navegación intuitiva y soporte para múltiples pantallas (inicio de sesión, registro de heno, finalización de actividades, descarga de reportes).

## Requisitos
- **Node.js**: Versión 14.x o superior.
- **React Native**: Entorno configurado para desarrollo móvil (Android/iOS).
- **Dependencias**: Instala las dependencias listadas en `package.json`.
- **Base de Datos**: Acceso a una instancia de SQLite Cloud con la conexión configurada en `dbService.js`.
- **Permisos**: Acceso a almacenamiento en el dispositivo para descargar reportes (requerido en Android).
- **Herramientas Adicionales**: Android Studio (para Android) o Xcode (para iOS), según la plataforma objetivo.

## Instalación

1. **Clona el Repositorio**
   ```bash
   git clone https://github.com/DanielManjarres/Heno-v1.git
   cd heno-1.0
2. **Instala las Dependencias**
   npm install
3. **Configura la Base de Datos**
   Abre el archivo src/services/dbService.js.
   Actualiza la variable connectionString con la URL y API key de tu instancia SQLite Cloud (ejemplo: sqlitecloud://cm9fk6scnz.g2.sqlite.cloud:8860/Eco?apikey=tu-api-key).
   Asegúrate de que las tablas (Usuarios, Ubicaciones, Registro_Actividades, Registro_Heno, Actividades, Maquinas) estén creadas y pobladas con datos iniciales.
4. **Ejecuta la Aplicación**
   cd android
   ./gradlew clean
   cd ..
   npx react-native run-android
## USO
   **Inicio de Sesión:**
   Abre la aplicación y accede con tus credenciales (usuario y contraseña) registradas en la base de datos.
   Los administradores tienen acceso a gestionar actividades y descargar reportes, mientras que los trabajadores pueden registrar heno.
   **Registro de Heno:**
   Navega a la pantalla "Registro de Heno".
   Ingresa la cantidad de heno recolectado (en kg) y presiona "GUARDAR" para registrar los datos.
   **Gestión de Actividades:**
   Selecciona una actividad desde la pantalla correspondiente.
   Inicia, finaliza (ingresando filas hileradas o pacas de heno según la actividad) o cancela la actividad según sea necesario.
   **Descarga de Reportes:**
   Ve a la pantalla "Descargar Documentación".
   Presiona "Descargar Reporte Completo" para generar un archivo Excel con los datos diarios de actividades y heno recolectado.
   El archivo se guardará en la carpeta de descargas del dispositivo.
