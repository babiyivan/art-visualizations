import * as leaflet from 'leaflet';
import * as d3 from 'd3';
import * as exhList from './list.js';
import {getSliderValues} from "./slider";

let map = L.map('map').setView([48.0, 10.0], 3);
let coords;
let selectedCircle=[0,0];


map.on('zoomend', function () {
    // console.log('zoom level: ' + map.getZoom());
    map.eachLayer(function (layer) {
        if (layer instanceof L.Circle) {
            map.removeLayer(layer);
        }
    });
    renderBubbles();
});
map.on('moveend', function () {
    // console.log('center: ' + map.getCenter());
});

export function initMap() {
    var Esri_WorldGrayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 16
    });

    var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    });

    CartoDB_Positron.addTo(map);
    // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //     maxZoom: 19,
    //     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    // }).addTo(map);

}


export async function saveCoords(input) {
    coords = input;
    renderBubbles();
}

export function updateData(newData) {
    coords = newData;
    map.eachLayer(function (layer) {
        if (layer instanceof L.Circle) {
            map.removeLayer(layer);
        }
    });
    renderBubbles();
}

function renderBubbles() {

    if (selectedCircle[0] === 0 ) {
        let exhibitionContainer = d3.select('.exhibition-list-container')
        exhibitionContainer.selectAll('*').remove();
        exhibitionContainer
            .append('p')
            .attr('class', 'text-muted small')
            .text('To see the results, select a data point on the map above');
    }

    var lengths = [];

    for (const [key, value] of coords) {
        for (const [key2, value2] of value) {
            lengths.push(value2.length);
        }
    }

    let maxLength = Math.max(...lengths) / 2;
    let minLength = Math.min(...lengths) / 2;

    var radiusScale = d3.scaleLinear()
        .domain([1, 3000])
        .range([minLength, maxLength]);


    for (const [key, value] of coords) {
        for (const [key2, value2] of value) {

            if (key !== "\\N" && key2 !== "\\N") {
                let radCoefficient = 256 * Math.pow(2, map.getZoom());
                var circle = L.circle([key2, key], {
                    color: (selectedCircle[0] === key && selectedCircle[1] === key2) ? 'green' : 'black',
                    fillColor: '#296aae',
                    fillOpacity: 0.5,
                    radius: 5000000 * Math.sqrt(radiusScale.invert(value2.length)) / (radCoefficient * 0.5),
                    id: coords.get(key).get(key2)[0].e_id
                })
                // circle.bindPopup(coords.get(key).get(key2)[0].e_venue);
                circle.on('click', function () {
                    selectedCircle = [key, key2];
                    map.eachLayer(function (layer) {
                        if (layer instanceof L.Circle) {
                            map.removeLayer(layer);
                        }
                    });
                    renderBubbles();
                    console.log('Circle clicked:', coords.get(key).get(key2)[0].e_id);
                    exhList.filterData(getSliderValues(), coords.get(key).get(key2));
                });
                let nrOfEvents = coords.get(key).get(key2).length;
                var z = document.createElement('p'); // is a node
                z.innerHTML = nrOfEvents + ' results';
                circle.bindTooltip(z);
                circle.addTo(map);
            }
        }
    }
    //
    // exhList.setData(coords);
    // exhList.updateList();
}
