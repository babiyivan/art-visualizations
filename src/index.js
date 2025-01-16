import * as d3 from 'd3';
import * as fs from 'fs';
import './styles.css';
import {initMap, saveCoords } from "./map";
import { initSlider } from "./slider";
import * as data from './data.js';
import * as exhList from "./list";
import {map} from "leaflet/src/map";

//SET THIS TO TRUE TO RUN LOCALLY
const local = false;

const localurl = 'http://localhost:8081/src/data/';
const gisturl = 'https://gist.githubusercontent.com/slelo/3a188911e0eef4ad54fb96a7aa670aa4/raw/5ce10e9f2ceb9ede5b3416b2ff181bc0962d2463/';
const filename = 'artvis_dump_NEW.csv';
const url = local ? localurl + filename : gisturl + filename;
console.log('fetching from ' + url);

const csvPromise = await fetch(url)

const csvText = await csvPromise.text();
const csvData = d3.csvParse(csvText);

const filteredCsvData = csvData.filter(row =>
    Object.keys(row).every(key => row[key] !== '')
);

exhList.saveData(filteredCsvData);

const groupedCsvData = d3.group(filteredCsvData, d => d.e_longitude, d => d.e_latitude);
await saveCoords(groupedCsvData);

data.storeData(filteredCsvData);

initMap();

initSlider(data.minYear(csvData), data.maxYear(csvData));

