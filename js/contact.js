// Variables globales del mapa
let map, userMarker, businessMarker, routeLine, userLocation = null;

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar mapa
    initializeMap();
    
    // Obtener ubicación automáticamente
    getCurrentLocation();
    
    // Eventos
    setupEventListeners();
});

function initializeMap() {
    // Inicializar mapa centrado en la empresa
    map = L.map('map').setView(MAP_CONFIG.MAP_CENTER, MAP_CONFIG.MAP_ZOOM);
    
    // Capa de mapa base
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Marcador de la empresa
    businessMarker = L.marker(MAP_CONFIG.BUSINESS_COORDS, {
        icon: L.divIcon({
            className: 'business-marker',
            html: '<i class="fas fa-building" style="color: #2563eb; font-size: 24px;"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        })
    }).addTo(map)
    .bindPopup(`
        <div style="text-align: center;">
            <strong style="color: #2563eb;">${MAP_CONFIG.BUSINESS_NAME}</strong><br>
            <small>${MAP_CONFIG.BUSINESS_ADDRESS}</small>
        </div>
    `).openPopup();
}

function setupEventListeners() {
    // Botón para obtener ubicación actual
    const getLocationBtn = document.getElementById('get-current-location');
    getLocationBtn.addEventListener('click', getCurrentLocation);
    
    // Botón para calcular ruta
    const calculateRouteBtn = document.getElementById('calculate-route');
    calculateRouteBtn.addEventListener('click', function() {
        const address = document.getElementById('user-location').value.trim();
        if (address) {
            geocodeAddress(address);
        } else if (userLocation) {
            // Si no hay dirección pero sí ubicación del usuario, calcular ruta directa
            calculateRoute(userLocation, MAP_CONFIG.BUSINESS_COORDS);
        } else {
            alert('Introduce tu dirección o permite el acceso a tu ubicación.');
        }
    });
    
    // Evento para el input de dirección
    document.getElementById('user-location').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calculateRouteBtn.click();
        }
    });
}

function getCurrentLocation() {
    const locationBtn = document.getElementById('get-current-location');
    const originalText = locationBtn.innerHTML;
    
    locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Obteniendo...';
    locationBtn.disabled = true;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = [position.coords.latitude, position.coords.longitude];
                
                // Mostrar información de precisión en consola
                console.log('📍 Ubicación obtenida:');
                console.log('   Latitud:', position.coords.latitude);
                console.log('   Longitud:', position.coords.longitude);
                console.log('   Precisión:', position.coords.accuracy, 'metros');
                console.log('   Altitud:', position.coords.altitude ? position.coords.altitude + 'm' : 'No disponible');
                console.log('   Velocidad:', position.coords.speed ? position.coords.speed + 'm/s' : 'No disponible');
                
                // Mostrar marcador del usuario
                showUserMarker(userLocation);
                
                // Calcular ruta automáticamente
                calculateRoute(userLocation, MAP_CONFIG.BUSINESS_COORDS);
                
                // Obtener dirección del usuario
                reverseGeocode(userLocation);
                
                // Mostrar mensaje de precisión al usuario
                const accuracyMessage = position.coords.accuracy <= 10 ? 
                    'Ubicación muy precisa' : 
                    position.coords.accuracy <= 50 ? 
                    'Ubicación precisa' : 
                    'Ubicación aproximada';
                
                locationBtn.innerHTML = `<i class="fas fa-check"></i> ${accuracyMessage}`;
                locationBtn.className = 'btn btn-success';
                
                // Mostrar tooltip con información de precisión
                showAccuracyTooltip(position.coords.accuracy);
                
                setTimeout(() => {
                    locationBtn.innerHTML = originalText;
                    locationBtn.className = 'btn btn-secondary';
                    locationBtn.disabled = false;
                }, 3000);
            },
            function(error) {
                console.error('Error de geolocalización:', error);
                let errorMessage = 'No se pudo obtener tu ubicación.';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Permiso denegado. Por favor, permite el acceso a tu ubicación.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Información de ubicación no disponible.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Tiempo de espera agotado.';
                        break;
                }
                
                alert(errorMessage);
                locationBtn.innerHTML = originalText;
                locationBtn.disabled = false;
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    } else {
        alert('Tu navegador no soporta geolocalización.');
        locationBtn.innerHTML = originalText;
        locationBtn.disabled = false;
    }
}

