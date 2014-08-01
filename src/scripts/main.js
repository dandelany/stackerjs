var _ = require('underscore');
var $ = require('jquery');
var Bacon = require('baconjs');
$.fn.asEventStream = Bacon.$.asEventStream;
var d3 = require('d3');
var React = require('react');
var ReactExample = require('./react-example.jsx');

// App javascript goes here
console.log("loaded main.js, all is well!");

// Bacon.js example
$(function() {
    var up = $('#bacon-up').asEventStream('click');
    var down = $('#bacon-down').asEventStream('click');
    var counter = up.map(1).merge(down.map(-1))
                    .scan(0, function(x, y) { return x + y; });
    var power = counter.scan(0, function(x, y) { return Math.pow(2,y); });
    power.assign($('#bacon-counter'), 'text');
});

// Example React component located at src/scripts/react-example.jsx
React.renderComponent(new ReactExample(), document.getElementById('react-example'));

// D3 example
var d3Data = [5, 28, 19, 8, 7, 42];
d3.select('#d3-example')
    .selectAll('div')
        .data(d3Data)
    .enter().append('div')
        .classed('bar', true)
        .style('width', function(d) { return (d * 10) + 'px'; })
        .text(function(d) { return d; });

