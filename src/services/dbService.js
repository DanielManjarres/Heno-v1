import { Database } from '@sqlitecloud/drivers';

// Inicialización de la base de datos
const connectionString = 'sqlitecloud://cm9fk6scnz.g2.sqlite.cloud:8860/Eco?apikey=r2cnw0rTHrDEFx9AHfeNjuH8sOeKGh46BALPbJjhkrU';
let db;

try {
  console.log('Inicializando conexión a la base de datos...');
  db = new Database(connectionString);
  console.log('Conexión a la base de datos inicializada con éxito.');
} catch (error) {
  console.error('Error al inicializar la base de datos:', error.message);
  throw new Error('No se pudo inicializar la base de datos: ' + error.message);
}

// Función para agregar un timeout a las promesas
const withTimeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Tiempo de espera agotado. Verifica tu conexión e intenta de nuevo.')), ms);
    }),
  ]);
};

// Verificar la conexión al cargar el módulo
const testConnection = async () => {
  try {
    console.log('Probando conexión a la base de datos...');
    const result = await withTimeout(db.sql`SELECT 1 AS test`, 10000);
    console.log('Resultado de la prueba de conexión:', result);
    return true;
  } catch (error) {
    console.error('Error al probar la conexión a la base de datos:', error.message);
    throw new Error('No se pudo conectar a la base de datos: ' + error.message);
  }
};

// Ejecutar la prueba de conexión al cargar el módulo
testConnection().catch(error => {
  console.error('Fallo en la prueba de conexión inicial:', error.message);
});

// --- Autenticación ---
export const loginUser = async (username, password) => {
  try {
    if (!db || !db.sql) {
      throw new Error('La base de datos no está inicializada correctamente.');
    }
    console.log('Intentando iniciar sesión con:', { username, password });
    const result = await withTimeout(
      db.sql`SELECT * FROM Usuarios WHERE Usuario = ${username} AND Contraseña = ${password}`,
      10000
    );
    if (result.length === 0) {
      console.log('No se encontraron usuarios con esas credenciales');
      return null;
    }
    console.log('Usuario encontrado:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error en loginUser:', error.message);
    throw new Error('Error al iniciar sesión: ' + error.message);
  }
};
export const updateUsername = async (userId, newUsername) => {
  try {
    if (!db || !db.sql) {
      throw new Error('La base de datos no está inicializada correctamente.');
    }
    const result = await withTimeout(
      db.sql`
        UPDATE Usuarios
        SET Usuario = ${newUsername}
        WHERE ID_usuario = ${userId}
      `,
      10000
    );
    return result.changes > 0;
  } catch (error) {
    console.error('Error al actualizar nombre de usuario:', error.message);
    throw new Error('No se pudo actualizar el nombre de usuario: ' + error.message);
  }
};