function showUserMarker(coords) {
    // Quitar marcador anterior del usuario
    if (userMarker) map.removeLayer(userMarker);
    
    // Crear marcador del usuario
    userMarker = L.marker(coords, {
        icon: L.divIcon({
            className: 'user-marker',
            html: '<i class="fas fa-user" style="color: #10b981; font-size: 24px;"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        })
    }).addTo(map)
    .bindPopup(`
        <div style="text-align: center;">
            <strong style="color: #10b981;">Tu Ubicación</strong><br>
            <small>Lat: ${coords[0].toFixed(4)}, Lon: ${coords[1].toFixed(4)}</small>
        </div>
    `).openPopup();
}

function reverseGeocode(coords) {
    fetch(`${MAP_CONFIG.NOMINATIM_BASE_URL}/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}&zoom=18&addressdetails=1`)
        .then(res => res.json())
        .then(data => {
            if (data && data.display_name) {
                const addressParts = data.display_name.split(',');
                const shortAddress = addressParts.slice(0, 2).join(', ');
                document.getElementById('user-location').value = shortAddress;
            }
        })
        .catch(error => console.error('Error en reverse geocoding:', error));
}

function geocodeAddress(address) {
    const calculateBtn = document.getElementById('calculate-route');
    const originalText = calculateBtn.innerHTML;
    
    calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculando...';
    calculateBtn.disabled = true;
    
    fetch(`${MAP_CONFIG.NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(address + ', Madrid, Spain')}&limit=1`)
        .then(res => res.json())
        .then(data => {
            if (data && data.length > 0) {
                const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                userLocation = coords;
                showUserMarker(coords);
                calculateRoute(coords, MAP_CONFIG.BUSINESS_COORDS);
            } else {
                alert('Dirección no encontrada. Intenta con una dirección más específica.');
            }
        })
        .catch(() => {
            alert('Error al buscar la dirección. Verifica tu conexión a internet.');
        })
        .finally(() => {
            calculateBtn.innerHTML = originalText;
            calculateBtn.disabled = false;
        });
}

function calculateRoute(origin, destination) {
    // Quitar ruta anterior
    if (routeLine) map.removeLayer(routeLine);
    
    // Mostrar loading
    const routeInfo = document.getElementById('route-info');
    routeInfo.innerHTML = '<div class="loading-route"><i class="fas fa-spinner fa-spin"></i> Calculando ruta...</div>';
    routeInfo.style.display = 'block';
    
    // Usar OpenRouteService para obtener ruta real
    const apiKey = MAP_CONFIG.OPENROUTE_API_KEY;
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}`;
    
    const body = {
        coordinates: [
            [origin[1], origin[0]], // OpenRouteService usa [lon, lat]
            [destination[1], destination[0]]
        ],
        format: 'geojson',
        preference: 'fastest'
    };
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(data => {
        if (data.features && data.features.length > 0) {
            const route = data.features[0];
            const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]); // Convertir a [lat, lon]
            
            // Dibujar ruta en el mapa
            routeLine = L.polyline(coordinates, {
                color: '#2563eb',
                weight: 6,
                opacity: 0.8
            }).addTo(map);
            
            // Mostrar información de la ruta
            const summary = route.properties.summary;
            const distance = (summary.distance / 1000).toFixed(1); // km
            const duration = Math.round(summary.duration / 60); // minutos
            
            routeInfo.innerHTML = `
                <div class="route-details">
                    <h4><i class="fas fa-route"></i> Ruta Calculada</h4>
                    <div class="route-stats">
                        <div class="route-stat">
                            <i class="fas fa-road"></i>
                            <span><strong>Distancia:</strong> ${distance} km</span>
                        </div>
                        <div class="route-stat">
                            <i class="fas fa-clock"></i>
                            <span><strong>Tiempo estimado:</strong> ${duration} min</span>
                        </div>
                    </div>
                    <div class="route-instructions">
                        <small>Ruta optimizada para vehículo particular</small>
                    </div>
                </div>
            `;
            
            // Ajustar vista del mapa para mostrar toda la ruta
            const bounds = L.latLngBounds([origin, destination]);
            map.fitBounds(bounds.pad(0.1));
            
        } else {
            // Fallback: línea directa si no se puede obtener la ruta
            showFallbackRoute(origin, destination);
        }
    })
    .catch(error => {
        console.error('Error al calcular ruta:', error);
        
        // Fallback: línea directa
        showFallbackRoute(origin, destination, true);
    });
}

function showFallbackRoute(origin, destination, isError = false) {
    routeLine = L.polyline([origin, destination], {
        color: '#2563eb',
        weight: 4,
        opacity: 0.6,
        dashArray: '10, 10'
    }).addTo(map);
    
    const distance = calculateDirectDistance(origin, destination);
    const iconClass = isError ? 'exclamation-triangle' : 'info-circle';
    const title = isError ? 'Ruta Aproximada' : 'Ruta Aproximada';
    const message = isError ? 'No se pudo calcular la ruta detallada' : 'Ruta directa (no incluye calles)';
    
    document.getElementById('route-info').innerHTML = `
        <div class="route-details">
            <h4><i class="fas fa-${iconClass}"></i> ${title}</h4>
            <div class="route-stats">
                <div class="route-stat">
                    <i class="fas fa-road"></i>
                    <span><strong>Distancia en línea recta:</strong> ${distance.toFixed(1)} km</span>
                </div>
            </div>
            <div class="route-instructions">
                <small>${message}</small>
            </div>
        </div>
    `;
    
    // Ajustar vista del mapa
    const bounds = L.latLngBounds([origin, destination]);
    map.fitBounds(bounds.pad(0.1));
}

function calculateDirectDistance(coord1, coord2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
    const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Función para mostrar tooltip con información de precisión
function showAccuracyTooltip(accuracy) {
    const routeInfo = document.getElementById('route-info');
    const accuracyInfo = document.createElement('div');
    accuracyInfo.className = 'accuracy-info';
    accuracyInfo.innerHTML = `
        <div class="accuracy-details">
            <i class="fas fa-info-circle"></i>
            <span>Precisión de ubicación: ${accuracy.toFixed(0)} metros</span>
            <small>${getAccuracyDescription(accuracy)}</small>
        </div>
    `;
    
    // Insertar antes de la información de ruta
    if (routeInfo.firstChild) {
        routeInfo.insertBefore(accuracyInfo, routeInfo.firstChild);
    } else {
        routeInfo.appendChild(accuracyInfo);
    }
    
    // Remover después de 5 segundos
    setTimeout(() => {
        if (accuracyInfo.parentNode) {
            accuracyInfo.remove();
        }
    }, 5000);
}

// Función para describir la precisión
function getAccuracyDescription(accuracy) {
    if (accuracy <= 10) return 'Excelente - Ubicación muy precisa';
    if (accuracy <= 50) return 'Buena - Ubicación precisa';
    if (accuracy <= 100) return 'Aceptable - Ubicación aproximada';
    if (accuracy <= 500) return 'Baja - Ubicación muy aproximada';
    return 'Muy baja - Considera usar dirección manual';
}
