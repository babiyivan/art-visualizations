import * as d3 from 'd3';
import * as fs from 'fs';
import './styles.css';
import {initMap, saveCoords } from "./map";
import { initSlider } from "./slider";
import * as data from './data.js';
import {map} from "leaflet/src/map";


const csvPromise = await fetch('http://localhost:8081/src/data/artvis_dump_NEW.csv')

const csvText = await csvPromise.text();
const csvData = d3.csvParse(csvText);

const filteredCsvData = csvData.filter(row =>
    Object.keys(row).every(key => row[key] !== '')
);


const groupedCsvData = d3.group(filteredCsvData, d => d.e_longitude, d => d.e_latitude);
// console.log(groupedCsvData);
await saveCoords(groupedCsvData);

data.storeData(filteredCsvData);

initMap();

initSlider(data.minYear(csvData), data.maxYear(csvData));

