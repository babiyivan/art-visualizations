import * as leaflet from 'leaflet';

let map = L.map('map').setView([48.0, 10.0], 3);

map.on('zoomend', function() {
    console.log('zoom level: ' + map.getZoom());
});
map.on('moveend', function() {
    console.log('center: ' + map.getCenter());
});

export function initMap() {
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);




}