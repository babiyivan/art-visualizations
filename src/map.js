import * as leaflet from 'leaflet';
import * as d3 from 'd3';

let map = L.map('map').setView([48.0, 10.0], 3);
let coords;


map.on('zoomend', function() {
    console.log('zoom level: ' + map.getZoom());
    map.eachLayer(function (layer) {
        if (layer instanceof L.Circle) {
            map.removeLayer(layer);
        }
    });
    for (const [key, value] of coords) {
        // console.log(`key: ${key}, value: ${value}`);
        // console.log(value);
        // console.log("count:");
        // console.log(value.size);
        for (const [key2, value2] of value) {
            console.log("key: ");
            console.log(key);
            console.log("key2:");
            console.log(key2);
            console.log("size: ");
            console.log(value2.length);
            if (key !== "\\N" && key2 !== "\\N") {
                let radCoefficient = 256 * Math.pow(2, map.getZoom());
                var circle = L.circle([key2, key], {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.5,
                    radius: 5000000*Math.sqrt(value2.length) / (radCoefficient*0.5)

                }).addTo(map);
            }
        }
    }
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


// export function drawMarkers() {
//     if(typeof this.coords === 'undefined') {
//         setTimeout(drawMarkers, 100);
//         return;
//     }
//     // var marker = L.marker([long, lat]).addTo(map);
//     // var circle = L.circle([long, lat], {
//     //     color: 'red',
//     //     fillColor: '#f03',
//     //     fillOpacity: 0.5,
//     //     radius: rad*100/map.getZoom()
//     // }).addTo(map);
//     for (const [key, value] of coords) {
//         // console.log(`key: ${key}, value: ${value}`);
//         // console.log(value);
//         // console.log("count:");
//         // console.log(value.size);
//         for (const [key2, value2] of value) {
//             console.log("key: ");
//             console.log(key);
//             console.log("key2:");
//             console.log(key2);
//             console.log("size: ");
//             console.log(value2.length);
//             if (key !== "\\N" && key2 !== "\\N") {
//                 var circle = L.circle([long, lat], {
//                     color: 'red',
//                     fillColor: '#f03',
//                     fillOpacity: 0.5,
//                     radius: rad*100/map.getZoom()
//                 }).addTo(map);
//             }
//         }
//     }
// }


export async function saveCoords(input) {
    coords = input;

    for (const [key, value] of coords) {
        // console.log(`key: ${key}, value: ${value}`);
        // console.log(value);
        // console.log("count:");
        // console.log(value.size);
        for (const [key2, value2] of value) {
            console.log("key: ");
            console.log(key);
            console.log("key2:");
            console.log(key2);
            console.log("size: ");
            console.log(value2.length);
            if (key !== "\\N" && key2 !== "\\N") {
                let radCoefficient = 256 * Math.pow(2, map.getZoom());
                var circle = L.circle([key2, key], {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.5,
                    radius: 5000000*Math.sqrt(value2.length) / (radCoefficient*0.5)
                }).addTo(map);
            }
        }
    }
}