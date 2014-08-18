var _ = require('underscore');
//var $ = require('jquery');
//var Bacon = require('baconjs');
//$.fn.asEventStream = Bacon.$.asEventStream;
//var d3 = require('d3');
//var React = require('react');

window.Pixastic = require('pixastic');

var img = new Image();
img.onload = function() {
//    Pixastic.process(img, 'desaturate');
    var blendImg = new Image();
    blendImg.onload = function() {
        Pixastic.process(img, 'desaturate', null, function(desaturated) {
            Pixastic.process(desaturated, "blend",
                {
                    amount : 1,
                    mode : "multiply",
                    image : blendImg
                }
            );
        });
    }
    blendImg.crossOrigin = 'anonymous';
    blendImg.src = "http://localhost:8080/sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0193.jpg";

//    blendImg.src = "images/20140111_000102_1024_0094.jpg";
};
img.crossOrigin = 'anonymous';
img.src = "http://localhost:8080/sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0211.jpg";
//img.src = "images/20140111_000000_1024_0171.jpg";
document.body.appendChild(img);

//window.mona = img;
//Pixi.Texture.fromImage("");
//var imgBlue = Pixi.Texture.fromImage("");
//var imgRed = Pixi.Texture.fromImage("http://localhost:8080/sdo.gsfc.nasa.gov/assets/img/browse/2014/01/01/20140101_000207_512_1700.jpg");