import * as d3 from 'd3';

let storedData;

export function storeData(csvData) {
    storedData = csvData;
}

export function minYear(csvData) {
    // console.log("minYear: " + csvData);
    return d3.min(csvData, function (d) {
        let date = new Date(d.e_startdate);
        if (date.getFullYear() == 0) {
            return null;
        }
        return date.getFullYear();
    });
}

export function updateTimeInterval(start, end)    {

    let filteredData = storedData.filter(d => {
        let date = new Date(d.e_startdate);
        return date.getFullYear() >= start && date.getFullYear() <= end;
    });
    let groupedCsvData = d3.group(filteredData, d => d.e_longitude, d => d.e_latitude);
    return groupedCsvData;
}

export function maxYear(csvData) {
    // console.log("maxYear: " + csvData);
    return d3.max(csvData, function (d) {
        let date = new Date(d.e_startdate);
        if (date.getFullYear() == 0) {
            return null;
        }
        return date.getFullYear();
    });
}