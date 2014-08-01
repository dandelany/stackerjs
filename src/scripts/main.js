var _ = require('underscore');
//var $ = require('jquery');
//var Bacon = require('baconjs');
//$.fn.asEventStream = Bacon.$.asEventStream;
//var d3 = require('d3');
//var React = require('react');
//var ReactExample = require('./react-example.jsx');

var Pixi = require('pixi');

// create an new instance of a pixi stage
var stage = new Pixi.Stage(0x000000);

// create a renderer instance
var renderer = Pixi.autoDetectRenderer(800, 800);

// add the renderer view element to the DOM
document.body.appendChild(renderer.view);



// create a texture from an image path
var imgGreen = Pixi.Texture.fromImage("http://localhost:8080/sdo.gsfc.nasa.gov/assets/img/browse/2014/01/11/20140111_000000_512_0171.jpg");
var imgBlue = Pixi.Texture.fromImage("http://localhost:8080/sdo.gsfc.nasa.gov/assets/img/browse/2014/01/11/20140111_000102_512_0094.jpg");
var imgRed = Pixi.Texture.fromImage("http://localhost:8080/sdo.gsfc.nasa.gov/assets/img/browse/2014/01/01/20140101_000207_512_1700.jpg");

_.each([imgGreen, imgBlue], function(texture, i) {
    // create a new Sprite using the texture
    var sunny = new Pixi.Sprite(texture);

    // center the sprites anchor point
    sunny.anchor.x = sunny.anchor.y = 0.5;

    // move the sprite to the center of the screen
    sunny.position.x = 300;
    sunny.position.y = 300;
    sunny.alpha = 0.75;

    sunny.blendMode = PIXI.blendModes.ADD;

    stage.addChild(sunny);
});


requestAnimFrame(animate);

function animate() {
    //requestAnimFrame(animate);

    // just for fun, let's rotate mr rabbit a little
    //sunny.rotation += 0.01;

    // render the stage
    renderer.render(stage);
}