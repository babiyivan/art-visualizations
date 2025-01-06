import * as d3 from "d3";

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
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

export function initSlider() {

    slider.append('line')
        .attr('class', 'track')
        .attr('x1', x.range()[0])
        .attr('x2', x.range()[1])
        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr('class', 'track-inset')
        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr('class', 'track-overlay')
        .call(d3.drag()
            .on('start.interrupt', function () {
                slider.interrupt();
            })
            .on('start drag', function (event) {
                update(x.invert(event.x));
            }));

    slider.insert('g', '.track-overlay')
        .attr('class', 'ticks')
        .attr('transform', 'translate(0,' + 18 + ')')
        .selectAll('text')
        .data(x.ticks(10))
        .enter()
        .append('text')
        .attr('x', function (d) {
            return x(d);
        })
        .attr('text-anchor', 'middle')
        .text(function (d) {
            return d;
        });

    var handle = slider.insert('circle', '.track-overlay')
        .attr('class', 'handle')
        .attr('r', 9)
        .attr('cx', x(100))
        .style('fill', 'blue') // Change color to blue
        .on('mousedown', function () {
            handle.interrupt();
        })
        .call(d3.drag()
            .on('start', function () {
                handle.interrupt();
            })
            .on('drag', function (event) {
                update(x.invert(event.x));
            }));

    var handle2 = slider.insert('circle', '.track-overlay')
        .attr('class', 'handle')
        .attr('r', 9)
        .style('fill', 'green') // Change color to green
        .attr('cx', x(0))
        .on('mousedown', function () {
            handle2.interrupt();
        })
        .call(d3.drag()
            .on('start', function () {
                handle2.interrupt();
            })
            .on('drag', function (event) {
                update2(x.invert(event.x));
            }));

    function update(h) {
        handle.attr('cx', x(h));
        if (h < x.invert(handle2.attr('cx'))) {
            handle2.attr('cx', x(h));
        }
    }

    function update2(h) {
        handle2.attr('cx', x(h));
        if (h > x.invert(handle.attr('cx'))) {
            handle.attr('cx', x(h));
        }

    }
}