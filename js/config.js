// Configuración de APIs para el mapa
const MAP_CONFIG = {
    // OpenRouteService API Key - Obtén una gratuita en: https://openrouteservice.org/dev/#/signup
    OPENROUTE_API_KEY: '5b3ce3597851110001cf6248c4c8c8c8c4c8c8c8c4c8c8c8c',
    
    // Configuración del mapa
    MAP_CENTER: [40.4201, -3.7058], // Madrid, Gran Vía
    MAP_ZOOM: 15,
    
    // Servicios de geocodificación
    NOMINATIM_BASE_URL: 'https://nominatim.openstreetmap.org',
    
    // Configuración de la empresa
    BUSINESS_NAME: 'TechPro Solutions',
    BUSINESS_ADDRESS: 'Calle Gran Vía 123, Madrid',
    BUSINESS_COORDS: [40.4201, -3.7058]
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MAP_CONFIG;
}
