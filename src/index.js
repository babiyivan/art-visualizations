// import * as d3 from 'd3';
import * as fs from 'fs';
import './styles.css';
import {initMap } from "./map";
import { initSlider } from "./slider";
import * as data from './data.js';
// import bootstrap from 'bootstrap'

let csvData;

data.readData().then((d) => {
    csvData = d.filter(row =>
        Object.keys(row).every(key => row[key] !== '')
    );

    console.log("minyear: " + data.minYear(csvData));
    console.log("maxyear: " + data.maxYear(csvData));
    console.log(csvData[0]["a_firstname"]);

});
// console.log(csvData)


initMap();

initSlider();

