import * as d3 from 'd3';
import {getSliderValues} from "./slider";

let originalData;
let savedData;

export function saveData(data) {
    originalData = data;
}

export function filterData(sliderValues, filteredData) {


    console.log("sliderValues: " + sliderValues);
    let flattenedData = originalData.filter(d => filteredData.some(fd => d.e_latitude === fd.e_latitude && d.e_longitude === fd.e_longitude));
    flattenedData = flattenedData.filter(d => d.e_startdate >= sliderValues[0] && d.e_startdate <= sliderValues[1]);
    flattenedData.sort((a, b) => {
        const lastnameCompare = a.a_lastname.localeCompare(b.a_lastname);
        if (lastnameCompare !== 0) {
            return lastnameCompare;
        } else {
            const firstnameCompare = a.a_firstname.localeCompare(b.a_firstname);
            if (firstnameCompare !== 0) {
                return firstnameCompare;
            } else {
                return a.e_startdate.localeCompare(b.e_startdate);
            }
        }
    });

    savedData = flattenedData;

    renderList(flattenedData)
}


export function updateList(sliderValues) {
    if (savedData !== undefined) {
        const refilteredData = savedData.filter(d => d.e_startdate >= sliderValues[0] && d.e_startdate <= sliderValues[1]);

        renderList(refilteredData);
    }

}


function renderList(data) {
    let exhibitionContainer = d3.select('.exhibition-list-container')
    exhibitionContainer.selectAll('*').remove();


    if (data.length > 150) {
        exhibitionContainer
            .append('p')
            .attr('class', 'text-muted small')
            .text('Only 150 results are displayed out of ' + data.length + ', please refine the filters');
    } else {
        exhibitionContainer
            .append('p')
            .attr('class', 'text-muted small')
            .text(data.length + ' results are found');
    }

    const listContainer = exhibitionContainer
        .append('ul')
        .attr('class', 'list');


    let dataChunk = data.slice(0, 150);
    try {
        let eCity = dataChunk[0].e_city;
        d3.select('#list-header')
            .text('List of artists in ' + eCity);
    } catch (e) {
        d3.select('#list-header')
            .text('List of artists');
    }

        const listItem = listContainer
            .selectAll('li')
            .data(dataChunk)
            .join(
                enter => enter.append('li')
                    .attr('class', 'list-group-item list-group-item-action')
            );
        listItem
            .append('div')
            .attr('class', 'd-flex w-100 justify-content-between')
            .append('h5')
            .attr('class', 'mb-1')
            .text(d => `${d.a_lastname}, ${d.a_firstname}`);
        listItem
            .append('div')
            .attr('class', 'mb-1')
            .append('small')
            .html(d => `${d.e_title} <b>(${d.e_startdate})</b> at ${d.e_venue}`);
        listItem
            .append('div')
            .attr('class', 'mb-1')
            .append('small')
            .html(d => `Number of artworks exhibited: <b>${d.e_paintings}</b> `);
    }



