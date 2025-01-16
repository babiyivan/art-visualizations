import * as d3 from "d3";
import * as data from "./data";
import * as exhList from "./list";
import * as map from "./map";

import {updateTimeInterval} from "./data";

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 500 - margin.left - margin.right,
    height = 50 - margin.top - margin.bottom;

var x = d3.scaleLinear()
    .domain([0, 100])
    .range([0, width])
    .clamp(true);

var slider = d3.select('.slider-container')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom + 10)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

let sliderStart = 0, sliderEnd = 100;

export function initSlider(start, end) {

    sliderStart = start;
    sliderEnd = end;

    x = d3.scaleLinear()
        .domain([start, end])
        .range([0, width])
        .clamp(true);

    //Append the track
    slider.append('line')
        .attr('class', 'track')
        .attr('x1', x.range()[0])
        .attr('x2', x.range()[1])
        .style('stroke', '#d3d3d3') // Light grey color
        .style('stroke-width', 7) // Thick line
        .style('stroke-linecap', 'round') // Rounded ends
        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr('class', 'track-inset')
        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr('class', 'track-overlay')
        .attr('position', 'relative')
        .attr('z-index', 0)

    var connectingLine = slider.append('line', '.track-overlay')
        .attr('class', 'connecting-line')
        .style('stroke', '#296aae')
        .style('stroke-width', 10)
        .attr('x1', x(start))
        .attr('y1', height / 2)
        .attr('x2', x(end))
        .attr('y2', height / 2)
        .attr('class', 'track-inset')
        .attr('position', 'relative')
        .attr('z-index', 1)

    //Append handles to the slider
    var handleStart = slider.append('circle', '.track-overlay')
        .attr('class', 'handle')
        .attr('r', 9)
        .style('fill', 'white')
        .style('stroke', 'black')
        .style('stroke-width', 2)
        .attr('cx', x(start))
        .attr('position', 'relative')
        .attr('z-index', 2)
        .on('mousedown', function () {
            handleStart.interrupt();
        })
        .call(d3.drag()
            .on('start', function () {
                handleStart.interrupt();
            })
            .on('drag', function (event) {
                updateStart(x.invert(event.x));
                connectingLine.attr('x1', handleStart.attr('cx'))
                    .attr('x2', handleEnd.attr('cx'));
            // })
            // .on('end', function () {
                let updateData = data.updateTimeInterval(x.invert(handleStart.attr('cx')), x.invert(handleEnd.attr('cx')));
                if (updateData !== null) {
                    map.updateData(updateData);
                    exhList.updateList([x.invert(handleStart.attr('cx')), x.invert(handleEnd.attr('cx'))]);
                }
            }));

    var handleEnd = slider.append('circle', '.track-overlay')
        .attr('class', 'handle')
        .attr('r', 9)
        .attr('cx', x(end))
        .attr('position', 'relative')
        .attr('z-index', 2)
        .style('fill', 'white')
        .style('stroke', 'black')
        .style('stroke-width', 2)
        .on('mousedown', function () {
            handleEnd.interrupt();
        })
        .call(d3.drag()
            .on('start', function () {
                handleEnd.interrupt();
            })
            .on('drag', function (event) {
                updateEnd(x.invert(event.x));
                connectingLine.attr('x1', handleStart.attr('cx'))
                    .attr('x2', handleEnd.attr('cx'));
                // })
                // .on('end', function () {
                let updateData = data.updateTimeInterval(x.invert(handleStart.attr('cx')), x.invert(handleEnd.attr('cx')));
                if (updateData !== null) {
                    map.updateData(updateData);
                    exhList.updateList([x.invert(handleStart.attr('cx')), x.invert(handleEnd.attr('cx'))]);
                }
            }));


    // Append textboxes for handle values
    var handleTextStart = slider.append('text')
        .attr('class', 'handle-text')
        .attr('x', x(start))
        .attr('y', height + 30)
        .style('text-anchor', 'middle')
        .style('background-color', '#d3d3d3')
        .text(x.invert(handleStart.attr('cx')));


    var handleTextEnd = slider.append('text')
        .attr('class', 'handle-text')
        .attr('x', x(end))
        .attr('y', height + 30)
        .style('text-anchor', 'middle')
        .style('background-color', '#d83939')
        .text(x.invert(handleEnd.attr('cx')));


    function updateEnd(h) {

        sliderEnd =  Math.round(x.invert(handleEnd.attr('cx')));

        handleEnd.attr('cx', x(h));
        handleTextEnd.attr('x', x(h))
            .text(Math.round(x.invert(handleEnd.attr('cx'))));

        if (h < x.invert(handleStart.attr('cx'))) {
            handleStart.attr('cx', x(h));
            handleTextStart.attr('x', x(h))
        }
    }

    function updateStart(h) {

        sliderStart = Math.round(x.invert(handleStart.attr('cx')));

        handleStart.attr('cx', x(h));
        handleTextStart.attr('x', x(h))
            .text(Math.round(x.invert(handleStart.attr('cx'))));

        if (h > x.invert(handleEnd.attr('cx'))) {
            handleEnd.attr('cx', x(h));
            handleTextEnd.attr('x', x(h))
        }

    }
}

export function getSliderValues() {
    return [sliderStart, sliderEnd];
}

