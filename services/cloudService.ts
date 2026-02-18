
import { CloudConfig } from '../types';

export const cloudService = {
  // Helper para construir la URL correcta
  _buildUrl: (endpoint: string) => {
    let url = endpoint.trim();
    
    // 1. Si el usuario puso solo el ID del proyecto, asumimos firebaseio.com (aunque es arriesgado, mejor pedir URL completa)
    // Pero si no tiene http, se lo ponemos.
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }

    // 2. Si el usuario pegó una URL que ya termina en .json, la limpiamos para estandarizar
    if (url.endsWith('.json')) {
      url = url.substring(0, url.lastIndexOf('.json'));
    }

    // 3. Quitar slash final si existe
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }

    // 4. Añadir nuestro nodo de datos
    return `${url}/rcm-data.json`;
  },

  // Subir datos (PUT a Firebase)
  uploadData: async (config: CloudConfig, data: any) => {
    if (!config.endpoint) throw new Error("Falta la URL de la base de datos");

    const finalUrl = cloudService._buildUrl(config.endpoint);

    try {
      const response = await fetch(finalUrl, {
        method: 'PUT',
        mode: 'cors', // Forzar modo CORS
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error: any) {
      console.error("Firebase Upload Error:", error);
      if (error.message === 'Failed to fetch') {
        throw new Error("Error de conexión. Verifica que la URL comience con 'https://' y que tengas internet.");
      }
      throw error;
    }
  },

  // Descargar datos (GET a Firebase)
  downloadData: async (config: CloudConfig) => {
    if (!config.endpoint) throw new Error("Falta la URL de la base de datos");

    const finalUrl = cloudService._buildUrl(config.endpoint);

    try {
      const response = await fetch(finalUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      if (json === null) throw new Error("Conexión exitosa, pero la base de datos está vacía.");
      
      return json; 
    } catch (error: any) {
      console.error("Firebase Download Error:", error);
      if (error.message === 'Failed to fetch') {
        throw new Error("Error de conexión. Verifica que la URL comience con 'https://' y revisa las Reglas en Firebase.");
      }
      throw error;
    }
  }
};