export const updatePassword = async (userId, newPassword) => {
  try {
    if (!db || !db.sql) {
      throw new Error('La base de datos no está inicializada correctamente.');
    }
    const result = await withTimeout(
      db.sql`
        UPDATE Usuarios
        SET Contraseña = ${newPassword}
        WHERE ID_usuario = ${userId}
      `,
      10000
    );
    return result.changes > 0;
  } catch (error) {
    console.error('Error al actualizar contraseña:', error.message);
    throw new Error('No se pudo actualizar la contraseña: ' + error.message);
  }
};
// --- Gestión de Ubicaciones ---
export const getLocations = async () => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      if (!db || !db.sql) {
        throw new Error('La base de datos no está inicializada correctamente.');
      }
      console.log(`Intentando obtener ubicaciones (intento ${attempt + 1}/${maxRetries})`);
      const result = await withTimeout(
        db.sql`
          SELECT 
            u.ID_ubicacion,
            u.Nombre,
            u.ID_maquina,
            u.Area,
            m.Nombre AS Nombre_maquina
          FROM Ubicaciones u
          JOIN Maquinas m ON u.ID_maquina = m.ID_maquina
        `,
        15000
      );
      console.log('Resultado de obtener ubicaciones:', result);
      return Array.isArray(result) ? result : result.rows;
    } catch (error) {
      attempt++;
      console.error(`Error al obtener ubicaciones (intento ${attempt}/${maxRetries}):`, error.message);
      if (attempt === maxRetries) {
        throw new Error('No se pudieron cargar las ubicaciones después de varios intentos: ' + error.message);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

export const addLocation = async (locationName, machineId, area) => {
  try {
    if (!db || !db.sql) {
      throw new Error('La base de datos no está inicializada correctamente.');
    }
    const trimmedName = locationName.trim();
    console.log('Añadiendo ubicación con nombre:', trimmedName, 'máquina:', machineId, 'área:', area);
    const result = await withTimeout(
      db.sql`
        INSERT INTO Ubicaciones (Nombre, ID_maquina, Area)
        VALUES (${trimmedName}, ${parseInt(machineId)}, ${parseInt(area)})
      `,
      15000
    );
    console.log('Resultado de añadir ubicación:', result);
    return result.changes > 0;
  } catch (error) {
    console.error('Error al añadir ubicación:', error.message);
    throw new Error('No se pudo añadir la ubicación: ' + error.message);
  }
};

export const deleteLocation = async (locationId) => {
  try {
    if (!db || !db.sql) {
      throw new Error('La base de datos no está inicializada correctamente.');
    }
    const parsedLocationId = parseInt(locationId);
    console.log('Eliminando ubicación con ID:', parsedLocationId);

    // Verificar si la ubicación existe y está en uso en una sola consulta
    const usageResult = await withTimeout(
      db.sql`
        SELECT 
          (SELECT COUNT(*) FROM Usuarios WHERE ID_ubicacion = ${parsedLocationId}) AS userCount,
          (SELECT COUNT(*) FROM Registro_actividades WHERE ID_ubicacion = ${parsedLocationId}) AS activityCount
      `,
      15000
    );
    console.log('Resultado de verificar uso de ubicación:', usageResult);

    if (usageResult.length === 0) {
      throw new Error('La ubicación no existe en la base de datos.');
    }
    const { userCount, activityCount } = usageResult[0];
    if (userCount > 0 || activityCount > 0) {
      throw new Error('No se puede eliminar la ubicación porque está siendo usada por usuarios o actividades.');
    }

    const result = await withTimeout(
      db.sql`DELETE FROM Ubicaciones WHERE ID_ubicacion = ${parsedLocationId}`,
      15000
    );
    console.log('Resultado de la consulta DELETE:', result);
    return result.changes > 0;
  } catch (error) {
    console.error('Error al eliminar ubicación:', error.message);
    throw new Error('No se pudo eliminar la ubicación: ' + error.message);
  }
};
export const getAllUsers = async () => {
  try {
    if (!db || !db.sql) {
      throw new Error('La base de datos no está inicializada correctamente.');
    }

    const result = await withTimeout(
      db.sql`
        SELECT 
          u.ID_usuario,
          u.Nombre,
          u.Apellido,
          u.Usuario,
          u.Rol,
          u.ID_ubicacion,
          ub.Nombre AS Nombre_ubicacion,
          COALESCE((
            SELECT SUM(
              CASE 
                WHEN (STRFTIME('%s', ra.Hora_fin) - STRFTIME('%s', ra.Hora_inicio)) < 0 
                THEN (STRFTIME('%s', ra.Hora_fin) - STRFTIME('%s', ra.Hora_inicio)) + 86400
                ELSE (STRFTIME('%s', ra.Hora_fin) - STRFTIME('%s', ra.Hora_inicio))
              END / 3600.0
            )
            FROM Registro_Actividades ra
            WHERE ra.ID_trabajador = u.ID_usuario 
              AND ra.Estado = 'Finalizada'
              AND ra.Hora_fin IS NOT NULL
              AND ra.Hora_inicio IS NOT NULL
          ), 0) AS Horas_trabajadas,
          COALESCE((
            SELECT SUM(rh.Cantidad_kg)
            FROM Registro_Heno rh
            WHERE rh.ID_trabajador = u.ID_usuario
          ), 0) AS Heno_recolectado
        FROM Usuarios u
        LEFT JOIN Ubicaciones ub ON u.ID_ubicacion = ub.ID_ubicacion
      `,
      10000
    );

    console.log('Datos obtenidos de getAllUsers:', result);
    return Array.isArray(result) ? result : result.rows || [];
  } catch (error) {
    console.error('Error al obtener usuarios:', error.message);
    throw new Error('No se pudo obtener la lista de usuarios: ' + error.message);
  }
};
export const checkUsernameExists = async (username) => {
  try {
    if (!db || !db.sql) {
      throw new Error('La base de datos no está inicializada correctamente.');
    }
    const result = await withTimeout(
      db.sql`
        SELECT COUNT(*) as count 
        FROM Usuarios 
        WHERE Usuario = ${username}
      `,
      10000
    );
    const count = Array.isArray(result) ? result[0].count : result.rows[0].count;
    return count > 0;
  } catch (error) {
    console.error('Error al verificar nombre de usuario:', error.message);
    throw new Error('No se pudo verificar el nombre de usuario: ' + error.message);
  }
};

export const checkIdentificationExists = async (identification) => {
  try {
    if (!db || !db.sql) {
      throw new Error('La base de datos no está inicializada correctamente.');
    }
    const result = await withTimeout(
      db.sql`
        SELECT COUNT(*) as count 
        FROM Usuarios 
        WHERE Identificacion = ${identification}
      `,
      10000
    );
    const count = Array.isArray(result) ? result[0].count : result.rows[0].count;
    return count > 0;
  } catch (error) {
    console.error('Error al verificar identificación:', error.message);
    throw new Error('No se pudo verificar la identificación: ' + error.message);
  }
};

// --- Gestión de Máquinas ---
export const getMachines = async () => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      if (!db || !db.sql) {
        throw new Error('La base de datos no está inicializada correctamente.');
      }
      console.log(`Intentando obtener máquinas (intento ${attempt + 1}/${maxRetries})`);
      const result = await withTimeout(db.sql`SELECT * FROM Maquinas`, 15000);
      console.log('Resultado de obtener máquinas:', result);
      return result;
    } catch (error) {
      attempt++;
      console.error(`Error al obtener máquinas (intento ${attempt}/${maxRetries}):`, error.message);
      if (attempt === maxRetries) {
        throw new Error('No se pudieron cargar las máquinas después de varios intentos: ' + error.message);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};


// --- Gestión de Trabajadores ---
export const getWorkers = async () => {
  try {
    if (!db || !db.sql) {
      throw new Error('La base de datos no está inicializada correctamente.');
    }

    const result = await withTimeout(
      db.sql`
        SELECT 
          u.ID_usuario,
          u.Nombre,
          u.Apellido,
          u.Fecha_nacimiento, -- Reemplaza Edad
          u.Identificacion,
          u.ID_ubicacion,
          ub.Nombre AS Nombre_ubicacion,
          COALESCE((
            SELECT SUM(
              CASE 
                WHEN (STRFTIME('%s', ra.Hora_fin) - STRFTIME('%s', ra.Hora_inicio)) < 0 
                THEN (STRFTIME('%s', ra.Hora_fin) - STRFTIME('%s', ra.Hora_inicio)) + 86400
                ELSE (STRFTIME('%s', ra.Hora_fin) - STRFTIME('%s', ra.Hora_inicio))
              END / 3600.0
            )
            FROM Registro_Actividades ra
            WHERE ra.ID_trabajador = u.ID_usuario 
              AND ra.Estado = 'Finalizada'
              AND ra.Hora_fin IS NOT NULL
              AND ra.Hora_inicio IS NOT NULL
          ), 0) AS Horas_trabajadas,
          COALESCE((
            SELECT SUM(rh.Cantidad_kg)
            FROM Registro_Heno rh
            WHERE rh.ID_trabajador = u.ID_usuario
          ), 0) AS Heno_recolectado
        FROM Usuarios u
        LEFT JOIN Ubicaciones ub ON u.ID_ubicacion = ub.ID_ubicacion
        WHERE u.Rol = 'Trabajador'
      `,
      10000
    );

    console.log('Datos obtenidos de getWorkers:', result);
    return Array.isArray(result) ? result : result.rows || [];
  } catch (error) {
    console.error('Error al obtener trabajadores:', error.message);
    throw new Error('No se pudo obtener la lista de trabajadores: ' + error.message);
  }
};
export const registerWorker = async (nombre, apellido, fechaNacimiento, identificacion, idUbicacion, usuario, contrasena, rol) => {
  try {
    if (!db || !db.sql) {
      throw new Error('La base de datos no está inicializada correctamente.');
    }

    const result = await withTimeout(
      db.sql`
        INSERT INTO Usuarios (Nombre, Apellido, Fecha_nacimiento, Identificacion, ID_ubicacion, Usuario, Contraseña, Rol)
        VALUES (${nombre}, ${apellido}, ${fechaNacimiento}, ${identificacion}, ${parseInt(idUbicacion)}, ${usuario}, ${contrasena}, ${rol})
      `,
      10000
    );

    return true;
  } catch (error) {
    console.error('Error al registrar trabajador:', error.message);
    throw new Error('No se pudo registrar el trabajador: ' + error.message);
  }
};

export const updateWorker = async (workerId, workerData) => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      if (!db || !db.sql) {
        throw new Error('La base de datos no está inicializada correctamente.');
      }

      console.log(`Intentando actualizar trabajador ID ${workerId} (intento ${attempt + 1}/${maxRetries})`);

      const result = await db.sql`
        UPDATE Usuarios
        SET 
          Nombre = ${workerData.Nombre},
          Apellido = ${workerData.Apellido},
          Fecha_nacimiento = ${workerData.Fecha_nacimiento},
          Identificacion = ${workerData.Identificacion},
          ID_ubicacion = ${workerData.ID_ubicacion} -- Cambiado de Ubicacion
        WHERE ID_usuario = ${workerId}
      `;

      console.log('Trabajador actualizado exitosamente:', result);
      return true;
    } catch (error) {
      attempt++;
      console.error(`Error al actualizar trabajador (intento ${attempt}/${maxRetries}):`, error.message);
      if (attempt === maxRetries) {
        throw new Error('No se pudo actualizar el trabajador después de varios intentos: ' + error.message);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};
export const deleteWorker = async (workerId) => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      if (!db || !db.sql) {
        throw new Error('La base de datos no está inicializada correctamente.');
      }

      console.log(`Intentando eliminar trabajador ID ${workerId} (intento ${attempt + 1}/${maxRetries})`);

      await db.sql`BEGIN TRANSACTION`;
      await db.sql`DELETE FROM Registro_Heno WHERE ID_trabajador = ${workerId}`;
      await db.sql`DELETE FROM Registro_Actividades WHERE ID_trabajador = ${workerId}`;
      const result = await db.sql`DELETE FROM Usuarios WHERE ID_usuario = ${workerId}`;
      await db.sql`COMMIT`;

      console.log('Trabajador eliminado exitosamente:', result);
      return true;
    } catch (error) {
      await db.sql`ROLLBACK`;
      attempt++;
      console.error(`Error al eliminar trabajador (intento ${attempt}/${maxRetries}):`, error.message);
      if (attempt === maxRetries) {
        throw new Error('No se pudo eliminar el trabajador después de varios intentos: ' + error.message);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

// --- Gestión de Actividades ---
export const startActivity = async (activityId, userId, locationId, date, time) => {
  try {
    if (!db || !db.sql) {
      throw new Error('La base de datos no está inicializada correctamente.');
    }
    console.log('Iniciando actividad con:', { activityId, userId, locationId, date, time });

    const result = await withTimeout(
      db.sql`
        INSERT INTO Registro_Actividades (
          ID_actividad,
          ID_trabajador,
          ID_ubicacion,
          Fecha,
          Hora_inicio,
          Estado
        ) VALUES (
          ${parseInt(activityId)},
          ${parseInt(userId)},
          ${parseInt(locationId)},
          ${date},
          ${time},
          'En curso'
        )
      `,
      10000
    );
    console.log('Resultado de insertar actividad:', result);

    const idResult = await withTimeout(db.sql`SELECT last_insert_rowid() AS ID_registro`, 10000);
    console.log('ID del registro insertado:', idResult);
    return idResult[0].ID_registro;
  } catch (error) {
    console.error('Error al iniciar actividad:', error.message);
    throw new Error('No se pudo iniciar la actividad: ' + error.message);
  }
};

export const finalizeActivity = async (recordId, filasHileradas = 0, pacasHeno = 0) => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      if (!db || !db.sql) {
        throw new Error('La base de datos no está inicializada correctamente.');
      }

      // Obtener la actividad para calcular la duración
      const getActivityQuery = `
        SELECT Fecha, Hora_inicio, Estado 
        FROM Registro_actividades 
        WHERE ID_registro = ${recordId}
      `;
      const activityResult = await withTimeout(db.sql(getActivityQuery), 10000);
      const activities = Array.isArray(activityResult) ? activityResult : activityResult.rows || [];
      if (!activities || activities.length === 0) {
        throw new Error('Actividad no encontrada.');
      }

      const activity = activities[0];
      if (activity.Estado !== 'En curso') {
        throw new Error('La actividad no está en curso y no puede ser finalizada.');
      }

      const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

      let query = `
        UPDATE Registro_actividades 
        SET 
          Estado = 'Finalizada',
          Hora_fin = '${currentTime}',
          Filas_hileradas = ${filasHileradas},
          Pacas_heno = ${pacasHeno}
        WHERE ID_registro = ${recordId}
      `;

      const updateResult = await withTimeout(db.sql(query), 10000);
      console.log('Actividad finalizada con ID:', recordId);
      return true; // Indicar éxito
    } catch (error) {
      attempt++;
      console.error(`Error al finalizar actividad (intento ${attempt}/${maxRetries}):`, error.message);
      if (attempt === maxRetries) {
        throw new Error('No se pudo finalizar la actividad después de varios intentos: ' + error.message);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

export const cancelActivity = async (recordId) => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      if (!db || !db.sql) {
        throw new Error('La base de datos no está inicializada correctamente.');
      }
      console.log('Eliminando actividad con ID:', recordId);

      // Verificar si la actividad existe y está en curso
      const activityCheckResult = await withTimeout(
        db.sql`
          SELECT Estado 
          FROM Registro_Actividades 
          WHERE ID_registro = ${parseInt(recordId)}
        `,
        10000
      );
      const activities = Array.isArray(activityCheckResult) ? activityCheckResult : activityCheckResult.rows || [];
      if (!activities || activities.length === 0) {
        throw new Error('Actividad no encontrada.');
      }
      if (activities[0].Estado !== 'En curso') {
        throw new Error('La actividad no está en curso y no puede ser cancelada.');
      }

      await withTimeout(
        db.sql`DELETE FROM Registro_Actividades WHERE ID_registro = ${parseInt(recordId)}`,
        10000
      );
      console.log('Actividad eliminada con ID:', recordId);
      return true; // Indicar éxito
    } catch (error) {
      attempt++;
      console.error(`Error al cancelar actividad (intento ${attempt}/${maxRetries}):`, error.message);
      if (attempt === maxRetries) {
        throw new Error('No se pudo cancelar la actividad después de varios intentos: ' + error.message);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

export const getActivities = async (userId, role, status = 'En curso') => {
  try {
    if (!db || !db.sql) {
      throw new Error('La base de datos no está inicializada correctamente.');
    }
    console.log('Obteniendo actividades con estado:', status);

    let query = `
      SELECT 
        r.ID_registro, 
        r.ID_actividad, 
        a.Nombre_actividad, 
        r.ID_ubicacion, 
        u.Nombre AS Ubicacion,
        u.ID_maquina,
        u.Area,
        m.Nombre AS Maquina,
        r.Fecha, 
        r.Hora_inicio, 
        r.Hora_fin,
        r.Estado,
        r.Filas_hileradas,
        r.Pacas_heno,
        u2.Nombre AS Nombre_usuario
      FROM Registro_actividades r
      JOIN Actividades a ON r.ID_actividad = a.ID_actividad
      JOIN Ubicaciones u ON r.ID_ubicacion = u.ID_ubicacion
      JOIN Maquinas m ON u.ID_maquina = m.ID_maquina
      JOIN Usuarios u2 ON r.ID_trabajador = u2.ID_usuario
      WHERE r.Estado = '${status}'  -- Aseguramos que el valor esté entre comillas
    `;
    if (role !== 'Administrador' && userId) {
      query += ` AND r.ID_trabajador = ${parseInt(userId)}`;
    }
    query += ` ORDER BY r.Fecha DESC, r.Hora_inicio DESC`;

    const result = await withTimeout(db.sql(query), 10000);
    console.log('Resultado de obtener actividades:', result);
    return Array.isArray(result) ? result : []; // Asegurarnos de que siempre devolvamos un array
  } catch (error) {
    console.error('Error al obtener actividades:', error.message);
    throw new Error('No se pudieron cargar las actividades: ' + error.message);
  }
};

export const getActivityHistory = async (userId, role) => {
  try {
    if (!db || !db.sql) {
      throw new Error('La base de datos no está inicializada correctamente.');
    }
    console.log('Obteniendo historial de actividades...');

    let query = `
      SELECT 
        r.ID_registro, 
        r.ID_actividad, 
        a.Nombre_actividad, 
        r.ID_ubicacion, 
        u.Nombre AS Ubicacion,
        u.ID_maquina,
        u.Area,
        m.Nombre AS Maquina,
        r.Fecha, 
        r.Hora_inicio, 
        r.Hora_fin,
        r.Estado,
        r.Filas_hileradas,
        r.Pacas_heno,
        u2.Nombre AS Nombre_usuario
      FROM Registro_actividades r
      JOIN Actividades a ON r.ID_actividad = a.ID_actividad
      JOIN Ubicaciones u ON r.ID_ubicacion = u.ID_ubicacion
      JOIN Maquinas m ON u.ID_maquina = m.ID_maquina
      JOIN Usuarios u2 ON r.ID_trabajador = u2.ID_usuario
      WHERE r.Estado = 'Finalizada'
    `;
    if (role !== 'Administrador' && userId) {
      query += ` AND r.ID_trabajador = ${parseInt(userId)}`;
    }
    query += ` ORDER BY r.Fecha DESC, r.Hora_inicio DESC`;

    const result = await withTimeout(db.sql(query), 10000);
    console.log('Historial de actividades:', result);
    return Array.isArray(result) ? result : result.rows || [];
  } catch (error) {
    console.error('Error al obtener historial de actividades:', error.message);
    throw new Error('No se pudo cargar el historial: ' + error.message);
  }
};
export const getLastActivity = async (activityId, userId, status = null) => {
  try {
    if (!db || !db.sql) {
      throw new Error('La base de datos no está inicializada correctamente.');
    }
    console.log('Obteniendo última actividad para ID_actividad:', activityId, 'y ID_trabajador:', userId);

    let query = `
      SELECT 
        r.ID_registro,
        r.ID_actividad,
        r.ID_trabajador,
        r.ID_ubicacion,
        r.Fecha,
        r.Hora_inicio,
        r.Hora_fin,
        r.Estado,
        a.Nombre_actividad,
        u.Nombre AS Ubicacion,
        u.ID_maquina,
        u.Area,
        m.Nombre AS Maquina,
        u2.Nombre AS Nombre_usuario
      FROM Registro_actividades r
      JOIN Actividades a ON r.ID_actividad = a.ID_actividad
      JOIN Ubicaciones u ON r.ID_ubicacion = u.ID_ubicacion
      JOIN Maquinas m ON u.ID_maquina = m.ID_maquina
      JOIN Usuarios u2 ON r.ID_trabajador = u2.ID_usuario
      WHERE r.ID_actividad = ${parseInt(activityId)} AND r.ID_trabajador = ${parseInt(userId)}
    `;
    if (status) {
      query += ` AND r.Estado = '${status}'`; // Escapamos el valor de status
    }
    query += ` ORDER BY r.ID_registro DESC LIMIT 1`;

    const result = await withTimeout(db.sql(query), 10000);
    console.log('Resultado de obtener última actividad:', result);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error al obtener última actividad:', error.message);
    throw new Error('No se pudo obtener la última actividad: ' + error.message);
  }
};

export const getActivityDetails = async (recordId) => {
  try {
    if (!db || !db.sql) {
      throw new Error('La base de datos no está inicializada correctamente.');
    }
    console.log('Obteniendo detalles de la actividad con ID_registro:', recordId);

    const query = `
      SELECT 
        r.ID_registro, 
        r.ID_actividad, 
        a.Nombre_actividad, 
        r.ID_ubicacion, 
        u.Nombre AS Ubicacion,
        u.ID_maquina,
        u.Area,
        m.Nombre AS Maquina,
        r.Fecha, 
        r.Hora_inicio, 
        r.Hora_fin,
        r.Estado,
        r.Filas_hileradas,
        r.Pacas_heno,
        u2.Nombre AS Nombre_usuario
      FROM Registro_actividades r
      JOIN Actividades a ON r.ID_actividad = a.ID_actividad
      JOIN Ubicaciones u ON r.ID_ubicacion = u.ID_ubicacion
      JOIN Maquinas m ON u.ID_maquina = m.ID_maquina
      JOIN Usuarios u2 ON r.ID_trabajador = u2.ID_usuario
      WHERE r.ID_registro = ${recordId}
    `;

    const result = await withTimeout(db.sql(query), 10000);
    console.log('Detalles de la actividad:', result);
    const activities = Array.isArray(result) ? result : result.rows || [];
    if (!activities || activities.length === 0) {
      throw new Error('Actividad no encontrada.');
    }
    return activities[0];
  } catch (error) {
    console.error('Error al obtener detalles de la actividad:', error.message);
    throw new Error('No se pudieron cargar los detalles de la actividad: ' + error.message);
  }
};

export const getUserLocation = async (userId) => {
  try {
    if (!db || !db.sql) {
      throw new Error('La base de datos no está inicializada correctamente.');
    }
    console.log('Obteniendo ubicación del usuario con ID:', userId);

    const result = await withTimeout(
      db.sql`
        SELECT 
          u.ID_ubicacion, 
          ub.Nombre AS Nombre, 
          ub.ID_maquina, 
          ub.Area, 
          m.Nombre AS Maquina
        FROM Usuarios u
        JOIN Ubicaciones ub ON u.ID_ubicacion = ub.ID_ubicacion
        JOIN Maquinas m ON ub.ID_maquina = m.ID_maquina
        WHERE u.ID_usuario = ${parseInt(userId)}
      `,
      10000
    );
    console.log('Resultado de obtener ubicación del usuario:', result);

    if (result.length === 0) {
      throw new Error(`No se encontró la ubicación para el usuario con ID ${userId}.`);
    }
    return result[0];
  } catch (error) {
    console.error('Error al obtener ubicación del usuario:', error.message);
    throw new Error('No se pudo obtener la ubicación del usuario: ' + error.message);
  }
};

// --- Gestión de Registros de Heno ---
export const saveHayRecord = async (cantidad_kg, userId) => {
  try {
    if (!db || !db.sql) {
      throw new Error('La base de datos no está inicializada correctamente.');
    }

    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

    const result = await withTimeout(
      db.sql`
        INSERT INTO Registro_Heno (ID_trabajador, Cantidad_kg, Fecha, Hora)
        VALUES (${parseInt(userId)}, ${parseFloat(cantidad_kg)}, ${currentDate}, ${currentTime})
      `,
      10000
    );
    console.log('Resultado de guardar registro de heno:', result);
    return result.changes > 0;
  } catch (error) {
    console.error('Error al guardar registro de heno:', error.message);
    throw new Error('No se pudo guardar el registro de heno: ' + error.message);
  }
};

export const getHayRecords = async (userId = null) => {
  try {
    if (!db || !db.sql) {
      throw new Error('La base de datos no está inicializada correctamente.');
    }

    console.log('Ejecutando getHayRecords con userId:', userId);

    let query = `
      SELECT 
        rh.ID_registro,
        rh.ID_trabajador,
        rh.Cantidad_kg,
        rh.Fecha,
        rh.Hora,
        ub.Nombre AS Ubicacion
      FROM Registro_Heno rh
      LEFT JOIN Usuarios u ON rh.ID_trabajador = u.ID_usuario
      LEFT JOIN Ubicaciones ub ON u.ID_ubicacion = ub.ID_ubicacion
    `;
    if (userId) {
      query += ` WHERE rh.ID_trabajador = ${parseInt(userId)}`;
    }
    query += ` ORDER BY rh.Fecha DESC, rh.Hora DESC`;

    const result = await withTimeout(db.sql(query), 10000);
    console.log('Resultado de la consulta para usuario ID', userId, ':', result);
    const records = Array.isArray(result) ? result : result.rows || [];
    console.log('Registros de heno procesados para usuario ID', userId, ':', records);
    return records;
  } catch (error) {
    console.error('Error al obtener registros de heno:', error.message);
    throw new Error('No se pudieron obtener los registros de heno: ' + error.message);
  }
};

export const getWorkerHenoRecords = async (workerId) => {
  try {
    if (!db || !db.sql) {
      throw new Error('La base de datos no está inicializada correctamente.');
    }

    console.log('Ejecutando getWorkerHenoRecords con workerId:', workerId);
    const query = `
      SELECT 
        rh.Fecha, 
        rh.Hora, 
        rh.Cantidad_kg AS Cantidad, 
        ub.Nombre AS Nombre_ubicacion
      FROM Registro_Heno rh
      LEFT JOIN Usuarios u ON rh.ID_trabajador = u.ID_usuario
      LEFT JOIN Ubicaciones ub ON u.ID_ubicacion = ub.ID_ubicacion
      WHERE rh.ID_trabajador = ${parseInt(workerId)}
      ORDER BY rh.Fecha DESC, rh.Hora DESC
    `;
    const result = await withTimeout(db.sql(query), 10000);
    console.log('Resultado de la consulta para trabajador ID', workerId, ':', result);
    const records = Array.isArray(result) ? result : result.rows || [];
    console.log('Registros de heno procesados para trabajador ID', workerId, ':', records);
    return records;
  } catch (error) {
    console.log('Error en getWorkerHenoRecords:', error);
    throw error;
  }
};


export const getDailyCombinedRecords = async () => {
  try {
    if (!db || !db.sql) {
      throw new Error('La base de datos no está inicializada correctamente.');
    }

    const result = await withTimeout(
      db.sql`
        SELECT 
          ra.ID_registro AS Activity_ID,
          ra.Fecha,
          ra.Hora_inicio,
          ra.Hora_fin,
          ra.ID_actividad,
          a.Nombre_actividad,
          ra.ID_trabajador,
          u.Nombre AS Nombre_trabajador,
          u.Apellido AS Apellido_trabajador,
          ra.ID_ubicacion,
          ub.Nombre AS Nombre_ubicacion,
          ra.Filas_hileradas,
          ra.Pacas_heno,
          COALESCE((
            SELECT rh.Cantidad_kg
            FROM Registro_Heno rh
            WHERE rh.ID_trabajador = ra.ID_trabajador
              AND rh.Fecha = ra.Fecha
              AND rh.Hora = ra.Hora_inicio
            LIMIT 1
          ), 0) AS Cantidad_kg
        FROM Registro_Actividades ra
        JOIN Actividades a ON ra.ID_actividad = a.ID_actividad
        JOIN Usuarios u ON ra.ID_trabajador = u.ID_usuario
        JOIN Ubicaciones ub ON ra.ID_ubicacion = ub.ID_ubicacion
        WHERE u.Rol = 'Trabajador'
          AND ra.Estado = 'Finalizada'
        ORDER BY ra.Fecha DESC, ra.Hora_inicio DESC
      `,
      10000
    );

    console.log('Datos obtenidos de getDailyCombinedRecords:', result);
    return Array.isArray(result) ? result : result.rows || [];
  } catch (error) {
    console.error('Error al obtener registros diarios combinados:', error.message);
    throw new Error('No se pudieron obtener los registros diarios combinados: ' + error.message);
  }
};
