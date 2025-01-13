import * as d3 from 'd3';
import * as fs from 'fs';
import './styles.css';
import {initMap, saveCoords } from "./map";
import { initSlider } from "./slider";
import * as data from './data.js';
import {map} from "leaflet/src/map";
// import bootstrap from 'bootstrap'

// let csvData;
//
// data.readData().then((d) => {
//     csvData = d.filter(row =>
//         Object.keys(row).every(key => row[key] !== '')
//     );
//
//     console.log("minyear: " + data.minYear(csvData));
//     console.log("maxyear: " + data.maxYear(csvData));
//     console.log(csvData[0]["a_firstname"]);
//
//     d.group(csvData, d => d.a_firstname);
//     console.log(csvData);
// });
// // console.log(csvData)

const csvPromise = fetch('http://localhost:8081/src/data/artvis_dump_NEW.csv')
    .then(response => response.text())
    .then(csvText => d3.csvParse(csvText));

csvPromise.then(async csvData => {
    const filteredCsvData = csvData.filter(row =>
        Object.keys(row).every(key => row[key] !== '')
    );

    // console.log("minyear: " + data.minYear(filteredCsvData));
    // console.log("maxyear: " + data.maxYear(filteredCsvData));
    // console.log(filteredCsvData[0]["a_firstname"]);

    const groupedCsvData = d3.group(filteredCsvData, d => d.e_longitude, d => d.e_latitude);
    console.log(groupedCsvData);
    await saveCoords(groupedCsvData);
    // drawMarkers();

});


initMap();

initSlider();

