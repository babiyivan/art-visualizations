import * as d3 from 'd3';


const store = {};

const logData = () => {
    console.log(store.routes)
}

export const loadData = () => {
    return d3.csv('http://localhost:8081/src/data/artvis_dump_NEW.csv')
        .then((routes) => {
            store.routes = routes
            logData();

            return routes;
        })
}

export const readData = () => {
    return loadData()
}


export function minYear(csvData) {
    console.log("minYear: " + csvData);
    return d3.min(csvData, function (d) {
        // console.log(new Date(d.a_birthdate));
        let date = new Date(d.a_birthdate);
        if (date.getFullYear() == 0) {
            return null;
        }
        return new Date(d.a_birthdate);
    });
}

export function maxYear(csvData) {
    console.log("maxYear: " + csvData);
    return d3.max(csvData, function (d) {
        // console.log(new Date(d.a_birthdate));
        let date = new Date(d.a_birthdate);
        if (date.getFullYear() == 0) {
            return null;
        }
        return new Date(d.a_birthdate);
    });
}