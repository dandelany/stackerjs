(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
;__browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {
/*
 * Pixastic Lib - Core Functions - v0.1.3
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

var Pixastic = (function() {


	function addEvent(el, event, handler) {
		if (el.addEventListener)
			el.addEventListener(event, handler, false); 
		else if (el.attachEvent)
			el.attachEvent("on" + event, handler); 
	}

	function onready(handler) {
		var handlerDone = false;
		var execHandler = function() {
			if (!handlerDone) {
				handlerDone = true;
				handler();
			}
		}
		document.write("<"+"script defer src=\"//:\" id=\"__onload_ie_pixastic__\"></"+"script>");
		var script = document.getElementById("__onload_ie_pixastic__");
		script.onreadystatechange = function() {
			if (script.readyState == "complete") {
				script.parentNode.removeChild(script);
				execHandler();
			}
		}
		if (document.addEventListener)
			document.addEventListener("DOMContentLoaded", execHandler, false); 
		addEvent(window, "load", execHandler);
	}

	function init() {
		var imgEls = getElementsByClass("pixastic", null, "img");
		var canvasEls = getElementsByClass("pixastic", null, "canvas");
		var elements = imgEls.concat(canvasEls);
		for (var i=0;i<elements.length;i++) {
			(function() {

			var el = elements[i];
			var actions = [];
			var classes = el.className.split(" ");
			for (var c=0;c<classes.length;c++) {
				var cls = classes[c];
				if (cls.substring(0,9) == "pixastic-") {
					var actionName = cls.substring(9);
					if (actionName != "")
						actions.push(actionName);
				}
			}
			if (actions.length) {
				if (el.tagName.toLowerCase() == "img") {
					var dataImg = new Image();
					dataImg.src = el.src;
					if (dataImg.complete) {
						for (var a=0;a<actions.length;a++) {
							var res = Pixastic.applyAction(el, el, actions[a], null);
							if (res) 
								el = res;
						}
					} else {
						dataImg.onload = function() {
							for (var a=0;a<actions.length;a++) {
								var res = Pixastic.applyAction(el, el, actions[a], null)
								if (res) 
									el = res;
							}
						}
					}
				} else {
					setTimeout(function() {
						for (var a=0;a<actions.length;a++) {
							var res = Pixastic.applyAction(
								el, el, actions[a], null
							);
							if (res) 
								el = res;
						}
					},1);
				}
			}

			})();
		}
	}

	if (typeof pixastic_parseonload != "undefined" && pixastic_parseonload)
		onready(init);

	// getElementsByClass by Dustin Diaz, http://www.dustindiaz.com/getelementsbyclass/
	function getElementsByClass(searchClass,node,tag) {
	        var classElements = new Array();
	        if ( node == null )
	                node = document;
	        if ( tag == null )
	                tag = '*';

	        var els = node.getElementsByTagName(tag);
	        var elsLen = els.length;
	        var pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");
	        for (i = 0, j = 0; i < elsLen; i++) {
	                if ( pattern.test(els[i].className) ) {
	                        classElements[j] = els[i];
	                        j++;
	                }
	        }
	        return classElements;
	}

	var debugElement;

	function writeDebug(text, level) {
		if (!Pixastic.debug) return;
		try {
			switch (level) {
				case "warn" : 
					console.warn("Pixastic:", text);
					break;
				case "error" :
					console.error("Pixastic:", text);
					break;
				default:
					console.log("Pixastic:", text);
			}
		} catch(e) {
		}
		if (!debugElement) {
			
		}
	}

	// canvas capability checks

	var hasCanvas = (function() {
		var c = document.createElement("canvas");
		var val = false;
		try {
			val = !!((typeof c.getContext == "function") && c.getContext("2d"));
		} catch(e) {}
		return function() {
			return val;
		}
	})();

	var hasCanvasImageData = (function() {
		var c = document.createElement("canvas");
		var val = false;
		var ctx;
		try {
			if (typeof c.getContext == "function" && (ctx = c.getContext("2d"))) {
				val = (typeof ctx.getImageData == "function");
			}
		} catch(e) {}
		return function() {
			return val;
		}
	})();

	var hasGlobalAlpha = (function() {
		var hasAlpha = false;
		var red = document.createElement("canvas");
		if (hasCanvas() && hasCanvasImageData()) {
			red.width = red.height = 1;
			var redctx = red.getContext("2d");
			redctx.fillStyle = "rgb(255,0,0)";
			redctx.fillRect(0,0,1,1);
	
			var blue = document.createElement("canvas");
			blue.width = blue.height = 1;
			var bluectx = blue.getContext("2d");
			bluectx.fillStyle = "rgb(0,0,255)";
			bluectx.fillRect(0,0,1,1);
	
			redctx.globalAlpha = 0.5;
			redctx.drawImage(blue, 0, 0);
			var reddata = redctx.getImageData(0,0,1,1).data;
	
			hasAlpha = (reddata[2] != 255);
		}
		return function() {
			return hasAlpha;
		}
	})();


	// return public interface

	return {

		parseOnLoad : false,

		debug : false,
		
		applyAction : function(img, dataImg, actionName, options) {

			options = options || {};

			var imageIsCanvas = (img.tagName.toLowerCase() == "canvas");
			if (imageIsCanvas && Pixastic.Client.isIE()) {
				if (Pixastic.debug) writeDebug("Tried to process a canvas element but browser is IE.");
				return false;
			}

			var canvas, ctx;
			var hasOutputCanvas = false;
			if (Pixastic.Client.hasCanvas()) {
				hasOutputCanvas = !!options.resultCanvas;
				canvas = options.resultCanvas || document.createElement("canvas");
				ctx = canvas.getContext("2d");
			}

			var w = img.offsetWidth;
			var h = img.offsetHeight;

			if (imageIsCanvas) {
				w = img.width;
				h = img.height;
			}

			// offsetWidth/Height might be 0 if the image is not in the document
			if (w == 0 || h == 0) {
				if (img.parentNode == null) {
					// add the image to the doc (way out left), read its dimensions and remove it again
					var oldpos = img.style.position;
					var oldleft = img.style.left;
					img.style.position = "absolute";
					img.style.left = "-9999px";
					document.body.appendChild(img);
					w = img.offsetWidth;
					h = img.offsetHeight;
					document.body.removeChild(img);
					img.style.position = oldpos;
					img.style.left = oldleft;
				} else {
					if (Pixastic.debug) writeDebug("Image has 0 width and/or height.");
					return;
				}
			}

			if (actionName.indexOf("(") > -1) {
				var tmp = actionName;
				actionName = tmp.substr(0, tmp.indexOf("("));
				var arg = tmp.match(/\((.*?)\)/);
				if (arg[1]) {
					arg = arg[1].split(";");
					for (var a=0;a<arg.length;a++) {
						thisArg = arg[a].split("=");
						if (thisArg.length == 2) {
							if (thisArg[0] == "rect") {
								var rectVal = thisArg[1].split(",");
								options[thisArg[0]] = {
									left : parseInt(rectVal[0],10)||0,
									top : parseInt(rectVal[1],10)||0,
									width : parseInt(rectVal[2],10)||0,
									height : parseInt(rectVal[3],10)||0
								}
							} else {
								options[thisArg[0]] = thisArg[1];
							}
						}
					}
				}
			}

			if (!options.rect) {
				options.rect = {
					left : 0, top : 0, width : w, height : h
				};
			} else {
				options.rect.left = Math.round(options.rect.left);
				options.rect.top = Math.round(options.rect.top);
				options.rect.width = Math.round(options.rect.width);
				options.rect.height = Math.round(options.rect.height);
			}

			var validAction = false;
			if (Pixastic.Actions[actionName] && typeof Pixastic.Actions[actionName].process == "function") {
				validAction = true;
			}
			if (!validAction) {
				if (Pixastic.debug) writeDebug("Invalid action \"" + actionName + "\". Maybe file not included?");
				return false;
			}
			if (!Pixastic.Actions[actionName].checkSupport()) {
				if (Pixastic.debug) writeDebug("Action \"" + actionName + "\" not supported by this browser.");
				return false;
			}

			if (Pixastic.Client.hasCanvas()) {
				if (canvas !== img) {
					canvas.width = w;
					canvas.height = h;
				}
				if (!hasOutputCanvas) {
					canvas.style.width = w+"px";
					canvas.style.height = h+"px";
				}
				ctx.drawImage(dataImg,0,0,w,h);

				if (!img.__pixastic_org_image) {
					canvas.__pixastic_org_image = img;
					canvas.__pixastic_org_width = w;
					canvas.__pixastic_org_height = h;
				} else {
					canvas.__pixastic_org_image = img.__pixastic_org_image;
					canvas.__pixastic_org_width = img.__pixastic_org_width;
					canvas.__pixastic_org_height = img.__pixastic_org_height;
				}

			} else if (Pixastic.Client.isIE() && typeof img.__pixastic_org_style == "undefined") {
				img.__pixastic_org_style = img.style.cssText;
			}

			var params = {
				image : img,
				canvas : canvas,
				width : w,
				height : h,
				useData : true,
				options : options
			}

			// Ok, let's do it!

			var res = Pixastic.Actions[actionName].process(params);

			if (!res) {
				return false;
			}

			if (Pixastic.Client.hasCanvas()) {
				if (params.useData) {
					if (Pixastic.Client.hasCanvasImageData()) {
						canvas.getContext("2d").putImageData(params.canvasData, options.rect.left, options.rect.top);

						// Opera doesn't seem to update the canvas until we draw something on it, lets draw a 0x0 rectangle.
						// Is this still so?
						canvas.getContext("2d").fillRect(0,0,0,0);
					}
				}

				if (!options.leaveDOM) {
					// copy properties and stuff from the source image
					canvas.title = img.title;
					canvas.imgsrc = img.imgsrc;
					if (!imageIsCanvas) canvas.alt  = img.alt;
					if (!imageIsCanvas) canvas.imgsrc = img.src;
					canvas.className = img.className;
					canvas.style.cssText = img.style.cssText;
					canvas.name = img.name;
					canvas.tabIndex = img.tabIndex;
					canvas.id = img.id;
					if (img.parentNode && img.parentNode.replaceChild) {
						img.parentNode.replaceChild(canvas, img);
					}
				}

				options.resultCanvas = canvas;

				return canvas;
			}

			return img;
		},

		prepareData : function(params, getCopy) {
			var ctx = params.canvas.getContext("2d");
			var rect = params.options.rect;
			var dataDesc = ctx.getImageData(rect.left, rect.top, rect.width, rect.height);
			var data = dataDesc.data;
			if (!getCopy) params.canvasData = dataDesc;
			return data;
		},

		// load the image file
		process : function(img, actionName, options, callback) {
			if (img.tagName.toLowerCase() == "img") {
				var dataImg = new Image();
                dataImg.crossOrigin = "anonymous";
				dataImg.src = img.src;

				if (dataImg.complete) {
					var res = Pixastic.applyAction(img, dataImg, actionName, options);
					if (callback) callback(res);
					return res;
				} else {
					dataImg.onload = function() {
						var res = Pixastic.applyAction(img, dataImg, actionName, options)
						if (callback) callback(res);
					}
				}
			}
			if (img.tagName.toLowerCase() == "canvas") {
				var res = Pixastic.applyAction(img, img, actionName, options);
				if (callback) callback(res);
				return res;
			}
		},

		revert : function(img) {
			if (Pixastic.Client.hasCanvas()) {
				if (img.tagName.toLowerCase() == "canvas" && img.__pixastic_org_image) {
					img.width = img.__pixastic_org_width;
					img.height = img.__pixastic_org_height;
					img.getContext("2d").drawImage(img.__pixastic_org_image, 0, 0);

					if (img.parentNode && img.parentNode.replaceChild) {
						img.parentNode.replaceChild(img.__pixastic_org_image, img);
					}

					return img;
				}
			} else if (Pixastic.Client.isIE()) {
 				if (typeof img.__pixastic_org_style != "undefined")
					img.style.cssText = img.__pixastic_org_style;
			}
		},

		Client : {
			hasCanvas : hasCanvas,
			hasCanvasImageData : hasCanvasImageData,
			hasGlobalAlpha : hasGlobalAlpha,
			isIE : function() {
				return !!document.all && !!window.attachEvent && !window.opera;
			}
		},

		Actions : {}
	}


})();
/*
 * Pixastic Lib - Blend - v0.1.1
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.blend = {

	process : function(params) {
		var amount = parseFloat(params.options.amount);
		var mode = (params.options.mode || "normal").toLowerCase();
		var image = params.options.image;

		amount = Math.max(0,Math.min(1,amount));

		if (!image) return false;

		if (Pixastic.Client.hasCanvasImageData()) {

			var rect = params.options.rect;
			var data = Pixastic.prepareData(params);
			var w = rect.width;
			var h = rect.height;

			params.useData = false;

			var otherCanvas = document.createElement("canvas");
			otherCanvas.width = params.canvas.width;
			otherCanvas.height = params.canvas.height;
			var otherCtx = otherCanvas.getContext("2d");
			otherCtx.drawImage(image,0,0);

			var params2 = {canvas:otherCanvas,options:params.options};
			var data2 = Pixastic.prepareData(params2);
			var dataDesc2 = params2.canvasData;

			var p = w*h;
			var pix = p*4;
			var pix1, pix2;
			var r1, g1, b1;
			var r2, g2, b2;
			var r3, g3, b3;
			var r4, g4, b4;

			var dataChanged = false;

			switch (mode) {
				case "normal" : 
					//while (p--) {
					//	data2[pix-=4] = data2[pix];
					//	data2[pix1=pix+1] = data2[pix1];
					//	data2[pix2=pix+2] = data2[pix2];
					//}
					break;

				case "multiply" : 
					while (p--) {
						data2[pix-=4] = data[pix] * data2[pix] / 255;
						data2[pix1=pix+1] = data[pix1] * data2[pix1] / 255;
						data2[pix2=pix+2] = data[pix2] * data2[pix2] / 255;
					}
					dataChanged = true;
					break;

				case "lighten" : 
					while (p--) {
						if ((r1 = data[pix-=4]) > data2[pix])
							data2[pix] = r1;
						if ((g1 = data[pix1=pix+1]) > data2[pix1])
							data2[pix1] = g1;
						if ((b1 = data[pix2=pix+2]) > data2[pix2])
							data2[pix2] = b1;
					}
					dataChanged = true;
					break;

				case "darken" : 
					while (p--) {
						if ((r1 = data[pix-=4]) < data2[pix])
							data2[pix] = r1;
						if ((g1 = data[pix1=pix+1]) < data2[pix1])
							data2[pix1] = g1;
						if ((b1 = data[pix2=pix+2]) < data2[pix2])
							data2[pix2] = b1;

					}
					dataChanged = true;
					break;

				case "darkercolor" : 
					while (p--) {
						if (((r1 = data[pix-=4])*0.3+(g1 = data[pix1=pix+1])*0.59+(b1 = data[pix2=pix+2])*0.11) <= (data2[pix]*0.3+data2[pix1]*0.59+data2[pix2]*0.11)) {
							data2[pix] = r1;
							data2[pix1] = g1;
							data2[pix2] = b1;
						}
					}
					dataChanged = true;
					break;

				case "lightercolor" : 
					while (p--) {
						if (((r1 = data[pix-=4])*0.3+(g1 = data[pix1=pix+1])*0.59+(b1 = data[pix2=pix+2])*0.11) > (data2[pix]*0.3+data2[pix1]*0.59+data2[pix2]*0.11)) {
							data2[pix] = r1;
							data2[pix1] = g1;
							data2[pix2] = b1;
						}
					}
					dataChanged = true;
					break;

				case "lineardodge" : 
					/*
					otherCtx.globalCompositeOperation = "source-over";
					otherCtx.drawImage(params.canvas, 0, 0);
					otherCtx.globalCompositeOperation = "lighter";
					otherCtx.drawImage(image, 0, 0);
					*/

					while (p--) {
						if ((r3 = data[pix-=4] + data2[pix]) > 255)
							data2[pix] = 255;
						else
							data2[pix] = r3;
						if ((g3 = data[pix1=pix+1] + data2[pix1]) > 255)
							data2[pix1] = 255;
						else
							data2[pix1] = g3;
						if ((b3 = data[pix2=pix+2] + data2[pix2]) > 255)
							data2[pix2] = 255;
						else
							data2[pix2] = b3;
					}
					dataChanged = true;

					break;

				case "linearburn" : 
					while (p--) {
						if ((r3 = data[pix-=4] + data2[pix]) < 255)
							data2[pix] = 0;
						else
							data2[pix] = (r3 - 255);
						if ((g3 = data[pix1=pix+1] + data2[pix1]) < 255)
							data2[pix1] = 0;
						else
							data2[pix1] = (g3 - 255);
						if ((b3 = data[pix2=pix+2] + data2[pix2]) < 255)
							data2[pix2] = 0;
						else
							data2[pix2] = (b3 - 255);
					}
					dataChanged = true;
					break;

				case "difference" : 
					while (p--) {
						if ((r3 = data[pix-=4] - data2[pix]) < 0)
							data2[pix] = -r3;
						else
							data2[pix] = r3;
						if ((g3 = data[pix1=pix+1] - data2[pix1]) < 0)
							data2[pix1] = -g3;
						else
							data2[pix1] = g3;
						if ((b3 = data[pix2=pix+2] - data2[pix2]) < 0)
							data2[pix2] = -b3;
						else
							data2[pix2] = b3;
					}
					dataChanged = true;
					break;

				case "screen" : 
					while (p--) {
						data2[pix-=4] = (255 - ( ((255-data2[pix])*(255-data[pix])) >> 8));
						data2[pix1=pix+1] = (255 - ( ((255-data2[pix1])*(255-data[pix1])) >> 8));
						data2[pix2=pix+2] = (255 - ( ((255-data2[pix2])*(255-data[pix2])) >> 8));
					}
					dataChanged = true;
					break;

				case "exclusion" : 
					var div_2_255 = 2 / 255;
					while (p--) {
						data2[pix-=4] = (r1 = data[pix]) - (r1 * div_2_255 - 1) * data2[pix];
						data2[pix1=pix+1] = (g1 = data[pix1]) - (g1 * div_2_255 - 1) * data2[pix1];
						data2[pix2=pix+2] = (b1 = data[pix2]) - (b1 * div_2_255 - 1) * data2[pix2];
					}
					dataChanged = true;
					break;

				case "overlay" : 
					var div_2_255 = 2 / 255;
					while (p--) {
						if ((r1 = data[pix-=4]) < 128)
							data2[pix] = data2[pix]*r1*div_2_255;
						else
							data2[pix] = 255 - (255-data2[pix])*(255-r1)*div_2_255;

						if ((g1 = data[pix1=pix+1]) < 128)
							data2[pix1] = data2[pix1]*g1*div_2_255;
						else
							data2[pix1] = 255 - (255-data2[pix1])*(255-g1)*div_2_255;

						if ((b1 = data[pix2=pix+2]) < 128)
							data2[pix2] = data2[pix2]*b1*div_2_255;
						else
							data2[pix2] = 255 - (255-data2[pix2])*(255-b1)*div_2_255;

					}
					dataChanged = true;
					break;

				case "softlight" : 
					var div_2_255 = 2 / 255;
					while (p--) {
						if ((r1 = data[pix-=4]) < 128)
							data2[pix] = ((data2[pix]>>1) + 64) * r1 * div_2_255;
						else
							data2[pix] = 255 - (191 - (data2[pix]>>1)) * (255-r1) * div_2_255;

						if ((g1 = data[pix1=pix+1]) < 128)
							data2[pix1] = ((data2[pix1]>>1)+64) * g1 * div_2_255;
						else
							data2[pix1] = 255 - (191 - (data2[pix1]>>1)) * (255-g1) * div_2_255;

						if ((b1 = data[pix2=pix+2]) < 128)
							data2[pix2] = ((data2[pix2]>>1)+64) * b1 * div_2_255;
						else
							data2[pix2] = 255 - (191 - (data2[pix2]>>1)) * (255-b1) * div_2_255;

					}
					dataChanged = true;
					break;

				case "hardlight" : 
					var div_2_255 = 2 / 255;
					while (p--) {
						if ((r2 = data2[pix-=4]) < 128)
							data2[pix] = data[pix] * r2 * div_2_255;
						else
							data2[pix] = 255 - (255-data[pix]) * (255-r2) * div_2_255;

						if ((g2 = data2[pix1=pix+1]) < 128)
							data2[pix1] = data[pix1] * g2 * div_2_255;
						else
							data2[pix1] = 255 - (255-data[pix1]) * (255-g2) * div_2_255;

						if ((b2 = data2[pix2=pix+2]) < 128)
							data2[pix2] = data[pix2] * b2 * div_2_255;
						else
							data2[pix2] = 255 - (255-data[pix2]) * (255-b2) * div_2_255;

					}
					dataChanged = true;
					break;

				case "colordodge" : 
					while (p--) {
						if ((r3 = (data[pix-=4]<<8)/(255-(r2 = data2[pix]))) > 255 || r2 == 255)
							data2[pix] = 255;
						else
							data2[pix] = r3;

						if ((g3 = (data[pix1=pix+1]<<8)/(255-(g2 = data2[pix1]))) > 255 || g2 == 255)
							data2[pix1] = 255;
						else
							data2[pix1] = g3;

						if ((b3 = (data[pix2=pix+2]<<8)/(255-(b2 = data2[pix2]))) > 255 || b2 == 255)
							data2[pix2] = 255;
						else
							data2[pix2] = b3;
					}
					dataChanged = true;
					break;

				case "colorburn" : 
					while (p--) {
						if ((r3 = 255-((255-data[pix-=4])<<8)/data2[pix]) < 0 || data2[pix] == 0)
							data2[pix] = 0;
						else
							data2[pix] = r3;

						if ((g3 = 255-((255-data[pix1=pix+1])<<8)/data2[pix1]) < 0 || data2[pix1] == 0)
							data2[pix1] = 0;
						else
							data2[pix1] = g3;

						if ((b3 = 255-((255-data[pix2=pix+2])<<8)/data2[pix2]) < 0 || data2[pix2] == 0)
							data2[pix2] = 0;
						else
							data2[pix2] = b3;
					}
					dataChanged = true;
					break;

				case "linearlight" : 
					while (p--) {
						if ( ((r3 = 2*(r2=data2[pix-=4])+data[pix]-256) < 0) || (r2 < 128 && r3 < 0)) {
							data2[pix] = 0
						} else {
							if (r3 > 255)
								data2[pix] = 255;
							else
								data2[pix] = r3;
						}
						if ( ((g3 = 2*(g2=data2[pix1=pix+1])+data[pix1]-256) < 0) || (g2 < 128 && g3 < 0)) {
							data2[pix1] = 0
						} else {
							if (g3 > 255)
								data2[pix1] = 255;
							else
								data2[pix1] = g3;
						}
						if ( ((b3 = 2*(b2=data2[pix2=pix+2])+data[pix2]-256) < 0) || (b2 < 128 && b3 < 0)) {
							data2[pix2] = 0
						} else {
							if (b3 > 255)
								data2[pix2] = 255;
							else
								data2[pix2] = b3;
						}
					}
					dataChanged = true;
					break;

				case "vividlight" : 
					while (p--) {
						if ((r2=data2[pix-=4]) < 128) {
							if (r2) {
								if ((r3 = 255 - ((255-data[pix])<<8) / (2*r2)) < 0) 
									data2[pix] = 0;
								else
									data2[pix] = r3
							} else {
								data2[pix] = 0;
							}
						} else if ((r3 = (r4=2*r2-256)) < 255) {
							if ((r3 = (data[pix]<<8)/(255-r4)) > 255) 
								data2[pix] = 255;
							else
								data2[pix] = r3;
						} else {
							if (r3 < 0) 
								data2[pix] = 0;
							else
								data2[pix] = r3
						}

						if ((g2=data2[pix1=pix+1]) < 128) {
							if (g2) {
								if ((g3 = 255 - ((255-data[pix1])<<8) / (2*g2)) < 0) 
									data2[pix1] = 0;
								else
									data2[pix1] = g3;
							} else {
								data2[pix1] = 0;
							}
						} else if ((g3 = (g4=2*g2-256)) < 255) {
							if ((g3 = (data[pix1]<<8)/(255-g4)) > 255)
								data2[pix1] = 255;
							else
								data2[pix1] = g3;
						} else {
							if (g3 < 0) 
								data2[pix1] = 0;
							else
								data2[pix1] = g3;
						}

						if ((b2=data2[pix2=pix+2]) < 128) {
							if (b2) {
								if ((b3 = 255 - ((255-data[pix2])<<8) / (2*b2)) < 0) 
									data2[pix2] = 0;
								else
									data2[pix2] = b3;
							} else {
								data2[pix2] = 0;
							}
						} else if ((b3 = (b4=2*b2-256)) < 255) {
							if ((b3 = (data[pix2]<<8)/(255-b4)) > 255) 
								data2[pix2] = 255;
							else
								data2[pix2] = b3;
						} else {
							if (b3 < 0) 
								data2[pix2] = 0;
							else
								data2[pix2] = b3;
						}
					}
					dataChanged = true;
					break;

				case "pinlight" : 
					while (p--) {
						if ((r2=data2[pix-=4]) < 128)
							if ((r1=data[pix]) < (r4=2*r2))
								data2[pix] = r1;
							else
								data2[pix] = r4;
						else
							if ((r1=data[pix]) > (r4=2*r2-256))
								data2[pix] = r1;
							else
								data2[pix] = r4;

						if ((g2=data2[pix1=pix+1]) < 128)
							if ((g1=data[pix1]) < (g4=2*g2))
								data2[pix1] = g1;
							else
								data2[pix1] = g4;
						else
							if ((g1=data[pix1]) > (g4=2*g2-256))
								data2[pix1] = g1;
							else
								data2[pix1] = g4;

						if ((r2=data2[pix2=pix+2]) < 128)
							if ((r1=data[pix2]) < (r4=2*r2))
								data2[pix2] = r1;
							else
								data2[pix2] = r4;
						else
							if ((r1=data[pix2]) > (r4=2*r2-256))
								data2[pix2] = r1;
							else
								data2[pix2] = r4;
					}
					dataChanged = true;
					break;

				case "hardmix" : 
					while (p--) {
						if ((r2 = data2[pix-=4]) < 128)
							if (255 - ((255-data[pix])<<8)/(2*r2) < 128 || r2 == 0)
								data2[pix] = 0;
							else
								data2[pix] = 255;
						else if ((r4=2*r2-256) < 255 && (data[pix]<<8)/(255-r4) < 128)
							data2[pix] = 0;
						else
							data2[pix] = 255;

						if ((g2 = data2[pix1=pix+1]) < 128)
							if (255 - ((255-data[pix1])<<8)/(2*g2) < 128 || g2 == 0)
								data2[pix1] = 0;
							else
								data2[pix1] = 255;
						else if ((g4=2*g2-256) < 255 && (data[pix1]<<8)/(255-g4) < 128)
							data2[pix1] = 0;
						else
							data2[pix1] = 255;

						if ((b2 = data2[pix2=pix+2]) < 128)
							if (255 - ((255-data[pix2])<<8)/(2*b2) < 128 || b2 == 0)
								data2[pix2] = 0;
							else
								data2[pix2] = 255;
						else if ((b4=2*b2-256) < 255 && (data[pix2]<<8)/(255-b4) < 128)
							data2[pix2] = 0;
						else
							data2[pix2] = 255;
					}
					dataChanged = true;
					break;
			}

			if (dataChanged) 
				otherCtx.putImageData(dataDesc2,0,0);

			if (amount != 1 && !Pixastic.Client.hasGlobalAlpha()) {
				var p = w*h;
				var amount2 = amount;
				var amount1 = 1 - amount;
				while (p--) {
					var pix = p*4;
					var r = (data[pix] * amount1 + data2[pix] * amount2)>>0;
					var g = (data[pix+1] * amount1 + data2[pix+1] * amount2)>>0;
					var b = (data[pix+2] * amount1 + data2[pix+2] * amount2)>>0;

					data[pix] = r;
					data[pix+1] = g;
					data[pix+2] = b;
				}
				params.useData = true;
			} else {
				var ctx = params.canvas.getContext("2d");
				ctx.save();
				ctx.globalAlpha = amount;
				ctx.drawImage(
					otherCanvas,
					0,0,rect.width,rect.height,
					rect.left,rect.top,rect.width,rect.height
				);
				ctx.globalAlpha = 1;
				ctx.restore();
			}

			return true;
		}
	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvasImageData();
	}
}/*
 * Pixastic Lib - Blur filter - v0.1.0
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.blur = {
	process : function(params) {

		if (typeof params.options.fixMargin == "undefined")
			params.options.fixMargin = true;

		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);
			var dataCopy = Pixastic.prepareData(params, true)

			/*
			var kernel = [
				[0.5, 	1, 	0.5],
				[1, 	2, 	1],
				[0.5, 	1, 	0.5]
			];
			*/

			var kernel = [
				[0, 	1, 	0],
				[1, 	2, 	1],
				[0, 	1, 	0]
			];

			var weight = 0;
			for (var i=0;i<3;i++) {
				for (var j=0;j<3;j++) {
					weight += kernel[i][j];
				}
			}

			weight = 1 / (weight*2);

			var rect = params.options.rect;
			var w = rect.width;
			var h = rect.height;

			var w4 = w*4;
			var y = h;
			do {
				var offsetY = (y-1)*w4;

				var prevY = (y == 1) ? 0 : y-2;
				var nextY = (y == h) ? y - 1 : y;

				var offsetYPrev = prevY*w*4;
				var offsetYNext = nextY*w*4;

				var x = w;
				do {
					var offset = offsetY + (x*4-4);

					var offsetPrev = offsetYPrev + ((x == 1) ? 0 : x-2) * 4;
					var offsetNext = offsetYNext + ((x == w) ? x-1 : x) * 4;
	
					data[offset] = (
						/*
						dataCopy[offsetPrev - 4]
						+ dataCopy[offsetPrev+4] 
						+ dataCopy[offsetNext - 4]
						+ dataCopy[offsetNext+4]
						+ 
						*/
						(dataCopy[offsetPrev]
						+ dataCopy[offset-4]
						+ dataCopy[offset+4]
						+ dataCopy[offsetNext])		* 2
						+ dataCopy[offset] 		* 4
						) * weight;

					data[offset+1] = (
						/*
						dataCopy[offsetPrev - 3]
						+ dataCopy[offsetPrev+5] 
						+ dataCopy[offsetNext - 3] 
						+ dataCopy[offsetNext+5]
						+ 
						*/
						(dataCopy[offsetPrev+1]
						+ dataCopy[offset-3]
						+ dataCopy[offset+5]
						+ dataCopy[offsetNext+1])	* 2
						+ dataCopy[offset+1] 		* 4
						) * weight;

					data[offset+2] = (
						/*
						dataCopy[offsetPrev - 2] 
						+ dataCopy[offsetPrev+6] 
						+ dataCopy[offsetNext - 2] 
						+ dataCopy[offsetNext+6]
						+ 
						*/
						(dataCopy[offsetPrev+2]
						+ dataCopy[offset-2]
						+ dataCopy[offset+6]
						+ dataCopy[offsetNext+2])	* 2
						+ dataCopy[offset+2] 		* 4
						) * weight;

				} while (--x);
			} while (--y);

			return true;

		} else if (Pixastic.Client.isIE()) {
			params.image.style.filter += " progid:DXImageTransform.Microsoft.Blur(pixelradius=1.5)";

			if (params.options.fixMargin) {
				params.image.style.marginLeft = (parseInt(params.image.style.marginLeft,10)||0) - 2 + "px";
				params.image.style.marginTop = (parseInt(params.image.style.marginTop,10)||0) - 2 + "px";
			}

			return true;
		}
	},
	checkSupport : function() {
		return (Pixastic.Client.hasCanvasImageData() || Pixastic.Client.isIE());
	}
}/*
 * Pixastic Lib - Blur Fast - v0.1.1
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.blurfast = {
	process : function(params) {

		var amount = parseFloat(params.options.amount)||0;
		var clear = !!(params.options.clear && params.options.clear != "false");

		amount = Math.max(0,Math.min(5,amount));

		if (Pixastic.Client.hasCanvas()) {
			var rect = params.options.rect;

			var ctx = params.canvas.getContext("2d");
			ctx.save();
			ctx.beginPath();
			ctx.rect(rect.left, rect.top, rect.width, rect.height);
			ctx.clip();

			var scale = 2;
			var smallWidth = Math.round(params.width / scale);
			var smallHeight = Math.round(params.height / scale);

			var copy = document.createElement("canvas");
			copy.width = smallWidth;
			copy.height = smallHeight;

			var clear = false;
			var steps = Math.round(amount * 20);

			var copyCtx = copy.getContext("2d");
			for (var i=0;i<steps;i++) {
				var scaledWidth = Math.max(1,Math.round(smallWidth - i));
				var scaledHeight = Math.max(1,Math.round(smallHeight - i));
	
				copyCtx.clearRect(0,0,smallWidth,smallHeight);
	
				copyCtx.drawImage(
					params.canvas,
					0,0,params.width,params.height,
					0,0,scaledWidth,scaledHeight
				);
	
				if (clear)
					ctx.clearRect(rect.left,rect.top,rect.width,rect.height);
	
				ctx.drawImage(
					copy,
					0,0,scaledWidth,scaledHeight,
					0,0,params.width,params.height
				);
			}

			ctx.restore();

			params.useData = false;
			return true;
		} else if (Pixastic.Client.isIE()) {
			var radius = 10 * amount;
			params.image.style.filter += " progid:DXImageTransform.Microsoft.Blur(pixelradius=" + radius + ")";

			if (params.options.fixMargin || 1) {
				params.image.style.marginLeft = (parseInt(params.image.style.marginLeft,10)||0) - Math.round(radius) + "px";
				params.image.style.marginTop = (parseInt(params.image.style.marginTop,10)||0) - Math.round(radius) + "px";
			}

			return true;
		}
	},
	checkSupport : function() {
		return (Pixastic.Client.hasCanvas() || Pixastic.Client.isIE());
	}
}
/*
 * Pixastic Lib - Brightness/Contrast filter - v0.1.1
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.brightness = {

	process : function(params) {

		var brightness = parseInt(params.options.brightness,10) || 0;
		var contrast = parseFloat(params.options.contrast)||0;
		var legacy = !!(params.options.legacy && params.options.legacy != "false");

		if (legacy) {
			brightness = Math.min(150,Math.max(-150,brightness));
		} else {
			var brightMul = 1 + Math.min(150,Math.max(-150,brightness)) / 150;
		}
		contrast = Math.max(0,contrast+1);

		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);
			var rect = params.options.rect;
			var w = rect.width;
			var h = rect.height;

			var p = w*h;
			var pix = p*4, pix1, pix2;

			var mul, add;
			if (contrast != 1) {
				if (legacy) {
					mul = contrast;
					add = (brightness - 128) * contrast + 128;
				} else {
					mul = brightMul * contrast;
					add = - contrast * 128 + 128;
				}
			} else {  // this if-then is not necessary anymore, is it?
				if (legacy) {
					mul = 1;
					add = brightness;
				} else {
					mul = brightMul;
					add = 0;
				}
			}
			var r, g, b;
			while (p--) {
				if ((r = data[pix-=4] * mul + add) > 255 )
					data[pix] = 255;
				else if (r < 0)
					data[pix] = 0;
				else
 					data[pix] = r;

				if ((g = data[pix1=pix+1] * mul + add) > 255 ) 
					data[pix1] = 255;
				else if (g < 0)
					data[pix1] = 0;
				else
					data[pix1] = g;

				if ((b = data[pix2=pix+2] * mul + add) > 255 ) 
					data[pix2] = 255;
				else if (b < 0)
					data[pix2] = 0;
				else
					data[pix2] = b;
			}
			return true;
		}
	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvasImageData();
	}
}

/*
 * Pixastic Lib - Color adjust filter - v0.1.1
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.coloradjust = {

	process : function(params) {
		var red = parseFloat(params.options.red) || 0;
		var green = parseFloat(params.options.green) || 0;
		var blue = parseFloat(params.options.blue) || 0;

		red = Math.round(red*255);
		green = Math.round(green*255);
		blue = Math.round(blue*255);

		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);
			var rect = params.options.rect;

			var p = rect.width*rect.height;
			var pix = p*4, pix1, pix2;

			var r, g, b;
			while (p--) {
				pix -= 4;

				if (red) {
					if ((r = data[pix] + red) < 0 ) 
						data[pix] = 0;
					else if (r > 255 ) 
						data[pix] = 255;
					else
						data[pix] = r;
				}

				if (green) {
					if ((g = data[pix1=pix+1] + green) < 0 ) 
						data[pix1] = 0;
					else if (g > 255 ) 
						data[pix1] = 255;
					else
						data[pix1] = g;
				}

				if (blue) {
					if ((b = data[pix2=pix+2] + blue) < 0 ) 
						data[pix2] = 0;
					else if (b > 255 ) 
						data[pix2] = 255;
					else
						data[pix2] = b;
				}
			}
			return true;
		}
	},
	checkSupport : function() {
		return (Pixastic.Client.hasCanvasImageData());
	}
}
/*
 * Pixastic Lib - Histogram - v0.1.0
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */


Pixastic.Actions.colorhistogram = {

	array256 : function(default_value) {
		arr = [];
		for (var i=0; i<256; i++) { arr[i] = default_value; }
		return arr
	},
 
	process : function(params) {
		var values = [];
		if (typeof params.options.returnValue != "object") {
			params.options.returnValue = {rvals:[], gvals:[], bvals:[]};
		}
		var paint = !!(params.options.paint);

		var returnValue = params.options.returnValue;
		if (typeof returnValue.values != "array") {
			returnValue.rvals = [];
			returnValue.gvals = [];
			returnValue.bvals = [];
		}
 
		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);
			params.useData = false;
 
			var rvals = this.array256(0);
			var gvals = this.array256(0);
			var bvals = this.array256(0);
 
			var rect = params.options.rect;

			var p = rect.width*rect.height;
			var pix = p*4;
			while (p--) {
				rvals[data[pix-=4]]++;
				gvals[data[pix+1]]++;
				bvals[data[pix+2]]++;
			}
 
			returnValue.rvals = rvals;
			returnValue.gvals = gvals;
			returnValue.bvals = bvals;

			if (paint) {
				var ctx = params.canvas.getContext("2d");
				var vals = [rvals, gvals, bvals];
				for (var v=0;v<3;v++) {
					var yoff = (v+1) * params.height / 3;
					var maxValue = 0;
					for (var i=0;i<256;i++) {
						if (vals[v][i] > maxValue)
							maxValue = vals[v][i];
					}
					var heightScale = params.height / 3 / maxValue;
					var widthScale = params.width / 256;
					if (v==0) ctx.fillStyle = "rgba(255,0,0,0.5)";
					else if (v==1) ctx.fillStyle = "rgba(0,255,0,0.5)";
					else if (v==2) ctx.fillStyle = "rgba(0,0,255,0.5)";
					for (var i=0;i<256;i++) {
						ctx.fillRect(
							i * widthScale, params.height - heightScale * vals[v][i] - params.height + yoff,
							widthScale, vals[v][i] * heightScale
						);
					}
				}
			}
			return true;
		}
	},

	checkSupport : function() {
		return Pixastic.Client.hasCanvasImageData();
	}
}/*
 * Pixastic Lib - Crop - v0.1.1
 * Copyright (c) 2008-2009 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.crop = {
	process : function(params) {
		if (Pixastic.Client.hasCanvas()) {
			var rect = params.options.rect;

			var width = rect.width;
			var height = rect.height;
			var top = rect.top;
			var left = rect.left;

			if (typeof params.options.left != "undefined")
				left = parseInt(params.options.left,10);
			if (typeof params.options.top != "undefined")
				top = parseInt(params.options.top,10);
			if (typeof params.options.height != "undefined")
				width = parseInt(params.options.width,10);
			if (typeof params.options.height != "undefined")
				height = parseInt(params.options.height,10);

			if (left < 0) left = 0;
			if (left > params.width-1) left = params.width-1;

			if (top < 0) top = 0;
			if (top > params.height-1) top = params.height-1;

			if (width < 1) width = 1;
			if (left + width > params.width)
				width = params.width - left;

			if (height < 1) height = 1;
			if (top + height > params.height)
				height = params.height - top;

			var copy = document.createElement("canvas");
			copy.width = params.width;
			copy.height = params.height;
			copy.getContext("2d").drawImage(params.canvas,0,0);

			params.canvas.width = width;
			params.canvas.height = height;
			params.canvas.getContext("2d").clearRect(0,0,width,height);

			params.canvas.getContext("2d").drawImage(copy,
				left,top,width,height,
				0,0,width,height
			);

			params.useData = false;
			return true;
		}
	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvas();
	}
}


/*
 * Pixastic Lib - Desaturation filter - v0.1.1
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.desaturate = {

	process : function(params) {
		var useAverage = !!(params.options.average && params.options.average != "false");

		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);
			var rect = params.options.rect;
			var w = rect.width;
			var h = rect.height;

			var p = w*h;
			var pix = p*4, pix1, pix2;

			if (useAverage) {
				while (p--) 
					data[pix-=4] = data[pix1=pix+1] = data[pix2=pix+2] = (data[pix]+data[pix1]+data[pix2])/3
			} else {
				while (p--)
					data[pix-=4] = data[pix1=pix+1] = data[pix2=pix+2] = (data[pix]*0.3 + data[pix1]*0.59 + data[pix2]*0.11);
			}
			return true;
		} else if (Pixastic.Client.isIE()) {
			params.image.style.filter += " gray";
			return true;
		}
	},
	checkSupport : function() {
		return (Pixastic.Client.hasCanvasImageData() || Pixastic.Client.isIE());
	}
}/*
 * Pixastic Lib - Edge detection filter - v0.1.1
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.edges = {
	process : function(params) {

		var mono = !!(params.options.mono && params.options.mono != "false");
		var invert = !!(params.options.invert && params.options.invert != "false");

		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);
			var dataCopy = Pixastic.prepareData(params, true)

			var c = -1/8;
			var kernel = [
				[c, 	c, 	c],
				[c, 	1, 	c],
				[c, 	c, 	c]
			];

			weight = 1/c;

			var rect = params.options.rect;
			var w = rect.width;
			var h = rect.height;

			var w4 = w*4;
			var y = h;
			do {
				var offsetY = (y-1)*w4;

				var nextY = (y == h) ? y - 1 : y;
				var prevY = (y == 1) ? 0 : y-2;

				var offsetYPrev = prevY*w*4;
				var offsetYNext = nextY*w*4;

				var x = w;
				do {
					var offset = offsetY + (x*4-4);

					var offsetPrev = offsetYPrev + ((x == 1) ? 0 : x-2) * 4;
					var offsetNext = offsetYNext + ((x == w) ? x-1 : x) * 4;
	
					var r = ((dataCopy[offsetPrev-4]
						+ dataCopy[offsetPrev]
						+ dataCopy[offsetPrev+4]
						+ dataCopy[offset-4]
						+ dataCopy[offset+4]
						+ dataCopy[offsetNext-4]
						+ dataCopy[offsetNext]
						+ dataCopy[offsetNext+4]) * c
						+ dataCopy[offset]
						) 
						* weight;
	
					var g = ((dataCopy[offsetPrev-3]
						+ dataCopy[offsetPrev+1]
						+ dataCopy[offsetPrev+5]
						+ dataCopy[offset-3]
						+ dataCopy[offset+5]
						+ dataCopy[offsetNext-3]
						+ dataCopy[offsetNext+1]
						+ dataCopy[offsetNext+5]) * c
						+ dataCopy[offset+1])
						* weight;
	
					var b = ((dataCopy[offsetPrev-2]
						+ dataCopy[offsetPrev+2]
						+ dataCopy[offsetPrev+6]
						+ dataCopy[offset-2]
						+ dataCopy[offset+6]
						+ dataCopy[offsetNext-2]
						+ dataCopy[offsetNext+2]
						+ dataCopy[offsetNext+6]) * c
						+ dataCopy[offset+2])
						* weight;

					if (mono) {
						var brightness = (r*0.3 + g*0.59 + b*0.11)||0;
						if (invert) brightness = 255 - brightness;
						if (brightness < 0 ) brightness = 0;
						if (brightness > 255 ) brightness = 255;
						r = g = b = brightness;
					} else {
						if (invert) {
							r = 255 - r;
							g = 255 - g;
							b = 255 - b;
						}
						if (r < 0 ) r = 0;
						if (g < 0 ) g = 0;
						if (b < 0 ) b = 0;
						if (r > 255 ) r = 255;
						if (g > 255 ) g = 255;
						if (b > 255 ) b = 255;
					}

					data[offset] = r;
					data[offset+1] = g;
					data[offset+2] = b;

				} while (--x);
			} while (--y);

			return true;
		}
	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvasImageData();
	}
}/*
 * Pixastic Lib - Edge detection 2 - v0.1.0
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 * 
 * Contribution by Oliver Hunt (http://nerget.com/, http://nerget.com/canvas/edgeDetection.js). Thanks Oliver!
 *
 */

Pixastic.Actions.edges2 = {
	process : function(params) {

		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);
			var dataCopy = Pixastic.prepareData(params, true)

			var rect = params.options.rect;
			var w = rect.width;
			var h = rect.height;

			var w4 = w * 4;
			var pixel = w4 + 4; // Start at (1,1)
			var hm1 = h - 1;
			var wm1 = w - 1;
			for (var y = 1; y < hm1; ++y) {
				// Prepare initial cached values for current row
				var centerRow = pixel - 4;
				var priorRow = centerRow - w4;
				var nextRow = centerRow + w4;
				
				var r1 = - dataCopy[priorRow]   - dataCopy[centerRow]   - dataCopy[nextRow];
				var g1 = - dataCopy[++priorRow] - dataCopy[++centerRow] - dataCopy[++nextRow];
				var b1 = - dataCopy[++priorRow] - dataCopy[++centerRow] - dataCopy[++nextRow];
				
				var rp = dataCopy[priorRow += 2];
				var gp = dataCopy[++priorRow];
				var bp = dataCopy[++priorRow];
				
				var rc = dataCopy[centerRow += 2];
				var gc = dataCopy[++centerRow];
				var bc = dataCopy[++centerRow];
				
				var rn = dataCopy[nextRow += 2];
				var gn = dataCopy[++nextRow];
				var bn = dataCopy[++nextRow];
				
				var r2 = - rp - rc - rn;
				var g2 = - gp - gc - gn;
				var b2 = - bp - bc - bn;
				
				// Main convolution loop
				for (var x = 1; x < wm1; ++x) {
					centerRow = pixel + 4;
					priorRow = centerRow - w4;
					nextRow = centerRow + w4;
					
					var r = 127 + r1 - rp - (rc * -8) - rn;
					var g = 127 + g1 - gp - (gc * -8) - gn;
					var b = 127 + b1 - bp - (bc * -8) - bn;
					
					r1 = r2;
					g1 = g2;
					b1 = b2;
					
					rp = dataCopy[  priorRow];
					gp = dataCopy[++priorRow];
					bp = dataCopy[++priorRow];
					
					rc = dataCopy[  centerRow];
					gc = dataCopy[++centerRow];
					bc = dataCopy[++centerRow];
					
					rn = dataCopy[  nextRow];
					gn = dataCopy[++nextRow];
					bn = dataCopy[++nextRow];
					
					r += (r2 = - rp - rc - rn);
					g += (g2 = - gp - gc - gn);
					b += (b2 = - bp - bc - bn);

					if (r > 255) r = 255;
					if (g > 255) g = 255;
					if (b > 255) b = 255;
					if (r < 0) r = 0;
					if (g < 0) g = 0;
					if (b < 0) b = 0;

					data[pixel] = r;
					data[++pixel] = g;
					data[++pixel] = b;
					//data[++pixel] = 255; // alpha

					pixel+=2;
				}
				pixel += 8;
			}
			return true;
		}
	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvasImageData();
	}
}/*
 * Pixastic Lib - Emboss filter - v0.1.0
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.emboss = {
	process : function(params) {

		var strength = parseFloat(params.options.strength)||1;
		var greyLevel = typeof params.options.greyLevel != "undefined" ? parseInt(params.options.greyLevel) : 180;
		var direction = params.options.direction||"topleft";
		var blend = !!(params.options.blend && params.options.blend != "false");

		var dirY = 0;
		var dirX = 0;

		switch (direction) {
			case "topleft":			// top left
				dirY = -1;
				dirX = -1;
				break;
			case "top":			// top
				dirY = -1;
				dirX = 0;
				break;
			case "topright":			// top right
				dirY = -1;
				dirX = 1;
				break;
			case "right":			// right
				dirY = 0;
				dirX = 1;
				break;
			case "bottomright":			// bottom right
				dirY = 1;
				dirX = 1;
				break;
			case "bottom":			// bottom
				dirY = 1;
				dirX = 0;
				break;
			case "bottomleft":			// bottom left
				dirY = 1;
				dirX = -1;
				break;
			case "left":			// left
				dirY = 0;
				dirX = -1;
				break;
		}

		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);
			var dataCopy = Pixastic.prepareData(params, true)

			var invertAlpha = !!params.options.invertAlpha;
			var rect = params.options.rect;
			var w = rect.width;
			var h = rect.height;

			var w4 = w*4;
			var y = h;
			do {
				var offsetY = (y-1)*w4;

				var otherY = dirY;
				if (y + otherY < 1) otherY = 0;
				if (y + otherY > h) otherY = 0;

				var offsetYOther = (y-1+otherY)*w*4;

				var x = w;
				do {
						var offset = offsetY + (x-1)*4;

						var otherX = dirX;
						if (x + otherX < 1) otherX = 0;
						if (x + otherX > w) otherX = 0;

						var offsetOther = offsetYOther + (x-1+otherX)*4;

						var dR = dataCopy[offset] - dataCopy[offsetOther];
						var dG = dataCopy[offset+1] - dataCopy[offsetOther+1];
						var dB = dataCopy[offset+2] - dataCopy[offsetOther+2];

						var dif = dR;
						var absDif = dif > 0 ? dif : -dif;

						var absG = dG > 0 ? dG : -dG;
						var absB = dB > 0 ? dB : -dB;

						if (absG > absDif) {
							dif = dG;
						}
						if (absB > absDif) {
							dif = dB;
						}

						dif *= strength;

						if (blend) {
							var r = data[offset] + dif;
							var g = data[offset+1] + dif;
							var b = data[offset+2] + dif;

							data[offset] = (r > 255) ? 255 : (r < 0 ? 0 : r);
							data[offset+1] = (g > 255) ? 255 : (g < 0 ? 0 : g);
							data[offset+2] = (b > 255) ? 255 : (b < 0 ? 0 : b);
						} else {
							var grey = greyLevel - dif;
							if (grey < 0) {
								grey = 0;
							} else if (grey > 255) {
								grey = 255;
							}

							data[offset] = data[offset+1] = data[offset+2] = grey;
						}

				} while (--x);
			} while (--y);
			return true;

		} else if (Pixastic.Client.isIE()) {
			params.image.style.filter += " progid:DXImageTransform.Microsoft.emboss()";
			return true;
		}
	},
	checkSupport : function() {
		return (Pixastic.Client.hasCanvasImageData() || Pixastic.Client.isIE());
	}

}
/*
 * Pixastic Lib - Flip - v0.1.0
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.flip = {
	process : function(params) {
		var rect = params.options.rect;
		var copyCanvas = document.createElement("canvas");
		copyCanvas.width = rect.width;
		copyCanvas.height = rect.height;
		copyCanvas.getContext("2d").drawImage(params.image, rect.left, rect.top, rect.width, rect.height, 0, 0, rect.width, rect.height);

		var ctx = params.canvas.getContext("2d");
		ctx.clearRect(rect.left, rect.top, rect.width, rect.height);

		if (params.options.axis == "horizontal") {
			ctx.scale(-1,1);
			ctx.drawImage(copyCanvas, -rect.left-rect.width, rect.top, rect.width, rect.height)
		} else {
			ctx.scale(1,-1);
			ctx.drawImage(copyCanvas, rect.left, -rect.top-rect.height, rect.width, rect.height)
		}

		params.useData = false;

		return true;		
	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvas();
	}
}

/*
 * Pixastic Lib - Horizontal flip - v0.1.0
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.fliph = {
	process : function(params) {
		if (Pixastic.Client.hasCanvas()) {
			var rect = params.options.rect;
			var copyCanvas = document.createElement("canvas");
			copyCanvas.width = rect.width;
			copyCanvas.height = rect.height;
			copyCanvas.getContext("2d").drawImage(params.image, rect.left, rect.top, rect.width, rect.height, 0, 0, rect.width, rect.height);

			var ctx = params.canvas.getContext("2d");
			ctx.clearRect(rect.left, rect.top, rect.width, rect.height);
			ctx.scale(-1,1);
			ctx.drawImage(copyCanvas, -rect.left-rect.width, rect.top, rect.width, rect.height)
			params.useData = false;

			return true;		

		} else if (Pixastic.Client.isIE()) {
			params.image.style.filter += " fliph";
			return true;
		}
	},
	checkSupport : function() {
		return (Pixastic.Client.hasCanvas() || Pixastic.Client.isIE());
	}
}

/*
 * Pixastic Lib - Vertical flip - v0.1.0
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.flipv = {
	process : function(params) {
		if (Pixastic.Client.hasCanvas()) {
			var rect = params.options.rect;
			var copyCanvas = document.createElement("canvas");
			copyCanvas.width = rect.width;
			copyCanvas.height = rect.height;
			copyCanvas.getContext("2d").drawImage(params.image, rect.left, rect.top, rect.width, rect.height, 0, 0, rect.width, rect.height);

			var ctx = params.canvas.getContext("2d");
			ctx.clearRect(rect.left, rect.top, rect.width, rect.height);
			ctx.scale(1,-1);
			ctx.drawImage(copyCanvas, rect.left, -rect.top-rect.height, rect.width, rect.height)
			params.useData = false;

			return true;		

		} else if (Pixastic.Client.isIE()) {
			params.image.style.filter += " flipv";
			return true;
		}
	},
	checkSupport : function() {
		return (Pixastic.Client.hasCanvas() || Pixastic.Client.isIE());
	}
}

/*
 * Pixastic Lib - Glow - v0.1.0
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */


Pixastic.Actions.glow = {
	process : function(params) {

		var amount = (parseFloat(params.options.amount)||0);
		var blurAmount = parseFloat(params.options.radius)||0;

		amount = Math.min(1,Math.max(0,amount));
		blurAmount = Math.min(5,Math.max(0,blurAmount));

		if (Pixastic.Client.hasCanvasImageData()) {
			var rect = params.options.rect;

			var blurCanvas = document.createElement("canvas");
			blurCanvas.width = params.width;
			blurCanvas.height = params.height;
			var blurCtx = blurCanvas.getContext("2d");
			blurCtx.drawImage(params.canvas,0,0);

			var scale = 2;
			var smallWidth = Math.round(params.width / scale);
			var smallHeight = Math.round(params.height / scale);

			var copy = document.createElement("canvas");
			copy.width = smallWidth;
			copy.height = smallHeight;

			var clear = true;
			var steps = Math.round(blurAmount * 20);

			var copyCtx = copy.getContext("2d");
			for (var i=0;i<steps;i++) {
				var scaledWidth = Math.max(1,Math.round(smallWidth - i));
				var scaledHeight = Math.max(1,Math.round(smallHeight - i));
	
				copyCtx.clearRect(0,0,smallWidth,smallHeight);
	
				copyCtx.drawImage(
					blurCanvas,
					0,0,params.width,params.height,
					0,0,scaledWidth,scaledHeight
				);
	
				blurCtx.clearRect(0,0,params.width,params.height);
	
				blurCtx.drawImage(
					copy,
					0,0,scaledWidth,scaledHeight,
					0,0,params.width,params.height
				);
			}

			var data = Pixastic.prepareData(params);
			var blurData = Pixastic.prepareData({canvas:blurCanvas,options:params.options});

			var p = rect.width * rect.height;

			var pix = p*4, pix1 = pix + 1, pix2 = pix + 2, pix3 = pix + 3;
			while (p--) {
				if ((data[pix-=4] += amount * blurData[pix]) > 255) data[pix] = 255;
				if ((data[pix1-=4] += amount * blurData[pix1]) > 255) data[pix1] = 255;
				if ((data[pix2-=4] += amount * blurData[pix2]) > 255) data[pix2] = 255;
			}

			return true;
		}
	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvasImageData();
	}
}



/*
 * Pixastic Lib - Histogram - v0.1.1
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.histogram = {
	process : function(params) {

		var average = !!(params.options.average && params.options.average != "false");
		var paint = !!(params.options.paint && params.options.paint != "false");
		var color = params.options.color || "rgba(255,255,255,0.5)";
		var values = [];
		if (typeof params.options.returnValue != "object") {
			params.options.returnValue = {values:[]};
		}
		var returnValue = params.options.returnValue;
		if (typeof returnValue.values != "array") {
			returnValue.values = [];
		}
		values = returnValue.values;

		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);
			params.useData = false;

			for (var i=0;i<256;i++) {
				values[i] = 0;
			}

			var rect = params.options.rect;
			var p = rect.width * rect.height;

			var pix = p*4, pix1 = pix + 1, pix2 = pix + 2, pix3 = pix + 3;
			var round = Math.round;

			if (average) {
				while (p--) {
					values[ round((data[pix-=4]+data[pix+1]+data[pix+2])/3) ]++;
				}
			} else {
				while (p--) {
					values[ round(data[pix-=4]*0.3 + data[pix+1]*0.59 + data[pix+2]*0.11) ]++;
				}
			}

			if (paint) {
				var maxValue = 0;
				for (var i=0;i<256;i++) {
					if (values[i] > maxValue) {
						maxValue = values[i];
					}
				}
				var heightScale = params.height / maxValue;
				var widthScale = params.width / 256;
				var ctx = params.canvas.getContext("2d");
				ctx.fillStyle = color;
				for (var i=0;i<256;i++) {
					ctx.fillRect(
						i * widthScale, params.height - heightScale * values[i],
						widthScale, values[i] * heightScale
					);
				}
			}

			returnValue.values = values;

			return true;
		}
	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvasImageData();
	}
}
/*
 * Pixastic Lib - HSL Adjust  - v0.1.1
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.hsl = {
	process : function(params) {

		var hue = parseInt(params.options.hue,10)||0;
		var saturation = (parseInt(params.options.saturation,10)||0) / 100;
		var lightness = (parseInt(params.options.lightness,10)||0) / 100;


		// this seems to give the same result as Photoshop
		if (saturation < 0) {
			var satMul = 1+saturation;
		} else {
			var satMul = 1+saturation*2;
		}

		hue = (hue%360) / 360;
		var hue6 = hue * 6;

		var rgbDiv = 1 / 255;

		var light255 = lightness * 255;
		var lightp1 = 1 + lightness;
		var lightm1 = 1 - lightness;
		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);

			var rect = params.options.rect;

			var p = rect.width * rect.height;

			var pix = p*4, pix1 = pix + 1, pix2 = pix + 2, pix3 = pix + 3;

			while (p--) {

				var r = data[pix-=4];
				var g = data[pix1=pix+1];
				var b = data[pix2=pix+2];

				if (hue != 0 || saturation != 0) {
					// ok, here comes rgb to hsl + adjust + hsl to rgb, all in one jumbled mess. 
					// It's not so pretty, but it's been optimized to get somewhat decent performance.
					// The transforms were originally adapted from the ones found in Graphics Gems, but have been heavily modified.
					var vs = r;
					if (g > vs) vs = g;
					if (b > vs) vs = b;
					var ms = r;
					if (g < ms) ms = g;
					if (b < ms) ms = b;
					var vm = (vs-ms);
					var l = (ms+vs)/510;
					if (l > 0) {
						if (vm > 0) {
							if (l <= 0.5) {
								var s = vm / (vs+ms) * satMul;
								if (s > 1) s = 1;
								var v = (l * (1+s));
							} else {
								var s = vm / (510-vs-ms) * satMul;
								if (s > 1) s = 1;
								var v = (l+s - l*s);
							}
							if (r == vs) {
								if (g == ms)
									var h = 5 + ((vs-b)/vm) + hue6;
								else
									var h = 1 - ((vs-g)/vm) + hue6;
							} else if (g == vs) {
								if (b == ms)
									var h = 1 + ((vs-r)/vm) + hue6;
								else
									var h = 3 - ((vs-b)/vm) + hue6;
							} else {
								if (r == ms)
									var h = 3 + ((vs-g)/vm) + hue6;
								else
									var h = 5 - ((vs-r)/vm) + hue6;
							}
							if (h < 0) h+=6;
							if (h >= 6) h-=6;
							var m = (l+l-v);
							var sextant = h>>0;
							if (sextant == 0) {
								r = v*255; g = (m+((v-m)*(h-sextant)))*255; b = m*255;
							} else if (sextant == 1) {
								r = (v-((v-m)*(h-sextant)))*255; g = v*255; b = m*255;
							} else if (sextant == 2) {
								r = m*255; g = v*255; b = (m+((v-m)*(h-sextant)))*255;
							} else if (sextant == 3) {
								r = m*255; g = (v-((v-m)*(h-sextant)))*255; b = v*255;
							} else if (sextant == 4) {
								r = (m+((v-m)*(h-sextant)))*255; g = m*255; b = v*255;
							} else if (sextant == 5) {
								r = v*255; g = m*255; b = (v-((v-m)*(h-sextant)))*255;
							}
						}
					}
				}

				if (lightness < 0) {
					r *= lightp1;
					g *= lightp1;
					b *= lightp1;
				} else if (lightness > 0) {
					r = r * lightm1 + light255;
					g = g * lightm1 + light255;
					b = b * lightm1 + light255;
				}

				if (r < 0) 
					data[pix] = 0
				else if (r > 255)
					data[pix] = 255
				else
					data[pix] = r;

				if (g < 0) 
					data[pix1] = 0
				else if (g > 255)
					data[pix1] = 255
				else
					data[pix1] = g;

				if (b < 0) 
					data[pix2] = 0
				else if (b > 255)
					data[pix2] = 255
				else
					data[pix2] = b;

			}

			return true;
		}
	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvasImageData();
	}

}
/*
 * Pixastic Lib - Invert filter - v0.1.1
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.invert = {
	process : function(params) {
		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);

			var invertAlpha = !!params.options.invertAlpha;
			var rect = params.options.rect;

			var p = rect.width * rect.height;

			var pix = p*4, pix1 = pix + 1, pix2 = pix + 2, pix3 = pix + 3;

			while (p--) {
				data[pix-=4] = 255 - data[pix];
				data[pix1-=4] = 255 - data[pix1];
				data[pix2-=4] = 255 - data[pix2];
				if (invertAlpha)
					data[pix3-=4] = 255 - data[pix3];
			}

			return true;
		} else if (Pixastic.Client.isIE()) {
			params.image.style.filter += " invert";
			return true;
		}
	},
	checkSupport : function() {
		return (Pixastic.Client.hasCanvasImageData() || Pixastic.Client.isIE());
	}
}
/*
 * Pixastic Lib - Laplace filter - v0.1.0
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.laplace = {
	process : function(params) {

		var strength = 1.0;
		var invert = !!(params.options.invert && params.options.invert != "false");
		var contrast = parseFloat(params.options.edgeStrength)||0;

		var greyLevel = parseInt(params.options.greyLevel)||0;

		contrast = -contrast;

		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);
			var dataCopy = Pixastic.prepareData(params, true)

			var kernel = [
				[-1, 	-1, 	-1],
				[-1, 	8, 	-1],
				[-1, 	-1, 	-1]
			];

			var weight = 1/8;

			var rect = params.options.rect;
			var w = rect.width;
			var h = rect.height;

			var w4 = w*4;
			var y = h;
			do {
				var offsetY = (y-1)*w4;

				var nextY = (y == h) ? y - 1 : y;
				var prevY = (y == 1) ? 0 : y-2;

				var offsetYPrev = prevY*w*4;
				var offsetYNext = nextY*w*4;

				var x = w;
				do {
					var offset = offsetY + (x*4-4);

					var offsetPrev = offsetYPrev + ((x == 1) ? 0 : x-2) * 4;
					var offsetNext = offsetYNext + ((x == w) ? x-1 : x) * 4;
	
					var r = ((-dataCopy[offsetPrev-4]
						- dataCopy[offsetPrev]
						- dataCopy[offsetPrev+4]
						- dataCopy[offset-4]
						- dataCopy[offset+4]
						- dataCopy[offsetNext-4]
						- dataCopy[offsetNext]
						- dataCopy[offsetNext+4])
						+ dataCopy[offset] * 8) 
						* weight;
	
					var g = ((-dataCopy[offsetPrev-3]
						- dataCopy[offsetPrev+1]
						- dataCopy[offsetPrev+5]
						- dataCopy[offset-3]
						- dataCopy[offset+5]
						- dataCopy[offsetNext-3]
						- dataCopy[offsetNext+1]
						- dataCopy[offsetNext+5])
						+ dataCopy[offset+1] * 8)
						* weight;
	
					var b = ((-dataCopy[offsetPrev-2]
						- dataCopy[offsetPrev+2]
						- dataCopy[offsetPrev+6]
						- dataCopy[offset-2]
						- dataCopy[offset+6]
						- dataCopy[offsetNext-2]
						- dataCopy[offsetNext+2]
						- dataCopy[offsetNext+6])
						+ dataCopy[offset+2] * 8)
						* weight;

					var brightness = ((r + g + b)/3) + greyLevel;

					if (contrast != 0) {
						if (brightness > 127) {
							brightness += ((brightness + 1) - 128) * contrast;
						} else if (brightness < 127) {
							brightness -= (brightness + 1) * contrast;
						}
					}
					if (invert) {
						brightness = 255 - brightness;
					}
					if (brightness < 0 ) brightness = 0;
					if (brightness > 255 ) brightness = 255;

					data[offset] = data[offset+1] = data[offset+2] = brightness;

				} while (--x);
			} while (--y);

			return true;
		}
	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvasImageData();
	}
}

/*
 * Pixastic Lib - Lighten filter - v0.1.1
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.lighten = {

	process : function(params) {
		var amount = parseFloat(params.options.amount) || 0;
		amount = Math.max(-1, Math.min(1, amount));

		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);
			var rect = params.options.rect;

			var p = rect.width * rect.height;

			var pix = p*4, pix1 = pix + 1, pix2 = pix + 2;
			var mul = amount + 1;

			while (p--) {
				if ((data[pix-=4] = data[pix] * mul) > 255)
					data[pix] = 255;

				if ((data[pix1-=4] = data[pix1] * mul) > 255)
					data[pix1] = 255;

				if ((data[pix2-=4] = data[pix2] * mul) > 255)
					data[pix2] = 255;

			}

			return true;

		} else if (Pixastic.Client.isIE()) {
			var img = params.image;
			if (amount < 0) {
				img.style.filter += " light()";
				img.filters[img.filters.length-1].addAmbient(
					255,255,255,
					100 * -amount
				);
			} else if (amount > 0) {
				img.style.filter += " light()";
				img.filters[img.filters.length-1].addAmbient(
					255,255,255,
					100
				);
				img.filters[img.filters.length-1].addAmbient(
					255,255,255,
					100 * amount
				);
			}
			return true;
		}
	},
	checkSupport : function() {
		return (Pixastic.Client.hasCanvasImageData() || Pixastic.Client.isIE());
	}
}
/*
 * Pixastic Lib - Mosaic filter - v0.1.0
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.mosaic = {

	process : function(params) {
		var blockSize = Math.max(1,parseInt(params.options.blockSize,10));

		if (Pixastic.Client.hasCanvasImageData()) {
			var rect = params.options.rect;
			var w = rect.width;
			var h = rect.height;
			var w4 = w*4;
			var y = h;

			var ctx = params.canvas.getContext("2d");

			var pixel = document.createElement("canvas");
			pixel.width = pixel.height = 1;
			var pixelCtx = pixel.getContext("2d");

			var copy = document.createElement("canvas");
			copy.width = w;
			copy.height = h;
			var copyCtx = copy.getContext("2d");
			copyCtx.drawImage(params.canvas,rect.left,rect.top,w,h, 0,0,w,h);

			for (var y=0;y<h;y+=blockSize) {
				for (var x=0;x<w;x+=blockSize) {
					var blockSizeX = blockSize;
					var blockSizeY = blockSize;
		
					if (blockSizeX + x > w)
						blockSizeX = w - x;
					if (blockSizeY + y > h)
						blockSizeY = h - y;

					pixelCtx.drawImage(copy, x, y, blockSizeX, blockSizeY, 0, 0, 1, 1);
					var data = pixelCtx.getImageData(0,0,1,1).data;
					ctx.fillStyle = "rgb(" + data[0] + "," + data[1] + "," + data[2] + ")";
					ctx.fillRect(rect.left + x, rect.top + y, blockSize, blockSize);
				}
			}
			params.useData = false;

			return true;
		}
	},
	checkSupport : function() {
		return (Pixastic.Client.hasCanvasImageData());
	}
}/*
 * Pixastic Lib - Noise filter - v0.1.0
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.noise = {

	process : function(params) {
		var amount = 0;
		var strength = 0;
		var mono = false;

		if (typeof params.options.amount != "undefined")
			amount = parseFloat(params.options.amount)||0;
		if (typeof params.options.strength != "undefined")
			strength = parseFloat(params.options.strength)||0;
		if (typeof params.options.mono != "undefined")
			mono = !!(params.options.mono && params.options.mono != "false");

		amount = Math.max(0,Math.min(1,amount));
		strength = Math.max(0,Math.min(1,strength));

		var noise = 128 * strength;
		var noise2 = noise / 2;

		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);
			var rect = params.options.rect;
			var w = rect.width;
			var h = rect.height;
			var w4 = w*4;
			var y = h;
			var random = Math.random;

			do {
				var offsetY = (y-1)*w4;
				var x = w;
				do {
					var offset = offsetY + (x-1)*4;
					if (random() < amount) {
						if (mono) {
							var pixelNoise = - noise2 + random() * noise;
							var r = data[offset] + pixelNoise;
							var g = data[offset+1] + pixelNoise;
							var b = data[offset+2] + pixelNoise;
						} else {
							var r = data[offset] - noise2 + (random() * noise);
							var g = data[offset+1] - noise2 + (random() * noise);
							var b = data[offset+2] - noise2 + (random() * noise);
						}

						if (r < 0 ) r = 0;
						if (g < 0 ) g = 0;
						if (b < 0 ) b = 0;
						if (r > 255 ) r = 255;
						if (g > 255 ) g = 255;
						if (b > 255 ) b = 255;

						data[offset] = r;
						data[offset+1] = g;
						data[offset+2] = b;
					}
				} while (--x);
			} while (--y);
			return true;
		}
	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvasImageData();
	}
}

/*
 * Pixastic Lib - Posterize effect - v0.1.0
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.posterize = {

	process : function(params) {

		
		var numLevels = 256;
		if (typeof params.options.levels != "undefined")
			numLevels = parseInt(params.options.levels,10)||1;

		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);

			numLevels = Math.max(2,Math.min(256,numLevels));
	
			var numAreas = 256 / numLevels;
			var numValues = 256 / (numLevels-1);

			var rect = params.options.rect;
			var w = rect.width;
			var h = rect.height;
			var w4 = w*4;
			var y = h;
			do {
				var offsetY = (y-1)*w4;
				var x = w;
				do {
					var offset = offsetY + (x-1)*4;

					var r = numValues * ((data[offset] / numAreas)>>0);
					var g = numValues * ((data[offset+1] / numAreas)>>0);
					var b = numValues * ((data[offset+2] / numAreas)>>0);

					if (r > 255) r = 255;
					if (g > 255) g = 255;
					if (b > 255) b = 255;

					data[offset] = r;
					data[offset+1] = g;
					data[offset+2] = b;

				} while (--x);
			} while (--y);
			return true;
		}
	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvasImageData();
	}
}


/*
 * Pixastic Lib - Pointillize filter - v0.1.0
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.pointillize = {

	process : function(params) {
		var radius = Math.max(1,parseInt(params.options.radius,10));
		var density = Math.min(5,Math.max(0,parseFloat(params.options.density)||0));
		var noise = Math.max(0,parseFloat(params.options.noise)||0);
		var transparent = !!(params.options.transparent && params.options.transparent != "false");

		if (Pixastic.Client.hasCanvasImageData()) {
			var rect = params.options.rect;
			var w = rect.width;
			var h = rect.height;
			var w4 = w*4;
			var y = h;

			var ctx = params.canvas.getContext("2d");
			var canvasWidth = params.canvas.width;
			var canvasHeight = params.canvas.height;

			var pixel = document.createElement("canvas");
			pixel.width = pixel.height = 1;
			var pixelCtx = pixel.getContext("2d");

			var copy = document.createElement("canvas");
			copy.width = w;
			copy.height = h;
			var copyCtx = copy.getContext("2d");
			copyCtx.drawImage(params.canvas,rect.left,rect.top,w,h, 0,0,w,h);

			var diameter = radius * 2;

			if (transparent)
				ctx.clearRect(rect.left, rect.top, rect.width, rect.height);

			var noiseRadius = radius * noise;

			var dist = 1 / density;

			for (var y=0;y<h+radius;y+=diameter*dist) {
				for (var x=0;x<w+radius;x+=diameter*dist) {
					rndX = noise ? (x+((Math.random()*2-1) * noiseRadius))>>0 : x;
					rndY = noise ? (y+((Math.random()*2-1) * noiseRadius))>>0 : y;

					var pixX = rndX - radius;
					var pixY = rndY - radius;
					if (pixX < 0) pixX = 0;
					if (pixY < 0) pixY = 0;

					var cx = rndX + rect.left;
					var cy = rndY + rect.top;
					if (cx < 0) cx = 0;
					if (cx > canvasWidth) cx = canvasWidth;
					if (cy < 0) cy = 0;
					if (cy > canvasHeight) cy = canvasHeight;

					var diameterX = diameter;
					var diameterY = diameter;

					if (diameterX + pixX > w)
						diameterX = w - pixX;
					if (diameterY + pixY > h)
						diameterY = h - pixY;
					if (diameterX < 1) diameterX = 1;
					if (diameterY < 1) diameterY = 1;

					pixelCtx.drawImage(copy, pixX, pixY, diameterX, diameterY, 0, 0, 1, 1);
					var data = pixelCtx.getImageData(0,0,1,1).data;

					ctx.fillStyle = "rgb(" + data[0] + "," + data[1] + "," + data[2] + ")";
					ctx.beginPath();
					ctx.arc(cx, cy, radius, 0, Math.PI*2, true);
					ctx.closePath();
					ctx.fill();
				}
			}

			params.useData = false;

			return true;
		}
	},
	checkSupport : function() {
		return (Pixastic.Client.hasCanvasImageData());
	}
}/*
 * Pixastic Lib - Remove noise - v0.1.0
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.removenoise = {
	process : function(params) {

		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);

			var rect = params.options.rect;
			var w = rect.width;
			var h = rect.height;

			var w4 = w*4;
			var y = h;
			do {
				var offsetY = (y-1)*w4;

				var nextY = (y == h) ? y - 1 : y;
				var prevY = (y == 1) ? 0 : y-2;

				var offsetYPrev = prevY*w*4;
				var offsetYNext = nextY*w*4;

				var x = w;
				do {
					var offset = offsetY + (x*4-4);

					var offsetPrev = offsetYPrev + ((x == 1) ? 0 : x-2) * 4;
					var offsetNext = offsetYNext + ((x == w) ? x-1 : x) * 4;

					var minR, maxR, minG, maxG, minB, maxB;

					minR = maxR = data[offsetPrev];
					var r1 = data[offset-4], r2 = data[offset+4], r3 = data[offsetNext];
					if (r1 < minR) minR = r1;
					if (r2 < minR) minR = r2;
					if (r3 < minR) minR = r3;
					if (r1 > maxR) maxR = r1;
					if (r2 > maxR) maxR = r2;
					if (r3 > maxR) maxR = r3;

					minG = maxG = data[offsetPrev+1];
					var g1 = data[offset-3], g2 = data[offset+5], g3 = data[offsetNext+1];
					if (g1 < minG) minG = g1;
					if (g2 < minG) minG = g2;
					if (g3 < minG) minG = g3;
					if (g1 > maxG) maxG = g1;
					if (g2 > maxG) maxG = g2;
					if (g3 > maxG) maxG = g3;

					minB = maxB = data[offsetPrev+2];
					var b1 = data[offset-2], b2 = data[offset+6], b3 = data[offsetNext+2];
					if (b1 < minB) minB = b1;
					if (b2 < minB) minB = b2;
					if (b3 < minB) minB = b3;
					if (b1 > maxB) maxB = b1;
					if (b2 > maxB) maxB = b2;
					if (b3 > maxB) maxB = b3;

					if (data[offset] > maxR) {
						data[offset] = maxR;
					} else if (data[offset] < minR) {
						data[offset] = minR;
					}
					if (data[offset+1] > maxG) {
						data[offset+1] = maxG;
					} else if (data[offset+1] < minG) {
						data[offset+1] = minG;
					}
					if (data[offset+2] > maxB) {
						data[offset+2] = maxB;
					} else if (data[offset+2] < minB) {
						data[offset+2] = minB;
					}

				} while (--x);
			} while (--y);

			return true;
		}
	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvasImageData();
	}
}/*
 * Pixastic Lib - Resize - v0.1.0
 * Copyright (c) 2009 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.resize = {
	process : function(params) {
		if (Pixastic.Client.hasCanvas()) {
			var width = parseInt(params.options.width,10);
			var height = parseInt(params.options.height,10);
			var canvas = params.canvas;

			if (width < 1) width = 1;
			if (width < 2) width = 2;

			var copy = document.createElement("canvas");
			copy.width = width;
			copy.height = height;

			copy.getContext("2d").drawImage(canvas,0,0,width,height);
			canvas.width = width;
			canvas.height = height;

			canvas.getContext("2d").drawImage(copy,0,0);

			params.useData = false;
			return true;
		}
	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvas();
	}
}


/*
 * Pixastic Lib - Rotate - v0.1.0
 * Copyright (c) 2009 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.rotate = {
	process : function(params) {
		if (Pixastic.Client.hasCanvas()) {
			var canvas = params.canvas;

			var width = params.width;
			var height = params.height;

			var copy = document.createElement("canvas");
			copy.width = width;
			copy.height = height;
			copy.getContext("2d").drawImage(canvas,0,0,width,height);

			var angle = -parseFloat(params.options.angle) * Math.PI / 180;

			var dimAngle = angle;
			if (dimAngle > Math.PI*0.5)
				dimAngle = Math.PI - dimAngle;
			if (dimAngle < -Math.PI*0.5)
				dimAngle = -Math.PI - dimAngle;

			var diag = Math.sqrt(width*width + height*height);

			var diagAngle1 = Math.abs(dimAngle) - Math.abs(Math.atan2(height, width));
			var diagAngle2 = Math.abs(dimAngle) + Math.abs(Math.atan2(height, width));

			var newWidth = Math.abs(Math.cos(diagAngle1) * diag);
			var newHeight = Math.abs(Math.sin(diagAngle2) * diag);

			canvas.width = newWidth;
			canvas.height = newHeight;

			var ctx = canvas.getContext("2d");
			ctx.translate(newWidth/2, newHeight/2);
			ctx.rotate(angle);
			ctx.drawImage(copy,-width/2,-height/2);

			params.useData = false;
			return true;
		}
	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvas();
	}
}


/*
 * Pixastic Lib - Sepia filter - v0.1.0
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.sepia = {

	process : function(params) {
		var mode = (parseInt(params.options.mode,10)||0);
		if (mode < 0) mode = 0;
		if (mode > 1) mode = 1;

		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);
			var rect = params.options.rect;
			var w = rect.width;
			var h = rect.height;
			var w4 = w*4;
			var y = h;
			do {
				var offsetY = (y-1)*w4;
				var x = w;
				do {
					var offset = offsetY + (x-1)*4;

					if (mode) {
						// a bit faster, but not as good
						var d = data[offset] * 0.299 + data[offset+1] * 0.587 + data[offset+2] * 0.114;
						var r = (d + 39);
						var g = (d + 14);
						var b = (d - 36);
					} else {
						// Microsoft
						var or = data[offset];
						var og = data[offset+1];
						var ob = data[offset+2];
	
						var r = (or * 0.393 + og * 0.769 + ob * 0.189);
						var g = (or * 0.349 + og * 0.686 + ob * 0.168);
						var b = (or * 0.272 + og * 0.534 + ob * 0.131);
					}

					if (r < 0) r = 0; if (r > 255) r = 255;
					if (g < 0) g = 0; if (g > 255) g = 255;
					if (b < 0) b = 0; if (b > 255) b = 255;

					data[offset] = r;
					data[offset+1] = g;
					data[offset+2] = b;

				} while (--x);
			} while (--y);
			return true;
		}
	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvasImageData();
	}
}/*
 * Pixastic Lib - Sharpen filter - v0.1.0
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.sharpen = {
	process : function(params) {

		var strength = 0;
		if (typeof params.options.amount != "undefined")
			strength = parseFloat(params.options.amount)||0;

		if (strength < 0) strength = 0;
		if (strength > 1) strength = 1;

		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);
			var dataCopy = Pixastic.prepareData(params, true)

			var mul = 15;
			var mulOther = 1 + 3*strength;

			var kernel = [
				[0, 	-mulOther, 	0],
				[-mulOther, 	mul, 	-mulOther],
				[0, 	-mulOther, 	0]
			];

			var weight = 0;
			for (var i=0;i<3;i++) {
				for (var j=0;j<3;j++) {
					weight += kernel[i][j];
				}
			}

			weight = 1 / weight;

			var rect = params.options.rect;
			var w = rect.width;
			var h = rect.height;

			mul *= weight;
			mulOther *= weight;

			var w4 = w*4;
			var y = h;
			do {
				var offsetY = (y-1)*w4;

				var nextY = (y == h) ? y - 1 : y;
				var prevY = (y == 1) ? 0 : y-2;

				var offsetYPrev = prevY*w4;
				var offsetYNext = nextY*w4;

				var x = w;
				do {
					var offset = offsetY + (x*4-4);

					var offsetPrev = offsetYPrev + ((x == 1) ? 0 : x-2) * 4;
					var offsetNext = offsetYNext + ((x == w) ? x-1 : x) * 4;

					var r = ((
						- dataCopy[offsetPrev]
						- dataCopy[offset-4]
						- dataCopy[offset+4]
						- dataCopy[offsetNext])		* mulOther
						+ dataCopy[offset] 	* mul
						);

					var g = ((
						- dataCopy[offsetPrev+1]
						- dataCopy[offset-3]
						- dataCopy[offset+5]
						- dataCopy[offsetNext+1])	* mulOther
						+ dataCopy[offset+1] 	* mul
						);

					var b = ((
						- dataCopy[offsetPrev+2]
						- dataCopy[offset-2]
						- dataCopy[offset+6]
						- dataCopy[offsetNext+2])	* mulOther
						+ dataCopy[offset+2] 	* mul
						);


					if (r < 0 ) r = 0;
					if (g < 0 ) g = 0;
					if (b < 0 ) b = 0;
					if (r > 255 ) r = 255;
					if (g > 255 ) g = 255;
					if (b > 255 ) b = 255;

					data[offset] = r;
					data[offset+1] = g;
					data[offset+2] = b;

				} while (--x);
			} while (--y);

			return true;

		}
	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvasImageData();
	}
}
/*
 * Pixastic Lib - Solarize filter - v0.1.0
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */

Pixastic.Actions.solarize = {

	process : function(params) {
		var useAverage = !!(params.options.average && params.options.average != "false");

		if (Pixastic.Client.hasCanvasImageData()) {
			var data = Pixastic.prepareData(params);
			var rect = params.options.rect;
			var w = rect.width;
			var h = rect.height;
			var w4 = w*4;
			var y = h;
			do {
				var offsetY = (y-1)*w4;
				var x = w;
				do {
					var offset = offsetY + (x-1)*4;

					var r = data[offset];
					var g = data[offset+1];
					var b = data[offset+2];

					if (r > 127) r = 255 - r;
					if (g > 127) g = 255 - g;
					if (b > 127) b = 255 - b;

					data[offset] = r;
					data[offset+1] = g;
					data[offset+2] = b;

				} while (--x);
			} while (--y);
			return true;
		}
	},
	checkSupport : function() {
		return (Pixastic.Client.hasCanvasImageData());
	}
}/*
 * Pixastic Lib - USM - v0.1.0
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 */


Pixastic.Actions.unsharpmask = {
	process : function(params) {

		var amount = (parseFloat(params.options.amount)||0);
		var blurAmount = parseFloat(params.options.radius)||0;
		var threshold = parseFloat(params.options.threshold)||0;

		amount = Math.min(500,Math.max(0,amount)) / 2;
		blurAmount = Math.min(5,Math.max(0,blurAmount)) / 10;
		threshold = Math.min(255,Math.max(0,threshold));

		threshold--;
		var thresholdNeg = -threshold;

		amount *= 0.016;
		amount++;

		if (Pixastic.Client.hasCanvasImageData()) {
			var rect = params.options.rect;

			var blurCanvas = document.createElement("canvas");
			blurCanvas.width = params.width;
			blurCanvas.height = params.height;
			var blurCtx = blurCanvas.getContext("2d");
			blurCtx.drawImage(params.canvas,0,0);

			var scale = 2;
			var smallWidth = Math.round(params.width / scale);
			var smallHeight = Math.round(params.height / scale);

			var copy = document.createElement("canvas");
			copy.width = smallWidth;
			copy.height = smallHeight;

			var steps = Math.round(blurAmount * 20);

			var copyCtx = copy.getContext("2d");
			for (var i=0;i<steps;i++) {
				var scaledWidth = Math.max(1,Math.round(smallWidth - i));
				var scaledHeight = Math.max(1,Math.round(smallHeight - i));

				copyCtx.clearRect(0,0,smallWidth,smallHeight);

				copyCtx.drawImage(
					blurCanvas,
					0,0,params.width,params.height,
					0,0,scaledWidth,scaledHeight
				);
	
				blurCtx.clearRect(0,0,params.width,params.height);
	
				blurCtx.drawImage(
					copy,
					0,0,scaledWidth,scaledHeight,
					0,0,params.width,params.height
				);
			}

			var data = Pixastic.prepareData(params);
			var blurData = Pixastic.prepareData({canvas:blurCanvas,options:params.options});
			var w = rect.width;
			var h = rect.height;
			var w4 = w*4;
			var y = h;
			do {
				var offsetY = (y-1)*w4;
				var x = w;
				do {
					var offset = offsetY + (x*4-4);

					var difR = data[offset] - blurData[offset];
					if (difR > threshold || difR < thresholdNeg) {
						var blurR = blurData[offset];
						blurR = amount * difR + blurR;
						data[offset] = blurR > 255 ? 255 : (blurR < 0 ? 0 : blurR);
					}

					var difG = data[offset+1] - blurData[offset+1];
					if (difG > threshold || difG < thresholdNeg) {
						var blurG = blurData[offset+1];
						blurG = amount * difG + blurG;
						data[offset+1] = blurG > 255 ? 255 : (blurG < 0 ? 0 : blurG);
					}

					var difB = data[offset+2] - blurData[offset+2];
					if (difB > threshold || difB < thresholdNeg) {
						var blurB = blurData[offset+2];
						blurB = amount * difB + blurB;
						data[offset+2] = blurB > 255 ? 255 : (blurB < 0 ? 0 : blurB);
					}

				} while (--x);
			} while (--y);

			return true;
		}
	},
	checkSupport : function() {
		return Pixastic.Client.hasCanvasImageData();
	}
}




; browserify_shim__define__module__export__(typeof Pixastic != "undefined" ? Pixastic : window.Pixastic);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
//     Underscore.js 1.6.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.6.0';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return obj;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
    return obj;
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    any(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(predicate, context);
    each(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, function(value, index, list) {
      return !predicate.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, context);
    each(obj, function(value, index, list) {
      if (!(result = result && predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
    each(obj, function(value, index, list) {
      if (result || (result = predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    var result = -Infinity, lastComputed = -Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed > lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    var result = Infinity, lastComputed = Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed < lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Shuffle an array, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return value;
    return _.property(value);
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    iterator = lookupIterator(iterator);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iterator, context) {
      var result = {};
      iterator = lookupIterator(iterator);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    _.has(result, key) ? result[key].push(value) : result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Split an array into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(array, predicate) {
    var pass = [], fail = [];
    each(array, function(elem) {
      (predicate(elem) ? pass : fail).push(elem);
    });
    return [pass, fail];
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.contains(other, item);
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, 'length').concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error('bindAll must be passed function names');
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;
      if (last < wait) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function () {
      return value;
    };
  };

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    return function(obj) {
      if (obj === attrs) return true; //avoid comparing an object to itself.
      for (var key in attrs) {
        if (attrs[key] !== obj[key])
          return false;
      }
      return true;
    }
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() { return new Date().getTime(); };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}).call(this);

},{}],3:[function(require,module,exports){
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
},{"pixastic":1,"underscore":2}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYW5pZWxkZWxhbnkvRG9jdW1lbnRzL01pc2NlbGxhbmVvdXMvc3RhY2tlcmpzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGFuaWVsZGVsYW55L0RvY3VtZW50cy9NaXNjZWxsYW5lb3VzL3N0YWNrZXJqcy9saWIvcGl4YXN0aWMuYWxsLmpzIiwiL1VzZXJzL2RhbmllbGRlbGFueS9Eb2N1bWVudHMvTWlzY2VsbGFuZW91cy9zdGFja2VyanMvbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUvdW5kZXJzY29yZS5qcyIsIi9Vc2Vycy9kYW5pZWxkZWxhbnkvRG9jdW1lbnRzL01pc2NlbGxhbmVvdXMvc3RhY2tlcmpzL3NyYy9zY3JpcHRzL3BpeC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy96Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG47X19icm93c2VyaWZ5X3NoaW1fcmVxdWlyZV9fPXJlcXVpcmU7KGZ1bmN0aW9uIGJyb3dzZXJpZnlTaGltKG1vZHVsZSwgZXhwb3J0cywgcmVxdWlyZSwgZGVmaW5lLCBicm93c2VyaWZ5X3NoaW1fX2RlZmluZV9fbW9kdWxlX19leHBvcnRfXykge1xuLypcbiAqIFBpeGFzdGljIExpYiAtIENvcmUgRnVuY3Rpb25zIC0gdjAuMS4zXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDggSmFjb2IgU2VpZGVsaW4sIGpzZWlkZWxpbkBuaWhpbG9naWMuZGssIGh0dHA6Ly9ibG9nLm5paGlsb2dpYy5kay9cbiAqIExpY2Vuc2U6IFtodHRwOi8vd3d3LnBpeGFzdGljLmNvbS9saWIvbGljZW5zZS50eHRdXG4gKi9cblxudmFyIFBpeGFzdGljID0gKGZ1bmN0aW9uKCkge1xuXG5cblx0ZnVuY3Rpb24gYWRkRXZlbnQoZWwsIGV2ZW50LCBoYW5kbGVyKSB7XG5cdFx0aWYgKGVsLmFkZEV2ZW50TGlzdGVuZXIpXG5cdFx0XHRlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyLCBmYWxzZSk7IFxuXHRcdGVsc2UgaWYgKGVsLmF0dGFjaEV2ZW50KVxuXHRcdFx0ZWwuYXR0YWNoRXZlbnQoXCJvblwiICsgZXZlbnQsIGhhbmRsZXIpOyBcblx0fVxuXG5cdGZ1bmN0aW9uIG9ucmVhZHkoaGFuZGxlcikge1xuXHRcdHZhciBoYW5kbGVyRG9uZSA9IGZhbHNlO1xuXHRcdHZhciBleGVjSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKCFoYW5kbGVyRG9uZSkge1xuXHRcdFx0XHRoYW5kbGVyRG9uZSA9IHRydWU7XG5cdFx0XHRcdGhhbmRsZXIoKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZG9jdW1lbnQud3JpdGUoXCI8XCIrXCJzY3JpcHQgZGVmZXIgc3JjPVxcXCIvLzpcXFwiIGlkPVxcXCJfX29ubG9hZF9pZV9waXhhc3RpY19fXFxcIj48L1wiK1wic2NyaXB0PlwiKTtcblx0XHR2YXIgc2NyaXB0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJfX29ubG9hZF9pZV9waXhhc3RpY19fXCIpO1xuXHRcdHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcblx0XHRcdGlmIChzY3JpcHQucmVhZHlTdGF0ZSA9PSBcImNvbXBsZXRlXCIpIHtcblx0XHRcdFx0c2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcblx0XHRcdFx0ZXhlY0hhbmRsZXIoKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIpXG5cdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBleGVjSGFuZGxlciwgZmFsc2UpOyBcblx0XHRhZGRFdmVudCh3aW5kb3csIFwibG9hZFwiLCBleGVjSGFuZGxlcik7XG5cdH1cblxuXHRmdW5jdGlvbiBpbml0KCkge1xuXHRcdHZhciBpbWdFbHMgPSBnZXRFbGVtZW50c0J5Q2xhc3MoXCJwaXhhc3RpY1wiLCBudWxsLCBcImltZ1wiKTtcblx0XHR2YXIgY2FudmFzRWxzID0gZ2V0RWxlbWVudHNCeUNsYXNzKFwicGl4YXN0aWNcIiwgbnVsbCwgXCJjYW52YXNcIik7XG5cdFx0dmFyIGVsZW1lbnRzID0gaW1nRWxzLmNvbmNhdChjYW52YXNFbHMpO1xuXHRcdGZvciAodmFyIGk9MDtpPGVsZW1lbnRzLmxlbmd0aDtpKyspIHtcblx0XHRcdChmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIGVsID0gZWxlbWVudHNbaV07XG5cdFx0XHR2YXIgYWN0aW9ucyA9IFtdO1xuXHRcdFx0dmFyIGNsYXNzZXMgPSBlbC5jbGFzc05hbWUuc3BsaXQoXCIgXCIpO1xuXHRcdFx0Zm9yICh2YXIgYz0wO2M8Y2xhc3Nlcy5sZW5ndGg7YysrKSB7XG5cdFx0XHRcdHZhciBjbHMgPSBjbGFzc2VzW2NdO1xuXHRcdFx0XHRpZiAoY2xzLnN1YnN0cmluZygwLDkpID09IFwicGl4YXN0aWMtXCIpIHtcblx0XHRcdFx0XHR2YXIgYWN0aW9uTmFtZSA9IGNscy5zdWJzdHJpbmcoOSk7XG5cdFx0XHRcdFx0aWYgKGFjdGlvbk5hbWUgIT0gXCJcIilcblx0XHRcdFx0XHRcdGFjdGlvbnMucHVzaChhY3Rpb25OYW1lKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGFjdGlvbnMubGVuZ3RoKSB7XG5cdFx0XHRcdGlmIChlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT0gXCJpbWdcIikge1xuXHRcdFx0XHRcdHZhciBkYXRhSW1nID0gbmV3IEltYWdlKCk7XG5cdFx0XHRcdFx0ZGF0YUltZy5zcmMgPSBlbC5zcmM7XG5cdFx0XHRcdFx0aWYgKGRhdGFJbWcuY29tcGxldGUpIHtcblx0XHRcdFx0XHRcdGZvciAodmFyIGE9MDthPGFjdGlvbnMubGVuZ3RoO2ErKykge1xuXHRcdFx0XHRcdFx0XHR2YXIgcmVzID0gUGl4YXN0aWMuYXBwbHlBY3Rpb24oZWwsIGVsLCBhY3Rpb25zW2FdLCBudWxsKTtcblx0XHRcdFx0XHRcdFx0aWYgKHJlcykgXG5cdFx0XHRcdFx0XHRcdFx0ZWwgPSByZXM7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGRhdGFJbWcub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdGZvciAodmFyIGE9MDthPGFjdGlvbnMubGVuZ3RoO2ErKykge1xuXHRcdFx0XHRcdFx0XHRcdHZhciByZXMgPSBQaXhhc3RpYy5hcHBseUFjdGlvbihlbCwgZWwsIGFjdGlvbnNbYV0sIG51bGwpXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHJlcykgXG5cdFx0XHRcdFx0XHRcdFx0XHRlbCA9IHJlcztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0Zm9yICh2YXIgYT0wO2E8YWN0aW9ucy5sZW5ndGg7YSsrKSB7XG5cdFx0XHRcdFx0XHRcdHZhciByZXMgPSBQaXhhc3RpYy5hcHBseUFjdGlvbihcblx0XHRcdFx0XHRcdFx0XHRlbCwgZWwsIGFjdGlvbnNbYV0sIG51bGxcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0aWYgKHJlcykgXG5cdFx0XHRcdFx0XHRcdFx0ZWwgPSByZXM7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSwxKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHR9KSgpO1xuXHRcdH1cblx0fVxuXG5cdGlmICh0eXBlb2YgcGl4YXN0aWNfcGFyc2VvbmxvYWQgIT0gXCJ1bmRlZmluZWRcIiAmJiBwaXhhc3RpY19wYXJzZW9ubG9hZClcblx0XHRvbnJlYWR5KGluaXQpO1xuXG5cdC8vIGdldEVsZW1lbnRzQnlDbGFzcyBieSBEdXN0aW4gRGlheiwgaHR0cDovL3d3dy5kdXN0aW5kaWF6LmNvbS9nZXRlbGVtZW50c2J5Y2xhc3MvXG5cdGZ1bmN0aW9uIGdldEVsZW1lbnRzQnlDbGFzcyhzZWFyY2hDbGFzcyxub2RlLHRhZykge1xuXHQgICAgICAgIHZhciBjbGFzc0VsZW1lbnRzID0gbmV3IEFycmF5KCk7XG5cdCAgICAgICAgaWYgKCBub2RlID09IG51bGwgKVxuXHQgICAgICAgICAgICAgICAgbm9kZSA9IGRvY3VtZW50O1xuXHQgICAgICAgIGlmICggdGFnID09IG51bGwgKVxuXHQgICAgICAgICAgICAgICAgdGFnID0gJyonO1xuXG5cdCAgICAgICAgdmFyIGVscyA9IG5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUodGFnKTtcblx0ICAgICAgICB2YXIgZWxzTGVuID0gZWxzLmxlbmd0aDtcblx0ICAgICAgICB2YXIgcGF0dGVybiA9IG5ldyBSZWdFeHAoXCIoXnxcXFxccylcIitzZWFyY2hDbGFzcytcIihcXFxcc3wkKVwiKTtcblx0ICAgICAgICBmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGVsc0xlbjsgaSsrKSB7XG5cdCAgICAgICAgICAgICAgICBpZiAoIHBhdHRlcm4udGVzdChlbHNbaV0uY2xhc3NOYW1lKSApIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NFbGVtZW50c1tqXSA9IGVsc1tpXTtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgaisrO1xuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgIH1cblx0ICAgICAgICByZXR1cm4gY2xhc3NFbGVtZW50cztcblx0fVxuXG5cdHZhciBkZWJ1Z0VsZW1lbnQ7XG5cblx0ZnVuY3Rpb24gd3JpdGVEZWJ1Zyh0ZXh0LCBsZXZlbCkge1xuXHRcdGlmICghUGl4YXN0aWMuZGVidWcpIHJldHVybjtcblx0XHR0cnkge1xuXHRcdFx0c3dpdGNoIChsZXZlbCkge1xuXHRcdFx0XHRjYXNlIFwid2FyblwiIDogXG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKFwiUGl4YXN0aWM6XCIsIHRleHQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiZXJyb3JcIiA6XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcihcIlBpeGFzdGljOlwiLCB0ZXh0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcIlBpeGFzdGljOlwiLCB0ZXh0KTtcblx0XHRcdH1cblx0XHR9IGNhdGNoKGUpIHtcblx0XHR9XG5cdFx0aWYgKCFkZWJ1Z0VsZW1lbnQpIHtcblx0XHRcdFxuXHRcdH1cblx0fVxuXG5cdC8vIGNhbnZhcyBjYXBhYmlsaXR5IGNoZWNrc1xuXG5cdHZhciBoYXNDYW52YXMgPSAoZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuXHRcdHZhciB2YWwgPSBmYWxzZTtcblx0XHR0cnkge1xuXHRcdFx0dmFsID0gISEoKHR5cGVvZiBjLmdldENvbnRleHQgPT0gXCJmdW5jdGlvblwiKSAmJiBjLmdldENvbnRleHQoXCIyZFwiKSk7XG5cdFx0fSBjYXRjaChlKSB7fVxuXHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB2YWw7XG5cdFx0fVxuXHR9KSgpO1xuXG5cdHZhciBoYXNDYW52YXNJbWFnZURhdGEgPSAoZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuXHRcdHZhciB2YWwgPSBmYWxzZTtcblx0XHR2YXIgY3R4O1xuXHRcdHRyeSB7XG5cdFx0XHRpZiAodHlwZW9mIGMuZ2V0Q29udGV4dCA9PSBcImZ1bmN0aW9uXCIgJiYgKGN0eCA9IGMuZ2V0Q29udGV4dChcIjJkXCIpKSkge1xuXHRcdFx0XHR2YWwgPSAodHlwZW9mIGN0eC5nZXRJbWFnZURhdGEgPT0gXCJmdW5jdGlvblwiKTtcblx0XHRcdH1cblx0XHR9IGNhdGNoKGUpIHt9XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHZhbDtcblx0XHR9XG5cdH0pKCk7XG5cblx0dmFyIGhhc0dsb2JhbEFscGhhID0gKGZ1bmN0aW9uKCkge1xuXHRcdHZhciBoYXNBbHBoYSA9IGZhbHNlO1xuXHRcdHZhciByZWQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuXHRcdGlmIChoYXNDYW52YXMoKSAmJiBoYXNDYW52YXNJbWFnZURhdGEoKSkge1xuXHRcdFx0cmVkLndpZHRoID0gcmVkLmhlaWdodCA9IDE7XG5cdFx0XHR2YXIgcmVkY3R4ID0gcmVkLmdldENvbnRleHQoXCIyZFwiKTtcblx0XHRcdHJlZGN0eC5maWxsU3R5bGUgPSBcInJnYigyNTUsMCwwKVwiO1xuXHRcdFx0cmVkY3R4LmZpbGxSZWN0KDAsMCwxLDEpO1xuXHRcblx0XHRcdHZhciBibHVlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcblx0XHRcdGJsdWUud2lkdGggPSBibHVlLmhlaWdodCA9IDE7XG5cdFx0XHR2YXIgYmx1ZWN0eCA9IGJsdWUuZ2V0Q29udGV4dChcIjJkXCIpO1xuXHRcdFx0Ymx1ZWN0eC5maWxsU3R5bGUgPSBcInJnYigwLDAsMjU1KVwiO1xuXHRcdFx0Ymx1ZWN0eC5maWxsUmVjdCgwLDAsMSwxKTtcblx0XG5cdFx0XHRyZWRjdHguZ2xvYmFsQWxwaGEgPSAwLjU7XG5cdFx0XHRyZWRjdHguZHJhd0ltYWdlKGJsdWUsIDAsIDApO1xuXHRcdFx0dmFyIHJlZGRhdGEgPSByZWRjdHguZ2V0SW1hZ2VEYXRhKDAsMCwxLDEpLmRhdGE7XG5cdFxuXHRcdFx0aGFzQWxwaGEgPSAocmVkZGF0YVsyXSAhPSAyNTUpO1xuXHRcdH1cblx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gaGFzQWxwaGE7XG5cdFx0fVxuXHR9KSgpO1xuXG5cblx0Ly8gcmV0dXJuIHB1YmxpYyBpbnRlcmZhY2VcblxuXHRyZXR1cm4ge1xuXG5cdFx0cGFyc2VPbkxvYWQgOiBmYWxzZSxcblxuXHRcdGRlYnVnIDogZmFsc2UsXG5cdFx0XG5cdFx0YXBwbHlBY3Rpb24gOiBmdW5jdGlvbihpbWcsIGRhdGFJbWcsIGFjdGlvbk5hbWUsIG9wdGlvbnMpIHtcblxuXHRcdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0XHRcdHZhciBpbWFnZUlzQ2FudmFzID0gKGltZy50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT0gXCJjYW52YXNcIik7XG5cdFx0XHRpZiAoaW1hZ2VJc0NhbnZhcyAmJiBQaXhhc3RpYy5DbGllbnQuaXNJRSgpKSB7XG5cdFx0XHRcdGlmIChQaXhhc3RpYy5kZWJ1Zykgd3JpdGVEZWJ1ZyhcIlRyaWVkIHRvIHByb2Nlc3MgYSBjYW52YXMgZWxlbWVudCBidXQgYnJvd3NlciBpcyBJRS5cIik7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGNhbnZhcywgY3R4O1xuXHRcdFx0dmFyIGhhc091dHB1dENhbnZhcyA9IGZhbHNlO1xuXHRcdFx0aWYgKFBpeGFzdGljLkNsaWVudC5oYXNDYW52YXMoKSkge1xuXHRcdFx0XHRoYXNPdXRwdXRDYW52YXMgPSAhIW9wdGlvbnMucmVzdWx0Q2FudmFzO1xuXHRcdFx0XHRjYW52YXMgPSBvcHRpb25zLnJlc3VsdENhbnZhcyB8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuXHRcdFx0XHRjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgdyA9IGltZy5vZmZzZXRXaWR0aDtcblx0XHRcdHZhciBoID0gaW1nLm9mZnNldEhlaWdodDtcblxuXHRcdFx0aWYgKGltYWdlSXNDYW52YXMpIHtcblx0XHRcdFx0dyA9IGltZy53aWR0aDtcblx0XHRcdFx0aCA9IGltZy5oZWlnaHQ7XG5cdFx0XHR9XG5cblx0XHRcdC8vIG9mZnNldFdpZHRoL0hlaWdodCBtaWdodCBiZSAwIGlmIHRoZSBpbWFnZSBpcyBub3QgaW4gdGhlIGRvY3VtZW50XG5cdFx0XHRpZiAodyA9PSAwIHx8IGggPT0gMCkge1xuXHRcdFx0XHRpZiAoaW1nLnBhcmVudE5vZGUgPT0gbnVsbCkge1xuXHRcdFx0XHRcdC8vIGFkZCB0aGUgaW1hZ2UgdG8gdGhlIGRvYyAod2F5IG91dCBsZWZ0KSwgcmVhZCBpdHMgZGltZW5zaW9ucyBhbmQgcmVtb3ZlIGl0IGFnYWluXG5cdFx0XHRcdFx0dmFyIG9sZHBvcyA9IGltZy5zdHlsZS5wb3NpdGlvbjtcblx0XHRcdFx0XHR2YXIgb2xkbGVmdCA9IGltZy5zdHlsZS5sZWZ0O1xuXHRcdFx0XHRcdGltZy5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcblx0XHRcdFx0XHRpbWcuc3R5bGUubGVmdCA9IFwiLTk5OTlweFwiO1xuXHRcdFx0XHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaW1nKTtcblx0XHRcdFx0XHR3ID0gaW1nLm9mZnNldFdpZHRoO1xuXHRcdFx0XHRcdGggPSBpbWcub2Zmc2V0SGVpZ2h0O1xuXHRcdFx0XHRcdGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoaW1nKTtcblx0XHRcdFx0XHRpbWcuc3R5bGUucG9zaXRpb24gPSBvbGRwb3M7XG5cdFx0XHRcdFx0aW1nLnN0eWxlLmxlZnQgPSBvbGRsZWZ0O1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGlmIChQaXhhc3RpYy5kZWJ1Zykgd3JpdGVEZWJ1ZyhcIkltYWdlIGhhcyAwIHdpZHRoIGFuZC9vciBoZWlnaHQuXCIpO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYWN0aW9uTmFtZS5pbmRleE9mKFwiKFwiKSA+IC0xKSB7XG5cdFx0XHRcdHZhciB0bXAgPSBhY3Rpb25OYW1lO1xuXHRcdFx0XHRhY3Rpb25OYW1lID0gdG1wLnN1YnN0cigwLCB0bXAuaW5kZXhPZihcIihcIikpO1xuXHRcdFx0XHR2YXIgYXJnID0gdG1wLm1hdGNoKC9cXCgoLio/KVxcKS8pO1xuXHRcdFx0XHRpZiAoYXJnWzFdKSB7XG5cdFx0XHRcdFx0YXJnID0gYXJnWzFdLnNwbGl0KFwiO1wiKTtcblx0XHRcdFx0XHRmb3IgKHZhciBhPTA7YTxhcmcubGVuZ3RoO2ErKykge1xuXHRcdFx0XHRcdFx0dGhpc0FyZyA9IGFyZ1thXS5zcGxpdChcIj1cIik7XG5cdFx0XHRcdFx0XHRpZiAodGhpc0FyZy5sZW5ndGggPT0gMikge1xuXHRcdFx0XHRcdFx0XHRpZiAodGhpc0FyZ1swXSA9PSBcInJlY3RcIikge1xuXHRcdFx0XHRcdFx0XHRcdHZhciByZWN0VmFsID0gdGhpc0FyZ1sxXS5zcGxpdChcIixcIik7XG5cdFx0XHRcdFx0XHRcdFx0b3B0aW9uc1t0aGlzQXJnWzBdXSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdGxlZnQgOiBwYXJzZUludChyZWN0VmFsWzBdLDEwKXx8MCxcblx0XHRcdFx0XHRcdFx0XHRcdHRvcCA6IHBhcnNlSW50KHJlY3RWYWxbMV0sMTApfHwwLFxuXHRcdFx0XHRcdFx0XHRcdFx0d2lkdGggOiBwYXJzZUludChyZWN0VmFsWzJdLDEwKXx8MCxcblx0XHRcdFx0XHRcdFx0XHRcdGhlaWdodCA6IHBhcnNlSW50KHJlY3RWYWxbM10sMTApfHwwXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdG9wdGlvbnNbdGhpc0FyZ1swXV0gPSB0aGlzQXJnWzFdO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICghb3B0aW9ucy5yZWN0KSB7XG5cdFx0XHRcdG9wdGlvbnMucmVjdCA9IHtcblx0XHRcdFx0XHRsZWZ0IDogMCwgdG9wIDogMCwgd2lkdGggOiB3LCBoZWlnaHQgOiBoXG5cdFx0XHRcdH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvcHRpb25zLnJlY3QubGVmdCA9IE1hdGgucm91bmQob3B0aW9ucy5yZWN0LmxlZnQpO1xuXHRcdFx0XHRvcHRpb25zLnJlY3QudG9wID0gTWF0aC5yb3VuZChvcHRpb25zLnJlY3QudG9wKTtcblx0XHRcdFx0b3B0aW9ucy5yZWN0LndpZHRoID0gTWF0aC5yb3VuZChvcHRpb25zLnJlY3Qud2lkdGgpO1xuXHRcdFx0XHRvcHRpb25zLnJlY3QuaGVpZ2h0ID0gTWF0aC5yb3VuZChvcHRpb25zLnJlY3QuaGVpZ2h0KTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHZhbGlkQWN0aW9uID0gZmFsc2U7XG5cdFx0XHRpZiAoUGl4YXN0aWMuQWN0aW9uc1thY3Rpb25OYW1lXSAmJiB0eXBlb2YgUGl4YXN0aWMuQWN0aW9uc1thY3Rpb25OYW1lXS5wcm9jZXNzID09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHR2YWxpZEFjdGlvbiA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIXZhbGlkQWN0aW9uKSB7XG5cdFx0XHRcdGlmIChQaXhhc3RpYy5kZWJ1Zykgd3JpdGVEZWJ1ZyhcIkludmFsaWQgYWN0aW9uIFxcXCJcIiArIGFjdGlvbk5hbWUgKyBcIlxcXCIuIE1heWJlIGZpbGUgbm90IGluY2x1ZGVkP1wiKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCFQaXhhc3RpYy5BY3Rpb25zW2FjdGlvbk5hbWVdLmNoZWNrU3VwcG9ydCgpKSB7XG5cdFx0XHRcdGlmIChQaXhhc3RpYy5kZWJ1Zykgd3JpdGVEZWJ1ZyhcIkFjdGlvbiBcXFwiXCIgKyBhY3Rpb25OYW1lICsgXCJcXFwiIG5vdCBzdXBwb3J0ZWQgYnkgdGhpcyBicm93c2VyLlwiKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoUGl4YXN0aWMuQ2xpZW50Lmhhc0NhbnZhcygpKSB7XG5cdFx0XHRcdGlmIChjYW52YXMgIT09IGltZykge1xuXHRcdFx0XHRcdGNhbnZhcy53aWR0aCA9IHc7XG5cdFx0XHRcdFx0Y2FudmFzLmhlaWdodCA9IGg7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCFoYXNPdXRwdXRDYW52YXMpIHtcblx0XHRcdFx0XHRjYW52YXMuc3R5bGUud2lkdGggPSB3K1wicHhcIjtcblx0XHRcdFx0XHRjYW52YXMuc3R5bGUuaGVpZ2h0ID0gaCtcInB4XCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y3R4LmRyYXdJbWFnZShkYXRhSW1nLDAsMCx3LGgpO1xuXG5cdFx0XHRcdGlmICghaW1nLl9fcGl4YXN0aWNfb3JnX2ltYWdlKSB7XG5cdFx0XHRcdFx0Y2FudmFzLl9fcGl4YXN0aWNfb3JnX2ltYWdlID0gaW1nO1xuXHRcdFx0XHRcdGNhbnZhcy5fX3BpeGFzdGljX29yZ193aWR0aCA9IHc7XG5cdFx0XHRcdFx0Y2FudmFzLl9fcGl4YXN0aWNfb3JnX2hlaWdodCA9IGg7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y2FudmFzLl9fcGl4YXN0aWNfb3JnX2ltYWdlID0gaW1nLl9fcGl4YXN0aWNfb3JnX2ltYWdlO1xuXHRcdFx0XHRcdGNhbnZhcy5fX3BpeGFzdGljX29yZ193aWR0aCA9IGltZy5fX3BpeGFzdGljX29yZ193aWR0aDtcblx0XHRcdFx0XHRjYW52YXMuX19waXhhc3RpY19vcmdfaGVpZ2h0ID0gaW1nLl9fcGl4YXN0aWNfb3JnX2hlaWdodDtcblx0XHRcdFx0fVxuXG5cdFx0XHR9IGVsc2UgaWYgKFBpeGFzdGljLkNsaWVudC5pc0lFKCkgJiYgdHlwZW9mIGltZy5fX3BpeGFzdGljX29yZ19zdHlsZSA9PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRcdGltZy5fX3BpeGFzdGljX29yZ19zdHlsZSA9IGltZy5zdHlsZS5jc3NUZXh0O1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcGFyYW1zID0ge1xuXHRcdFx0XHRpbWFnZSA6IGltZyxcblx0XHRcdFx0Y2FudmFzIDogY2FudmFzLFxuXHRcdFx0XHR3aWR0aCA6IHcsXG5cdFx0XHRcdGhlaWdodCA6IGgsXG5cdFx0XHRcdHVzZURhdGEgOiB0cnVlLFxuXHRcdFx0XHRvcHRpb25zIDogb3B0aW9uc1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBPaywgbGV0J3MgZG8gaXQhXG5cblx0XHRcdHZhciByZXMgPSBQaXhhc3RpYy5BY3Rpb25zW2FjdGlvbk5hbWVdLnByb2Nlc3MocGFyYW1zKTtcblxuXHRcdFx0aWYgKCFyZXMpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoUGl4YXN0aWMuQ2xpZW50Lmhhc0NhbnZhcygpKSB7XG5cdFx0XHRcdGlmIChwYXJhbXMudXNlRGF0YSkge1xuXHRcdFx0XHRcdGlmIChQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzSW1hZ2VEYXRhKCkpIHtcblx0XHRcdFx0XHRcdGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIikucHV0SW1hZ2VEYXRhKHBhcmFtcy5jYW52YXNEYXRhLCBvcHRpb25zLnJlY3QubGVmdCwgb3B0aW9ucy5yZWN0LnRvcCk7XG5cblx0XHRcdFx0XHRcdC8vIE9wZXJhIGRvZXNuJ3Qgc2VlbSB0byB1cGRhdGUgdGhlIGNhbnZhcyB1bnRpbCB3ZSBkcmF3IHNvbWV0aGluZyBvbiBpdCwgbGV0cyBkcmF3IGEgMHgwIHJlY3RhbmdsZS5cblx0XHRcdFx0XHRcdC8vIElzIHRoaXMgc3RpbGwgc28/XG5cdFx0XHRcdFx0XHRjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpLmZpbGxSZWN0KDAsMCwwLDApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICghb3B0aW9ucy5sZWF2ZURPTSkge1xuXHRcdFx0XHRcdC8vIGNvcHkgcHJvcGVydGllcyBhbmQgc3R1ZmYgZnJvbSB0aGUgc291cmNlIGltYWdlXG5cdFx0XHRcdFx0Y2FudmFzLnRpdGxlID0gaW1nLnRpdGxlO1xuXHRcdFx0XHRcdGNhbnZhcy5pbWdzcmMgPSBpbWcuaW1nc3JjO1xuXHRcdFx0XHRcdGlmICghaW1hZ2VJc0NhbnZhcykgY2FudmFzLmFsdCAgPSBpbWcuYWx0O1xuXHRcdFx0XHRcdGlmICghaW1hZ2VJc0NhbnZhcykgY2FudmFzLmltZ3NyYyA9IGltZy5zcmM7XG5cdFx0XHRcdFx0Y2FudmFzLmNsYXNzTmFtZSA9IGltZy5jbGFzc05hbWU7XG5cdFx0XHRcdFx0Y2FudmFzLnN0eWxlLmNzc1RleHQgPSBpbWcuc3R5bGUuY3NzVGV4dDtcblx0XHRcdFx0XHRjYW52YXMubmFtZSA9IGltZy5uYW1lO1xuXHRcdFx0XHRcdGNhbnZhcy50YWJJbmRleCA9IGltZy50YWJJbmRleDtcblx0XHRcdFx0XHRjYW52YXMuaWQgPSBpbWcuaWQ7XG5cdFx0XHRcdFx0aWYgKGltZy5wYXJlbnROb2RlICYmIGltZy5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZCkge1xuXHRcdFx0XHRcdFx0aW1nLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGNhbnZhcywgaW1nKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRvcHRpb25zLnJlc3VsdENhbnZhcyA9IGNhbnZhcztcblxuXHRcdFx0XHRyZXR1cm4gY2FudmFzO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gaW1nO1xuXHRcdH0sXG5cblx0XHRwcmVwYXJlRGF0YSA6IGZ1bmN0aW9uKHBhcmFtcywgZ2V0Q29weSkge1xuXHRcdFx0dmFyIGN0eCA9IHBhcmFtcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuXHRcdFx0dmFyIHJlY3QgPSBwYXJhbXMub3B0aW9ucy5yZWN0O1xuXHRcdFx0dmFyIGRhdGFEZXNjID0gY3R4LmdldEltYWdlRGF0YShyZWN0LmxlZnQsIHJlY3QudG9wLCByZWN0LndpZHRoLCByZWN0LmhlaWdodCk7XG5cdFx0XHR2YXIgZGF0YSA9IGRhdGFEZXNjLmRhdGE7XG5cdFx0XHRpZiAoIWdldENvcHkpIHBhcmFtcy5jYW52YXNEYXRhID0gZGF0YURlc2M7XG5cdFx0XHRyZXR1cm4gZGF0YTtcblx0XHR9LFxuXG5cdFx0Ly8gbG9hZCB0aGUgaW1hZ2UgZmlsZVxuXHRcdHByb2Nlc3MgOiBmdW5jdGlvbihpbWcsIGFjdGlvbk5hbWUsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG5cdFx0XHRpZiAoaW1nLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PSBcImltZ1wiKSB7XG5cdFx0XHRcdHZhciBkYXRhSW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICAgICAgZGF0YUltZy5jcm9zc09yaWdpbiA9IFwiYW5vbnltb3VzXCI7XG5cdFx0XHRcdGRhdGFJbWcuc3JjID0gaW1nLnNyYztcblxuXHRcdFx0XHRpZiAoZGF0YUltZy5jb21wbGV0ZSkge1xuXHRcdFx0XHRcdHZhciByZXMgPSBQaXhhc3RpYy5hcHBseUFjdGlvbihpbWcsIGRhdGFJbWcsIGFjdGlvbk5hbWUsIG9wdGlvbnMpO1xuXHRcdFx0XHRcdGlmIChjYWxsYmFjaykgY2FsbGJhY2socmVzKTtcblx0XHRcdFx0XHRyZXR1cm4gcmVzO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGRhdGFJbWcub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgcmVzID0gUGl4YXN0aWMuYXBwbHlBY3Rpb24oaW1nLCBkYXRhSW1nLCBhY3Rpb25OYW1lLCBvcHRpb25zKVxuXHRcdFx0XHRcdFx0aWYgKGNhbGxiYWNrKSBjYWxsYmFjayhyZXMpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGltZy50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT0gXCJjYW52YXNcIikge1xuXHRcdFx0XHR2YXIgcmVzID0gUGl4YXN0aWMuYXBwbHlBY3Rpb24oaW1nLCBpbWcsIGFjdGlvbk5hbWUsIG9wdGlvbnMpO1xuXHRcdFx0XHRpZiAoY2FsbGJhY2spIGNhbGxiYWNrKHJlcyk7XG5cdFx0XHRcdHJldHVybiByZXM7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdHJldmVydCA6IGZ1bmN0aW9uKGltZykge1xuXHRcdFx0aWYgKFBpeGFzdGljLkNsaWVudC5oYXNDYW52YXMoKSkge1xuXHRcdFx0XHRpZiAoaW1nLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PSBcImNhbnZhc1wiICYmIGltZy5fX3BpeGFzdGljX29yZ19pbWFnZSkge1xuXHRcdFx0XHRcdGltZy53aWR0aCA9IGltZy5fX3BpeGFzdGljX29yZ193aWR0aDtcblx0XHRcdFx0XHRpbWcuaGVpZ2h0ID0gaW1nLl9fcGl4YXN0aWNfb3JnX2hlaWdodDtcblx0XHRcdFx0XHRpbWcuZ2V0Q29udGV4dChcIjJkXCIpLmRyYXdJbWFnZShpbWcuX19waXhhc3RpY19vcmdfaW1hZ2UsIDAsIDApO1xuXG5cdFx0XHRcdFx0aWYgKGltZy5wYXJlbnROb2RlICYmIGltZy5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZCkge1xuXHRcdFx0XHRcdFx0aW1nLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGltZy5fX3BpeGFzdGljX29yZ19pbWFnZSwgaW1nKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gaW1nO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKFBpeGFzdGljLkNsaWVudC5pc0lFKCkpIHtcbiBcdFx0XHRcdGlmICh0eXBlb2YgaW1nLl9fcGl4YXN0aWNfb3JnX3N0eWxlICE9IFwidW5kZWZpbmVkXCIpXG5cdFx0XHRcdFx0aW1nLnN0eWxlLmNzc1RleHQgPSBpbWcuX19waXhhc3RpY19vcmdfc3R5bGU7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdENsaWVudCA6IHtcblx0XHRcdGhhc0NhbnZhcyA6IGhhc0NhbnZhcyxcblx0XHRcdGhhc0NhbnZhc0ltYWdlRGF0YSA6IGhhc0NhbnZhc0ltYWdlRGF0YSxcblx0XHRcdGhhc0dsb2JhbEFscGhhIDogaGFzR2xvYmFsQWxwaGEsXG5cdFx0XHRpc0lFIDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiAhIWRvY3VtZW50LmFsbCAmJiAhIXdpbmRvdy5hdHRhY2hFdmVudCAmJiAhd2luZG93Lm9wZXJhO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRBY3Rpb25zIDoge31cblx0fVxuXG5cbn0pKCk7XG4vKlxuICogUGl4YXN0aWMgTGliIC0gQmxlbmQgLSB2MC4xLjFcbiAqIENvcHlyaWdodCAoYykgMjAwOCBKYWNvYiBTZWlkZWxpbiwganNlaWRlbGluQG5paGlsb2dpYy5kaywgaHR0cDovL2Jsb2cubmloaWxvZ2ljLmRrL1xuICogTGljZW5zZTogW2h0dHA6Ly93d3cucGl4YXN0aWMuY29tL2xpYi9saWNlbnNlLnR4dF1cbiAqL1xuXG5QaXhhc3RpYy5BY3Rpb25zLmJsZW5kID0ge1xuXG5cdHByb2Nlc3MgOiBmdW5jdGlvbihwYXJhbXMpIHtcblx0XHR2YXIgYW1vdW50ID0gcGFyc2VGbG9hdChwYXJhbXMub3B0aW9ucy5hbW91bnQpO1xuXHRcdHZhciBtb2RlID0gKHBhcmFtcy5vcHRpb25zLm1vZGUgfHwgXCJub3JtYWxcIikudG9Mb3dlckNhc2UoKTtcblx0XHR2YXIgaW1hZ2UgPSBwYXJhbXMub3B0aW9ucy5pbWFnZTtcblxuXHRcdGFtb3VudCA9IE1hdGgubWF4KDAsTWF0aC5taW4oMSxhbW91bnQpKTtcblxuXHRcdGlmICghaW1hZ2UpIHJldHVybiBmYWxzZTtcblxuXHRcdGlmIChQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzSW1hZ2VEYXRhKCkpIHtcblxuXHRcdFx0dmFyIHJlY3QgPSBwYXJhbXMub3B0aW9ucy5yZWN0O1xuXHRcdFx0dmFyIGRhdGEgPSBQaXhhc3RpYy5wcmVwYXJlRGF0YShwYXJhbXMpO1xuXHRcdFx0dmFyIHcgPSByZWN0LndpZHRoO1xuXHRcdFx0dmFyIGggPSByZWN0LmhlaWdodDtcblxuXHRcdFx0cGFyYW1zLnVzZURhdGEgPSBmYWxzZTtcblxuXHRcdFx0dmFyIG90aGVyQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcblx0XHRcdG90aGVyQ2FudmFzLndpZHRoID0gcGFyYW1zLmNhbnZhcy53aWR0aDtcblx0XHRcdG90aGVyQ2FudmFzLmhlaWdodCA9IHBhcmFtcy5jYW52YXMuaGVpZ2h0O1xuXHRcdFx0dmFyIG90aGVyQ3R4ID0gb3RoZXJDYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuXHRcdFx0b3RoZXJDdHguZHJhd0ltYWdlKGltYWdlLDAsMCk7XG5cblx0XHRcdHZhciBwYXJhbXMyID0ge2NhbnZhczpvdGhlckNhbnZhcyxvcHRpb25zOnBhcmFtcy5vcHRpb25zfTtcblx0XHRcdHZhciBkYXRhMiA9IFBpeGFzdGljLnByZXBhcmVEYXRhKHBhcmFtczIpO1xuXHRcdFx0dmFyIGRhdGFEZXNjMiA9IHBhcmFtczIuY2FudmFzRGF0YTtcblxuXHRcdFx0dmFyIHAgPSB3Kmg7XG5cdFx0XHR2YXIgcGl4ID0gcCo0O1xuXHRcdFx0dmFyIHBpeDEsIHBpeDI7XG5cdFx0XHR2YXIgcjEsIGcxLCBiMTtcblx0XHRcdHZhciByMiwgZzIsIGIyO1xuXHRcdFx0dmFyIHIzLCBnMywgYjM7XG5cdFx0XHR2YXIgcjQsIGc0LCBiNDtcblxuXHRcdFx0dmFyIGRhdGFDaGFuZ2VkID0gZmFsc2U7XG5cblx0XHRcdHN3aXRjaCAobW9kZSkge1xuXHRcdFx0XHRjYXNlIFwibm9ybWFsXCIgOiBcblx0XHRcdFx0XHQvL3doaWxlIChwLS0pIHtcblx0XHRcdFx0XHQvL1x0ZGF0YTJbcGl4LT00XSA9IGRhdGEyW3BpeF07XG5cdFx0XHRcdFx0Ly9cdGRhdGEyW3BpeDE9cGl4KzFdID0gZGF0YTJbcGl4MV07XG5cdFx0XHRcdFx0Ly9cdGRhdGEyW3BpeDI9cGl4KzJdID0gZGF0YTJbcGl4Ml07XG5cdFx0XHRcdFx0Ly99XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBcIm11bHRpcGx5XCIgOiBcblx0XHRcdFx0XHR3aGlsZSAocC0tKSB7XG5cdFx0XHRcdFx0XHRkYXRhMltwaXgtPTRdID0gZGF0YVtwaXhdICogZGF0YTJbcGl4XSAvIDI1NTtcblx0XHRcdFx0XHRcdGRhdGEyW3BpeDE9cGl4KzFdID0gZGF0YVtwaXgxXSAqIGRhdGEyW3BpeDFdIC8gMjU1O1xuXHRcdFx0XHRcdFx0ZGF0YTJbcGl4Mj1waXgrMl0gPSBkYXRhW3BpeDJdICogZGF0YTJbcGl4Ml0gLyAyNTU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGRhdGFDaGFuZ2VkID0gdHJ1ZTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIFwibGlnaHRlblwiIDogXG5cdFx0XHRcdFx0d2hpbGUgKHAtLSkge1xuXHRcdFx0XHRcdFx0aWYgKChyMSA9IGRhdGFbcGl4LT00XSkgPiBkYXRhMltwaXhdKVxuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXhdID0gcjE7XG5cdFx0XHRcdFx0XHRpZiAoKGcxID0gZGF0YVtwaXgxPXBpeCsxXSkgPiBkYXRhMltwaXgxXSlcblx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4MV0gPSBnMTtcblx0XHRcdFx0XHRcdGlmICgoYjEgPSBkYXRhW3BpeDI9cGl4KzJdKSA+IGRhdGEyW3BpeDJdKVxuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXgyXSA9IGIxO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkYXRhQ2hhbmdlZCA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBcImRhcmtlblwiIDogXG5cdFx0XHRcdFx0d2hpbGUgKHAtLSkge1xuXHRcdFx0XHRcdFx0aWYgKChyMSA9IGRhdGFbcGl4LT00XSkgPCBkYXRhMltwaXhdKVxuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXhdID0gcjE7XG5cdFx0XHRcdFx0XHRpZiAoKGcxID0gZGF0YVtwaXgxPXBpeCsxXSkgPCBkYXRhMltwaXgxXSlcblx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4MV0gPSBnMTtcblx0XHRcdFx0XHRcdGlmICgoYjEgPSBkYXRhW3BpeDI9cGl4KzJdKSA8IGRhdGEyW3BpeDJdKVxuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXgyXSA9IGIxO1xuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGRhdGFDaGFuZ2VkID0gdHJ1ZTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIFwiZGFya2VyY29sb3JcIiA6IFxuXHRcdFx0XHRcdHdoaWxlIChwLS0pIHtcblx0XHRcdFx0XHRcdGlmICgoKHIxID0gZGF0YVtwaXgtPTRdKSowLjMrKGcxID0gZGF0YVtwaXgxPXBpeCsxXSkqMC41OSsoYjEgPSBkYXRhW3BpeDI9cGl4KzJdKSowLjExKSA8PSAoZGF0YTJbcGl4XSowLjMrZGF0YTJbcGl4MV0qMC41OStkYXRhMltwaXgyXSowLjExKSkge1xuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXhdID0gcjE7XG5cdFx0XHRcdFx0XHRcdGRhdGEyW3BpeDFdID0gZzE7XG5cdFx0XHRcdFx0XHRcdGRhdGEyW3BpeDJdID0gYjE7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGRhdGFDaGFuZ2VkID0gdHJ1ZTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIFwibGlnaHRlcmNvbG9yXCIgOiBcblx0XHRcdFx0XHR3aGlsZSAocC0tKSB7XG5cdFx0XHRcdFx0XHRpZiAoKChyMSA9IGRhdGFbcGl4LT00XSkqMC4zKyhnMSA9IGRhdGFbcGl4MT1waXgrMV0pKjAuNTkrKGIxID0gZGF0YVtwaXgyPXBpeCsyXSkqMC4xMSkgPiAoZGF0YTJbcGl4XSowLjMrZGF0YTJbcGl4MV0qMC41OStkYXRhMltwaXgyXSowLjExKSkge1xuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXhdID0gcjE7XG5cdFx0XHRcdFx0XHRcdGRhdGEyW3BpeDFdID0gZzE7XG5cdFx0XHRcdFx0XHRcdGRhdGEyW3BpeDJdID0gYjE7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGRhdGFDaGFuZ2VkID0gdHJ1ZTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIFwibGluZWFyZG9kZ2VcIiA6IFxuXHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0b3RoZXJDdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gXCJzb3VyY2Utb3ZlclwiO1xuXHRcdFx0XHRcdG90aGVyQ3R4LmRyYXdJbWFnZShwYXJhbXMuY2FudmFzLCAwLCAwKTtcblx0XHRcdFx0XHRvdGhlckN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSBcImxpZ2h0ZXJcIjtcblx0XHRcdFx0XHRvdGhlckN0eC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xuXHRcdFx0XHRcdCovXG5cblx0XHRcdFx0XHR3aGlsZSAocC0tKSB7XG5cdFx0XHRcdFx0XHRpZiAoKHIzID0gZGF0YVtwaXgtPTRdICsgZGF0YTJbcGl4XSkgPiAyNTUpXG5cdFx0XHRcdFx0XHRcdGRhdGEyW3BpeF0gPSAyNTU7XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdGRhdGEyW3BpeF0gPSByMztcblx0XHRcdFx0XHRcdGlmICgoZzMgPSBkYXRhW3BpeDE9cGl4KzFdICsgZGF0YTJbcGl4MV0pID4gMjU1KVxuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXgxXSA9IDI1NTtcblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4MV0gPSBnMztcblx0XHRcdFx0XHRcdGlmICgoYjMgPSBkYXRhW3BpeDI9cGl4KzJdICsgZGF0YTJbcGl4Ml0pID4gMjU1KVxuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXgyXSA9IDI1NTtcblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4Ml0gPSBiMztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZGF0YUNoYW5nZWQgPSB0cnVlO1xuXG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBcImxpbmVhcmJ1cm5cIiA6IFxuXHRcdFx0XHRcdHdoaWxlIChwLS0pIHtcblx0XHRcdFx0XHRcdGlmICgocjMgPSBkYXRhW3BpeC09NF0gKyBkYXRhMltwaXhdKSA8IDI1NSlcblx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4XSA9IDA7XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdGRhdGEyW3BpeF0gPSAocjMgLSAyNTUpO1xuXHRcdFx0XHRcdFx0aWYgKChnMyA9IGRhdGFbcGl4MT1waXgrMV0gKyBkYXRhMltwaXgxXSkgPCAyNTUpXG5cdFx0XHRcdFx0XHRcdGRhdGEyW3BpeDFdID0gMDtcblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4MV0gPSAoZzMgLSAyNTUpO1xuXHRcdFx0XHRcdFx0aWYgKChiMyA9IGRhdGFbcGl4Mj1waXgrMl0gKyBkYXRhMltwaXgyXSkgPCAyNTUpXG5cdFx0XHRcdFx0XHRcdGRhdGEyW3BpeDJdID0gMDtcblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4Ml0gPSAoYjMgLSAyNTUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkYXRhQ2hhbmdlZCA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBcImRpZmZlcmVuY2VcIiA6IFxuXHRcdFx0XHRcdHdoaWxlIChwLS0pIHtcblx0XHRcdFx0XHRcdGlmICgocjMgPSBkYXRhW3BpeC09NF0gLSBkYXRhMltwaXhdKSA8IDApXG5cdFx0XHRcdFx0XHRcdGRhdGEyW3BpeF0gPSAtcjM7XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdGRhdGEyW3BpeF0gPSByMztcblx0XHRcdFx0XHRcdGlmICgoZzMgPSBkYXRhW3BpeDE9cGl4KzFdIC0gZGF0YTJbcGl4MV0pIDwgMClcblx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4MV0gPSAtZzM7XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdGRhdGEyW3BpeDFdID0gZzM7XG5cdFx0XHRcdFx0XHRpZiAoKGIzID0gZGF0YVtwaXgyPXBpeCsyXSAtIGRhdGEyW3BpeDJdKSA8IDApXG5cdFx0XHRcdFx0XHRcdGRhdGEyW3BpeDJdID0gLWIzO1xuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXgyXSA9IGIzO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkYXRhQ2hhbmdlZCA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBcInNjcmVlblwiIDogXG5cdFx0XHRcdFx0d2hpbGUgKHAtLSkge1xuXHRcdFx0XHRcdFx0ZGF0YTJbcGl4LT00XSA9ICgyNTUgLSAoICgoMjU1LWRhdGEyW3BpeF0pKigyNTUtZGF0YVtwaXhdKSkgPj4gOCkpO1xuXHRcdFx0XHRcdFx0ZGF0YTJbcGl4MT1waXgrMV0gPSAoMjU1IC0gKCAoKDI1NS1kYXRhMltwaXgxXSkqKDI1NS1kYXRhW3BpeDFdKSkgPj4gOCkpO1xuXHRcdFx0XHRcdFx0ZGF0YTJbcGl4Mj1waXgrMl0gPSAoMjU1IC0gKCAoKDI1NS1kYXRhMltwaXgyXSkqKDI1NS1kYXRhW3BpeDJdKSkgPj4gOCkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkYXRhQ2hhbmdlZCA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBcImV4Y2x1c2lvblwiIDogXG5cdFx0XHRcdFx0dmFyIGRpdl8yXzI1NSA9IDIgLyAyNTU7XG5cdFx0XHRcdFx0d2hpbGUgKHAtLSkge1xuXHRcdFx0XHRcdFx0ZGF0YTJbcGl4LT00XSA9IChyMSA9IGRhdGFbcGl4XSkgLSAocjEgKiBkaXZfMl8yNTUgLSAxKSAqIGRhdGEyW3BpeF07XG5cdFx0XHRcdFx0XHRkYXRhMltwaXgxPXBpeCsxXSA9IChnMSA9IGRhdGFbcGl4MV0pIC0gKGcxICogZGl2XzJfMjU1IC0gMSkgKiBkYXRhMltwaXgxXTtcblx0XHRcdFx0XHRcdGRhdGEyW3BpeDI9cGl4KzJdID0gKGIxID0gZGF0YVtwaXgyXSkgLSAoYjEgKiBkaXZfMl8yNTUgLSAxKSAqIGRhdGEyW3BpeDJdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkYXRhQ2hhbmdlZCA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBcIm92ZXJsYXlcIiA6IFxuXHRcdFx0XHRcdHZhciBkaXZfMl8yNTUgPSAyIC8gMjU1O1xuXHRcdFx0XHRcdHdoaWxlIChwLS0pIHtcblx0XHRcdFx0XHRcdGlmICgocjEgPSBkYXRhW3BpeC09NF0pIDwgMTI4KVxuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXhdID0gZGF0YTJbcGl4XSpyMSpkaXZfMl8yNTU7XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdGRhdGEyW3BpeF0gPSAyNTUgLSAoMjU1LWRhdGEyW3BpeF0pKigyNTUtcjEpKmRpdl8yXzI1NTtcblxuXHRcdFx0XHRcdFx0aWYgKChnMSA9IGRhdGFbcGl4MT1waXgrMV0pIDwgMTI4KVxuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXgxXSA9IGRhdGEyW3BpeDFdKmcxKmRpdl8yXzI1NTtcblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4MV0gPSAyNTUgLSAoMjU1LWRhdGEyW3BpeDFdKSooMjU1LWcxKSpkaXZfMl8yNTU7XG5cblx0XHRcdFx0XHRcdGlmICgoYjEgPSBkYXRhW3BpeDI9cGl4KzJdKSA8IDEyOClcblx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4Ml0gPSBkYXRhMltwaXgyXSpiMSpkaXZfMl8yNTU7XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdGRhdGEyW3BpeDJdID0gMjU1IC0gKDI1NS1kYXRhMltwaXgyXSkqKDI1NS1iMSkqZGl2XzJfMjU1O1xuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGRhdGFDaGFuZ2VkID0gdHJ1ZTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIFwic29mdGxpZ2h0XCIgOiBcblx0XHRcdFx0XHR2YXIgZGl2XzJfMjU1ID0gMiAvIDI1NTtcblx0XHRcdFx0XHR3aGlsZSAocC0tKSB7XG5cdFx0XHRcdFx0XHRpZiAoKHIxID0gZGF0YVtwaXgtPTRdKSA8IDEyOClcblx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4XSA9ICgoZGF0YTJbcGl4XT4+MSkgKyA2NCkgKiByMSAqIGRpdl8yXzI1NTtcblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4XSA9IDI1NSAtICgxOTEgLSAoZGF0YTJbcGl4XT4+MSkpICogKDI1NS1yMSkgKiBkaXZfMl8yNTU7XG5cblx0XHRcdFx0XHRcdGlmICgoZzEgPSBkYXRhW3BpeDE9cGl4KzFdKSA8IDEyOClcblx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4MV0gPSAoKGRhdGEyW3BpeDFdPj4xKSs2NCkgKiBnMSAqIGRpdl8yXzI1NTtcblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4MV0gPSAyNTUgLSAoMTkxIC0gKGRhdGEyW3BpeDFdPj4xKSkgKiAoMjU1LWcxKSAqIGRpdl8yXzI1NTtcblxuXHRcdFx0XHRcdFx0aWYgKChiMSA9IGRhdGFbcGl4Mj1waXgrMl0pIDwgMTI4KVxuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXgyXSA9ICgoZGF0YTJbcGl4Ml0+PjEpKzY0KSAqIGIxICogZGl2XzJfMjU1O1xuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXgyXSA9IDI1NSAtICgxOTEgLSAoZGF0YTJbcGl4Ml0+PjEpKSAqICgyNTUtYjEpICogZGl2XzJfMjU1O1xuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGRhdGFDaGFuZ2VkID0gdHJ1ZTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIFwiaGFyZGxpZ2h0XCIgOiBcblx0XHRcdFx0XHR2YXIgZGl2XzJfMjU1ID0gMiAvIDI1NTtcblx0XHRcdFx0XHR3aGlsZSAocC0tKSB7XG5cdFx0XHRcdFx0XHRpZiAoKHIyID0gZGF0YTJbcGl4LT00XSkgPCAxMjgpXG5cdFx0XHRcdFx0XHRcdGRhdGEyW3BpeF0gPSBkYXRhW3BpeF0gKiByMiAqIGRpdl8yXzI1NTtcblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4XSA9IDI1NSAtICgyNTUtZGF0YVtwaXhdKSAqICgyNTUtcjIpICogZGl2XzJfMjU1O1xuXG5cdFx0XHRcdFx0XHRpZiAoKGcyID0gZGF0YTJbcGl4MT1waXgrMV0pIDwgMTI4KVxuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXgxXSA9IGRhdGFbcGl4MV0gKiBnMiAqIGRpdl8yXzI1NTtcblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4MV0gPSAyNTUgLSAoMjU1LWRhdGFbcGl4MV0pICogKDI1NS1nMikgKiBkaXZfMl8yNTU7XG5cblx0XHRcdFx0XHRcdGlmICgoYjIgPSBkYXRhMltwaXgyPXBpeCsyXSkgPCAxMjgpXG5cdFx0XHRcdFx0XHRcdGRhdGEyW3BpeDJdID0gZGF0YVtwaXgyXSAqIGIyICogZGl2XzJfMjU1O1xuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXgyXSA9IDI1NSAtICgyNTUtZGF0YVtwaXgyXSkgKiAoMjU1LWIyKSAqIGRpdl8yXzI1NTtcblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkYXRhQ2hhbmdlZCA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBcImNvbG9yZG9kZ2VcIiA6IFxuXHRcdFx0XHRcdHdoaWxlIChwLS0pIHtcblx0XHRcdFx0XHRcdGlmICgocjMgPSAoZGF0YVtwaXgtPTRdPDw4KS8oMjU1LShyMiA9IGRhdGEyW3BpeF0pKSkgPiAyNTUgfHwgcjIgPT0gMjU1KVxuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXhdID0gMjU1O1xuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXhdID0gcjM7XG5cblx0XHRcdFx0XHRcdGlmICgoZzMgPSAoZGF0YVtwaXgxPXBpeCsxXTw8OCkvKDI1NS0oZzIgPSBkYXRhMltwaXgxXSkpKSA+IDI1NSB8fCBnMiA9PSAyNTUpXG5cdFx0XHRcdFx0XHRcdGRhdGEyW3BpeDFdID0gMjU1O1xuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXgxXSA9IGczO1xuXG5cdFx0XHRcdFx0XHRpZiAoKGIzID0gKGRhdGFbcGl4Mj1waXgrMl08PDgpLygyNTUtKGIyID0gZGF0YTJbcGl4Ml0pKSkgPiAyNTUgfHwgYjIgPT0gMjU1KVxuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXgyXSA9IDI1NTtcblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4Ml0gPSBiMztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZGF0YUNoYW5nZWQgPSB0cnVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgXCJjb2xvcmJ1cm5cIiA6IFxuXHRcdFx0XHRcdHdoaWxlIChwLS0pIHtcblx0XHRcdFx0XHRcdGlmICgocjMgPSAyNTUtKCgyNTUtZGF0YVtwaXgtPTRdKTw8OCkvZGF0YTJbcGl4XSkgPCAwIHx8IGRhdGEyW3BpeF0gPT0gMClcblx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4XSA9IDA7XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdGRhdGEyW3BpeF0gPSByMztcblxuXHRcdFx0XHRcdFx0aWYgKChnMyA9IDI1NS0oKDI1NS1kYXRhW3BpeDE9cGl4KzFdKTw8OCkvZGF0YTJbcGl4MV0pIDwgMCB8fCBkYXRhMltwaXgxXSA9PSAwKVxuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXgxXSA9IDA7XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdGRhdGEyW3BpeDFdID0gZzM7XG5cblx0XHRcdFx0XHRcdGlmICgoYjMgPSAyNTUtKCgyNTUtZGF0YVtwaXgyPXBpeCsyXSk8PDgpL2RhdGEyW3BpeDJdKSA8IDAgfHwgZGF0YTJbcGl4Ml0gPT0gMClcblx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4Ml0gPSAwO1xuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXgyXSA9IGIzO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkYXRhQ2hhbmdlZCA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBcImxpbmVhcmxpZ2h0XCIgOiBcblx0XHRcdFx0XHR3aGlsZSAocC0tKSB7XG5cdFx0XHRcdFx0XHRpZiAoICgocjMgPSAyKihyMj1kYXRhMltwaXgtPTRdKStkYXRhW3BpeF0tMjU2KSA8IDApIHx8IChyMiA8IDEyOCAmJiByMyA8IDApKSB7XG5cdFx0XHRcdFx0XHRcdGRhdGEyW3BpeF0gPSAwXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRpZiAocjMgPiAyNTUpXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4XSA9IDI1NTtcblx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRcdGRhdGEyW3BpeF0gPSByMztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmICggKChnMyA9IDIqKGcyPWRhdGEyW3BpeDE9cGl4KzFdKStkYXRhW3BpeDFdLTI1NikgPCAwKSB8fCAoZzIgPCAxMjggJiYgZzMgPCAwKSkge1xuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXgxXSA9IDBcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGlmIChnMyA+IDI1NSlcblx0XHRcdFx0XHRcdFx0XHRkYXRhMltwaXgxXSA9IDI1NTtcblx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRcdGRhdGEyW3BpeDFdID0gZzM7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAoICgoYjMgPSAyKihiMj1kYXRhMltwaXgyPXBpeCsyXSkrZGF0YVtwaXgyXS0yNTYpIDwgMCkgfHwgKGIyIDwgMTI4ICYmIGIzIDwgMCkpIHtcblx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4Ml0gPSAwXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRpZiAoYjMgPiAyNTUpXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4Ml0gPSAyNTU7XG5cdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0XHRkYXRhMltwaXgyXSA9IGIzO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkYXRhQ2hhbmdlZCA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBcInZpdmlkbGlnaHRcIiA6IFxuXHRcdFx0XHRcdHdoaWxlIChwLS0pIHtcblx0XHRcdFx0XHRcdGlmICgocjI9ZGF0YTJbcGl4LT00XSkgPCAxMjgpIHtcblx0XHRcdFx0XHRcdFx0aWYgKHIyKSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKChyMyA9IDI1NSAtICgoMjU1LWRhdGFbcGl4XSk8PDgpIC8gKDIqcjIpKSA8IDApIFxuXHRcdFx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4XSA9IDA7XG5cdFx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4XSA9IHIzXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4XSA9IDA7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoKHIzID0gKHI0PTIqcjItMjU2KSkgPCAyNTUpIHtcblx0XHRcdFx0XHRcdFx0aWYgKChyMyA9IChkYXRhW3BpeF08PDgpLygyNTUtcjQpKSA+IDI1NSkgXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4XSA9IDI1NTtcblx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRcdGRhdGEyW3BpeF0gPSByMztcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGlmIChyMyA8IDApIFxuXHRcdFx0XHRcdFx0XHRcdGRhdGEyW3BpeF0gPSAwO1xuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4XSA9IHIzXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmICgoZzI9ZGF0YTJbcGl4MT1waXgrMV0pIDwgMTI4KSB7XG5cdFx0XHRcdFx0XHRcdGlmIChnMikge1xuXHRcdFx0XHRcdFx0XHRcdGlmICgoZzMgPSAyNTUgLSAoKDI1NS1kYXRhW3BpeDFdKTw8OCkgLyAoMipnMikpIDwgMCkgXG5cdFx0XHRcdFx0XHRcdFx0XHRkYXRhMltwaXgxXSA9IDA7XG5cdFx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4MV0gPSBnMztcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRkYXRhMltwaXgxXSA9IDA7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoKGczID0gKGc0PTIqZzItMjU2KSkgPCAyNTUpIHtcblx0XHRcdFx0XHRcdFx0aWYgKChnMyA9IChkYXRhW3BpeDFdPDw4KS8oMjU1LWc0KSkgPiAyNTUpXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4MV0gPSAyNTU7XG5cdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0XHRkYXRhMltwaXgxXSA9IGczO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0aWYgKGczIDwgMCkgXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4MV0gPSAwO1xuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4MV0gPSBnMztcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKChiMj1kYXRhMltwaXgyPXBpeCsyXSkgPCAxMjgpIHtcblx0XHRcdFx0XHRcdFx0aWYgKGIyKSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKChiMyA9IDI1NSAtICgoMjU1LWRhdGFbcGl4Ml0pPDw4KSAvICgyKmIyKSkgPCAwKSBcblx0XHRcdFx0XHRcdFx0XHRcdGRhdGEyW3BpeDJdID0gMDtcblx0XHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdFx0XHRkYXRhMltwaXgyXSA9IGIzO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGRhdGEyW3BpeDJdID0gMDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBlbHNlIGlmICgoYjMgPSAoYjQ9MipiMi0yNTYpKSA8IDI1NSkge1xuXHRcdFx0XHRcdFx0XHRpZiAoKGIzID0gKGRhdGFbcGl4Ml08PDgpLygyNTUtYjQpKSA+IDI1NSkgXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4Ml0gPSAyNTU7XG5cdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0XHRkYXRhMltwaXgyXSA9IGIzO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0aWYgKGIzIDwgMCkgXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4Ml0gPSAwO1xuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4Ml0gPSBiMztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZGF0YUNoYW5nZWQgPSB0cnVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgXCJwaW5saWdodFwiIDogXG5cdFx0XHRcdFx0d2hpbGUgKHAtLSkge1xuXHRcdFx0XHRcdFx0aWYgKChyMj1kYXRhMltwaXgtPTRdKSA8IDEyOClcblx0XHRcdFx0XHRcdFx0aWYgKChyMT1kYXRhW3BpeF0pIDwgKHI0PTIqcjIpKVxuXHRcdFx0XHRcdFx0XHRcdGRhdGEyW3BpeF0gPSByMTtcblx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRcdGRhdGEyW3BpeF0gPSByNDtcblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0aWYgKChyMT1kYXRhW3BpeF0pID4gKHI0PTIqcjItMjU2KSlcblx0XHRcdFx0XHRcdFx0XHRkYXRhMltwaXhdID0gcjE7XG5cdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0XHRkYXRhMltwaXhdID0gcjQ7XG5cblx0XHRcdFx0XHRcdGlmICgoZzI9ZGF0YTJbcGl4MT1waXgrMV0pIDwgMTI4KVxuXHRcdFx0XHRcdFx0XHRpZiAoKGcxPWRhdGFbcGl4MV0pIDwgKGc0PTIqZzIpKVxuXHRcdFx0XHRcdFx0XHRcdGRhdGEyW3BpeDFdID0gZzE7XG5cdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0XHRkYXRhMltwaXgxXSA9IGc0O1xuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRpZiAoKGcxPWRhdGFbcGl4MV0pID4gKGc0PTIqZzItMjU2KSlcblx0XHRcdFx0XHRcdFx0XHRkYXRhMltwaXgxXSA9IGcxO1xuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4MV0gPSBnNDtcblxuXHRcdFx0XHRcdFx0aWYgKChyMj1kYXRhMltwaXgyPXBpeCsyXSkgPCAxMjgpXG5cdFx0XHRcdFx0XHRcdGlmICgocjE9ZGF0YVtwaXgyXSkgPCAocjQ9MipyMikpXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4Ml0gPSByMTtcblx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRcdGRhdGEyW3BpeDJdID0gcjQ7XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdGlmICgocjE9ZGF0YVtwaXgyXSkgPiAocjQ9MipyMi0yNTYpKVxuXHRcdFx0XHRcdFx0XHRcdGRhdGEyW3BpeDJdID0gcjE7XG5cdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0XHRkYXRhMltwaXgyXSA9IHI0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkYXRhQ2hhbmdlZCA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBcImhhcmRtaXhcIiA6IFxuXHRcdFx0XHRcdHdoaWxlIChwLS0pIHtcblx0XHRcdFx0XHRcdGlmICgocjIgPSBkYXRhMltwaXgtPTRdKSA8IDEyOClcblx0XHRcdFx0XHRcdFx0aWYgKDI1NSAtICgoMjU1LWRhdGFbcGl4XSk8PDgpLygyKnIyKSA8IDEyOCB8fCByMiA9PSAwKVxuXHRcdFx0XHRcdFx0XHRcdGRhdGEyW3BpeF0gPSAwO1xuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4XSA9IDI1NTtcblx0XHRcdFx0XHRcdGVsc2UgaWYgKChyND0yKnIyLTI1NikgPCAyNTUgJiYgKGRhdGFbcGl4XTw8OCkvKDI1NS1yNCkgPCAxMjgpXG5cdFx0XHRcdFx0XHRcdGRhdGEyW3BpeF0gPSAwO1xuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXhdID0gMjU1O1xuXG5cdFx0XHRcdFx0XHRpZiAoKGcyID0gZGF0YTJbcGl4MT1waXgrMV0pIDwgMTI4KVxuXHRcdFx0XHRcdFx0XHRpZiAoMjU1IC0gKCgyNTUtZGF0YVtwaXgxXSk8PDgpLygyKmcyKSA8IDEyOCB8fCBnMiA9PSAwKVxuXHRcdFx0XHRcdFx0XHRcdGRhdGEyW3BpeDFdID0gMDtcblx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRcdGRhdGEyW3BpeDFdID0gMjU1O1xuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoKGc0PTIqZzItMjU2KSA8IDI1NSAmJiAoZGF0YVtwaXgxXTw8OCkvKDI1NS1nNCkgPCAxMjgpXG5cdFx0XHRcdFx0XHRcdGRhdGEyW3BpeDFdID0gMDtcblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4MV0gPSAyNTU7XG5cblx0XHRcdFx0XHRcdGlmICgoYjIgPSBkYXRhMltwaXgyPXBpeCsyXSkgPCAxMjgpXG5cdFx0XHRcdFx0XHRcdGlmICgyNTUgLSAoKDI1NS1kYXRhW3BpeDJdKTw8OCkvKDIqYjIpIDwgMTI4IHx8IGIyID09IDApXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4Ml0gPSAwO1xuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4Ml0gPSAyNTU7XG5cdFx0XHRcdFx0XHRlbHNlIGlmICgoYjQ9MipiMi0yNTYpIDwgMjU1ICYmIChkYXRhW3BpeDJdPDw4KS8oMjU1LWI0KSA8IDEyOClcblx0XHRcdFx0XHRcdFx0ZGF0YTJbcGl4Ml0gPSAwO1xuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRkYXRhMltwaXgyXSA9IDI1NTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZGF0YUNoYW5nZWQgPSB0cnVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZGF0YUNoYW5nZWQpIFxuXHRcdFx0XHRvdGhlckN0eC5wdXRJbWFnZURhdGEoZGF0YURlc2MyLDAsMCk7XG5cblx0XHRcdGlmIChhbW91bnQgIT0gMSAmJiAhUGl4YXN0aWMuQ2xpZW50Lmhhc0dsb2JhbEFscGhhKCkpIHtcblx0XHRcdFx0dmFyIHAgPSB3Kmg7XG5cdFx0XHRcdHZhciBhbW91bnQyID0gYW1vdW50O1xuXHRcdFx0XHR2YXIgYW1vdW50MSA9IDEgLSBhbW91bnQ7XG5cdFx0XHRcdHdoaWxlIChwLS0pIHtcblx0XHRcdFx0XHR2YXIgcGl4ID0gcCo0O1xuXHRcdFx0XHRcdHZhciByID0gKGRhdGFbcGl4XSAqIGFtb3VudDEgKyBkYXRhMltwaXhdICogYW1vdW50Mik+PjA7XG5cdFx0XHRcdFx0dmFyIGcgPSAoZGF0YVtwaXgrMV0gKiBhbW91bnQxICsgZGF0YTJbcGl4KzFdICogYW1vdW50Mik+PjA7XG5cdFx0XHRcdFx0dmFyIGIgPSAoZGF0YVtwaXgrMl0gKiBhbW91bnQxICsgZGF0YTJbcGl4KzJdICogYW1vdW50Mik+PjA7XG5cblx0XHRcdFx0XHRkYXRhW3BpeF0gPSByO1xuXHRcdFx0XHRcdGRhdGFbcGl4KzFdID0gZztcblx0XHRcdFx0XHRkYXRhW3BpeCsyXSA9IGI7XG5cdFx0XHRcdH1cblx0XHRcdFx0cGFyYW1zLnVzZURhdGEgPSB0cnVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIGN0eCA9IHBhcmFtcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuXHRcdFx0XHRjdHguc2F2ZSgpO1xuXHRcdFx0XHRjdHguZ2xvYmFsQWxwaGEgPSBhbW91bnQ7XG5cdFx0XHRcdGN0eC5kcmF3SW1hZ2UoXG5cdFx0XHRcdFx0b3RoZXJDYW52YXMsXG5cdFx0XHRcdFx0MCwwLHJlY3Qud2lkdGgscmVjdC5oZWlnaHQsXG5cdFx0XHRcdFx0cmVjdC5sZWZ0LHJlY3QudG9wLHJlY3Qud2lkdGgscmVjdC5oZWlnaHRcblx0XHRcdFx0KTtcblx0XHRcdFx0Y3R4Lmdsb2JhbEFscGhhID0gMTtcblx0XHRcdFx0Y3R4LnJlc3RvcmUoKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9LFxuXHRjaGVja1N1cHBvcnQgOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gUGl4YXN0aWMuQ2xpZW50Lmhhc0NhbnZhc0ltYWdlRGF0YSgpO1xuXHR9XG59LypcbiAqIFBpeGFzdGljIExpYiAtIEJsdXIgZmlsdGVyIC0gdjAuMS4wXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDggSmFjb2IgU2VpZGVsaW4sIGpzZWlkZWxpbkBuaWhpbG9naWMuZGssIGh0dHA6Ly9ibG9nLm5paGlsb2dpYy5kay9cbiAqIExpY2Vuc2U6IFtodHRwOi8vd3d3LnBpeGFzdGljLmNvbS9saWIvbGljZW5zZS50eHRdXG4gKi9cblxuUGl4YXN0aWMuQWN0aW9ucy5ibHVyID0ge1xuXHRwcm9jZXNzIDogZnVuY3Rpb24ocGFyYW1zKSB7XG5cblx0XHRpZiAodHlwZW9mIHBhcmFtcy5vcHRpb25zLmZpeE1hcmdpbiA9PSBcInVuZGVmaW5lZFwiKVxuXHRcdFx0cGFyYW1zLm9wdGlvbnMuZml4TWFyZ2luID0gdHJ1ZTtcblxuXHRcdGlmIChQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzSW1hZ2VEYXRhKCkpIHtcblx0XHRcdHZhciBkYXRhID0gUGl4YXN0aWMucHJlcGFyZURhdGEocGFyYW1zKTtcblx0XHRcdHZhciBkYXRhQ29weSA9IFBpeGFzdGljLnByZXBhcmVEYXRhKHBhcmFtcywgdHJ1ZSlcblxuXHRcdFx0Lypcblx0XHRcdHZhciBrZXJuZWwgPSBbXG5cdFx0XHRcdFswLjUsIFx0MSwgXHQwLjVdLFxuXHRcdFx0XHRbMSwgXHQyLCBcdDFdLFxuXHRcdFx0XHRbMC41LCBcdDEsIFx0MC41XVxuXHRcdFx0XTtcblx0XHRcdCovXG5cblx0XHRcdHZhciBrZXJuZWwgPSBbXG5cdFx0XHRcdFswLCBcdDEsIFx0MF0sXG5cdFx0XHRcdFsxLCBcdDIsIFx0MV0sXG5cdFx0XHRcdFswLCBcdDEsIFx0MF1cblx0XHRcdF07XG5cblx0XHRcdHZhciB3ZWlnaHQgPSAwO1xuXHRcdFx0Zm9yICh2YXIgaT0wO2k8MztpKyspIHtcblx0XHRcdFx0Zm9yICh2YXIgaj0wO2o8MztqKyspIHtcblx0XHRcdFx0XHR3ZWlnaHQgKz0ga2VybmVsW2ldW2pdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHdlaWdodCA9IDEgLyAod2VpZ2h0KjIpO1xuXG5cdFx0XHR2YXIgcmVjdCA9IHBhcmFtcy5vcHRpb25zLnJlY3Q7XG5cdFx0XHR2YXIgdyA9IHJlY3Qud2lkdGg7XG5cdFx0XHR2YXIgaCA9IHJlY3QuaGVpZ2h0O1xuXG5cdFx0XHR2YXIgdzQgPSB3KjQ7XG5cdFx0XHR2YXIgeSA9IGg7XG5cdFx0XHRkbyB7XG5cdFx0XHRcdHZhciBvZmZzZXRZID0gKHktMSkqdzQ7XG5cblx0XHRcdFx0dmFyIHByZXZZID0gKHkgPT0gMSkgPyAwIDogeS0yO1xuXHRcdFx0XHR2YXIgbmV4dFkgPSAoeSA9PSBoKSA/IHkgLSAxIDogeTtcblxuXHRcdFx0XHR2YXIgb2Zmc2V0WVByZXYgPSBwcmV2WSp3KjQ7XG5cdFx0XHRcdHZhciBvZmZzZXRZTmV4dCA9IG5leHRZKncqNDtcblxuXHRcdFx0XHR2YXIgeCA9IHc7XG5cdFx0XHRcdGRvIHtcblx0XHRcdFx0XHR2YXIgb2Zmc2V0ID0gb2Zmc2V0WSArICh4KjQtNCk7XG5cblx0XHRcdFx0XHR2YXIgb2Zmc2V0UHJldiA9IG9mZnNldFlQcmV2ICsgKCh4ID09IDEpID8gMCA6IHgtMikgKiA0O1xuXHRcdFx0XHRcdHZhciBvZmZzZXROZXh0ID0gb2Zmc2V0WU5leHQgKyAoKHggPT0gdykgPyB4LTEgOiB4KSAqIDQ7XG5cdFxuXHRcdFx0XHRcdGRhdGFbb2Zmc2V0XSA9IChcblx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRkYXRhQ29weVtvZmZzZXRQcmV2IC0gNF1cblx0XHRcdFx0XHRcdCsgZGF0YUNvcHlbb2Zmc2V0UHJldis0XSBcblx0XHRcdFx0XHRcdCsgZGF0YUNvcHlbb2Zmc2V0TmV4dCAtIDRdXG5cdFx0XHRcdFx0XHQrIGRhdGFDb3B5W29mZnNldE5leHQrNF1cblx0XHRcdFx0XHRcdCsgXG5cdFx0XHRcdFx0XHQqL1xuXHRcdFx0XHRcdFx0KGRhdGFDb3B5W29mZnNldFByZXZdXG5cdFx0XHRcdFx0XHQrIGRhdGFDb3B5W29mZnNldC00XVxuXHRcdFx0XHRcdFx0KyBkYXRhQ29weVtvZmZzZXQrNF1cblx0XHRcdFx0XHRcdCsgZGF0YUNvcHlbb2Zmc2V0TmV4dF0pXHRcdCogMlxuXHRcdFx0XHRcdFx0KyBkYXRhQ29weVtvZmZzZXRdIFx0XHQqIDRcblx0XHRcdFx0XHRcdCkgKiB3ZWlnaHQ7XG5cblx0XHRcdFx0XHRkYXRhW29mZnNldCsxXSA9IChcblx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRkYXRhQ29weVtvZmZzZXRQcmV2IC0gM11cblx0XHRcdFx0XHRcdCsgZGF0YUNvcHlbb2Zmc2V0UHJldis1XSBcblx0XHRcdFx0XHRcdCsgZGF0YUNvcHlbb2Zmc2V0TmV4dCAtIDNdIFxuXHRcdFx0XHRcdFx0KyBkYXRhQ29weVtvZmZzZXROZXh0KzVdXG5cdFx0XHRcdFx0XHQrIFxuXHRcdFx0XHRcdFx0Ki9cblx0XHRcdFx0XHRcdChkYXRhQ29weVtvZmZzZXRQcmV2KzFdXG5cdFx0XHRcdFx0XHQrIGRhdGFDb3B5W29mZnNldC0zXVxuXHRcdFx0XHRcdFx0KyBkYXRhQ29weVtvZmZzZXQrNV1cblx0XHRcdFx0XHRcdCsgZGF0YUNvcHlbb2Zmc2V0TmV4dCsxXSlcdCogMlxuXHRcdFx0XHRcdFx0KyBkYXRhQ29weVtvZmZzZXQrMV0gXHRcdCogNFxuXHRcdFx0XHRcdFx0KSAqIHdlaWdodDtcblxuXHRcdFx0XHRcdGRhdGFbb2Zmc2V0KzJdID0gKFxuXHRcdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdGRhdGFDb3B5W29mZnNldFByZXYgLSAyXSBcblx0XHRcdFx0XHRcdCsgZGF0YUNvcHlbb2Zmc2V0UHJldis2XSBcblx0XHRcdFx0XHRcdCsgZGF0YUNvcHlbb2Zmc2V0TmV4dCAtIDJdIFxuXHRcdFx0XHRcdFx0KyBkYXRhQ29weVtvZmZzZXROZXh0KzZdXG5cdFx0XHRcdFx0XHQrIFxuXHRcdFx0XHRcdFx0Ki9cblx0XHRcdFx0XHRcdChkYXRhQ29weVtvZmZzZXRQcmV2KzJdXG5cdFx0XHRcdFx0XHQrIGRhdGFDb3B5W29mZnNldC0yXVxuXHRcdFx0XHRcdFx0KyBkYXRhQ29weVtvZmZzZXQrNl1cblx0XHRcdFx0XHRcdCsgZGF0YUNvcHlbb2Zmc2V0TmV4dCsyXSlcdCogMlxuXHRcdFx0XHRcdFx0KyBkYXRhQ29weVtvZmZzZXQrMl0gXHRcdCogNFxuXHRcdFx0XHRcdFx0KSAqIHdlaWdodDtcblxuXHRcdFx0XHR9IHdoaWxlICgtLXgpO1xuXHRcdFx0fSB3aGlsZSAoLS15KTtcblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cblx0XHR9IGVsc2UgaWYgKFBpeGFzdGljLkNsaWVudC5pc0lFKCkpIHtcblx0XHRcdHBhcmFtcy5pbWFnZS5zdHlsZS5maWx0ZXIgKz0gXCIgcHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LkJsdXIocGl4ZWxyYWRpdXM9MS41KVwiO1xuXG5cdFx0XHRpZiAocGFyYW1zLm9wdGlvbnMuZml4TWFyZ2luKSB7XG5cdFx0XHRcdHBhcmFtcy5pbWFnZS5zdHlsZS5tYXJnaW5MZWZ0ID0gKHBhcnNlSW50KHBhcmFtcy5pbWFnZS5zdHlsZS5tYXJnaW5MZWZ0LDEwKXx8MCkgLSAyICsgXCJweFwiO1xuXHRcdFx0XHRwYXJhbXMuaW1hZ2Uuc3R5bGUubWFyZ2luVG9wID0gKHBhcnNlSW50KHBhcmFtcy5pbWFnZS5zdHlsZS5tYXJnaW5Ub3AsMTApfHwwKSAtIDIgKyBcInB4XCI7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fSxcblx0Y2hlY2tTdXBwb3J0IDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIChQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzSW1hZ2VEYXRhKCkgfHwgUGl4YXN0aWMuQ2xpZW50LmlzSUUoKSk7XG5cdH1cbn0vKlxuICogUGl4YXN0aWMgTGliIC0gQmx1ciBGYXN0IC0gdjAuMS4xXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDggSmFjb2IgU2VpZGVsaW4sIGpzZWlkZWxpbkBuaWhpbG9naWMuZGssIGh0dHA6Ly9ibG9nLm5paGlsb2dpYy5kay9cbiAqIExpY2Vuc2U6IFtodHRwOi8vd3d3LnBpeGFzdGljLmNvbS9saWIvbGljZW5zZS50eHRdXG4gKi9cblxuUGl4YXN0aWMuQWN0aW9ucy5ibHVyZmFzdCA9IHtcblx0cHJvY2VzcyA6IGZ1bmN0aW9uKHBhcmFtcykge1xuXG5cdFx0dmFyIGFtb3VudCA9IHBhcnNlRmxvYXQocGFyYW1zLm9wdGlvbnMuYW1vdW50KXx8MDtcblx0XHR2YXIgY2xlYXIgPSAhIShwYXJhbXMub3B0aW9ucy5jbGVhciAmJiBwYXJhbXMub3B0aW9ucy5jbGVhciAhPSBcImZhbHNlXCIpO1xuXG5cdFx0YW1vdW50ID0gTWF0aC5tYXgoMCxNYXRoLm1pbig1LGFtb3VudCkpO1xuXG5cdFx0aWYgKFBpeGFzdGljLkNsaWVudC5oYXNDYW52YXMoKSkge1xuXHRcdFx0dmFyIHJlY3QgPSBwYXJhbXMub3B0aW9ucy5yZWN0O1xuXG5cdFx0XHR2YXIgY3R4ID0gcGFyYW1zLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG5cdFx0XHRjdHguc2F2ZSgpO1xuXHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0Y3R4LnJlY3QocmVjdC5sZWZ0LCByZWN0LnRvcCwgcmVjdC53aWR0aCwgcmVjdC5oZWlnaHQpO1xuXHRcdFx0Y3R4LmNsaXAoKTtcblxuXHRcdFx0dmFyIHNjYWxlID0gMjtcblx0XHRcdHZhciBzbWFsbFdpZHRoID0gTWF0aC5yb3VuZChwYXJhbXMud2lkdGggLyBzY2FsZSk7XG5cdFx0XHR2YXIgc21hbGxIZWlnaHQgPSBNYXRoLnJvdW5kKHBhcmFtcy5oZWlnaHQgLyBzY2FsZSk7XG5cblx0XHRcdHZhciBjb3B5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcblx0XHRcdGNvcHkud2lkdGggPSBzbWFsbFdpZHRoO1xuXHRcdFx0Y29weS5oZWlnaHQgPSBzbWFsbEhlaWdodDtcblxuXHRcdFx0dmFyIGNsZWFyID0gZmFsc2U7XG5cdFx0XHR2YXIgc3RlcHMgPSBNYXRoLnJvdW5kKGFtb3VudCAqIDIwKTtcblxuXHRcdFx0dmFyIGNvcHlDdHggPSBjb3B5LmdldENvbnRleHQoXCIyZFwiKTtcblx0XHRcdGZvciAodmFyIGk9MDtpPHN0ZXBzO2krKykge1xuXHRcdFx0XHR2YXIgc2NhbGVkV2lkdGggPSBNYXRoLm1heCgxLE1hdGgucm91bmQoc21hbGxXaWR0aCAtIGkpKTtcblx0XHRcdFx0dmFyIHNjYWxlZEhlaWdodCA9IE1hdGgubWF4KDEsTWF0aC5yb3VuZChzbWFsbEhlaWdodCAtIGkpKTtcblx0XG5cdFx0XHRcdGNvcHlDdHguY2xlYXJSZWN0KDAsMCxzbWFsbFdpZHRoLHNtYWxsSGVpZ2h0KTtcblx0XG5cdFx0XHRcdGNvcHlDdHguZHJhd0ltYWdlKFxuXHRcdFx0XHRcdHBhcmFtcy5jYW52YXMsXG5cdFx0XHRcdFx0MCwwLHBhcmFtcy53aWR0aCxwYXJhbXMuaGVpZ2h0LFxuXHRcdFx0XHRcdDAsMCxzY2FsZWRXaWR0aCxzY2FsZWRIZWlnaHRcblx0XHRcdFx0KTtcblx0XG5cdFx0XHRcdGlmIChjbGVhcilcblx0XHRcdFx0XHRjdHguY2xlYXJSZWN0KHJlY3QubGVmdCxyZWN0LnRvcCxyZWN0LndpZHRoLHJlY3QuaGVpZ2h0KTtcblx0XG5cdFx0XHRcdGN0eC5kcmF3SW1hZ2UoXG5cdFx0XHRcdFx0Y29weSxcblx0XHRcdFx0XHQwLDAsc2NhbGVkV2lkdGgsc2NhbGVkSGVpZ2h0LFxuXHRcdFx0XHRcdDAsMCxwYXJhbXMud2lkdGgscGFyYW1zLmhlaWdodFxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRjdHgucmVzdG9yZSgpO1xuXG5cdFx0XHRwYXJhbXMudXNlRGF0YSA9IGZhbHNlO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSBlbHNlIGlmIChQaXhhc3RpYy5DbGllbnQuaXNJRSgpKSB7XG5cdFx0XHR2YXIgcmFkaXVzID0gMTAgKiBhbW91bnQ7XG5cdFx0XHRwYXJhbXMuaW1hZ2Uuc3R5bGUuZmlsdGVyICs9IFwiIHByb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5CbHVyKHBpeGVscmFkaXVzPVwiICsgcmFkaXVzICsgXCIpXCI7XG5cblx0XHRcdGlmIChwYXJhbXMub3B0aW9ucy5maXhNYXJnaW4gfHwgMSkge1xuXHRcdFx0XHRwYXJhbXMuaW1hZ2Uuc3R5bGUubWFyZ2luTGVmdCA9IChwYXJzZUludChwYXJhbXMuaW1hZ2Uuc3R5bGUubWFyZ2luTGVmdCwxMCl8fDApIC0gTWF0aC5yb3VuZChyYWRpdXMpICsgXCJweFwiO1xuXHRcdFx0XHRwYXJhbXMuaW1hZ2Uuc3R5bGUubWFyZ2luVG9wID0gKHBhcnNlSW50KHBhcmFtcy5pbWFnZS5zdHlsZS5tYXJnaW5Ub3AsMTApfHwwKSAtIE1hdGgucm91bmQocmFkaXVzKSArIFwicHhcIjtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9LFxuXHRjaGVja1N1cHBvcnQgOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gKFBpeGFzdGljLkNsaWVudC5oYXNDYW52YXMoKSB8fCBQaXhhc3RpYy5DbGllbnQuaXNJRSgpKTtcblx0fVxufVxuLypcbiAqIFBpeGFzdGljIExpYiAtIEJyaWdodG5lc3MvQ29udHJhc3QgZmlsdGVyIC0gdjAuMS4xXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDggSmFjb2IgU2VpZGVsaW4sIGpzZWlkZWxpbkBuaWhpbG9naWMuZGssIGh0dHA6Ly9ibG9nLm5paGlsb2dpYy5kay9cbiAqIExpY2Vuc2U6IFtodHRwOi8vd3d3LnBpeGFzdGljLmNvbS9saWIvbGljZW5zZS50eHRdXG4gKi9cblxuUGl4YXN0aWMuQWN0aW9ucy5icmlnaHRuZXNzID0ge1xuXG5cdHByb2Nlc3MgOiBmdW5jdGlvbihwYXJhbXMpIHtcblxuXHRcdHZhciBicmlnaHRuZXNzID0gcGFyc2VJbnQocGFyYW1zLm9wdGlvbnMuYnJpZ2h0bmVzcywxMCkgfHwgMDtcblx0XHR2YXIgY29udHJhc3QgPSBwYXJzZUZsb2F0KHBhcmFtcy5vcHRpb25zLmNvbnRyYXN0KXx8MDtcblx0XHR2YXIgbGVnYWN5ID0gISEocGFyYW1zLm9wdGlvbnMubGVnYWN5ICYmIHBhcmFtcy5vcHRpb25zLmxlZ2FjeSAhPSBcImZhbHNlXCIpO1xuXG5cdFx0aWYgKGxlZ2FjeSkge1xuXHRcdFx0YnJpZ2h0bmVzcyA9IE1hdGgubWluKDE1MCxNYXRoLm1heCgtMTUwLGJyaWdodG5lc3MpKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIGJyaWdodE11bCA9IDEgKyBNYXRoLm1pbigxNTAsTWF0aC5tYXgoLTE1MCxicmlnaHRuZXNzKSkgLyAxNTA7XG5cdFx0fVxuXHRcdGNvbnRyYXN0ID0gTWF0aC5tYXgoMCxjb250cmFzdCsxKTtcblxuXHRcdGlmIChQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzSW1hZ2VEYXRhKCkpIHtcblx0XHRcdHZhciBkYXRhID0gUGl4YXN0aWMucHJlcGFyZURhdGEocGFyYW1zKTtcblx0XHRcdHZhciByZWN0ID0gcGFyYW1zLm9wdGlvbnMucmVjdDtcblx0XHRcdHZhciB3ID0gcmVjdC53aWR0aDtcblx0XHRcdHZhciBoID0gcmVjdC5oZWlnaHQ7XG5cblx0XHRcdHZhciBwID0gdypoO1xuXHRcdFx0dmFyIHBpeCA9IHAqNCwgcGl4MSwgcGl4MjtcblxuXHRcdFx0dmFyIG11bCwgYWRkO1xuXHRcdFx0aWYgKGNvbnRyYXN0ICE9IDEpIHtcblx0XHRcdFx0aWYgKGxlZ2FjeSkge1xuXHRcdFx0XHRcdG11bCA9IGNvbnRyYXN0O1xuXHRcdFx0XHRcdGFkZCA9IChicmlnaHRuZXNzIC0gMTI4KSAqIGNvbnRyYXN0ICsgMTI4O1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG11bCA9IGJyaWdodE11bCAqIGNvbnRyYXN0O1xuXHRcdFx0XHRcdGFkZCA9IC0gY29udHJhc3QgKiAxMjggKyAxMjg7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7ICAvLyB0aGlzIGlmLXRoZW4gaXMgbm90IG5lY2Vzc2FyeSBhbnltb3JlLCBpcyBpdD9cblx0XHRcdFx0aWYgKGxlZ2FjeSkge1xuXHRcdFx0XHRcdG11bCA9IDE7XG5cdFx0XHRcdFx0YWRkID0gYnJpZ2h0bmVzcztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRtdWwgPSBicmlnaHRNdWw7XG5cdFx0XHRcdFx0YWRkID0gMDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dmFyIHIsIGcsIGI7XG5cdFx0XHR3aGlsZSAocC0tKSB7XG5cdFx0XHRcdGlmICgociA9IGRhdGFbcGl4LT00XSAqIG11bCArIGFkZCkgPiAyNTUgKVxuXHRcdFx0XHRcdGRhdGFbcGl4XSA9IDI1NTtcblx0XHRcdFx0ZWxzZSBpZiAociA8IDApXG5cdFx0XHRcdFx0ZGF0YVtwaXhdID0gMDtcblx0XHRcdFx0ZWxzZVxuIFx0XHRcdFx0XHRkYXRhW3BpeF0gPSByO1xuXG5cdFx0XHRcdGlmICgoZyA9IGRhdGFbcGl4MT1waXgrMV0gKiBtdWwgKyBhZGQpID4gMjU1ICkgXG5cdFx0XHRcdFx0ZGF0YVtwaXgxXSA9IDI1NTtcblx0XHRcdFx0ZWxzZSBpZiAoZyA8IDApXG5cdFx0XHRcdFx0ZGF0YVtwaXgxXSA9IDA7XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRkYXRhW3BpeDFdID0gZztcblxuXHRcdFx0XHRpZiAoKGIgPSBkYXRhW3BpeDI9cGl4KzJdICogbXVsICsgYWRkKSA+IDI1NSApIFxuXHRcdFx0XHRcdGRhdGFbcGl4Ml0gPSAyNTU7XG5cdFx0XHRcdGVsc2UgaWYgKGIgPCAwKVxuXHRcdFx0XHRcdGRhdGFbcGl4Ml0gPSAwO1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0ZGF0YVtwaXgyXSA9IGI7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH0sXG5cdGNoZWNrU3VwcG9ydCA6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzSW1hZ2VEYXRhKCk7XG5cdH1cbn1cblxuLypcbiAqIFBpeGFzdGljIExpYiAtIENvbG9yIGFkanVzdCBmaWx0ZXIgLSB2MC4xLjFcbiAqIENvcHlyaWdodCAoYykgMjAwOCBKYWNvYiBTZWlkZWxpbiwganNlaWRlbGluQG5paGlsb2dpYy5kaywgaHR0cDovL2Jsb2cubmloaWxvZ2ljLmRrL1xuICogTGljZW5zZTogW2h0dHA6Ly93d3cucGl4YXN0aWMuY29tL2xpYi9saWNlbnNlLnR4dF1cbiAqL1xuXG5QaXhhc3RpYy5BY3Rpb25zLmNvbG9yYWRqdXN0ID0ge1xuXG5cdHByb2Nlc3MgOiBmdW5jdGlvbihwYXJhbXMpIHtcblx0XHR2YXIgcmVkID0gcGFyc2VGbG9hdChwYXJhbXMub3B0aW9ucy5yZWQpIHx8IDA7XG5cdFx0dmFyIGdyZWVuID0gcGFyc2VGbG9hdChwYXJhbXMub3B0aW9ucy5ncmVlbikgfHwgMDtcblx0XHR2YXIgYmx1ZSA9IHBhcnNlRmxvYXQocGFyYW1zLm9wdGlvbnMuYmx1ZSkgfHwgMDtcblxuXHRcdHJlZCA9IE1hdGgucm91bmQocmVkKjI1NSk7XG5cdFx0Z3JlZW4gPSBNYXRoLnJvdW5kKGdyZWVuKjI1NSk7XG5cdFx0Ymx1ZSA9IE1hdGgucm91bmQoYmx1ZSoyNTUpO1xuXG5cdFx0aWYgKFBpeGFzdGljLkNsaWVudC5oYXNDYW52YXNJbWFnZURhdGEoKSkge1xuXHRcdFx0dmFyIGRhdGEgPSBQaXhhc3RpYy5wcmVwYXJlRGF0YShwYXJhbXMpO1xuXHRcdFx0dmFyIHJlY3QgPSBwYXJhbXMub3B0aW9ucy5yZWN0O1xuXG5cdFx0XHR2YXIgcCA9IHJlY3Qud2lkdGgqcmVjdC5oZWlnaHQ7XG5cdFx0XHR2YXIgcGl4ID0gcCo0LCBwaXgxLCBwaXgyO1xuXG5cdFx0XHR2YXIgciwgZywgYjtcblx0XHRcdHdoaWxlIChwLS0pIHtcblx0XHRcdFx0cGl4IC09IDQ7XG5cblx0XHRcdFx0aWYgKHJlZCkge1xuXHRcdFx0XHRcdGlmICgociA9IGRhdGFbcGl4XSArIHJlZCkgPCAwICkgXG5cdFx0XHRcdFx0XHRkYXRhW3BpeF0gPSAwO1xuXHRcdFx0XHRcdGVsc2UgaWYgKHIgPiAyNTUgKSBcblx0XHRcdFx0XHRcdGRhdGFbcGl4XSA9IDI1NTtcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRkYXRhW3BpeF0gPSByO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGdyZWVuKSB7XG5cdFx0XHRcdFx0aWYgKChnID0gZGF0YVtwaXgxPXBpeCsxXSArIGdyZWVuKSA8IDAgKSBcblx0XHRcdFx0XHRcdGRhdGFbcGl4MV0gPSAwO1xuXHRcdFx0XHRcdGVsc2UgaWYgKGcgPiAyNTUgKSBcblx0XHRcdFx0XHRcdGRhdGFbcGl4MV0gPSAyNTU7XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0ZGF0YVtwaXgxXSA9IGc7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYmx1ZSkge1xuXHRcdFx0XHRcdGlmICgoYiA9IGRhdGFbcGl4Mj1waXgrMl0gKyBibHVlKSA8IDAgKSBcblx0XHRcdFx0XHRcdGRhdGFbcGl4Ml0gPSAwO1xuXHRcdFx0XHRcdGVsc2UgaWYgKGIgPiAyNTUgKSBcblx0XHRcdFx0XHRcdGRhdGFbcGl4Ml0gPSAyNTU7XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0ZGF0YVtwaXgyXSA9IGI7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fSxcblx0Y2hlY2tTdXBwb3J0IDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIChQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzSW1hZ2VEYXRhKCkpO1xuXHR9XG59XG4vKlxuICogUGl4YXN0aWMgTGliIC0gSGlzdG9ncmFtIC0gdjAuMS4wXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDggSmFjb2IgU2VpZGVsaW4sIGpzZWlkZWxpbkBuaWhpbG9naWMuZGssIGh0dHA6Ly9ibG9nLm5paGlsb2dpYy5kay9cbiAqIExpY2Vuc2U6IFtodHRwOi8vd3d3LnBpeGFzdGljLmNvbS9saWIvbGljZW5zZS50eHRdXG4gKi9cblxuXG5QaXhhc3RpYy5BY3Rpb25zLmNvbG9yaGlzdG9ncmFtID0ge1xuXG5cdGFycmF5MjU2IDogZnVuY3Rpb24oZGVmYXVsdF92YWx1ZSkge1xuXHRcdGFyciA9IFtdO1xuXHRcdGZvciAodmFyIGk9MDsgaTwyNTY7IGkrKykgeyBhcnJbaV0gPSBkZWZhdWx0X3ZhbHVlOyB9XG5cdFx0cmV0dXJuIGFyclxuXHR9LFxuIFxuXHRwcm9jZXNzIDogZnVuY3Rpb24ocGFyYW1zKSB7XG5cdFx0dmFyIHZhbHVlcyA9IFtdO1xuXHRcdGlmICh0eXBlb2YgcGFyYW1zLm9wdGlvbnMucmV0dXJuVmFsdWUgIT0gXCJvYmplY3RcIikge1xuXHRcdFx0cGFyYW1zLm9wdGlvbnMucmV0dXJuVmFsdWUgPSB7cnZhbHM6W10sIGd2YWxzOltdLCBidmFsczpbXX07XG5cdFx0fVxuXHRcdHZhciBwYWludCA9ICEhKHBhcmFtcy5vcHRpb25zLnBhaW50KTtcblxuXHRcdHZhciByZXR1cm5WYWx1ZSA9IHBhcmFtcy5vcHRpb25zLnJldHVyblZhbHVlO1xuXHRcdGlmICh0eXBlb2YgcmV0dXJuVmFsdWUudmFsdWVzICE9IFwiYXJyYXlcIikge1xuXHRcdFx0cmV0dXJuVmFsdWUucnZhbHMgPSBbXTtcblx0XHRcdHJldHVyblZhbHVlLmd2YWxzID0gW107XG5cdFx0XHRyZXR1cm5WYWx1ZS5idmFscyA9IFtdO1xuXHRcdH1cbiBcblx0XHRpZiAoUGl4YXN0aWMuQ2xpZW50Lmhhc0NhbnZhc0ltYWdlRGF0YSgpKSB7XG5cdFx0XHR2YXIgZGF0YSA9IFBpeGFzdGljLnByZXBhcmVEYXRhKHBhcmFtcyk7XG5cdFx0XHRwYXJhbXMudXNlRGF0YSA9IGZhbHNlO1xuIFxuXHRcdFx0dmFyIHJ2YWxzID0gdGhpcy5hcnJheTI1NigwKTtcblx0XHRcdHZhciBndmFscyA9IHRoaXMuYXJyYXkyNTYoMCk7XG5cdFx0XHR2YXIgYnZhbHMgPSB0aGlzLmFycmF5MjU2KDApO1xuIFxuXHRcdFx0dmFyIHJlY3QgPSBwYXJhbXMub3B0aW9ucy5yZWN0O1xuXG5cdFx0XHR2YXIgcCA9IHJlY3Qud2lkdGgqcmVjdC5oZWlnaHQ7XG5cdFx0XHR2YXIgcGl4ID0gcCo0O1xuXHRcdFx0d2hpbGUgKHAtLSkge1xuXHRcdFx0XHRydmFsc1tkYXRhW3BpeC09NF1dKys7XG5cdFx0XHRcdGd2YWxzW2RhdGFbcGl4KzFdXSsrO1xuXHRcdFx0XHRidmFsc1tkYXRhW3BpeCsyXV0rKztcblx0XHRcdH1cbiBcblx0XHRcdHJldHVyblZhbHVlLnJ2YWxzID0gcnZhbHM7XG5cdFx0XHRyZXR1cm5WYWx1ZS5ndmFscyA9IGd2YWxzO1xuXHRcdFx0cmV0dXJuVmFsdWUuYnZhbHMgPSBidmFscztcblxuXHRcdFx0aWYgKHBhaW50KSB7XG5cdFx0XHRcdHZhciBjdHggPSBwYXJhbXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcblx0XHRcdFx0dmFyIHZhbHMgPSBbcnZhbHMsIGd2YWxzLCBidmFsc107XG5cdFx0XHRcdGZvciAodmFyIHY9MDt2PDM7disrKSB7XG5cdFx0XHRcdFx0dmFyIHlvZmYgPSAodisxKSAqIHBhcmFtcy5oZWlnaHQgLyAzO1xuXHRcdFx0XHRcdHZhciBtYXhWYWx1ZSA9IDA7XG5cdFx0XHRcdFx0Zm9yICh2YXIgaT0wO2k8MjU2O2krKykge1xuXHRcdFx0XHRcdFx0aWYgKHZhbHNbdl1baV0gPiBtYXhWYWx1ZSlcblx0XHRcdFx0XHRcdFx0bWF4VmFsdWUgPSB2YWxzW3ZdW2ldO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR2YXIgaGVpZ2h0U2NhbGUgPSBwYXJhbXMuaGVpZ2h0IC8gMyAvIG1heFZhbHVlO1xuXHRcdFx0XHRcdHZhciB3aWR0aFNjYWxlID0gcGFyYW1zLndpZHRoIC8gMjU2O1xuXHRcdFx0XHRcdGlmICh2PT0wKSBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDI1NSwwLDAsMC41KVwiO1xuXHRcdFx0XHRcdGVsc2UgaWYgKHY9PTEpIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwyNTUsMCwwLjUpXCI7XG5cdFx0XHRcdFx0ZWxzZSBpZiAodj09MikgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLDAsMjU1LDAuNSlcIjtcblx0XHRcdFx0XHRmb3IgKHZhciBpPTA7aTwyNTY7aSsrKSB7XG5cdFx0XHRcdFx0XHRjdHguZmlsbFJlY3QoXG5cdFx0XHRcdFx0XHRcdGkgKiB3aWR0aFNjYWxlLCBwYXJhbXMuaGVpZ2h0IC0gaGVpZ2h0U2NhbGUgKiB2YWxzW3ZdW2ldIC0gcGFyYW1zLmhlaWdodCArIHlvZmYsXG5cdFx0XHRcdFx0XHRcdHdpZHRoU2NhbGUsIHZhbHNbdl1baV0gKiBoZWlnaHRTY2FsZVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fSxcblxuXHRjaGVja1N1cHBvcnQgOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gUGl4YXN0aWMuQ2xpZW50Lmhhc0NhbnZhc0ltYWdlRGF0YSgpO1xuXHR9XG59LypcbiAqIFBpeGFzdGljIExpYiAtIENyb3AgLSB2MC4xLjFcbiAqIENvcHlyaWdodCAoYykgMjAwOC0yMDA5IEphY29iIFNlaWRlbGluLCBqc2VpZGVsaW5AbmloaWxvZ2ljLmRrLCBodHRwOi8vYmxvZy5uaWhpbG9naWMuZGsvXG4gKiBMaWNlbnNlOiBbaHR0cDovL3d3dy5waXhhc3RpYy5jb20vbGliL2xpY2Vuc2UudHh0XVxuICovXG5cblBpeGFzdGljLkFjdGlvbnMuY3JvcCA9IHtcblx0cHJvY2VzcyA6IGZ1bmN0aW9uKHBhcmFtcykge1xuXHRcdGlmIChQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzKCkpIHtcblx0XHRcdHZhciByZWN0ID0gcGFyYW1zLm9wdGlvbnMucmVjdDtcblxuXHRcdFx0dmFyIHdpZHRoID0gcmVjdC53aWR0aDtcblx0XHRcdHZhciBoZWlnaHQgPSByZWN0LmhlaWdodDtcblx0XHRcdHZhciB0b3AgPSByZWN0LnRvcDtcblx0XHRcdHZhciBsZWZ0ID0gcmVjdC5sZWZ0O1xuXG5cdFx0XHRpZiAodHlwZW9mIHBhcmFtcy5vcHRpb25zLmxlZnQgIT0gXCJ1bmRlZmluZWRcIilcblx0XHRcdFx0bGVmdCA9IHBhcnNlSW50KHBhcmFtcy5vcHRpb25zLmxlZnQsMTApO1xuXHRcdFx0aWYgKHR5cGVvZiBwYXJhbXMub3B0aW9ucy50b3AgIT0gXCJ1bmRlZmluZWRcIilcblx0XHRcdFx0dG9wID0gcGFyc2VJbnQocGFyYW1zLm9wdGlvbnMudG9wLDEwKTtcblx0XHRcdGlmICh0eXBlb2YgcGFyYW1zLm9wdGlvbnMuaGVpZ2h0ICE9IFwidW5kZWZpbmVkXCIpXG5cdFx0XHRcdHdpZHRoID0gcGFyc2VJbnQocGFyYW1zLm9wdGlvbnMud2lkdGgsMTApO1xuXHRcdFx0aWYgKHR5cGVvZiBwYXJhbXMub3B0aW9ucy5oZWlnaHQgIT0gXCJ1bmRlZmluZWRcIilcblx0XHRcdFx0aGVpZ2h0ID0gcGFyc2VJbnQocGFyYW1zLm9wdGlvbnMuaGVpZ2h0LDEwKTtcblxuXHRcdFx0aWYgKGxlZnQgPCAwKSBsZWZ0ID0gMDtcblx0XHRcdGlmIChsZWZ0ID4gcGFyYW1zLndpZHRoLTEpIGxlZnQgPSBwYXJhbXMud2lkdGgtMTtcblxuXHRcdFx0aWYgKHRvcCA8IDApIHRvcCA9IDA7XG5cdFx0XHRpZiAodG9wID4gcGFyYW1zLmhlaWdodC0xKSB0b3AgPSBwYXJhbXMuaGVpZ2h0LTE7XG5cblx0XHRcdGlmICh3aWR0aCA8IDEpIHdpZHRoID0gMTtcblx0XHRcdGlmIChsZWZ0ICsgd2lkdGggPiBwYXJhbXMud2lkdGgpXG5cdFx0XHRcdHdpZHRoID0gcGFyYW1zLndpZHRoIC0gbGVmdDtcblxuXHRcdFx0aWYgKGhlaWdodCA8IDEpIGhlaWdodCA9IDE7XG5cdFx0XHRpZiAodG9wICsgaGVpZ2h0ID4gcGFyYW1zLmhlaWdodClcblx0XHRcdFx0aGVpZ2h0ID0gcGFyYW1zLmhlaWdodCAtIHRvcDtcblxuXHRcdFx0dmFyIGNvcHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuXHRcdFx0Y29weS53aWR0aCA9IHBhcmFtcy53aWR0aDtcblx0XHRcdGNvcHkuaGVpZ2h0ID0gcGFyYW1zLmhlaWdodDtcblx0XHRcdGNvcHkuZ2V0Q29udGV4dChcIjJkXCIpLmRyYXdJbWFnZShwYXJhbXMuY2FudmFzLDAsMCk7XG5cblx0XHRcdHBhcmFtcy5jYW52YXMud2lkdGggPSB3aWR0aDtcblx0XHRcdHBhcmFtcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXHRcdFx0cGFyYW1zLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIikuY2xlYXJSZWN0KDAsMCx3aWR0aCxoZWlnaHQpO1xuXG5cdFx0XHRwYXJhbXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKS5kcmF3SW1hZ2UoY29weSxcblx0XHRcdFx0bGVmdCx0b3Asd2lkdGgsaGVpZ2h0LFxuXHRcdFx0XHQwLDAsd2lkdGgsaGVpZ2h0XG5cdFx0XHQpO1xuXG5cdFx0XHRwYXJhbXMudXNlRGF0YSA9IGZhbHNlO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9LFxuXHRjaGVja1N1cHBvcnQgOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gUGl4YXN0aWMuQ2xpZW50Lmhhc0NhbnZhcygpO1xuXHR9XG59XG5cblxuLypcbiAqIFBpeGFzdGljIExpYiAtIERlc2F0dXJhdGlvbiBmaWx0ZXIgLSB2MC4xLjFcbiAqIENvcHlyaWdodCAoYykgMjAwOCBKYWNvYiBTZWlkZWxpbiwganNlaWRlbGluQG5paGlsb2dpYy5kaywgaHR0cDovL2Jsb2cubmloaWxvZ2ljLmRrL1xuICogTGljZW5zZTogW2h0dHA6Ly93d3cucGl4YXN0aWMuY29tL2xpYi9saWNlbnNlLnR4dF1cbiAqL1xuXG5QaXhhc3RpYy5BY3Rpb25zLmRlc2F0dXJhdGUgPSB7XG5cblx0cHJvY2VzcyA6IGZ1bmN0aW9uKHBhcmFtcykge1xuXHRcdHZhciB1c2VBdmVyYWdlID0gISEocGFyYW1zLm9wdGlvbnMuYXZlcmFnZSAmJiBwYXJhbXMub3B0aW9ucy5hdmVyYWdlICE9IFwiZmFsc2VcIik7XG5cblx0XHRpZiAoUGl4YXN0aWMuQ2xpZW50Lmhhc0NhbnZhc0ltYWdlRGF0YSgpKSB7XG5cdFx0XHR2YXIgZGF0YSA9IFBpeGFzdGljLnByZXBhcmVEYXRhKHBhcmFtcyk7XG5cdFx0XHR2YXIgcmVjdCA9IHBhcmFtcy5vcHRpb25zLnJlY3Q7XG5cdFx0XHR2YXIgdyA9IHJlY3Qud2lkdGg7XG5cdFx0XHR2YXIgaCA9IHJlY3QuaGVpZ2h0O1xuXG5cdFx0XHR2YXIgcCA9IHcqaDtcblx0XHRcdHZhciBwaXggPSBwKjQsIHBpeDEsIHBpeDI7XG5cblx0XHRcdGlmICh1c2VBdmVyYWdlKSB7XG5cdFx0XHRcdHdoaWxlIChwLS0pIFxuXHRcdFx0XHRcdGRhdGFbcGl4LT00XSA9IGRhdGFbcGl4MT1waXgrMV0gPSBkYXRhW3BpeDI9cGl4KzJdID0gKGRhdGFbcGl4XStkYXRhW3BpeDFdK2RhdGFbcGl4Ml0pLzNcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHdoaWxlIChwLS0pXG5cdFx0XHRcdFx0ZGF0YVtwaXgtPTRdID0gZGF0YVtwaXgxPXBpeCsxXSA9IGRhdGFbcGl4Mj1waXgrMl0gPSAoZGF0YVtwaXhdKjAuMyArIGRhdGFbcGl4MV0qMC41OSArIGRhdGFbcGl4Ml0qMC4xMSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGVsc2UgaWYgKFBpeGFzdGljLkNsaWVudC5pc0lFKCkpIHtcblx0XHRcdHBhcmFtcy5pbWFnZS5zdHlsZS5maWx0ZXIgKz0gXCIgZ3JheVwiO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9LFxuXHRjaGVja1N1cHBvcnQgOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gKFBpeGFzdGljLkNsaWVudC5oYXNDYW52YXNJbWFnZURhdGEoKSB8fCBQaXhhc3RpYy5DbGllbnQuaXNJRSgpKTtcblx0fVxufS8qXG4gKiBQaXhhc3RpYyBMaWIgLSBFZGdlIGRldGVjdGlvbiBmaWx0ZXIgLSB2MC4xLjFcbiAqIENvcHlyaWdodCAoYykgMjAwOCBKYWNvYiBTZWlkZWxpbiwganNlaWRlbGluQG5paGlsb2dpYy5kaywgaHR0cDovL2Jsb2cubmloaWxvZ2ljLmRrL1xuICogTGljZW5zZTogW2h0dHA6Ly93d3cucGl4YXN0aWMuY29tL2xpYi9saWNlbnNlLnR4dF1cbiAqL1xuXG5QaXhhc3RpYy5BY3Rpb25zLmVkZ2VzID0ge1xuXHRwcm9jZXNzIDogZnVuY3Rpb24ocGFyYW1zKSB7XG5cblx0XHR2YXIgbW9ubyA9ICEhKHBhcmFtcy5vcHRpb25zLm1vbm8gJiYgcGFyYW1zLm9wdGlvbnMubW9ubyAhPSBcImZhbHNlXCIpO1xuXHRcdHZhciBpbnZlcnQgPSAhIShwYXJhbXMub3B0aW9ucy5pbnZlcnQgJiYgcGFyYW1zLm9wdGlvbnMuaW52ZXJ0ICE9IFwiZmFsc2VcIik7XG5cblx0XHRpZiAoUGl4YXN0aWMuQ2xpZW50Lmhhc0NhbnZhc0ltYWdlRGF0YSgpKSB7XG5cdFx0XHR2YXIgZGF0YSA9IFBpeGFzdGljLnByZXBhcmVEYXRhKHBhcmFtcyk7XG5cdFx0XHR2YXIgZGF0YUNvcHkgPSBQaXhhc3RpYy5wcmVwYXJlRGF0YShwYXJhbXMsIHRydWUpXG5cblx0XHRcdHZhciBjID0gLTEvODtcblx0XHRcdHZhciBrZXJuZWwgPSBbXG5cdFx0XHRcdFtjLCBcdGMsIFx0Y10sXG5cdFx0XHRcdFtjLCBcdDEsIFx0Y10sXG5cdFx0XHRcdFtjLCBcdGMsIFx0Y11cblx0XHRcdF07XG5cblx0XHRcdHdlaWdodCA9IDEvYztcblxuXHRcdFx0dmFyIHJlY3QgPSBwYXJhbXMub3B0aW9ucy5yZWN0O1xuXHRcdFx0dmFyIHcgPSByZWN0LndpZHRoO1xuXHRcdFx0dmFyIGggPSByZWN0LmhlaWdodDtcblxuXHRcdFx0dmFyIHc0ID0gdyo0O1xuXHRcdFx0dmFyIHkgPSBoO1xuXHRcdFx0ZG8ge1xuXHRcdFx0XHR2YXIgb2Zmc2V0WSA9ICh5LTEpKnc0O1xuXG5cdFx0XHRcdHZhciBuZXh0WSA9ICh5ID09IGgpID8geSAtIDEgOiB5O1xuXHRcdFx0XHR2YXIgcHJldlkgPSAoeSA9PSAxKSA/IDAgOiB5LTI7XG5cblx0XHRcdFx0dmFyIG9mZnNldFlQcmV2ID0gcHJldlkqdyo0O1xuXHRcdFx0XHR2YXIgb2Zmc2V0WU5leHQgPSBuZXh0WSp3KjQ7XG5cblx0XHRcdFx0dmFyIHggPSB3O1xuXHRcdFx0XHRkbyB7XG5cdFx0XHRcdFx0dmFyIG9mZnNldCA9IG9mZnNldFkgKyAoeCo0LTQpO1xuXG5cdFx0XHRcdFx0dmFyIG9mZnNldFByZXYgPSBvZmZzZXRZUHJldiArICgoeCA9PSAxKSA/IDAgOiB4LTIpICogNDtcblx0XHRcdFx0XHR2YXIgb2Zmc2V0TmV4dCA9IG9mZnNldFlOZXh0ICsgKCh4ID09IHcpID8geC0xIDogeCkgKiA0O1xuXHRcblx0XHRcdFx0XHR2YXIgciA9ICgoZGF0YUNvcHlbb2Zmc2V0UHJldi00XVxuXHRcdFx0XHRcdFx0KyBkYXRhQ29weVtvZmZzZXRQcmV2XVxuXHRcdFx0XHRcdFx0KyBkYXRhQ29weVtvZmZzZXRQcmV2KzRdXG5cdFx0XHRcdFx0XHQrIGRhdGFDb3B5W29mZnNldC00XVxuXHRcdFx0XHRcdFx0KyBkYXRhQ29weVtvZmZzZXQrNF1cblx0XHRcdFx0XHRcdCsgZGF0YUNvcHlbb2Zmc2V0TmV4dC00XVxuXHRcdFx0XHRcdFx0KyBkYXRhQ29weVtvZmZzZXROZXh0XVxuXHRcdFx0XHRcdFx0KyBkYXRhQ29weVtvZmZzZXROZXh0KzRdKSAqIGNcblx0XHRcdFx0XHRcdCsgZGF0YUNvcHlbb2Zmc2V0XVxuXHRcdFx0XHRcdFx0KSBcblx0XHRcdFx0XHRcdCogd2VpZ2h0O1xuXHRcblx0XHRcdFx0XHR2YXIgZyA9ICgoZGF0YUNvcHlbb2Zmc2V0UHJldi0zXVxuXHRcdFx0XHRcdFx0KyBkYXRhQ29weVtvZmZzZXRQcmV2KzFdXG5cdFx0XHRcdFx0XHQrIGRhdGFDb3B5W29mZnNldFByZXYrNV1cblx0XHRcdFx0XHRcdCsgZGF0YUNvcHlbb2Zmc2V0LTNdXG5cdFx0XHRcdFx0XHQrIGRhdGFDb3B5W29mZnNldCs1XVxuXHRcdFx0XHRcdFx0KyBkYXRhQ29weVtvZmZzZXROZXh0LTNdXG5cdFx0XHRcdFx0XHQrIGRhdGFDb3B5W29mZnNldE5leHQrMV1cblx0XHRcdFx0XHRcdCsgZGF0YUNvcHlbb2Zmc2V0TmV4dCs1XSkgKiBjXG5cdFx0XHRcdFx0XHQrIGRhdGFDb3B5W29mZnNldCsxXSlcblx0XHRcdFx0XHRcdCogd2VpZ2h0O1xuXHRcblx0XHRcdFx0XHR2YXIgYiA9ICgoZGF0YUNvcHlbb2Zmc2V0UHJldi0yXVxuXHRcdFx0XHRcdFx0KyBkYXRhQ29weVtvZmZzZXRQcmV2KzJdXG5cdFx0XHRcdFx0XHQrIGRhdGFDb3B5W29mZnNldFByZXYrNl1cblx0XHRcdFx0XHRcdCsgZGF0YUNvcHlbb2Zmc2V0LTJdXG5cdFx0XHRcdFx0XHQrIGRhdGFDb3B5W29mZnNldCs2XVxuXHRcdFx0XHRcdFx0KyBkYXRhQ29weVtvZmZzZXROZXh0LTJdXG5cdFx0XHRcdFx0XHQrIGRhdGFDb3B5W29mZnNldE5leHQrMl1cblx0XHRcdFx0XHRcdCsgZGF0YUNvcHlbb2Zmc2V0TmV4dCs2XSkgKiBjXG5cdFx0XHRcdFx0XHQrIGRhdGFDb3B5W29mZnNldCsyXSlcblx0XHRcdFx0XHRcdCogd2VpZ2h0O1xuXG5cdFx0XHRcdFx0aWYgKG1vbm8pIHtcblx0XHRcdFx0XHRcdHZhciBicmlnaHRuZXNzID0gKHIqMC4zICsgZyowLjU5ICsgYiowLjExKXx8MDtcblx0XHRcdFx0XHRcdGlmIChpbnZlcnQpIGJyaWdodG5lc3MgPSAyNTUgLSBicmlnaHRuZXNzO1xuXHRcdFx0XHRcdFx0aWYgKGJyaWdodG5lc3MgPCAwICkgYnJpZ2h0bmVzcyA9IDA7XG5cdFx0XHRcdFx0XHRpZiAoYnJpZ2h0bmVzcyA+IDI1NSApIGJyaWdodG5lc3MgPSAyNTU7XG5cdFx0XHRcdFx0XHRyID0gZyA9IGIgPSBicmlnaHRuZXNzO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpZiAoaW52ZXJ0KSB7XG5cdFx0XHRcdFx0XHRcdHIgPSAyNTUgLSByO1xuXHRcdFx0XHRcdFx0XHRnID0gMjU1IC0gZztcblx0XHRcdFx0XHRcdFx0YiA9IDI1NSAtIGI7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAociA8IDAgKSByID0gMDtcblx0XHRcdFx0XHRcdGlmIChnIDwgMCApIGcgPSAwO1xuXHRcdFx0XHRcdFx0aWYgKGIgPCAwICkgYiA9IDA7XG5cdFx0XHRcdFx0XHRpZiAociA+IDI1NSApIHIgPSAyNTU7XG5cdFx0XHRcdFx0XHRpZiAoZyA+IDI1NSApIGcgPSAyNTU7XG5cdFx0XHRcdFx0XHRpZiAoYiA+IDI1NSApIGIgPSAyNTU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0ZGF0YVtvZmZzZXRdID0gcjtcblx0XHRcdFx0XHRkYXRhW29mZnNldCsxXSA9IGc7XG5cdFx0XHRcdFx0ZGF0YVtvZmZzZXQrMl0gPSBiO1xuXG5cdFx0XHRcdH0gd2hpbGUgKC0teCk7XG5cdFx0XHR9IHdoaWxlICgtLXkpO1xuXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH0sXG5cdGNoZWNrU3VwcG9ydCA6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzSW1hZ2VEYXRhKCk7XG5cdH1cbn0vKlxuICogUGl4YXN0aWMgTGliIC0gRWRnZSBkZXRlY3Rpb24gMiAtIHYwLjEuMFxuICogQ29weXJpZ2h0IChjKSAyMDA4IEphY29iIFNlaWRlbGluLCBqc2VpZGVsaW5AbmloaWxvZ2ljLmRrLCBodHRwOi8vYmxvZy5uaWhpbG9naWMuZGsvXG4gKiBMaWNlbnNlOiBbaHR0cDovL3d3dy5waXhhc3RpYy5jb20vbGliL2xpY2Vuc2UudHh0XVxuICogXG4gKiBDb250cmlidXRpb24gYnkgT2xpdmVyIEh1bnQgKGh0dHA6Ly9uZXJnZXQuY29tLywgaHR0cDovL25lcmdldC5jb20vY2FudmFzL2VkZ2VEZXRlY3Rpb24uanMpLiBUaGFua3MgT2xpdmVyIVxuICpcbiAqL1xuXG5QaXhhc3RpYy5BY3Rpb25zLmVkZ2VzMiA9IHtcblx0cHJvY2VzcyA6IGZ1bmN0aW9uKHBhcmFtcykge1xuXG5cdFx0aWYgKFBpeGFzdGljLkNsaWVudC5oYXNDYW52YXNJbWFnZURhdGEoKSkge1xuXHRcdFx0dmFyIGRhdGEgPSBQaXhhc3RpYy5wcmVwYXJlRGF0YShwYXJhbXMpO1xuXHRcdFx0dmFyIGRhdGFDb3B5ID0gUGl4YXN0aWMucHJlcGFyZURhdGEocGFyYW1zLCB0cnVlKVxuXG5cdFx0XHR2YXIgcmVjdCA9IHBhcmFtcy5vcHRpb25zLnJlY3Q7XG5cdFx0XHR2YXIgdyA9IHJlY3Qud2lkdGg7XG5cdFx0XHR2YXIgaCA9IHJlY3QuaGVpZ2h0O1xuXG5cdFx0XHR2YXIgdzQgPSB3ICogNDtcblx0XHRcdHZhciBwaXhlbCA9IHc0ICsgNDsgLy8gU3RhcnQgYXQgKDEsMSlcblx0XHRcdHZhciBobTEgPSBoIC0gMTtcblx0XHRcdHZhciB3bTEgPSB3IC0gMTtcblx0XHRcdGZvciAodmFyIHkgPSAxOyB5IDwgaG0xOyArK3kpIHtcblx0XHRcdFx0Ly8gUHJlcGFyZSBpbml0aWFsIGNhY2hlZCB2YWx1ZXMgZm9yIGN1cnJlbnQgcm93XG5cdFx0XHRcdHZhciBjZW50ZXJSb3cgPSBwaXhlbCAtIDQ7XG5cdFx0XHRcdHZhciBwcmlvclJvdyA9IGNlbnRlclJvdyAtIHc0O1xuXHRcdFx0XHR2YXIgbmV4dFJvdyA9IGNlbnRlclJvdyArIHc0O1xuXHRcdFx0XHRcblx0XHRcdFx0dmFyIHIxID0gLSBkYXRhQ29weVtwcmlvclJvd10gICAtIGRhdGFDb3B5W2NlbnRlclJvd10gICAtIGRhdGFDb3B5W25leHRSb3ddO1xuXHRcdFx0XHR2YXIgZzEgPSAtIGRhdGFDb3B5WysrcHJpb3JSb3ddIC0gZGF0YUNvcHlbKytjZW50ZXJSb3ddIC0gZGF0YUNvcHlbKytuZXh0Um93XTtcblx0XHRcdFx0dmFyIGIxID0gLSBkYXRhQ29weVsrK3ByaW9yUm93XSAtIGRhdGFDb3B5WysrY2VudGVyUm93XSAtIGRhdGFDb3B5WysrbmV4dFJvd107XG5cdFx0XHRcdFxuXHRcdFx0XHR2YXIgcnAgPSBkYXRhQ29weVtwcmlvclJvdyArPSAyXTtcblx0XHRcdFx0dmFyIGdwID0gZGF0YUNvcHlbKytwcmlvclJvd107XG5cdFx0XHRcdHZhciBicCA9IGRhdGFDb3B5WysrcHJpb3JSb3ddO1xuXHRcdFx0XHRcblx0XHRcdFx0dmFyIHJjID0gZGF0YUNvcHlbY2VudGVyUm93ICs9IDJdO1xuXHRcdFx0XHR2YXIgZ2MgPSBkYXRhQ29weVsrK2NlbnRlclJvd107XG5cdFx0XHRcdHZhciBiYyA9IGRhdGFDb3B5WysrY2VudGVyUm93XTtcblx0XHRcdFx0XG5cdFx0XHRcdHZhciBybiA9IGRhdGFDb3B5W25leHRSb3cgKz0gMl07XG5cdFx0XHRcdHZhciBnbiA9IGRhdGFDb3B5WysrbmV4dFJvd107XG5cdFx0XHRcdHZhciBibiA9IGRhdGFDb3B5WysrbmV4dFJvd107XG5cdFx0XHRcdFxuXHRcdFx0XHR2YXIgcjIgPSAtIHJwIC0gcmMgLSBybjtcblx0XHRcdFx0dmFyIGcyID0gLSBncCAtIGdjIC0gZ247XG5cdFx0XHRcdHZhciBiMiA9IC0gYnAgLSBiYyAtIGJuO1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8gTWFpbiBjb252b2x1dGlvbiBsb29wXG5cdFx0XHRcdGZvciAodmFyIHggPSAxOyB4IDwgd20xOyArK3gpIHtcblx0XHRcdFx0XHRjZW50ZXJSb3cgPSBwaXhlbCArIDQ7XG5cdFx0XHRcdFx0cHJpb3JSb3cgPSBjZW50ZXJSb3cgLSB3NDtcblx0XHRcdFx0XHRuZXh0Um93ID0gY2VudGVyUm93ICsgdzQ7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0dmFyIHIgPSAxMjcgKyByMSAtIHJwIC0gKHJjICogLTgpIC0gcm47XG5cdFx0XHRcdFx0dmFyIGcgPSAxMjcgKyBnMSAtIGdwIC0gKGdjICogLTgpIC0gZ247XG5cdFx0XHRcdFx0dmFyIGIgPSAxMjcgKyBiMSAtIGJwIC0gKGJjICogLTgpIC0gYm47XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0cjEgPSByMjtcblx0XHRcdFx0XHRnMSA9IGcyO1xuXHRcdFx0XHRcdGIxID0gYjI7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0cnAgPSBkYXRhQ29weVsgIHByaW9yUm93XTtcblx0XHRcdFx0XHRncCA9IGRhdGFDb3B5WysrcHJpb3JSb3ddO1xuXHRcdFx0XHRcdGJwID0gZGF0YUNvcHlbKytwcmlvclJvd107XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0cmMgPSBkYXRhQ29weVsgIGNlbnRlclJvd107XG5cdFx0XHRcdFx0Z2MgPSBkYXRhQ29weVsrK2NlbnRlclJvd107XG5cdFx0XHRcdFx0YmMgPSBkYXRhQ29weVsrK2NlbnRlclJvd107XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0cm4gPSBkYXRhQ29weVsgIG5leHRSb3ddO1xuXHRcdFx0XHRcdGduID0gZGF0YUNvcHlbKytuZXh0Um93XTtcblx0XHRcdFx0XHRibiA9IGRhdGFDb3B5WysrbmV4dFJvd107XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0ciArPSAocjIgPSAtIHJwIC0gcmMgLSBybik7XG5cdFx0XHRcdFx0ZyArPSAoZzIgPSAtIGdwIC0gZ2MgLSBnbik7XG5cdFx0XHRcdFx0YiArPSAoYjIgPSAtIGJwIC0gYmMgLSBibik7XG5cblx0XHRcdFx0XHRpZiAociA+IDI1NSkgciA9IDI1NTtcblx0XHRcdFx0XHRpZiAoZyA+IDI1NSkgZyA9IDI1NTtcblx0XHRcdFx0XHRpZiAoYiA+IDI1NSkgYiA9IDI1NTtcblx0XHRcdFx0XHRpZiAociA8IDApIHIgPSAwO1xuXHRcdFx0XHRcdGlmIChnIDwgMCkgZyA9IDA7XG5cdFx0XHRcdFx0aWYgKGIgPCAwKSBiID0gMDtcblxuXHRcdFx0XHRcdGRhdGFbcGl4ZWxdID0gcjtcblx0XHRcdFx0XHRkYXRhWysrcGl4ZWxdID0gZztcblx0XHRcdFx0XHRkYXRhWysrcGl4ZWxdID0gYjtcblx0XHRcdFx0XHQvL2RhdGFbKytwaXhlbF0gPSAyNTU7IC8vIGFscGhhXG5cblx0XHRcdFx0XHRwaXhlbCs9Mjtcblx0XHRcdFx0fVxuXHRcdFx0XHRwaXhlbCArPSA4O1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9LFxuXHRjaGVja1N1cHBvcnQgOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gUGl4YXN0aWMuQ2xpZW50Lmhhc0NhbnZhc0ltYWdlRGF0YSgpO1xuXHR9XG59LypcbiAqIFBpeGFzdGljIExpYiAtIEVtYm9zcyBmaWx0ZXIgLSB2MC4xLjBcbiAqIENvcHlyaWdodCAoYykgMjAwOCBKYWNvYiBTZWlkZWxpbiwganNlaWRlbGluQG5paGlsb2dpYy5kaywgaHR0cDovL2Jsb2cubmloaWxvZ2ljLmRrL1xuICogTGljZW5zZTogW2h0dHA6Ly93d3cucGl4YXN0aWMuY29tL2xpYi9saWNlbnNlLnR4dF1cbiAqL1xuXG5QaXhhc3RpYy5BY3Rpb25zLmVtYm9zcyA9IHtcblx0cHJvY2VzcyA6IGZ1bmN0aW9uKHBhcmFtcykge1xuXG5cdFx0dmFyIHN0cmVuZ3RoID0gcGFyc2VGbG9hdChwYXJhbXMub3B0aW9ucy5zdHJlbmd0aCl8fDE7XG5cdFx0dmFyIGdyZXlMZXZlbCA9IHR5cGVvZiBwYXJhbXMub3B0aW9ucy5ncmV5TGV2ZWwgIT0gXCJ1bmRlZmluZWRcIiA/IHBhcnNlSW50KHBhcmFtcy5vcHRpb25zLmdyZXlMZXZlbCkgOiAxODA7XG5cdFx0dmFyIGRpcmVjdGlvbiA9IHBhcmFtcy5vcHRpb25zLmRpcmVjdGlvbnx8XCJ0b3BsZWZ0XCI7XG5cdFx0dmFyIGJsZW5kID0gISEocGFyYW1zLm9wdGlvbnMuYmxlbmQgJiYgcGFyYW1zLm9wdGlvbnMuYmxlbmQgIT0gXCJmYWxzZVwiKTtcblxuXHRcdHZhciBkaXJZID0gMDtcblx0XHR2YXIgZGlyWCA9IDA7XG5cblx0XHRzd2l0Y2ggKGRpcmVjdGlvbikge1xuXHRcdFx0Y2FzZSBcInRvcGxlZnRcIjpcdFx0XHQvLyB0b3AgbGVmdFxuXHRcdFx0XHRkaXJZID0gLTE7XG5cdFx0XHRcdGRpclggPSAtMTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwidG9wXCI6XHRcdFx0Ly8gdG9wXG5cdFx0XHRcdGRpclkgPSAtMTtcblx0XHRcdFx0ZGlyWCA9IDA7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcInRvcHJpZ2h0XCI6XHRcdFx0Ly8gdG9wIHJpZ2h0XG5cdFx0XHRcdGRpclkgPSAtMTtcblx0XHRcdFx0ZGlyWCA9IDE7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcInJpZ2h0XCI6XHRcdFx0Ly8gcmlnaHRcblx0XHRcdFx0ZGlyWSA9IDA7XG5cdFx0XHRcdGRpclggPSAxO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJib3R0b21yaWdodFwiOlx0XHRcdC8vIGJvdHRvbSByaWdodFxuXHRcdFx0XHRkaXJZID0gMTtcblx0XHRcdFx0ZGlyWCA9IDE7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImJvdHRvbVwiOlx0XHRcdC8vIGJvdHRvbVxuXHRcdFx0XHRkaXJZID0gMTtcblx0XHRcdFx0ZGlyWCA9IDA7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImJvdHRvbWxlZnRcIjpcdFx0XHQvLyBib3R0b20gbGVmdFxuXHRcdFx0XHRkaXJZID0gMTtcblx0XHRcdFx0ZGlyWCA9IC0xO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJsZWZ0XCI6XHRcdFx0Ly8gbGVmdFxuXHRcdFx0XHRkaXJZID0gMDtcblx0XHRcdFx0ZGlyWCA9IC0xO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRpZiAoUGl4YXN0aWMuQ2xpZW50Lmhhc0NhbnZhc0ltYWdlRGF0YSgpKSB7XG5cdFx0XHR2YXIgZGF0YSA9IFBpeGFzdGljLnByZXBhcmVEYXRhKHBhcmFtcyk7XG5cdFx0XHR2YXIgZGF0YUNvcHkgPSBQaXhhc3RpYy5wcmVwYXJlRGF0YShwYXJhbXMsIHRydWUpXG5cblx0XHRcdHZhciBpbnZlcnRBbHBoYSA9ICEhcGFyYW1zLm9wdGlvbnMuaW52ZXJ0QWxwaGE7XG5cdFx0XHR2YXIgcmVjdCA9IHBhcmFtcy5vcHRpb25zLnJlY3Q7XG5cdFx0XHR2YXIgdyA9IHJlY3Qud2lkdGg7XG5cdFx0XHR2YXIgaCA9IHJlY3QuaGVpZ2h0O1xuXG5cdFx0XHR2YXIgdzQgPSB3KjQ7XG5cdFx0XHR2YXIgeSA9IGg7XG5cdFx0XHRkbyB7XG5cdFx0XHRcdHZhciBvZmZzZXRZID0gKHktMSkqdzQ7XG5cblx0XHRcdFx0dmFyIG90aGVyWSA9IGRpclk7XG5cdFx0XHRcdGlmICh5ICsgb3RoZXJZIDwgMSkgb3RoZXJZID0gMDtcblx0XHRcdFx0aWYgKHkgKyBvdGhlclkgPiBoKSBvdGhlclkgPSAwO1xuXG5cdFx0XHRcdHZhciBvZmZzZXRZT3RoZXIgPSAoeS0xK290aGVyWSkqdyo0O1xuXG5cdFx0XHRcdHZhciB4ID0gdztcblx0XHRcdFx0ZG8ge1xuXHRcdFx0XHRcdFx0dmFyIG9mZnNldCA9IG9mZnNldFkgKyAoeC0xKSo0O1xuXG5cdFx0XHRcdFx0XHR2YXIgb3RoZXJYID0gZGlyWDtcblx0XHRcdFx0XHRcdGlmICh4ICsgb3RoZXJYIDwgMSkgb3RoZXJYID0gMDtcblx0XHRcdFx0XHRcdGlmICh4ICsgb3RoZXJYID4gdykgb3RoZXJYID0gMDtcblxuXHRcdFx0XHRcdFx0dmFyIG9mZnNldE90aGVyID0gb2Zmc2V0WU90aGVyICsgKHgtMStvdGhlclgpKjQ7XG5cblx0XHRcdFx0XHRcdHZhciBkUiA9IGRhdGFDb3B5W29mZnNldF0gLSBkYXRhQ29weVtvZmZzZXRPdGhlcl07XG5cdFx0XHRcdFx0XHR2YXIgZEcgPSBkYXRhQ29weVtvZmZzZXQrMV0gLSBkYXRhQ29weVtvZmZzZXRPdGhlcisxXTtcblx0XHRcdFx0XHRcdHZhciBkQiA9IGRhdGFDb3B5W29mZnNldCsyXSAtIGRhdGFDb3B5W29mZnNldE90aGVyKzJdO1xuXG5cdFx0XHRcdFx0XHR2YXIgZGlmID0gZFI7XG5cdFx0XHRcdFx0XHR2YXIgYWJzRGlmID0gZGlmID4gMCA/IGRpZiA6IC1kaWY7XG5cblx0XHRcdFx0XHRcdHZhciBhYnNHID0gZEcgPiAwID8gZEcgOiAtZEc7XG5cdFx0XHRcdFx0XHR2YXIgYWJzQiA9IGRCID4gMCA/IGRCIDogLWRCO1xuXG5cdFx0XHRcdFx0XHRpZiAoYWJzRyA+IGFic0RpZikge1xuXHRcdFx0XHRcdFx0XHRkaWYgPSBkRztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmIChhYnNCID4gYWJzRGlmKSB7XG5cdFx0XHRcdFx0XHRcdGRpZiA9IGRCO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRkaWYgKj0gc3RyZW5ndGg7XG5cblx0XHRcdFx0XHRcdGlmIChibGVuZCkge1xuXHRcdFx0XHRcdFx0XHR2YXIgciA9IGRhdGFbb2Zmc2V0XSArIGRpZjtcblx0XHRcdFx0XHRcdFx0dmFyIGcgPSBkYXRhW29mZnNldCsxXSArIGRpZjtcblx0XHRcdFx0XHRcdFx0dmFyIGIgPSBkYXRhW29mZnNldCsyXSArIGRpZjtcblxuXHRcdFx0XHRcdFx0XHRkYXRhW29mZnNldF0gPSAociA+IDI1NSkgPyAyNTUgOiAociA8IDAgPyAwIDogcik7XG5cdFx0XHRcdFx0XHRcdGRhdGFbb2Zmc2V0KzFdID0gKGcgPiAyNTUpID8gMjU1IDogKGcgPCAwID8gMCA6IGcpO1xuXHRcdFx0XHRcdFx0XHRkYXRhW29mZnNldCsyXSA9IChiID4gMjU1KSA/IDI1NSA6IChiIDwgMCA/IDAgOiBiKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHZhciBncmV5ID0gZ3JleUxldmVsIC0gZGlmO1xuXHRcdFx0XHRcdFx0XHRpZiAoZ3JleSA8IDApIHtcblx0XHRcdFx0XHRcdFx0XHRncmV5ID0gMDtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChncmV5ID4gMjU1KSB7XG5cdFx0XHRcdFx0XHRcdFx0Z3JleSA9IDI1NTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGRhdGFbb2Zmc2V0XSA9IGRhdGFbb2Zmc2V0KzFdID0gZGF0YVtvZmZzZXQrMl0gPSBncmV5O1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0gd2hpbGUgKC0teCk7XG5cdFx0XHR9IHdoaWxlICgtLXkpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cblx0XHR9IGVsc2UgaWYgKFBpeGFzdGljLkNsaWVudC5pc0lFKCkpIHtcblx0XHRcdHBhcmFtcy5pbWFnZS5zdHlsZS5maWx0ZXIgKz0gXCIgcHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LmVtYm9zcygpXCI7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH0sXG5cdGNoZWNrU3VwcG9ydCA6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAoUGl4YXN0aWMuQ2xpZW50Lmhhc0NhbnZhc0ltYWdlRGF0YSgpIHx8IFBpeGFzdGljLkNsaWVudC5pc0lFKCkpO1xuXHR9XG5cbn1cbi8qXG4gKiBQaXhhc3RpYyBMaWIgLSBGbGlwIC0gdjAuMS4wXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDggSmFjb2IgU2VpZGVsaW4sIGpzZWlkZWxpbkBuaWhpbG9naWMuZGssIGh0dHA6Ly9ibG9nLm5paGlsb2dpYy5kay9cbiAqIExpY2Vuc2U6IFtodHRwOi8vd3d3LnBpeGFzdGljLmNvbS9saWIvbGljZW5zZS50eHRdXG4gKi9cblxuUGl4YXN0aWMuQWN0aW9ucy5mbGlwID0ge1xuXHRwcm9jZXNzIDogZnVuY3Rpb24ocGFyYW1zKSB7XG5cdFx0dmFyIHJlY3QgPSBwYXJhbXMub3B0aW9ucy5yZWN0O1xuXHRcdHZhciBjb3B5Q2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcblx0XHRjb3B5Q2FudmFzLndpZHRoID0gcmVjdC53aWR0aDtcblx0XHRjb3B5Q2FudmFzLmhlaWdodCA9IHJlY3QuaGVpZ2h0O1xuXHRcdGNvcHlDYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpLmRyYXdJbWFnZShwYXJhbXMuaW1hZ2UsIHJlY3QubGVmdCwgcmVjdC50b3AsIHJlY3Qud2lkdGgsIHJlY3QuaGVpZ2h0LCAwLCAwLCByZWN0LndpZHRoLCByZWN0LmhlaWdodCk7XG5cblx0XHR2YXIgY3R4ID0gcGFyYW1zLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG5cdFx0Y3R4LmNsZWFyUmVjdChyZWN0LmxlZnQsIHJlY3QudG9wLCByZWN0LndpZHRoLCByZWN0LmhlaWdodCk7XG5cblx0XHRpZiAocGFyYW1zLm9wdGlvbnMuYXhpcyA9PSBcImhvcml6b250YWxcIikge1xuXHRcdFx0Y3R4LnNjYWxlKC0xLDEpO1xuXHRcdFx0Y3R4LmRyYXdJbWFnZShjb3B5Q2FudmFzLCAtcmVjdC5sZWZ0LXJlY3Qud2lkdGgsIHJlY3QudG9wLCByZWN0LndpZHRoLCByZWN0LmhlaWdodClcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y3R4LnNjYWxlKDEsLTEpO1xuXHRcdFx0Y3R4LmRyYXdJbWFnZShjb3B5Q2FudmFzLCByZWN0LmxlZnQsIC1yZWN0LnRvcC1yZWN0LmhlaWdodCwgcmVjdC53aWR0aCwgcmVjdC5oZWlnaHQpXG5cdFx0fVxuXG5cdFx0cGFyYW1zLnVzZURhdGEgPSBmYWxzZTtcblxuXHRcdHJldHVybiB0cnVlO1x0XHRcblx0fSxcblx0Y2hlY2tTdXBwb3J0IDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIFBpeGFzdGljLkNsaWVudC5oYXNDYW52YXMoKTtcblx0fVxufVxuXG4vKlxuICogUGl4YXN0aWMgTGliIC0gSG9yaXpvbnRhbCBmbGlwIC0gdjAuMS4wXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDggSmFjb2IgU2VpZGVsaW4sIGpzZWlkZWxpbkBuaWhpbG9naWMuZGssIGh0dHA6Ly9ibG9nLm5paGlsb2dpYy5kay9cbiAqIExpY2Vuc2U6IFtodHRwOi8vd3d3LnBpeGFzdGljLmNvbS9saWIvbGljZW5zZS50eHRdXG4gKi9cblxuUGl4YXN0aWMuQWN0aW9ucy5mbGlwaCA9IHtcblx0cHJvY2VzcyA6IGZ1bmN0aW9uKHBhcmFtcykge1xuXHRcdGlmIChQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzKCkpIHtcblx0XHRcdHZhciByZWN0ID0gcGFyYW1zLm9wdGlvbnMucmVjdDtcblx0XHRcdHZhciBjb3B5Q2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcblx0XHRcdGNvcHlDYW52YXMud2lkdGggPSByZWN0LndpZHRoO1xuXHRcdFx0Y29weUNhbnZhcy5oZWlnaHQgPSByZWN0LmhlaWdodDtcblx0XHRcdGNvcHlDYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpLmRyYXdJbWFnZShwYXJhbXMuaW1hZ2UsIHJlY3QubGVmdCwgcmVjdC50b3AsIHJlY3Qud2lkdGgsIHJlY3QuaGVpZ2h0LCAwLCAwLCByZWN0LndpZHRoLCByZWN0LmhlaWdodCk7XG5cblx0XHRcdHZhciBjdHggPSBwYXJhbXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcblx0XHRcdGN0eC5jbGVhclJlY3QocmVjdC5sZWZ0LCByZWN0LnRvcCwgcmVjdC53aWR0aCwgcmVjdC5oZWlnaHQpO1xuXHRcdFx0Y3R4LnNjYWxlKC0xLDEpO1xuXHRcdFx0Y3R4LmRyYXdJbWFnZShjb3B5Q2FudmFzLCAtcmVjdC5sZWZ0LXJlY3Qud2lkdGgsIHJlY3QudG9wLCByZWN0LndpZHRoLCByZWN0LmhlaWdodClcblx0XHRcdHBhcmFtcy51c2VEYXRhID0gZmFsc2U7XG5cblx0XHRcdHJldHVybiB0cnVlO1x0XHRcblxuXHRcdH0gZWxzZSBpZiAoUGl4YXN0aWMuQ2xpZW50LmlzSUUoKSkge1xuXHRcdFx0cGFyYW1zLmltYWdlLnN0eWxlLmZpbHRlciArPSBcIiBmbGlwaFwiO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9LFxuXHRjaGVja1N1cHBvcnQgOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gKFBpeGFzdGljLkNsaWVudC5oYXNDYW52YXMoKSB8fCBQaXhhc3RpYy5DbGllbnQuaXNJRSgpKTtcblx0fVxufVxuXG4vKlxuICogUGl4YXN0aWMgTGliIC0gVmVydGljYWwgZmxpcCAtIHYwLjEuMFxuICogQ29weXJpZ2h0IChjKSAyMDA4IEphY29iIFNlaWRlbGluLCBqc2VpZGVsaW5AbmloaWxvZ2ljLmRrLCBodHRwOi8vYmxvZy5uaWhpbG9naWMuZGsvXG4gKiBMaWNlbnNlOiBbaHR0cDovL3d3dy5waXhhc3RpYy5jb20vbGliL2xpY2Vuc2UudHh0XVxuICovXG5cblBpeGFzdGljLkFjdGlvbnMuZmxpcHYgPSB7XG5cdHByb2Nlc3MgOiBmdW5jdGlvbihwYXJhbXMpIHtcblx0XHRpZiAoUGl4YXN0aWMuQ2xpZW50Lmhhc0NhbnZhcygpKSB7XG5cdFx0XHR2YXIgcmVjdCA9IHBhcmFtcy5vcHRpb25zLnJlY3Q7XG5cdFx0XHR2YXIgY29weUNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG5cdFx0XHRjb3B5Q2FudmFzLndpZHRoID0gcmVjdC53aWR0aDtcblx0XHRcdGNvcHlDYW52YXMuaGVpZ2h0ID0gcmVjdC5oZWlnaHQ7XG5cdFx0XHRjb3B5Q2FudmFzLmdldENvbnRleHQoXCIyZFwiKS5kcmF3SW1hZ2UocGFyYW1zLmltYWdlLCByZWN0LmxlZnQsIHJlY3QudG9wLCByZWN0LndpZHRoLCByZWN0LmhlaWdodCwgMCwgMCwgcmVjdC53aWR0aCwgcmVjdC5oZWlnaHQpO1xuXG5cdFx0XHR2YXIgY3R4ID0gcGFyYW1zLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG5cdFx0XHRjdHguY2xlYXJSZWN0KHJlY3QubGVmdCwgcmVjdC50b3AsIHJlY3Qud2lkdGgsIHJlY3QuaGVpZ2h0KTtcblx0XHRcdGN0eC5zY2FsZSgxLC0xKTtcblx0XHRcdGN0eC5kcmF3SW1hZ2UoY29weUNhbnZhcywgcmVjdC5sZWZ0LCAtcmVjdC50b3AtcmVjdC5oZWlnaHQsIHJlY3Qud2lkdGgsIHJlY3QuaGVpZ2h0KVxuXHRcdFx0cGFyYW1zLnVzZURhdGEgPSBmYWxzZTtcblxuXHRcdFx0cmV0dXJuIHRydWU7XHRcdFxuXG5cdFx0fSBlbHNlIGlmIChQaXhhc3RpYy5DbGllbnQuaXNJRSgpKSB7XG5cdFx0XHRwYXJhbXMuaW1hZ2Uuc3R5bGUuZmlsdGVyICs9IFwiIGZsaXB2XCI7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH0sXG5cdGNoZWNrU3VwcG9ydCA6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAoUGl4YXN0aWMuQ2xpZW50Lmhhc0NhbnZhcygpIHx8IFBpeGFzdGljLkNsaWVudC5pc0lFKCkpO1xuXHR9XG59XG5cbi8qXG4gKiBQaXhhc3RpYyBMaWIgLSBHbG93IC0gdjAuMS4wXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDggSmFjb2IgU2VpZGVsaW4sIGpzZWlkZWxpbkBuaWhpbG9naWMuZGssIGh0dHA6Ly9ibG9nLm5paGlsb2dpYy5kay9cbiAqIExpY2Vuc2U6IFtodHRwOi8vd3d3LnBpeGFzdGljLmNvbS9saWIvbGljZW5zZS50eHRdXG4gKi9cblxuXG5QaXhhc3RpYy5BY3Rpb25zLmdsb3cgPSB7XG5cdHByb2Nlc3MgOiBmdW5jdGlvbihwYXJhbXMpIHtcblxuXHRcdHZhciBhbW91bnQgPSAocGFyc2VGbG9hdChwYXJhbXMub3B0aW9ucy5hbW91bnQpfHwwKTtcblx0XHR2YXIgYmx1ckFtb3VudCA9IHBhcnNlRmxvYXQocGFyYW1zLm9wdGlvbnMucmFkaXVzKXx8MDtcblxuXHRcdGFtb3VudCA9IE1hdGgubWluKDEsTWF0aC5tYXgoMCxhbW91bnQpKTtcblx0XHRibHVyQW1vdW50ID0gTWF0aC5taW4oNSxNYXRoLm1heCgwLGJsdXJBbW91bnQpKTtcblxuXHRcdGlmIChQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzSW1hZ2VEYXRhKCkpIHtcblx0XHRcdHZhciByZWN0ID0gcGFyYW1zLm9wdGlvbnMucmVjdDtcblxuXHRcdFx0dmFyIGJsdXJDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuXHRcdFx0Ymx1ckNhbnZhcy53aWR0aCA9IHBhcmFtcy53aWR0aDtcblx0XHRcdGJsdXJDYW52YXMuaGVpZ2h0ID0gcGFyYW1zLmhlaWdodDtcblx0XHRcdHZhciBibHVyQ3R4ID0gYmx1ckNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG5cdFx0XHRibHVyQ3R4LmRyYXdJbWFnZShwYXJhbXMuY2FudmFzLDAsMCk7XG5cblx0XHRcdHZhciBzY2FsZSA9IDI7XG5cdFx0XHR2YXIgc21hbGxXaWR0aCA9IE1hdGgucm91bmQocGFyYW1zLndpZHRoIC8gc2NhbGUpO1xuXHRcdFx0dmFyIHNtYWxsSGVpZ2h0ID0gTWF0aC5yb3VuZChwYXJhbXMuaGVpZ2h0IC8gc2NhbGUpO1xuXG5cdFx0XHR2YXIgY29weSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG5cdFx0XHRjb3B5LndpZHRoID0gc21hbGxXaWR0aDtcblx0XHRcdGNvcHkuaGVpZ2h0ID0gc21hbGxIZWlnaHQ7XG5cblx0XHRcdHZhciBjbGVhciA9IHRydWU7XG5cdFx0XHR2YXIgc3RlcHMgPSBNYXRoLnJvdW5kKGJsdXJBbW91bnQgKiAyMCk7XG5cblx0XHRcdHZhciBjb3B5Q3R4ID0gY29weS5nZXRDb250ZXh0KFwiMmRcIik7XG5cdFx0XHRmb3IgKHZhciBpPTA7aTxzdGVwcztpKyspIHtcblx0XHRcdFx0dmFyIHNjYWxlZFdpZHRoID0gTWF0aC5tYXgoMSxNYXRoLnJvdW5kKHNtYWxsV2lkdGggLSBpKSk7XG5cdFx0XHRcdHZhciBzY2FsZWRIZWlnaHQgPSBNYXRoLm1heCgxLE1hdGgucm91bmQoc21hbGxIZWlnaHQgLSBpKSk7XG5cdFxuXHRcdFx0XHRjb3B5Q3R4LmNsZWFyUmVjdCgwLDAsc21hbGxXaWR0aCxzbWFsbEhlaWdodCk7XG5cdFxuXHRcdFx0XHRjb3B5Q3R4LmRyYXdJbWFnZShcblx0XHRcdFx0XHRibHVyQ2FudmFzLFxuXHRcdFx0XHRcdDAsMCxwYXJhbXMud2lkdGgscGFyYW1zLmhlaWdodCxcblx0XHRcdFx0XHQwLDAsc2NhbGVkV2lkdGgsc2NhbGVkSGVpZ2h0XG5cdFx0XHRcdCk7XG5cdFxuXHRcdFx0XHRibHVyQ3R4LmNsZWFyUmVjdCgwLDAscGFyYW1zLndpZHRoLHBhcmFtcy5oZWlnaHQpO1xuXHRcblx0XHRcdFx0Ymx1ckN0eC5kcmF3SW1hZ2UoXG5cdFx0XHRcdFx0Y29weSxcblx0XHRcdFx0XHQwLDAsc2NhbGVkV2lkdGgsc2NhbGVkSGVpZ2h0LFxuXHRcdFx0XHRcdDAsMCxwYXJhbXMud2lkdGgscGFyYW1zLmhlaWdodFxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgZGF0YSA9IFBpeGFzdGljLnByZXBhcmVEYXRhKHBhcmFtcyk7XG5cdFx0XHR2YXIgYmx1ckRhdGEgPSBQaXhhc3RpYy5wcmVwYXJlRGF0YSh7Y2FudmFzOmJsdXJDYW52YXMsb3B0aW9uczpwYXJhbXMub3B0aW9uc30pO1xuXG5cdFx0XHR2YXIgcCA9IHJlY3Qud2lkdGggKiByZWN0LmhlaWdodDtcblxuXHRcdFx0dmFyIHBpeCA9IHAqNCwgcGl4MSA9IHBpeCArIDEsIHBpeDIgPSBwaXggKyAyLCBwaXgzID0gcGl4ICsgMztcblx0XHRcdHdoaWxlIChwLS0pIHtcblx0XHRcdFx0aWYgKChkYXRhW3BpeC09NF0gKz0gYW1vdW50ICogYmx1ckRhdGFbcGl4XSkgPiAyNTUpIGRhdGFbcGl4XSA9IDI1NTtcblx0XHRcdFx0aWYgKChkYXRhW3BpeDEtPTRdICs9IGFtb3VudCAqIGJsdXJEYXRhW3BpeDFdKSA+IDI1NSkgZGF0YVtwaXgxXSA9IDI1NTtcblx0XHRcdFx0aWYgKChkYXRhW3BpeDItPTRdICs9IGFtb3VudCAqIGJsdXJEYXRhW3BpeDJdKSA+IDI1NSkgZGF0YVtwaXgyXSA9IDI1NTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9LFxuXHRjaGVja1N1cHBvcnQgOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gUGl4YXN0aWMuQ2xpZW50Lmhhc0NhbnZhc0ltYWdlRGF0YSgpO1xuXHR9XG59XG5cblxuXG4vKlxuICogUGl4YXN0aWMgTGliIC0gSGlzdG9ncmFtIC0gdjAuMS4xXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDggSmFjb2IgU2VpZGVsaW4sIGpzZWlkZWxpbkBuaWhpbG9naWMuZGssIGh0dHA6Ly9ibG9nLm5paGlsb2dpYy5kay9cbiAqIExpY2Vuc2U6IFtodHRwOi8vd3d3LnBpeGFzdGljLmNvbS9saWIvbGljZW5zZS50eHRdXG4gKi9cblxuUGl4YXN0aWMuQWN0aW9ucy5oaXN0b2dyYW0gPSB7XG5cdHByb2Nlc3MgOiBmdW5jdGlvbihwYXJhbXMpIHtcblxuXHRcdHZhciBhdmVyYWdlID0gISEocGFyYW1zLm9wdGlvbnMuYXZlcmFnZSAmJiBwYXJhbXMub3B0aW9ucy5hdmVyYWdlICE9IFwiZmFsc2VcIik7XG5cdFx0dmFyIHBhaW50ID0gISEocGFyYW1zLm9wdGlvbnMucGFpbnQgJiYgcGFyYW1zLm9wdGlvbnMucGFpbnQgIT0gXCJmYWxzZVwiKTtcblx0XHR2YXIgY29sb3IgPSBwYXJhbXMub3B0aW9ucy5jb2xvciB8fCBcInJnYmEoMjU1LDI1NSwyNTUsMC41KVwiO1xuXHRcdHZhciB2YWx1ZXMgPSBbXTtcblx0XHRpZiAodHlwZW9mIHBhcmFtcy5vcHRpb25zLnJldHVyblZhbHVlICE9IFwib2JqZWN0XCIpIHtcblx0XHRcdHBhcmFtcy5vcHRpb25zLnJldHVyblZhbHVlID0ge3ZhbHVlczpbXX07XG5cdFx0fVxuXHRcdHZhciByZXR1cm5WYWx1ZSA9IHBhcmFtcy5vcHRpb25zLnJldHVyblZhbHVlO1xuXHRcdGlmICh0eXBlb2YgcmV0dXJuVmFsdWUudmFsdWVzICE9IFwiYXJyYXlcIikge1xuXHRcdFx0cmV0dXJuVmFsdWUudmFsdWVzID0gW107XG5cdFx0fVxuXHRcdHZhbHVlcyA9IHJldHVyblZhbHVlLnZhbHVlcztcblxuXHRcdGlmIChQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzSW1hZ2VEYXRhKCkpIHtcblx0XHRcdHZhciBkYXRhID0gUGl4YXN0aWMucHJlcGFyZURhdGEocGFyYW1zKTtcblx0XHRcdHBhcmFtcy51c2VEYXRhID0gZmFsc2U7XG5cblx0XHRcdGZvciAodmFyIGk9MDtpPDI1NjtpKyspIHtcblx0XHRcdFx0dmFsdWVzW2ldID0gMDtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHJlY3QgPSBwYXJhbXMub3B0aW9ucy5yZWN0O1xuXHRcdFx0dmFyIHAgPSByZWN0LndpZHRoICogcmVjdC5oZWlnaHQ7XG5cblx0XHRcdHZhciBwaXggPSBwKjQsIHBpeDEgPSBwaXggKyAxLCBwaXgyID0gcGl4ICsgMiwgcGl4MyA9IHBpeCArIDM7XG5cdFx0XHR2YXIgcm91bmQgPSBNYXRoLnJvdW5kO1xuXG5cdFx0XHRpZiAoYXZlcmFnZSkge1xuXHRcdFx0XHR3aGlsZSAocC0tKSB7XG5cdFx0XHRcdFx0dmFsdWVzWyByb3VuZCgoZGF0YVtwaXgtPTRdK2RhdGFbcGl4KzFdK2RhdGFbcGl4KzJdKS8zKSBdKys7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHdoaWxlIChwLS0pIHtcblx0XHRcdFx0XHR2YWx1ZXNbIHJvdW5kKGRhdGFbcGl4LT00XSowLjMgKyBkYXRhW3BpeCsxXSowLjU5ICsgZGF0YVtwaXgrMl0qMC4xMSkgXSsrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChwYWludCkge1xuXHRcdFx0XHR2YXIgbWF4VmFsdWUgPSAwO1xuXHRcdFx0XHRmb3IgKHZhciBpPTA7aTwyNTY7aSsrKSB7XG5cdFx0XHRcdFx0aWYgKHZhbHVlc1tpXSA+IG1heFZhbHVlKSB7XG5cdFx0XHRcdFx0XHRtYXhWYWx1ZSA9IHZhbHVlc1tpXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIGhlaWdodFNjYWxlID0gcGFyYW1zLmhlaWdodCAvIG1heFZhbHVlO1xuXHRcdFx0XHR2YXIgd2lkdGhTY2FsZSA9IHBhcmFtcy53aWR0aCAvIDI1Njtcblx0XHRcdFx0dmFyIGN0eCA9IHBhcmFtcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuXHRcdFx0XHRjdHguZmlsbFN0eWxlID0gY29sb3I7XG5cdFx0XHRcdGZvciAodmFyIGk9MDtpPDI1NjtpKyspIHtcblx0XHRcdFx0XHRjdHguZmlsbFJlY3QoXG5cdFx0XHRcdFx0XHRpICogd2lkdGhTY2FsZSwgcGFyYW1zLmhlaWdodCAtIGhlaWdodFNjYWxlICogdmFsdWVzW2ldLFxuXHRcdFx0XHRcdFx0d2lkdGhTY2FsZSwgdmFsdWVzW2ldICogaGVpZ2h0U2NhbGVcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVyblZhbHVlLnZhbHVlcyA9IHZhbHVlcztcblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9LFxuXHRjaGVja1N1cHBvcnQgOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gUGl4YXN0aWMuQ2xpZW50Lmhhc0NhbnZhc0ltYWdlRGF0YSgpO1xuXHR9XG59XG4vKlxuICogUGl4YXN0aWMgTGliIC0gSFNMIEFkanVzdCAgLSB2MC4xLjFcbiAqIENvcHlyaWdodCAoYykgMjAwOCBKYWNvYiBTZWlkZWxpbiwganNlaWRlbGluQG5paGlsb2dpYy5kaywgaHR0cDovL2Jsb2cubmloaWxvZ2ljLmRrL1xuICogTGljZW5zZTogW2h0dHA6Ly93d3cucGl4YXN0aWMuY29tL2xpYi9saWNlbnNlLnR4dF1cbiAqL1xuXG5QaXhhc3RpYy5BY3Rpb25zLmhzbCA9IHtcblx0cHJvY2VzcyA6IGZ1bmN0aW9uKHBhcmFtcykge1xuXG5cdFx0dmFyIGh1ZSA9IHBhcnNlSW50KHBhcmFtcy5vcHRpb25zLmh1ZSwxMCl8fDA7XG5cdFx0dmFyIHNhdHVyYXRpb24gPSAocGFyc2VJbnQocGFyYW1zLm9wdGlvbnMuc2F0dXJhdGlvbiwxMCl8fDApIC8gMTAwO1xuXHRcdHZhciBsaWdodG5lc3MgPSAocGFyc2VJbnQocGFyYW1zLm9wdGlvbnMubGlnaHRuZXNzLDEwKXx8MCkgLyAxMDA7XG5cblxuXHRcdC8vIHRoaXMgc2VlbXMgdG8gZ2l2ZSB0aGUgc2FtZSByZXN1bHQgYXMgUGhvdG9zaG9wXG5cdFx0aWYgKHNhdHVyYXRpb24gPCAwKSB7XG5cdFx0XHR2YXIgc2F0TXVsID0gMStzYXR1cmF0aW9uO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgc2F0TXVsID0gMStzYXR1cmF0aW9uKjI7XG5cdFx0fVxuXG5cdFx0aHVlID0gKGh1ZSUzNjApIC8gMzYwO1xuXHRcdHZhciBodWU2ID0gaHVlICogNjtcblxuXHRcdHZhciByZ2JEaXYgPSAxIC8gMjU1O1xuXG5cdFx0dmFyIGxpZ2h0MjU1ID0gbGlnaHRuZXNzICogMjU1O1xuXHRcdHZhciBsaWdodHAxID0gMSArIGxpZ2h0bmVzcztcblx0XHR2YXIgbGlnaHRtMSA9IDEgLSBsaWdodG5lc3M7XG5cdFx0aWYgKFBpeGFzdGljLkNsaWVudC5oYXNDYW52YXNJbWFnZURhdGEoKSkge1xuXHRcdFx0dmFyIGRhdGEgPSBQaXhhc3RpYy5wcmVwYXJlRGF0YShwYXJhbXMpO1xuXG5cdFx0XHR2YXIgcmVjdCA9IHBhcmFtcy5vcHRpb25zLnJlY3Q7XG5cblx0XHRcdHZhciBwID0gcmVjdC53aWR0aCAqIHJlY3QuaGVpZ2h0O1xuXG5cdFx0XHR2YXIgcGl4ID0gcCo0LCBwaXgxID0gcGl4ICsgMSwgcGl4MiA9IHBpeCArIDIsIHBpeDMgPSBwaXggKyAzO1xuXG5cdFx0XHR3aGlsZSAocC0tKSB7XG5cblx0XHRcdFx0dmFyIHIgPSBkYXRhW3BpeC09NF07XG5cdFx0XHRcdHZhciBnID0gZGF0YVtwaXgxPXBpeCsxXTtcblx0XHRcdFx0dmFyIGIgPSBkYXRhW3BpeDI9cGl4KzJdO1xuXG5cdFx0XHRcdGlmIChodWUgIT0gMCB8fCBzYXR1cmF0aW9uICE9IDApIHtcblx0XHRcdFx0XHQvLyBvaywgaGVyZSBjb21lcyByZ2IgdG8gaHNsICsgYWRqdXN0ICsgaHNsIHRvIHJnYiwgYWxsIGluIG9uZSBqdW1ibGVkIG1lc3MuIFxuXHRcdFx0XHRcdC8vIEl0J3Mgbm90IHNvIHByZXR0eSwgYnV0IGl0J3MgYmVlbiBvcHRpbWl6ZWQgdG8gZ2V0IHNvbWV3aGF0IGRlY2VudCBwZXJmb3JtYW5jZS5cblx0XHRcdFx0XHQvLyBUaGUgdHJhbnNmb3JtcyB3ZXJlIG9yaWdpbmFsbHkgYWRhcHRlZCBmcm9tIHRoZSBvbmVzIGZvdW5kIGluIEdyYXBoaWNzIEdlbXMsIGJ1dCBoYXZlIGJlZW4gaGVhdmlseSBtb2RpZmllZC5cblx0XHRcdFx0XHR2YXIgdnMgPSByO1xuXHRcdFx0XHRcdGlmIChnID4gdnMpIHZzID0gZztcblx0XHRcdFx0XHRpZiAoYiA+IHZzKSB2cyA9IGI7XG5cdFx0XHRcdFx0dmFyIG1zID0gcjtcblx0XHRcdFx0XHRpZiAoZyA8IG1zKSBtcyA9IGc7XG5cdFx0XHRcdFx0aWYgKGIgPCBtcykgbXMgPSBiO1xuXHRcdFx0XHRcdHZhciB2bSA9ICh2cy1tcyk7XG5cdFx0XHRcdFx0dmFyIGwgPSAobXMrdnMpLzUxMDtcblx0XHRcdFx0XHRpZiAobCA+IDApIHtcblx0XHRcdFx0XHRcdGlmICh2bSA+IDApIHtcblx0XHRcdFx0XHRcdFx0aWYgKGwgPD0gMC41KSB7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIHMgPSB2bSAvICh2cyttcykgKiBzYXRNdWw7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHMgPiAxKSBzID0gMTtcblx0XHRcdFx0XHRcdFx0XHR2YXIgdiA9IChsICogKDErcykpO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdHZhciBzID0gdm0gLyAoNTEwLXZzLW1zKSAqIHNhdE11bDtcblx0XHRcdFx0XHRcdFx0XHRpZiAocyA+IDEpIHMgPSAxO1xuXHRcdFx0XHRcdFx0XHRcdHZhciB2ID0gKGwrcyAtIGwqcyk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0aWYgKHIgPT0gdnMpIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoZyA9PSBtcylcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBoID0gNSArICgodnMtYikvdm0pICsgaHVlNjtcblx0XHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgaCA9IDEgLSAoKHZzLWcpL3ZtKSArIGh1ZTY7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoZyA9PSB2cykge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChiID09IG1zKVxuXHRcdFx0XHRcdFx0XHRcdFx0dmFyIGggPSAxICsgKCh2cy1yKS92bSkgKyBodWU2O1xuXHRcdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBoID0gMyAtICgodnMtYikvdm0pICsgaHVlNjtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAociA9PSBtcylcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBoID0gMyArICgodnMtZykvdm0pICsgaHVlNjtcblx0XHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgaCA9IDUgLSAoKHZzLXIpL3ZtKSArIGh1ZTY7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0aWYgKGggPCAwKSBoKz02O1xuXHRcdFx0XHRcdFx0XHRpZiAoaCA+PSA2KSBoLT02O1xuXHRcdFx0XHRcdFx0XHR2YXIgbSA9IChsK2wtdik7XG5cdFx0XHRcdFx0XHRcdHZhciBzZXh0YW50ID0gaD4+MDtcblx0XHRcdFx0XHRcdFx0aWYgKHNleHRhbnQgPT0gMCkge1xuXHRcdFx0XHRcdFx0XHRcdHIgPSB2KjI1NTsgZyA9IChtKygodi1tKSooaC1zZXh0YW50KSkpKjI1NTsgYiA9IG0qMjU1O1xuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHNleHRhbnQgPT0gMSkge1xuXHRcdFx0XHRcdFx0XHRcdHIgPSAodi0oKHYtbSkqKGgtc2V4dGFudCkpKSoyNTU7IGcgPSB2KjI1NTsgYiA9IG0qMjU1O1xuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHNleHRhbnQgPT0gMikge1xuXHRcdFx0XHRcdFx0XHRcdHIgPSBtKjI1NTsgZyA9IHYqMjU1OyBiID0gKG0rKCh2LW0pKihoLXNleHRhbnQpKSkqMjU1O1xuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHNleHRhbnQgPT0gMykge1xuXHRcdFx0XHRcdFx0XHRcdHIgPSBtKjI1NTsgZyA9ICh2LSgodi1tKSooaC1zZXh0YW50KSkpKjI1NTsgYiA9IHYqMjU1O1xuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHNleHRhbnQgPT0gNCkge1xuXHRcdFx0XHRcdFx0XHRcdHIgPSAobSsoKHYtbSkqKGgtc2V4dGFudCkpKSoyNTU7IGcgPSBtKjI1NTsgYiA9IHYqMjU1O1xuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHNleHRhbnQgPT0gNSkge1xuXHRcdFx0XHRcdFx0XHRcdHIgPSB2KjI1NTsgZyA9IG0qMjU1OyBiID0gKHYtKCh2LW0pKihoLXNleHRhbnQpKSkqMjU1O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGxpZ2h0bmVzcyA8IDApIHtcblx0XHRcdFx0XHRyICo9IGxpZ2h0cDE7XG5cdFx0XHRcdFx0ZyAqPSBsaWdodHAxO1xuXHRcdFx0XHRcdGIgKj0gbGlnaHRwMTtcblx0XHRcdFx0fSBlbHNlIGlmIChsaWdodG5lc3MgPiAwKSB7XG5cdFx0XHRcdFx0ciA9IHIgKiBsaWdodG0xICsgbGlnaHQyNTU7XG5cdFx0XHRcdFx0ZyA9IGcgKiBsaWdodG0xICsgbGlnaHQyNTU7XG5cdFx0XHRcdFx0YiA9IGIgKiBsaWdodG0xICsgbGlnaHQyNTU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAociA8IDApIFxuXHRcdFx0XHRcdGRhdGFbcGl4XSA9IDBcblx0XHRcdFx0ZWxzZSBpZiAociA+IDI1NSlcblx0XHRcdFx0XHRkYXRhW3BpeF0gPSAyNTVcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGRhdGFbcGl4XSA9IHI7XG5cblx0XHRcdFx0aWYgKGcgPCAwKSBcblx0XHRcdFx0XHRkYXRhW3BpeDFdID0gMFxuXHRcdFx0XHRlbHNlIGlmIChnID4gMjU1KVxuXHRcdFx0XHRcdGRhdGFbcGl4MV0gPSAyNTVcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGRhdGFbcGl4MV0gPSBnO1xuXG5cdFx0XHRcdGlmIChiIDwgMCkgXG5cdFx0XHRcdFx0ZGF0YVtwaXgyXSA9IDBcblx0XHRcdFx0ZWxzZSBpZiAoYiA+IDI1NSlcblx0XHRcdFx0XHRkYXRhW3BpeDJdID0gMjU1XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRkYXRhW3BpeDJdID0gYjtcblxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH0sXG5cdGNoZWNrU3VwcG9ydCA6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzSW1hZ2VEYXRhKCk7XG5cdH1cblxufVxuLypcbiAqIFBpeGFzdGljIExpYiAtIEludmVydCBmaWx0ZXIgLSB2MC4xLjFcbiAqIENvcHlyaWdodCAoYykgMjAwOCBKYWNvYiBTZWlkZWxpbiwganNlaWRlbGluQG5paGlsb2dpYy5kaywgaHR0cDovL2Jsb2cubmloaWxvZ2ljLmRrL1xuICogTGljZW5zZTogW2h0dHA6Ly93d3cucGl4YXN0aWMuY29tL2xpYi9saWNlbnNlLnR4dF1cbiAqL1xuXG5QaXhhc3RpYy5BY3Rpb25zLmludmVydCA9IHtcblx0cHJvY2VzcyA6IGZ1bmN0aW9uKHBhcmFtcykge1xuXHRcdGlmIChQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzSW1hZ2VEYXRhKCkpIHtcblx0XHRcdHZhciBkYXRhID0gUGl4YXN0aWMucHJlcGFyZURhdGEocGFyYW1zKTtcblxuXHRcdFx0dmFyIGludmVydEFscGhhID0gISFwYXJhbXMub3B0aW9ucy5pbnZlcnRBbHBoYTtcblx0XHRcdHZhciByZWN0ID0gcGFyYW1zLm9wdGlvbnMucmVjdDtcblxuXHRcdFx0dmFyIHAgPSByZWN0LndpZHRoICogcmVjdC5oZWlnaHQ7XG5cblx0XHRcdHZhciBwaXggPSBwKjQsIHBpeDEgPSBwaXggKyAxLCBwaXgyID0gcGl4ICsgMiwgcGl4MyA9IHBpeCArIDM7XG5cblx0XHRcdHdoaWxlIChwLS0pIHtcblx0XHRcdFx0ZGF0YVtwaXgtPTRdID0gMjU1IC0gZGF0YVtwaXhdO1xuXHRcdFx0XHRkYXRhW3BpeDEtPTRdID0gMjU1IC0gZGF0YVtwaXgxXTtcblx0XHRcdFx0ZGF0YVtwaXgyLT00XSA9IDI1NSAtIGRhdGFbcGl4Ml07XG5cdFx0XHRcdGlmIChpbnZlcnRBbHBoYSlcblx0XHRcdFx0XHRkYXRhW3BpeDMtPTRdID0gMjU1IC0gZGF0YVtwaXgzXTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSBlbHNlIGlmIChQaXhhc3RpYy5DbGllbnQuaXNJRSgpKSB7XG5cdFx0XHRwYXJhbXMuaW1hZ2Uuc3R5bGUuZmlsdGVyICs9IFwiIGludmVydFwiO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9LFxuXHRjaGVja1N1cHBvcnQgOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gKFBpeGFzdGljLkNsaWVudC5oYXNDYW52YXNJbWFnZURhdGEoKSB8fCBQaXhhc3RpYy5DbGllbnQuaXNJRSgpKTtcblx0fVxufVxuLypcbiAqIFBpeGFzdGljIExpYiAtIExhcGxhY2UgZmlsdGVyIC0gdjAuMS4wXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDggSmFjb2IgU2VpZGVsaW4sIGpzZWlkZWxpbkBuaWhpbG9naWMuZGssIGh0dHA6Ly9ibG9nLm5paGlsb2dpYy5kay9cbiAqIExpY2Vuc2U6IFtodHRwOi8vd3d3LnBpeGFzdGljLmNvbS9saWIvbGljZW5zZS50eHRdXG4gKi9cblxuUGl4YXN0aWMuQWN0aW9ucy5sYXBsYWNlID0ge1xuXHRwcm9jZXNzIDogZnVuY3Rpb24ocGFyYW1zKSB7XG5cblx0XHR2YXIgc3RyZW5ndGggPSAxLjA7XG5cdFx0dmFyIGludmVydCA9ICEhKHBhcmFtcy5vcHRpb25zLmludmVydCAmJiBwYXJhbXMub3B0aW9ucy5pbnZlcnQgIT0gXCJmYWxzZVwiKTtcblx0XHR2YXIgY29udHJhc3QgPSBwYXJzZUZsb2F0KHBhcmFtcy5vcHRpb25zLmVkZ2VTdHJlbmd0aCl8fDA7XG5cblx0XHR2YXIgZ3JleUxldmVsID0gcGFyc2VJbnQocGFyYW1zLm9wdGlvbnMuZ3JleUxldmVsKXx8MDtcblxuXHRcdGNvbnRyYXN0ID0gLWNvbnRyYXN0O1xuXG5cdFx0aWYgKFBpeGFzdGljLkNsaWVudC5oYXNDYW52YXNJbWFnZURhdGEoKSkge1xuXHRcdFx0dmFyIGRhdGEgPSBQaXhhc3RpYy5wcmVwYXJlRGF0YShwYXJhbXMpO1xuXHRcdFx0dmFyIGRhdGFDb3B5ID0gUGl4YXN0aWMucHJlcGFyZURhdGEocGFyYW1zLCB0cnVlKVxuXG5cdFx0XHR2YXIga2VybmVsID0gW1xuXHRcdFx0XHRbLTEsIFx0LTEsIFx0LTFdLFxuXHRcdFx0XHRbLTEsIFx0OCwgXHQtMV0sXG5cdFx0XHRcdFstMSwgXHQtMSwgXHQtMV1cblx0XHRcdF07XG5cblx0XHRcdHZhciB3ZWlnaHQgPSAxLzg7XG5cblx0XHRcdHZhciByZWN0ID0gcGFyYW1zLm9wdGlvbnMucmVjdDtcblx0XHRcdHZhciB3ID0gcmVjdC53aWR0aDtcblx0XHRcdHZhciBoID0gcmVjdC5oZWlnaHQ7XG5cblx0XHRcdHZhciB3NCA9IHcqNDtcblx0XHRcdHZhciB5ID0gaDtcblx0XHRcdGRvIHtcblx0XHRcdFx0dmFyIG9mZnNldFkgPSAoeS0xKSp3NDtcblxuXHRcdFx0XHR2YXIgbmV4dFkgPSAoeSA9PSBoKSA/IHkgLSAxIDogeTtcblx0XHRcdFx0dmFyIHByZXZZID0gKHkgPT0gMSkgPyAwIDogeS0yO1xuXG5cdFx0XHRcdHZhciBvZmZzZXRZUHJldiA9IHByZXZZKncqNDtcblx0XHRcdFx0dmFyIG9mZnNldFlOZXh0ID0gbmV4dFkqdyo0O1xuXG5cdFx0XHRcdHZhciB4ID0gdztcblx0XHRcdFx0ZG8ge1xuXHRcdFx0XHRcdHZhciBvZmZzZXQgPSBvZmZzZXRZICsgKHgqNC00KTtcblxuXHRcdFx0XHRcdHZhciBvZmZzZXRQcmV2ID0gb2Zmc2V0WVByZXYgKyAoKHggPT0gMSkgPyAwIDogeC0yKSAqIDQ7XG5cdFx0XHRcdFx0dmFyIG9mZnNldE5leHQgPSBvZmZzZXRZTmV4dCArICgoeCA9PSB3KSA/IHgtMSA6IHgpICogNDtcblx0XG5cdFx0XHRcdFx0dmFyIHIgPSAoKC1kYXRhQ29weVtvZmZzZXRQcmV2LTRdXG5cdFx0XHRcdFx0XHQtIGRhdGFDb3B5W29mZnNldFByZXZdXG5cdFx0XHRcdFx0XHQtIGRhdGFDb3B5W29mZnNldFByZXYrNF1cblx0XHRcdFx0XHRcdC0gZGF0YUNvcHlbb2Zmc2V0LTRdXG5cdFx0XHRcdFx0XHQtIGRhdGFDb3B5W29mZnNldCs0XVxuXHRcdFx0XHRcdFx0LSBkYXRhQ29weVtvZmZzZXROZXh0LTRdXG5cdFx0XHRcdFx0XHQtIGRhdGFDb3B5W29mZnNldE5leHRdXG5cdFx0XHRcdFx0XHQtIGRhdGFDb3B5W29mZnNldE5leHQrNF0pXG5cdFx0XHRcdFx0XHQrIGRhdGFDb3B5W29mZnNldF0gKiA4KSBcblx0XHRcdFx0XHRcdCogd2VpZ2h0O1xuXHRcblx0XHRcdFx0XHR2YXIgZyA9ICgoLWRhdGFDb3B5W29mZnNldFByZXYtM11cblx0XHRcdFx0XHRcdC0gZGF0YUNvcHlbb2Zmc2V0UHJldisxXVxuXHRcdFx0XHRcdFx0LSBkYXRhQ29weVtvZmZzZXRQcmV2KzVdXG5cdFx0XHRcdFx0XHQtIGRhdGFDb3B5W29mZnNldC0zXVxuXHRcdFx0XHRcdFx0LSBkYXRhQ29weVtvZmZzZXQrNV1cblx0XHRcdFx0XHRcdC0gZGF0YUNvcHlbb2Zmc2V0TmV4dC0zXVxuXHRcdFx0XHRcdFx0LSBkYXRhQ29weVtvZmZzZXROZXh0KzFdXG5cdFx0XHRcdFx0XHQtIGRhdGFDb3B5W29mZnNldE5leHQrNV0pXG5cdFx0XHRcdFx0XHQrIGRhdGFDb3B5W29mZnNldCsxXSAqIDgpXG5cdFx0XHRcdFx0XHQqIHdlaWdodDtcblx0XG5cdFx0XHRcdFx0dmFyIGIgPSAoKC1kYXRhQ29weVtvZmZzZXRQcmV2LTJdXG5cdFx0XHRcdFx0XHQtIGRhdGFDb3B5W29mZnNldFByZXYrMl1cblx0XHRcdFx0XHRcdC0gZGF0YUNvcHlbb2Zmc2V0UHJldis2XVxuXHRcdFx0XHRcdFx0LSBkYXRhQ29weVtvZmZzZXQtMl1cblx0XHRcdFx0XHRcdC0gZGF0YUNvcHlbb2Zmc2V0KzZdXG5cdFx0XHRcdFx0XHQtIGRhdGFDb3B5W29mZnNldE5leHQtMl1cblx0XHRcdFx0XHRcdC0gZGF0YUNvcHlbb2Zmc2V0TmV4dCsyXVxuXHRcdFx0XHRcdFx0LSBkYXRhQ29weVtvZmZzZXROZXh0KzZdKVxuXHRcdFx0XHRcdFx0KyBkYXRhQ29weVtvZmZzZXQrMl0gKiA4KVxuXHRcdFx0XHRcdFx0KiB3ZWlnaHQ7XG5cblx0XHRcdFx0XHR2YXIgYnJpZ2h0bmVzcyA9ICgociArIGcgKyBiKS8zKSArIGdyZXlMZXZlbDtcblxuXHRcdFx0XHRcdGlmIChjb250cmFzdCAhPSAwKSB7XG5cdFx0XHRcdFx0XHRpZiAoYnJpZ2h0bmVzcyA+IDEyNykge1xuXHRcdFx0XHRcdFx0XHRicmlnaHRuZXNzICs9ICgoYnJpZ2h0bmVzcyArIDEpIC0gMTI4KSAqIGNvbnRyYXN0O1xuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChicmlnaHRuZXNzIDwgMTI3KSB7XG5cdFx0XHRcdFx0XHRcdGJyaWdodG5lc3MgLT0gKGJyaWdodG5lc3MgKyAxKSAqIGNvbnRyYXN0O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoaW52ZXJ0KSB7XG5cdFx0XHRcdFx0XHRicmlnaHRuZXNzID0gMjU1IC0gYnJpZ2h0bmVzcztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKGJyaWdodG5lc3MgPCAwICkgYnJpZ2h0bmVzcyA9IDA7XG5cdFx0XHRcdFx0aWYgKGJyaWdodG5lc3MgPiAyNTUgKSBicmlnaHRuZXNzID0gMjU1O1xuXG5cdFx0XHRcdFx0ZGF0YVtvZmZzZXRdID0gZGF0YVtvZmZzZXQrMV0gPSBkYXRhW29mZnNldCsyXSA9IGJyaWdodG5lc3M7XG5cblx0XHRcdFx0fSB3aGlsZSAoLS14KTtcblx0XHRcdH0gd2hpbGUgKC0teSk7XG5cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fSxcblx0Y2hlY2tTdXBwb3J0IDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIFBpeGFzdGljLkNsaWVudC5oYXNDYW52YXNJbWFnZURhdGEoKTtcblx0fVxufVxuXG4vKlxuICogUGl4YXN0aWMgTGliIC0gTGlnaHRlbiBmaWx0ZXIgLSB2MC4xLjFcbiAqIENvcHlyaWdodCAoYykgMjAwOCBKYWNvYiBTZWlkZWxpbiwganNlaWRlbGluQG5paGlsb2dpYy5kaywgaHR0cDovL2Jsb2cubmloaWxvZ2ljLmRrL1xuICogTGljZW5zZTogW2h0dHA6Ly93d3cucGl4YXN0aWMuY29tL2xpYi9saWNlbnNlLnR4dF1cbiAqL1xuXG5QaXhhc3RpYy5BY3Rpb25zLmxpZ2h0ZW4gPSB7XG5cblx0cHJvY2VzcyA6IGZ1bmN0aW9uKHBhcmFtcykge1xuXHRcdHZhciBhbW91bnQgPSBwYXJzZUZsb2F0KHBhcmFtcy5vcHRpb25zLmFtb3VudCkgfHwgMDtcblx0XHRhbW91bnQgPSBNYXRoLm1heCgtMSwgTWF0aC5taW4oMSwgYW1vdW50KSk7XG5cblx0XHRpZiAoUGl4YXN0aWMuQ2xpZW50Lmhhc0NhbnZhc0ltYWdlRGF0YSgpKSB7XG5cdFx0XHR2YXIgZGF0YSA9IFBpeGFzdGljLnByZXBhcmVEYXRhKHBhcmFtcyk7XG5cdFx0XHR2YXIgcmVjdCA9IHBhcmFtcy5vcHRpb25zLnJlY3Q7XG5cblx0XHRcdHZhciBwID0gcmVjdC53aWR0aCAqIHJlY3QuaGVpZ2h0O1xuXG5cdFx0XHR2YXIgcGl4ID0gcCo0LCBwaXgxID0gcGl4ICsgMSwgcGl4MiA9IHBpeCArIDI7XG5cdFx0XHR2YXIgbXVsID0gYW1vdW50ICsgMTtcblxuXHRcdFx0d2hpbGUgKHAtLSkge1xuXHRcdFx0XHRpZiAoKGRhdGFbcGl4LT00XSA9IGRhdGFbcGl4XSAqIG11bCkgPiAyNTUpXG5cdFx0XHRcdFx0ZGF0YVtwaXhdID0gMjU1O1xuXG5cdFx0XHRcdGlmICgoZGF0YVtwaXgxLT00XSA9IGRhdGFbcGl4MV0gKiBtdWwpID4gMjU1KVxuXHRcdFx0XHRcdGRhdGFbcGl4MV0gPSAyNTU7XG5cblx0XHRcdFx0aWYgKChkYXRhW3BpeDItPTRdID0gZGF0YVtwaXgyXSAqIG11bCkgPiAyNTUpXG5cdFx0XHRcdFx0ZGF0YVtwaXgyXSA9IDI1NTtcblxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblxuXHRcdH0gZWxzZSBpZiAoUGl4YXN0aWMuQ2xpZW50LmlzSUUoKSkge1xuXHRcdFx0dmFyIGltZyA9IHBhcmFtcy5pbWFnZTtcblx0XHRcdGlmIChhbW91bnQgPCAwKSB7XG5cdFx0XHRcdGltZy5zdHlsZS5maWx0ZXIgKz0gXCIgbGlnaHQoKVwiO1xuXHRcdFx0XHRpbWcuZmlsdGVyc1tpbWcuZmlsdGVycy5sZW5ndGgtMV0uYWRkQW1iaWVudChcblx0XHRcdFx0XHQyNTUsMjU1LDI1NSxcblx0XHRcdFx0XHQxMDAgKiAtYW1vdW50XG5cdFx0XHRcdCk7XG5cdFx0XHR9IGVsc2UgaWYgKGFtb3VudCA+IDApIHtcblx0XHRcdFx0aW1nLnN0eWxlLmZpbHRlciArPSBcIiBsaWdodCgpXCI7XG5cdFx0XHRcdGltZy5maWx0ZXJzW2ltZy5maWx0ZXJzLmxlbmd0aC0xXS5hZGRBbWJpZW50KFxuXHRcdFx0XHRcdDI1NSwyNTUsMjU1LFxuXHRcdFx0XHRcdDEwMFxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpbWcuZmlsdGVyc1tpbWcuZmlsdGVycy5sZW5ndGgtMV0uYWRkQW1iaWVudChcblx0XHRcdFx0XHQyNTUsMjU1LDI1NSxcblx0XHRcdFx0XHQxMDAgKiBhbW91bnRcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fSxcblx0Y2hlY2tTdXBwb3J0IDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIChQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzSW1hZ2VEYXRhKCkgfHwgUGl4YXN0aWMuQ2xpZW50LmlzSUUoKSk7XG5cdH1cbn1cbi8qXG4gKiBQaXhhc3RpYyBMaWIgLSBNb3NhaWMgZmlsdGVyIC0gdjAuMS4wXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDggSmFjb2IgU2VpZGVsaW4sIGpzZWlkZWxpbkBuaWhpbG9naWMuZGssIGh0dHA6Ly9ibG9nLm5paGlsb2dpYy5kay9cbiAqIExpY2Vuc2U6IFtodHRwOi8vd3d3LnBpeGFzdGljLmNvbS9saWIvbGljZW5zZS50eHRdXG4gKi9cblxuUGl4YXN0aWMuQWN0aW9ucy5tb3NhaWMgPSB7XG5cblx0cHJvY2VzcyA6IGZ1bmN0aW9uKHBhcmFtcykge1xuXHRcdHZhciBibG9ja1NpemUgPSBNYXRoLm1heCgxLHBhcnNlSW50KHBhcmFtcy5vcHRpb25zLmJsb2NrU2l6ZSwxMCkpO1xuXG5cdFx0aWYgKFBpeGFzdGljLkNsaWVudC5oYXNDYW52YXNJbWFnZURhdGEoKSkge1xuXHRcdFx0dmFyIHJlY3QgPSBwYXJhbXMub3B0aW9ucy5yZWN0O1xuXHRcdFx0dmFyIHcgPSByZWN0LndpZHRoO1xuXHRcdFx0dmFyIGggPSByZWN0LmhlaWdodDtcblx0XHRcdHZhciB3NCA9IHcqNDtcblx0XHRcdHZhciB5ID0gaDtcblxuXHRcdFx0dmFyIGN0eCA9IHBhcmFtcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuXG5cdFx0XHR2YXIgcGl4ZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuXHRcdFx0cGl4ZWwud2lkdGggPSBwaXhlbC5oZWlnaHQgPSAxO1xuXHRcdFx0dmFyIHBpeGVsQ3R4ID0gcGl4ZWwuZ2V0Q29udGV4dChcIjJkXCIpO1xuXG5cdFx0XHR2YXIgY29weSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG5cdFx0XHRjb3B5LndpZHRoID0gdztcblx0XHRcdGNvcHkuaGVpZ2h0ID0gaDtcblx0XHRcdHZhciBjb3B5Q3R4ID0gY29weS5nZXRDb250ZXh0KFwiMmRcIik7XG5cdFx0XHRjb3B5Q3R4LmRyYXdJbWFnZShwYXJhbXMuY2FudmFzLHJlY3QubGVmdCxyZWN0LnRvcCx3LGgsIDAsMCx3LGgpO1xuXG5cdFx0XHRmb3IgKHZhciB5PTA7eTxoO3krPWJsb2NrU2l6ZSkge1xuXHRcdFx0XHRmb3IgKHZhciB4PTA7eDx3O3grPWJsb2NrU2l6ZSkge1xuXHRcdFx0XHRcdHZhciBibG9ja1NpemVYID0gYmxvY2tTaXplO1xuXHRcdFx0XHRcdHZhciBibG9ja1NpemVZID0gYmxvY2tTaXplO1xuXHRcdFxuXHRcdFx0XHRcdGlmIChibG9ja1NpemVYICsgeCA+IHcpXG5cdFx0XHRcdFx0XHRibG9ja1NpemVYID0gdyAtIHg7XG5cdFx0XHRcdFx0aWYgKGJsb2NrU2l6ZVkgKyB5ID4gaClcblx0XHRcdFx0XHRcdGJsb2NrU2l6ZVkgPSBoIC0geTtcblxuXHRcdFx0XHRcdHBpeGVsQ3R4LmRyYXdJbWFnZShjb3B5LCB4LCB5LCBibG9ja1NpemVYLCBibG9ja1NpemVZLCAwLCAwLCAxLCAxKTtcblx0XHRcdFx0XHR2YXIgZGF0YSA9IHBpeGVsQ3R4LmdldEltYWdlRGF0YSgwLDAsMSwxKS5kYXRhO1xuXHRcdFx0XHRcdGN0eC5maWxsU3R5bGUgPSBcInJnYihcIiArIGRhdGFbMF0gKyBcIixcIiArIGRhdGFbMV0gKyBcIixcIiArIGRhdGFbMl0gKyBcIilcIjtcblx0XHRcdFx0XHRjdHguZmlsbFJlY3QocmVjdC5sZWZ0ICsgeCwgcmVjdC50b3AgKyB5LCBibG9ja1NpemUsIGJsb2NrU2l6ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHBhcmFtcy51c2VEYXRhID0gZmFsc2U7XG5cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fSxcblx0Y2hlY2tTdXBwb3J0IDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIChQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzSW1hZ2VEYXRhKCkpO1xuXHR9XG59LypcbiAqIFBpeGFzdGljIExpYiAtIE5vaXNlIGZpbHRlciAtIHYwLjEuMFxuICogQ29weXJpZ2h0IChjKSAyMDA4IEphY29iIFNlaWRlbGluLCBqc2VpZGVsaW5AbmloaWxvZ2ljLmRrLCBodHRwOi8vYmxvZy5uaWhpbG9naWMuZGsvXG4gKiBMaWNlbnNlOiBbaHR0cDovL3d3dy5waXhhc3RpYy5jb20vbGliL2xpY2Vuc2UudHh0XVxuICovXG5cblBpeGFzdGljLkFjdGlvbnMubm9pc2UgPSB7XG5cblx0cHJvY2VzcyA6IGZ1bmN0aW9uKHBhcmFtcykge1xuXHRcdHZhciBhbW91bnQgPSAwO1xuXHRcdHZhciBzdHJlbmd0aCA9IDA7XG5cdFx0dmFyIG1vbm8gPSBmYWxzZTtcblxuXHRcdGlmICh0eXBlb2YgcGFyYW1zLm9wdGlvbnMuYW1vdW50ICE9IFwidW5kZWZpbmVkXCIpXG5cdFx0XHRhbW91bnQgPSBwYXJzZUZsb2F0KHBhcmFtcy5vcHRpb25zLmFtb3VudCl8fDA7XG5cdFx0aWYgKHR5cGVvZiBwYXJhbXMub3B0aW9ucy5zdHJlbmd0aCAhPSBcInVuZGVmaW5lZFwiKVxuXHRcdFx0c3RyZW5ndGggPSBwYXJzZUZsb2F0KHBhcmFtcy5vcHRpb25zLnN0cmVuZ3RoKXx8MDtcblx0XHRpZiAodHlwZW9mIHBhcmFtcy5vcHRpb25zLm1vbm8gIT0gXCJ1bmRlZmluZWRcIilcblx0XHRcdG1vbm8gPSAhIShwYXJhbXMub3B0aW9ucy5tb25vICYmIHBhcmFtcy5vcHRpb25zLm1vbm8gIT0gXCJmYWxzZVwiKTtcblxuXHRcdGFtb3VudCA9IE1hdGgubWF4KDAsTWF0aC5taW4oMSxhbW91bnQpKTtcblx0XHRzdHJlbmd0aCA9IE1hdGgubWF4KDAsTWF0aC5taW4oMSxzdHJlbmd0aCkpO1xuXG5cdFx0dmFyIG5vaXNlID0gMTI4ICogc3RyZW5ndGg7XG5cdFx0dmFyIG5vaXNlMiA9IG5vaXNlIC8gMjtcblxuXHRcdGlmIChQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzSW1hZ2VEYXRhKCkpIHtcblx0XHRcdHZhciBkYXRhID0gUGl4YXN0aWMucHJlcGFyZURhdGEocGFyYW1zKTtcblx0XHRcdHZhciByZWN0ID0gcGFyYW1zLm9wdGlvbnMucmVjdDtcblx0XHRcdHZhciB3ID0gcmVjdC53aWR0aDtcblx0XHRcdHZhciBoID0gcmVjdC5oZWlnaHQ7XG5cdFx0XHR2YXIgdzQgPSB3KjQ7XG5cdFx0XHR2YXIgeSA9IGg7XG5cdFx0XHR2YXIgcmFuZG9tID0gTWF0aC5yYW5kb207XG5cblx0XHRcdGRvIHtcblx0XHRcdFx0dmFyIG9mZnNldFkgPSAoeS0xKSp3NDtcblx0XHRcdFx0dmFyIHggPSB3O1xuXHRcdFx0XHRkbyB7XG5cdFx0XHRcdFx0dmFyIG9mZnNldCA9IG9mZnNldFkgKyAoeC0xKSo0O1xuXHRcdFx0XHRcdGlmIChyYW5kb20oKSA8IGFtb3VudCkge1xuXHRcdFx0XHRcdFx0aWYgKG1vbm8pIHtcblx0XHRcdFx0XHRcdFx0dmFyIHBpeGVsTm9pc2UgPSAtIG5vaXNlMiArIHJhbmRvbSgpICogbm9pc2U7XG5cdFx0XHRcdFx0XHRcdHZhciByID0gZGF0YVtvZmZzZXRdICsgcGl4ZWxOb2lzZTtcblx0XHRcdFx0XHRcdFx0dmFyIGcgPSBkYXRhW29mZnNldCsxXSArIHBpeGVsTm9pc2U7XG5cdFx0XHRcdFx0XHRcdHZhciBiID0gZGF0YVtvZmZzZXQrMl0gKyBwaXhlbE5vaXNlO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0dmFyIHIgPSBkYXRhW29mZnNldF0gLSBub2lzZTIgKyAocmFuZG9tKCkgKiBub2lzZSk7XG5cdFx0XHRcdFx0XHRcdHZhciBnID0gZGF0YVtvZmZzZXQrMV0gLSBub2lzZTIgKyAocmFuZG9tKCkgKiBub2lzZSk7XG5cdFx0XHRcdFx0XHRcdHZhciBiID0gZGF0YVtvZmZzZXQrMl0gLSBub2lzZTIgKyAocmFuZG9tKCkgKiBub2lzZSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmIChyIDwgMCApIHIgPSAwO1xuXHRcdFx0XHRcdFx0aWYgKGcgPCAwICkgZyA9IDA7XG5cdFx0XHRcdFx0XHRpZiAoYiA8IDAgKSBiID0gMDtcblx0XHRcdFx0XHRcdGlmIChyID4gMjU1ICkgciA9IDI1NTtcblx0XHRcdFx0XHRcdGlmIChnID4gMjU1ICkgZyA9IDI1NTtcblx0XHRcdFx0XHRcdGlmIChiID4gMjU1ICkgYiA9IDI1NTtcblxuXHRcdFx0XHRcdFx0ZGF0YVtvZmZzZXRdID0gcjtcblx0XHRcdFx0XHRcdGRhdGFbb2Zmc2V0KzFdID0gZztcblx0XHRcdFx0XHRcdGRhdGFbb2Zmc2V0KzJdID0gYjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gd2hpbGUgKC0teCk7XG5cdFx0XHR9IHdoaWxlICgtLXkpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9LFxuXHRjaGVja1N1cHBvcnQgOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gUGl4YXN0aWMuQ2xpZW50Lmhhc0NhbnZhc0ltYWdlRGF0YSgpO1xuXHR9XG59XG5cbi8qXG4gKiBQaXhhc3RpYyBMaWIgLSBQb3N0ZXJpemUgZWZmZWN0IC0gdjAuMS4wXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDggSmFjb2IgU2VpZGVsaW4sIGpzZWlkZWxpbkBuaWhpbG9naWMuZGssIGh0dHA6Ly9ibG9nLm5paGlsb2dpYy5kay9cbiAqIExpY2Vuc2U6IFtodHRwOi8vd3d3LnBpeGFzdGljLmNvbS9saWIvbGljZW5zZS50eHRdXG4gKi9cblxuUGl4YXN0aWMuQWN0aW9ucy5wb3N0ZXJpemUgPSB7XG5cblx0cHJvY2VzcyA6IGZ1bmN0aW9uKHBhcmFtcykge1xuXG5cdFx0XG5cdFx0dmFyIG51bUxldmVscyA9IDI1Njtcblx0XHRpZiAodHlwZW9mIHBhcmFtcy5vcHRpb25zLmxldmVscyAhPSBcInVuZGVmaW5lZFwiKVxuXHRcdFx0bnVtTGV2ZWxzID0gcGFyc2VJbnQocGFyYW1zLm9wdGlvbnMubGV2ZWxzLDEwKXx8MTtcblxuXHRcdGlmIChQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzSW1hZ2VEYXRhKCkpIHtcblx0XHRcdHZhciBkYXRhID0gUGl4YXN0aWMucHJlcGFyZURhdGEocGFyYW1zKTtcblxuXHRcdFx0bnVtTGV2ZWxzID0gTWF0aC5tYXgoMixNYXRoLm1pbigyNTYsbnVtTGV2ZWxzKSk7XG5cdFxuXHRcdFx0dmFyIG51bUFyZWFzID0gMjU2IC8gbnVtTGV2ZWxzO1xuXHRcdFx0dmFyIG51bVZhbHVlcyA9IDI1NiAvIChudW1MZXZlbHMtMSk7XG5cblx0XHRcdHZhciByZWN0ID0gcGFyYW1zLm9wdGlvbnMucmVjdDtcblx0XHRcdHZhciB3ID0gcmVjdC53aWR0aDtcblx0XHRcdHZhciBoID0gcmVjdC5oZWlnaHQ7XG5cdFx0XHR2YXIgdzQgPSB3KjQ7XG5cdFx0XHR2YXIgeSA9IGg7XG5cdFx0XHRkbyB7XG5cdFx0XHRcdHZhciBvZmZzZXRZID0gKHktMSkqdzQ7XG5cdFx0XHRcdHZhciB4ID0gdztcblx0XHRcdFx0ZG8ge1xuXHRcdFx0XHRcdHZhciBvZmZzZXQgPSBvZmZzZXRZICsgKHgtMSkqNDtcblxuXHRcdFx0XHRcdHZhciByID0gbnVtVmFsdWVzICogKChkYXRhW29mZnNldF0gLyBudW1BcmVhcyk+PjApO1xuXHRcdFx0XHRcdHZhciBnID0gbnVtVmFsdWVzICogKChkYXRhW29mZnNldCsxXSAvIG51bUFyZWFzKT4+MCk7XG5cdFx0XHRcdFx0dmFyIGIgPSBudW1WYWx1ZXMgKiAoKGRhdGFbb2Zmc2V0KzJdIC8gbnVtQXJlYXMpPj4wKTtcblxuXHRcdFx0XHRcdGlmIChyID4gMjU1KSByID0gMjU1O1xuXHRcdFx0XHRcdGlmIChnID4gMjU1KSBnID0gMjU1O1xuXHRcdFx0XHRcdGlmIChiID4gMjU1KSBiID0gMjU1O1xuXG5cdFx0XHRcdFx0ZGF0YVtvZmZzZXRdID0gcjtcblx0XHRcdFx0XHRkYXRhW29mZnNldCsxXSA9IGc7XG5cdFx0XHRcdFx0ZGF0YVtvZmZzZXQrMl0gPSBiO1xuXG5cdFx0XHRcdH0gd2hpbGUgKC0teCk7XG5cdFx0XHR9IHdoaWxlICgtLXkpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9LFxuXHRjaGVja1N1cHBvcnQgOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gUGl4YXN0aWMuQ2xpZW50Lmhhc0NhbnZhc0ltYWdlRGF0YSgpO1xuXHR9XG59XG5cblxuLypcbiAqIFBpeGFzdGljIExpYiAtIFBvaW50aWxsaXplIGZpbHRlciAtIHYwLjEuMFxuICogQ29weXJpZ2h0IChjKSAyMDA4IEphY29iIFNlaWRlbGluLCBqc2VpZGVsaW5AbmloaWxvZ2ljLmRrLCBodHRwOi8vYmxvZy5uaWhpbG9naWMuZGsvXG4gKiBMaWNlbnNlOiBbaHR0cDovL3d3dy5waXhhc3RpYy5jb20vbGliL2xpY2Vuc2UudHh0XVxuICovXG5cblBpeGFzdGljLkFjdGlvbnMucG9pbnRpbGxpemUgPSB7XG5cblx0cHJvY2VzcyA6IGZ1bmN0aW9uKHBhcmFtcykge1xuXHRcdHZhciByYWRpdXMgPSBNYXRoLm1heCgxLHBhcnNlSW50KHBhcmFtcy5vcHRpb25zLnJhZGl1cywxMCkpO1xuXHRcdHZhciBkZW5zaXR5ID0gTWF0aC5taW4oNSxNYXRoLm1heCgwLHBhcnNlRmxvYXQocGFyYW1zLm9wdGlvbnMuZGVuc2l0eSl8fDApKTtcblx0XHR2YXIgbm9pc2UgPSBNYXRoLm1heCgwLHBhcnNlRmxvYXQocGFyYW1zLm9wdGlvbnMubm9pc2UpfHwwKTtcblx0XHR2YXIgdHJhbnNwYXJlbnQgPSAhIShwYXJhbXMub3B0aW9ucy50cmFuc3BhcmVudCAmJiBwYXJhbXMub3B0aW9ucy50cmFuc3BhcmVudCAhPSBcImZhbHNlXCIpO1xuXG5cdFx0aWYgKFBpeGFzdGljLkNsaWVudC5oYXNDYW52YXNJbWFnZURhdGEoKSkge1xuXHRcdFx0dmFyIHJlY3QgPSBwYXJhbXMub3B0aW9ucy5yZWN0O1xuXHRcdFx0dmFyIHcgPSByZWN0LndpZHRoO1xuXHRcdFx0dmFyIGggPSByZWN0LmhlaWdodDtcblx0XHRcdHZhciB3NCA9IHcqNDtcblx0XHRcdHZhciB5ID0gaDtcblxuXHRcdFx0dmFyIGN0eCA9IHBhcmFtcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuXHRcdFx0dmFyIGNhbnZhc1dpZHRoID0gcGFyYW1zLmNhbnZhcy53aWR0aDtcblx0XHRcdHZhciBjYW52YXNIZWlnaHQgPSBwYXJhbXMuY2FudmFzLmhlaWdodDtcblxuXHRcdFx0dmFyIHBpeGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcblx0XHRcdHBpeGVsLndpZHRoID0gcGl4ZWwuaGVpZ2h0ID0gMTtcblx0XHRcdHZhciBwaXhlbEN0eCA9IHBpeGVsLmdldENvbnRleHQoXCIyZFwiKTtcblxuXHRcdFx0dmFyIGNvcHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuXHRcdFx0Y29weS53aWR0aCA9IHc7XG5cdFx0XHRjb3B5LmhlaWdodCA9IGg7XG5cdFx0XHR2YXIgY29weUN0eCA9IGNvcHkuZ2V0Q29udGV4dChcIjJkXCIpO1xuXHRcdFx0Y29weUN0eC5kcmF3SW1hZ2UocGFyYW1zLmNhbnZhcyxyZWN0LmxlZnQscmVjdC50b3AsdyxoLCAwLDAsdyxoKTtcblxuXHRcdFx0dmFyIGRpYW1ldGVyID0gcmFkaXVzICogMjtcblxuXHRcdFx0aWYgKHRyYW5zcGFyZW50KVxuXHRcdFx0XHRjdHguY2xlYXJSZWN0KHJlY3QubGVmdCwgcmVjdC50b3AsIHJlY3Qud2lkdGgsIHJlY3QuaGVpZ2h0KTtcblxuXHRcdFx0dmFyIG5vaXNlUmFkaXVzID0gcmFkaXVzICogbm9pc2U7XG5cblx0XHRcdHZhciBkaXN0ID0gMSAvIGRlbnNpdHk7XG5cblx0XHRcdGZvciAodmFyIHk9MDt5PGgrcmFkaXVzO3krPWRpYW1ldGVyKmRpc3QpIHtcblx0XHRcdFx0Zm9yICh2YXIgeD0wO3g8dytyYWRpdXM7eCs9ZGlhbWV0ZXIqZGlzdCkge1xuXHRcdFx0XHRcdHJuZFggPSBub2lzZSA/ICh4KygoTWF0aC5yYW5kb20oKSoyLTEpICogbm9pc2VSYWRpdXMpKT4+MCA6IHg7XG5cdFx0XHRcdFx0cm5kWSA9IG5vaXNlID8gKHkrKChNYXRoLnJhbmRvbSgpKjItMSkgKiBub2lzZVJhZGl1cykpPj4wIDogeTtcblxuXHRcdFx0XHRcdHZhciBwaXhYID0gcm5kWCAtIHJhZGl1cztcblx0XHRcdFx0XHR2YXIgcGl4WSA9IHJuZFkgLSByYWRpdXM7XG5cdFx0XHRcdFx0aWYgKHBpeFggPCAwKSBwaXhYID0gMDtcblx0XHRcdFx0XHRpZiAocGl4WSA8IDApIHBpeFkgPSAwO1xuXG5cdFx0XHRcdFx0dmFyIGN4ID0gcm5kWCArIHJlY3QubGVmdDtcblx0XHRcdFx0XHR2YXIgY3kgPSBybmRZICsgcmVjdC50b3A7XG5cdFx0XHRcdFx0aWYgKGN4IDwgMCkgY3ggPSAwO1xuXHRcdFx0XHRcdGlmIChjeCA+IGNhbnZhc1dpZHRoKSBjeCA9IGNhbnZhc1dpZHRoO1xuXHRcdFx0XHRcdGlmIChjeSA8IDApIGN5ID0gMDtcblx0XHRcdFx0XHRpZiAoY3kgPiBjYW52YXNIZWlnaHQpIGN5ID0gY2FudmFzSGVpZ2h0O1xuXG5cdFx0XHRcdFx0dmFyIGRpYW1ldGVyWCA9IGRpYW1ldGVyO1xuXHRcdFx0XHRcdHZhciBkaWFtZXRlclkgPSBkaWFtZXRlcjtcblxuXHRcdFx0XHRcdGlmIChkaWFtZXRlclggKyBwaXhYID4gdylcblx0XHRcdFx0XHRcdGRpYW1ldGVyWCA9IHcgLSBwaXhYO1xuXHRcdFx0XHRcdGlmIChkaWFtZXRlclkgKyBwaXhZID4gaClcblx0XHRcdFx0XHRcdGRpYW1ldGVyWSA9IGggLSBwaXhZO1xuXHRcdFx0XHRcdGlmIChkaWFtZXRlclggPCAxKSBkaWFtZXRlclggPSAxO1xuXHRcdFx0XHRcdGlmIChkaWFtZXRlclkgPCAxKSBkaWFtZXRlclkgPSAxO1xuXG5cdFx0XHRcdFx0cGl4ZWxDdHguZHJhd0ltYWdlKGNvcHksIHBpeFgsIHBpeFksIGRpYW1ldGVyWCwgZGlhbWV0ZXJZLCAwLCAwLCAxLCAxKTtcblx0XHRcdFx0XHR2YXIgZGF0YSA9IHBpeGVsQ3R4LmdldEltYWdlRGF0YSgwLDAsMSwxKS5kYXRhO1xuXG5cdFx0XHRcdFx0Y3R4LmZpbGxTdHlsZSA9IFwicmdiKFwiICsgZGF0YVswXSArIFwiLFwiICsgZGF0YVsxXSArIFwiLFwiICsgZGF0YVsyXSArIFwiKVwiO1xuXHRcdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0XHRjdHguYXJjKGN4LCBjeSwgcmFkaXVzLCAwLCBNYXRoLlBJKjIsIHRydWUpO1xuXHRcdFx0XHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRcdFx0XHRjdHguZmlsbCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHBhcmFtcy51c2VEYXRhID0gZmFsc2U7XG5cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fSxcblx0Y2hlY2tTdXBwb3J0IDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIChQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzSW1hZ2VEYXRhKCkpO1xuXHR9XG59LypcbiAqIFBpeGFzdGljIExpYiAtIFJlbW92ZSBub2lzZSAtIHYwLjEuMFxuICogQ29weXJpZ2h0IChjKSAyMDA4IEphY29iIFNlaWRlbGluLCBqc2VpZGVsaW5AbmloaWxvZ2ljLmRrLCBodHRwOi8vYmxvZy5uaWhpbG9naWMuZGsvXG4gKiBMaWNlbnNlOiBbaHR0cDovL3d3dy5waXhhc3RpYy5jb20vbGliL2xpY2Vuc2UudHh0XVxuICovXG5cblBpeGFzdGljLkFjdGlvbnMucmVtb3Zlbm9pc2UgPSB7XG5cdHByb2Nlc3MgOiBmdW5jdGlvbihwYXJhbXMpIHtcblxuXHRcdGlmIChQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzSW1hZ2VEYXRhKCkpIHtcblx0XHRcdHZhciBkYXRhID0gUGl4YXN0aWMucHJlcGFyZURhdGEocGFyYW1zKTtcblxuXHRcdFx0dmFyIHJlY3QgPSBwYXJhbXMub3B0aW9ucy5yZWN0O1xuXHRcdFx0dmFyIHcgPSByZWN0LndpZHRoO1xuXHRcdFx0dmFyIGggPSByZWN0LmhlaWdodDtcblxuXHRcdFx0dmFyIHc0ID0gdyo0O1xuXHRcdFx0dmFyIHkgPSBoO1xuXHRcdFx0ZG8ge1xuXHRcdFx0XHR2YXIgb2Zmc2V0WSA9ICh5LTEpKnc0O1xuXG5cdFx0XHRcdHZhciBuZXh0WSA9ICh5ID09IGgpID8geSAtIDEgOiB5O1xuXHRcdFx0XHR2YXIgcHJldlkgPSAoeSA9PSAxKSA/IDAgOiB5LTI7XG5cblx0XHRcdFx0dmFyIG9mZnNldFlQcmV2ID0gcHJldlkqdyo0O1xuXHRcdFx0XHR2YXIgb2Zmc2V0WU5leHQgPSBuZXh0WSp3KjQ7XG5cblx0XHRcdFx0dmFyIHggPSB3O1xuXHRcdFx0XHRkbyB7XG5cdFx0XHRcdFx0dmFyIG9mZnNldCA9IG9mZnNldFkgKyAoeCo0LTQpO1xuXG5cdFx0XHRcdFx0dmFyIG9mZnNldFByZXYgPSBvZmZzZXRZUHJldiArICgoeCA9PSAxKSA/IDAgOiB4LTIpICogNDtcblx0XHRcdFx0XHR2YXIgb2Zmc2V0TmV4dCA9IG9mZnNldFlOZXh0ICsgKCh4ID09IHcpID8geC0xIDogeCkgKiA0O1xuXG5cdFx0XHRcdFx0dmFyIG1pblIsIG1heFIsIG1pbkcsIG1heEcsIG1pbkIsIG1heEI7XG5cblx0XHRcdFx0XHRtaW5SID0gbWF4UiA9IGRhdGFbb2Zmc2V0UHJldl07XG5cdFx0XHRcdFx0dmFyIHIxID0gZGF0YVtvZmZzZXQtNF0sIHIyID0gZGF0YVtvZmZzZXQrNF0sIHIzID0gZGF0YVtvZmZzZXROZXh0XTtcblx0XHRcdFx0XHRpZiAocjEgPCBtaW5SKSBtaW5SID0gcjE7XG5cdFx0XHRcdFx0aWYgKHIyIDwgbWluUikgbWluUiA9IHIyO1xuXHRcdFx0XHRcdGlmIChyMyA8IG1pblIpIG1pblIgPSByMztcblx0XHRcdFx0XHRpZiAocjEgPiBtYXhSKSBtYXhSID0gcjE7XG5cdFx0XHRcdFx0aWYgKHIyID4gbWF4UikgbWF4UiA9IHIyO1xuXHRcdFx0XHRcdGlmIChyMyA+IG1heFIpIG1heFIgPSByMztcblxuXHRcdFx0XHRcdG1pbkcgPSBtYXhHID0gZGF0YVtvZmZzZXRQcmV2KzFdO1xuXHRcdFx0XHRcdHZhciBnMSA9IGRhdGFbb2Zmc2V0LTNdLCBnMiA9IGRhdGFbb2Zmc2V0KzVdLCBnMyA9IGRhdGFbb2Zmc2V0TmV4dCsxXTtcblx0XHRcdFx0XHRpZiAoZzEgPCBtaW5HKSBtaW5HID0gZzE7XG5cdFx0XHRcdFx0aWYgKGcyIDwgbWluRykgbWluRyA9IGcyO1xuXHRcdFx0XHRcdGlmIChnMyA8IG1pbkcpIG1pbkcgPSBnMztcblx0XHRcdFx0XHRpZiAoZzEgPiBtYXhHKSBtYXhHID0gZzE7XG5cdFx0XHRcdFx0aWYgKGcyID4gbWF4RykgbWF4RyA9IGcyO1xuXHRcdFx0XHRcdGlmIChnMyA+IG1heEcpIG1heEcgPSBnMztcblxuXHRcdFx0XHRcdG1pbkIgPSBtYXhCID0gZGF0YVtvZmZzZXRQcmV2KzJdO1xuXHRcdFx0XHRcdHZhciBiMSA9IGRhdGFbb2Zmc2V0LTJdLCBiMiA9IGRhdGFbb2Zmc2V0KzZdLCBiMyA9IGRhdGFbb2Zmc2V0TmV4dCsyXTtcblx0XHRcdFx0XHRpZiAoYjEgPCBtaW5CKSBtaW5CID0gYjE7XG5cdFx0XHRcdFx0aWYgKGIyIDwgbWluQikgbWluQiA9IGIyO1xuXHRcdFx0XHRcdGlmIChiMyA8IG1pbkIpIG1pbkIgPSBiMztcblx0XHRcdFx0XHRpZiAoYjEgPiBtYXhCKSBtYXhCID0gYjE7XG5cdFx0XHRcdFx0aWYgKGIyID4gbWF4QikgbWF4QiA9IGIyO1xuXHRcdFx0XHRcdGlmIChiMyA+IG1heEIpIG1heEIgPSBiMztcblxuXHRcdFx0XHRcdGlmIChkYXRhW29mZnNldF0gPiBtYXhSKSB7XG5cdFx0XHRcdFx0XHRkYXRhW29mZnNldF0gPSBtYXhSO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoZGF0YVtvZmZzZXRdIDwgbWluUikge1xuXHRcdFx0XHRcdFx0ZGF0YVtvZmZzZXRdID0gbWluUjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKGRhdGFbb2Zmc2V0KzFdID4gbWF4Rykge1xuXHRcdFx0XHRcdFx0ZGF0YVtvZmZzZXQrMV0gPSBtYXhHO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoZGF0YVtvZmZzZXQrMV0gPCBtaW5HKSB7XG5cdFx0XHRcdFx0XHRkYXRhW29mZnNldCsxXSA9IG1pbkc7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChkYXRhW29mZnNldCsyXSA+IG1heEIpIHtcblx0XHRcdFx0XHRcdGRhdGFbb2Zmc2V0KzJdID0gbWF4Qjtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKGRhdGFbb2Zmc2V0KzJdIDwgbWluQikge1xuXHRcdFx0XHRcdFx0ZGF0YVtvZmZzZXQrMl0gPSBtaW5CO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9IHdoaWxlICgtLXgpO1xuXHRcdFx0fSB3aGlsZSAoLS15KTtcblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9LFxuXHRjaGVja1N1cHBvcnQgOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gUGl4YXN0aWMuQ2xpZW50Lmhhc0NhbnZhc0ltYWdlRGF0YSgpO1xuXHR9XG59LypcbiAqIFBpeGFzdGljIExpYiAtIFJlc2l6ZSAtIHYwLjEuMFxuICogQ29weXJpZ2h0IChjKSAyMDA5IEphY29iIFNlaWRlbGluLCBqc2VpZGVsaW5AbmloaWxvZ2ljLmRrLCBodHRwOi8vYmxvZy5uaWhpbG9naWMuZGsvXG4gKiBMaWNlbnNlOiBbaHR0cDovL3d3dy5waXhhc3RpYy5jb20vbGliL2xpY2Vuc2UudHh0XVxuICovXG5cblBpeGFzdGljLkFjdGlvbnMucmVzaXplID0ge1xuXHRwcm9jZXNzIDogZnVuY3Rpb24ocGFyYW1zKSB7XG5cdFx0aWYgKFBpeGFzdGljLkNsaWVudC5oYXNDYW52YXMoKSkge1xuXHRcdFx0dmFyIHdpZHRoID0gcGFyc2VJbnQocGFyYW1zLm9wdGlvbnMud2lkdGgsMTApO1xuXHRcdFx0dmFyIGhlaWdodCA9IHBhcnNlSW50KHBhcmFtcy5vcHRpb25zLmhlaWdodCwxMCk7XG5cdFx0XHR2YXIgY2FudmFzID0gcGFyYW1zLmNhbnZhcztcblxuXHRcdFx0aWYgKHdpZHRoIDwgMSkgd2lkdGggPSAxO1xuXHRcdFx0aWYgKHdpZHRoIDwgMikgd2lkdGggPSAyO1xuXG5cdFx0XHR2YXIgY29weSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG5cdFx0XHRjb3B5LndpZHRoID0gd2lkdGg7XG5cdFx0XHRjb3B5LmhlaWdodCA9IGhlaWdodDtcblxuXHRcdFx0Y29weS5nZXRDb250ZXh0KFwiMmRcIikuZHJhd0ltYWdlKGNhbnZhcywwLDAsd2lkdGgsaGVpZ2h0KTtcblx0XHRcdGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuXHRcdFx0Y2FudmFzLmhlaWdodCA9IGhlaWdodDtcblxuXHRcdFx0Y2FudmFzLmdldENvbnRleHQoXCIyZFwiKS5kcmF3SW1hZ2UoY29weSwwLDApO1xuXG5cdFx0XHRwYXJhbXMudXNlRGF0YSA9IGZhbHNlO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9LFxuXHRjaGVja1N1cHBvcnQgOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gUGl4YXN0aWMuQ2xpZW50Lmhhc0NhbnZhcygpO1xuXHR9XG59XG5cblxuLypcbiAqIFBpeGFzdGljIExpYiAtIFJvdGF0ZSAtIHYwLjEuMFxuICogQ29weXJpZ2h0IChjKSAyMDA5IEphY29iIFNlaWRlbGluLCBqc2VpZGVsaW5AbmloaWxvZ2ljLmRrLCBodHRwOi8vYmxvZy5uaWhpbG9naWMuZGsvXG4gKiBMaWNlbnNlOiBbaHR0cDovL3d3dy5waXhhc3RpYy5jb20vbGliL2xpY2Vuc2UudHh0XVxuICovXG5cblBpeGFzdGljLkFjdGlvbnMucm90YXRlID0ge1xuXHRwcm9jZXNzIDogZnVuY3Rpb24ocGFyYW1zKSB7XG5cdFx0aWYgKFBpeGFzdGljLkNsaWVudC5oYXNDYW52YXMoKSkge1xuXHRcdFx0dmFyIGNhbnZhcyA9IHBhcmFtcy5jYW52YXM7XG5cblx0XHRcdHZhciB3aWR0aCA9IHBhcmFtcy53aWR0aDtcblx0XHRcdHZhciBoZWlnaHQgPSBwYXJhbXMuaGVpZ2h0O1xuXG5cdFx0XHR2YXIgY29weSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG5cdFx0XHRjb3B5LndpZHRoID0gd2lkdGg7XG5cdFx0XHRjb3B5LmhlaWdodCA9IGhlaWdodDtcblx0XHRcdGNvcHkuZ2V0Q29udGV4dChcIjJkXCIpLmRyYXdJbWFnZShjYW52YXMsMCwwLHdpZHRoLGhlaWdodCk7XG5cblx0XHRcdHZhciBhbmdsZSA9IC1wYXJzZUZsb2F0KHBhcmFtcy5vcHRpb25zLmFuZ2xlKSAqIE1hdGguUEkgLyAxODA7XG5cblx0XHRcdHZhciBkaW1BbmdsZSA9IGFuZ2xlO1xuXHRcdFx0aWYgKGRpbUFuZ2xlID4gTWF0aC5QSSowLjUpXG5cdFx0XHRcdGRpbUFuZ2xlID0gTWF0aC5QSSAtIGRpbUFuZ2xlO1xuXHRcdFx0aWYgKGRpbUFuZ2xlIDwgLU1hdGguUEkqMC41KVxuXHRcdFx0XHRkaW1BbmdsZSA9IC1NYXRoLlBJIC0gZGltQW5nbGU7XG5cblx0XHRcdHZhciBkaWFnID0gTWF0aC5zcXJ0KHdpZHRoKndpZHRoICsgaGVpZ2h0KmhlaWdodCk7XG5cblx0XHRcdHZhciBkaWFnQW5nbGUxID0gTWF0aC5hYnMoZGltQW5nbGUpIC0gTWF0aC5hYnMoTWF0aC5hdGFuMihoZWlnaHQsIHdpZHRoKSk7XG5cdFx0XHR2YXIgZGlhZ0FuZ2xlMiA9IE1hdGguYWJzKGRpbUFuZ2xlKSArIE1hdGguYWJzKE1hdGguYXRhbjIoaGVpZ2h0LCB3aWR0aCkpO1xuXG5cdFx0XHR2YXIgbmV3V2lkdGggPSBNYXRoLmFicyhNYXRoLmNvcyhkaWFnQW5nbGUxKSAqIGRpYWcpO1xuXHRcdFx0dmFyIG5ld0hlaWdodCA9IE1hdGguYWJzKE1hdGguc2luKGRpYWdBbmdsZTIpICogZGlhZyk7XG5cblx0XHRcdGNhbnZhcy53aWR0aCA9IG5ld1dpZHRoO1xuXHRcdFx0Y2FudmFzLmhlaWdodCA9IG5ld0hlaWdodDtcblxuXHRcdFx0dmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG5cdFx0XHRjdHgudHJhbnNsYXRlKG5ld1dpZHRoLzIsIG5ld0hlaWdodC8yKTtcblx0XHRcdGN0eC5yb3RhdGUoYW5nbGUpO1xuXHRcdFx0Y3R4LmRyYXdJbWFnZShjb3B5LC13aWR0aC8yLC1oZWlnaHQvMik7XG5cblx0XHRcdHBhcmFtcy51c2VEYXRhID0gZmFsc2U7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH0sXG5cdGNoZWNrU3VwcG9ydCA6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzKCk7XG5cdH1cbn1cblxuXG4vKlxuICogUGl4YXN0aWMgTGliIC0gU2VwaWEgZmlsdGVyIC0gdjAuMS4wXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDggSmFjb2IgU2VpZGVsaW4sIGpzZWlkZWxpbkBuaWhpbG9naWMuZGssIGh0dHA6Ly9ibG9nLm5paGlsb2dpYy5kay9cbiAqIExpY2Vuc2U6IFtodHRwOi8vd3d3LnBpeGFzdGljLmNvbS9saWIvbGljZW5zZS50eHRdXG4gKi9cblxuUGl4YXN0aWMuQWN0aW9ucy5zZXBpYSA9IHtcblxuXHRwcm9jZXNzIDogZnVuY3Rpb24ocGFyYW1zKSB7XG5cdFx0dmFyIG1vZGUgPSAocGFyc2VJbnQocGFyYW1zLm9wdGlvbnMubW9kZSwxMCl8fDApO1xuXHRcdGlmIChtb2RlIDwgMCkgbW9kZSA9IDA7XG5cdFx0aWYgKG1vZGUgPiAxKSBtb2RlID0gMTtcblxuXHRcdGlmIChQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzSW1hZ2VEYXRhKCkpIHtcblx0XHRcdHZhciBkYXRhID0gUGl4YXN0aWMucHJlcGFyZURhdGEocGFyYW1zKTtcblx0XHRcdHZhciByZWN0ID0gcGFyYW1zLm9wdGlvbnMucmVjdDtcblx0XHRcdHZhciB3ID0gcmVjdC53aWR0aDtcblx0XHRcdHZhciBoID0gcmVjdC5oZWlnaHQ7XG5cdFx0XHR2YXIgdzQgPSB3KjQ7XG5cdFx0XHR2YXIgeSA9IGg7XG5cdFx0XHRkbyB7XG5cdFx0XHRcdHZhciBvZmZzZXRZID0gKHktMSkqdzQ7XG5cdFx0XHRcdHZhciB4ID0gdztcblx0XHRcdFx0ZG8ge1xuXHRcdFx0XHRcdHZhciBvZmZzZXQgPSBvZmZzZXRZICsgKHgtMSkqNDtcblxuXHRcdFx0XHRcdGlmIChtb2RlKSB7XG5cdFx0XHRcdFx0XHQvLyBhIGJpdCBmYXN0ZXIsIGJ1dCBub3QgYXMgZ29vZFxuXHRcdFx0XHRcdFx0dmFyIGQgPSBkYXRhW29mZnNldF0gKiAwLjI5OSArIGRhdGFbb2Zmc2V0KzFdICogMC41ODcgKyBkYXRhW29mZnNldCsyXSAqIDAuMTE0O1xuXHRcdFx0XHRcdFx0dmFyIHIgPSAoZCArIDM5KTtcblx0XHRcdFx0XHRcdHZhciBnID0gKGQgKyAxNCk7XG5cdFx0XHRcdFx0XHR2YXIgYiA9IChkIC0gMzYpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyBNaWNyb3NvZnRcblx0XHRcdFx0XHRcdHZhciBvciA9IGRhdGFbb2Zmc2V0XTtcblx0XHRcdFx0XHRcdHZhciBvZyA9IGRhdGFbb2Zmc2V0KzFdO1xuXHRcdFx0XHRcdFx0dmFyIG9iID0gZGF0YVtvZmZzZXQrMl07XG5cdFxuXHRcdFx0XHRcdFx0dmFyIHIgPSAob3IgKiAwLjM5MyArIG9nICogMC43NjkgKyBvYiAqIDAuMTg5KTtcblx0XHRcdFx0XHRcdHZhciBnID0gKG9yICogMC4zNDkgKyBvZyAqIDAuNjg2ICsgb2IgKiAwLjE2OCk7XG5cdFx0XHRcdFx0XHR2YXIgYiA9IChvciAqIDAuMjcyICsgb2cgKiAwLjUzNCArIG9iICogMC4xMzEpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChyIDwgMCkgciA9IDA7IGlmIChyID4gMjU1KSByID0gMjU1O1xuXHRcdFx0XHRcdGlmIChnIDwgMCkgZyA9IDA7IGlmIChnID4gMjU1KSBnID0gMjU1O1xuXHRcdFx0XHRcdGlmIChiIDwgMCkgYiA9IDA7IGlmIChiID4gMjU1KSBiID0gMjU1O1xuXG5cdFx0XHRcdFx0ZGF0YVtvZmZzZXRdID0gcjtcblx0XHRcdFx0XHRkYXRhW29mZnNldCsxXSA9IGc7XG5cdFx0XHRcdFx0ZGF0YVtvZmZzZXQrMl0gPSBiO1xuXG5cdFx0XHRcdH0gd2hpbGUgKC0teCk7XG5cdFx0XHR9IHdoaWxlICgtLXkpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9LFxuXHRjaGVja1N1cHBvcnQgOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gUGl4YXN0aWMuQ2xpZW50Lmhhc0NhbnZhc0ltYWdlRGF0YSgpO1xuXHR9XG59LypcbiAqIFBpeGFzdGljIExpYiAtIFNoYXJwZW4gZmlsdGVyIC0gdjAuMS4wXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDggSmFjb2IgU2VpZGVsaW4sIGpzZWlkZWxpbkBuaWhpbG9naWMuZGssIGh0dHA6Ly9ibG9nLm5paGlsb2dpYy5kay9cbiAqIExpY2Vuc2U6IFtodHRwOi8vd3d3LnBpeGFzdGljLmNvbS9saWIvbGljZW5zZS50eHRdXG4gKi9cblxuUGl4YXN0aWMuQWN0aW9ucy5zaGFycGVuID0ge1xuXHRwcm9jZXNzIDogZnVuY3Rpb24ocGFyYW1zKSB7XG5cblx0XHR2YXIgc3RyZW5ndGggPSAwO1xuXHRcdGlmICh0eXBlb2YgcGFyYW1zLm9wdGlvbnMuYW1vdW50ICE9IFwidW5kZWZpbmVkXCIpXG5cdFx0XHRzdHJlbmd0aCA9IHBhcnNlRmxvYXQocGFyYW1zLm9wdGlvbnMuYW1vdW50KXx8MDtcblxuXHRcdGlmIChzdHJlbmd0aCA8IDApIHN0cmVuZ3RoID0gMDtcblx0XHRpZiAoc3RyZW5ndGggPiAxKSBzdHJlbmd0aCA9IDE7XG5cblx0XHRpZiAoUGl4YXN0aWMuQ2xpZW50Lmhhc0NhbnZhc0ltYWdlRGF0YSgpKSB7XG5cdFx0XHR2YXIgZGF0YSA9IFBpeGFzdGljLnByZXBhcmVEYXRhKHBhcmFtcyk7XG5cdFx0XHR2YXIgZGF0YUNvcHkgPSBQaXhhc3RpYy5wcmVwYXJlRGF0YShwYXJhbXMsIHRydWUpXG5cblx0XHRcdHZhciBtdWwgPSAxNTtcblx0XHRcdHZhciBtdWxPdGhlciA9IDEgKyAzKnN0cmVuZ3RoO1xuXG5cdFx0XHR2YXIga2VybmVsID0gW1xuXHRcdFx0XHRbMCwgXHQtbXVsT3RoZXIsIFx0MF0sXG5cdFx0XHRcdFstbXVsT3RoZXIsIFx0bXVsLCBcdC1tdWxPdGhlcl0sXG5cdFx0XHRcdFswLCBcdC1tdWxPdGhlciwgXHQwXVxuXHRcdFx0XTtcblxuXHRcdFx0dmFyIHdlaWdodCA9IDA7XG5cdFx0XHRmb3IgKHZhciBpPTA7aTwzO2krKykge1xuXHRcdFx0XHRmb3IgKHZhciBqPTA7ajwzO2orKykge1xuXHRcdFx0XHRcdHdlaWdodCArPSBrZXJuZWxbaV1bal07XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0d2VpZ2h0ID0gMSAvIHdlaWdodDtcblxuXHRcdFx0dmFyIHJlY3QgPSBwYXJhbXMub3B0aW9ucy5yZWN0O1xuXHRcdFx0dmFyIHcgPSByZWN0LndpZHRoO1xuXHRcdFx0dmFyIGggPSByZWN0LmhlaWdodDtcblxuXHRcdFx0bXVsICo9IHdlaWdodDtcblx0XHRcdG11bE90aGVyICo9IHdlaWdodDtcblxuXHRcdFx0dmFyIHc0ID0gdyo0O1xuXHRcdFx0dmFyIHkgPSBoO1xuXHRcdFx0ZG8ge1xuXHRcdFx0XHR2YXIgb2Zmc2V0WSA9ICh5LTEpKnc0O1xuXG5cdFx0XHRcdHZhciBuZXh0WSA9ICh5ID09IGgpID8geSAtIDEgOiB5O1xuXHRcdFx0XHR2YXIgcHJldlkgPSAoeSA9PSAxKSA/IDAgOiB5LTI7XG5cblx0XHRcdFx0dmFyIG9mZnNldFlQcmV2ID0gcHJldlkqdzQ7XG5cdFx0XHRcdHZhciBvZmZzZXRZTmV4dCA9IG5leHRZKnc0O1xuXG5cdFx0XHRcdHZhciB4ID0gdztcblx0XHRcdFx0ZG8ge1xuXHRcdFx0XHRcdHZhciBvZmZzZXQgPSBvZmZzZXRZICsgKHgqNC00KTtcblxuXHRcdFx0XHRcdHZhciBvZmZzZXRQcmV2ID0gb2Zmc2V0WVByZXYgKyAoKHggPT0gMSkgPyAwIDogeC0yKSAqIDQ7XG5cdFx0XHRcdFx0dmFyIG9mZnNldE5leHQgPSBvZmZzZXRZTmV4dCArICgoeCA9PSB3KSA/IHgtMSA6IHgpICogNDtcblxuXHRcdFx0XHRcdHZhciByID0gKChcblx0XHRcdFx0XHRcdC0gZGF0YUNvcHlbb2Zmc2V0UHJldl1cblx0XHRcdFx0XHRcdC0gZGF0YUNvcHlbb2Zmc2V0LTRdXG5cdFx0XHRcdFx0XHQtIGRhdGFDb3B5W29mZnNldCs0XVxuXHRcdFx0XHRcdFx0LSBkYXRhQ29weVtvZmZzZXROZXh0XSlcdFx0KiBtdWxPdGhlclxuXHRcdFx0XHRcdFx0KyBkYXRhQ29weVtvZmZzZXRdIFx0KiBtdWxcblx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHR2YXIgZyA9ICgoXG5cdFx0XHRcdFx0XHQtIGRhdGFDb3B5W29mZnNldFByZXYrMV1cblx0XHRcdFx0XHRcdC0gZGF0YUNvcHlbb2Zmc2V0LTNdXG5cdFx0XHRcdFx0XHQtIGRhdGFDb3B5W29mZnNldCs1XVxuXHRcdFx0XHRcdFx0LSBkYXRhQ29weVtvZmZzZXROZXh0KzFdKVx0KiBtdWxPdGhlclxuXHRcdFx0XHRcdFx0KyBkYXRhQ29weVtvZmZzZXQrMV0gXHQqIG11bFxuXHRcdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdHZhciBiID0gKChcblx0XHRcdFx0XHRcdC0gZGF0YUNvcHlbb2Zmc2V0UHJldisyXVxuXHRcdFx0XHRcdFx0LSBkYXRhQ29weVtvZmZzZXQtMl1cblx0XHRcdFx0XHRcdC0gZGF0YUNvcHlbb2Zmc2V0KzZdXG5cdFx0XHRcdFx0XHQtIGRhdGFDb3B5W29mZnNldE5leHQrMl0pXHQqIG11bE90aGVyXG5cdFx0XHRcdFx0XHQrIGRhdGFDb3B5W29mZnNldCsyXSBcdCogbXVsXG5cdFx0XHRcdFx0XHQpO1xuXG5cblx0XHRcdFx0XHRpZiAociA8IDAgKSByID0gMDtcblx0XHRcdFx0XHRpZiAoZyA8IDAgKSBnID0gMDtcblx0XHRcdFx0XHRpZiAoYiA8IDAgKSBiID0gMDtcblx0XHRcdFx0XHRpZiAociA+IDI1NSApIHIgPSAyNTU7XG5cdFx0XHRcdFx0aWYgKGcgPiAyNTUgKSBnID0gMjU1O1xuXHRcdFx0XHRcdGlmIChiID4gMjU1ICkgYiA9IDI1NTtcblxuXHRcdFx0XHRcdGRhdGFbb2Zmc2V0XSA9IHI7XG5cdFx0XHRcdFx0ZGF0YVtvZmZzZXQrMV0gPSBnO1xuXHRcdFx0XHRcdGRhdGFbb2Zmc2V0KzJdID0gYjtcblxuXHRcdFx0XHR9IHdoaWxlICgtLXgpO1xuXHRcdFx0fSB3aGlsZSAoLS15KTtcblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cblx0XHR9XG5cdH0sXG5cdGNoZWNrU3VwcG9ydCA6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzSW1hZ2VEYXRhKCk7XG5cdH1cbn1cbi8qXG4gKiBQaXhhc3RpYyBMaWIgLSBTb2xhcml6ZSBmaWx0ZXIgLSB2MC4xLjBcbiAqIENvcHlyaWdodCAoYykgMjAwOCBKYWNvYiBTZWlkZWxpbiwganNlaWRlbGluQG5paGlsb2dpYy5kaywgaHR0cDovL2Jsb2cubmloaWxvZ2ljLmRrL1xuICogTGljZW5zZTogW2h0dHA6Ly93d3cucGl4YXN0aWMuY29tL2xpYi9saWNlbnNlLnR4dF1cbiAqL1xuXG5QaXhhc3RpYy5BY3Rpb25zLnNvbGFyaXplID0ge1xuXG5cdHByb2Nlc3MgOiBmdW5jdGlvbihwYXJhbXMpIHtcblx0XHR2YXIgdXNlQXZlcmFnZSA9ICEhKHBhcmFtcy5vcHRpb25zLmF2ZXJhZ2UgJiYgcGFyYW1zLm9wdGlvbnMuYXZlcmFnZSAhPSBcImZhbHNlXCIpO1xuXG5cdFx0aWYgKFBpeGFzdGljLkNsaWVudC5oYXNDYW52YXNJbWFnZURhdGEoKSkge1xuXHRcdFx0dmFyIGRhdGEgPSBQaXhhc3RpYy5wcmVwYXJlRGF0YShwYXJhbXMpO1xuXHRcdFx0dmFyIHJlY3QgPSBwYXJhbXMub3B0aW9ucy5yZWN0O1xuXHRcdFx0dmFyIHcgPSByZWN0LndpZHRoO1xuXHRcdFx0dmFyIGggPSByZWN0LmhlaWdodDtcblx0XHRcdHZhciB3NCA9IHcqNDtcblx0XHRcdHZhciB5ID0gaDtcblx0XHRcdGRvIHtcblx0XHRcdFx0dmFyIG9mZnNldFkgPSAoeS0xKSp3NDtcblx0XHRcdFx0dmFyIHggPSB3O1xuXHRcdFx0XHRkbyB7XG5cdFx0XHRcdFx0dmFyIG9mZnNldCA9IG9mZnNldFkgKyAoeC0xKSo0O1xuXG5cdFx0XHRcdFx0dmFyIHIgPSBkYXRhW29mZnNldF07XG5cdFx0XHRcdFx0dmFyIGcgPSBkYXRhW29mZnNldCsxXTtcblx0XHRcdFx0XHR2YXIgYiA9IGRhdGFbb2Zmc2V0KzJdO1xuXG5cdFx0XHRcdFx0aWYgKHIgPiAxMjcpIHIgPSAyNTUgLSByO1xuXHRcdFx0XHRcdGlmIChnID4gMTI3KSBnID0gMjU1IC0gZztcblx0XHRcdFx0XHRpZiAoYiA+IDEyNykgYiA9IDI1NSAtIGI7XG5cblx0XHRcdFx0XHRkYXRhW29mZnNldF0gPSByO1xuXHRcdFx0XHRcdGRhdGFbb2Zmc2V0KzFdID0gZztcblx0XHRcdFx0XHRkYXRhW29mZnNldCsyXSA9IGI7XG5cblx0XHRcdFx0fSB3aGlsZSAoLS14KTtcblx0XHRcdH0gd2hpbGUgKC0teSk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH0sXG5cdGNoZWNrU3VwcG9ydCA6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAoUGl4YXN0aWMuQ2xpZW50Lmhhc0NhbnZhc0ltYWdlRGF0YSgpKTtcblx0fVxufS8qXG4gKiBQaXhhc3RpYyBMaWIgLSBVU00gLSB2MC4xLjBcbiAqIENvcHlyaWdodCAoYykgMjAwOCBKYWNvYiBTZWlkZWxpbiwganNlaWRlbGluQG5paGlsb2dpYy5kaywgaHR0cDovL2Jsb2cubmloaWxvZ2ljLmRrL1xuICogTGljZW5zZTogW2h0dHA6Ly93d3cucGl4YXN0aWMuY29tL2xpYi9saWNlbnNlLnR4dF1cbiAqL1xuXG5cblBpeGFzdGljLkFjdGlvbnMudW5zaGFycG1hc2sgPSB7XG5cdHByb2Nlc3MgOiBmdW5jdGlvbihwYXJhbXMpIHtcblxuXHRcdHZhciBhbW91bnQgPSAocGFyc2VGbG9hdChwYXJhbXMub3B0aW9ucy5hbW91bnQpfHwwKTtcblx0XHR2YXIgYmx1ckFtb3VudCA9IHBhcnNlRmxvYXQocGFyYW1zLm9wdGlvbnMucmFkaXVzKXx8MDtcblx0XHR2YXIgdGhyZXNob2xkID0gcGFyc2VGbG9hdChwYXJhbXMub3B0aW9ucy50aHJlc2hvbGQpfHwwO1xuXG5cdFx0YW1vdW50ID0gTWF0aC5taW4oNTAwLE1hdGgubWF4KDAsYW1vdW50KSkgLyAyO1xuXHRcdGJsdXJBbW91bnQgPSBNYXRoLm1pbig1LE1hdGgubWF4KDAsYmx1ckFtb3VudCkpIC8gMTA7XG5cdFx0dGhyZXNob2xkID0gTWF0aC5taW4oMjU1LE1hdGgubWF4KDAsdGhyZXNob2xkKSk7XG5cblx0XHR0aHJlc2hvbGQtLTtcblx0XHR2YXIgdGhyZXNob2xkTmVnID0gLXRocmVzaG9sZDtcblxuXHRcdGFtb3VudCAqPSAwLjAxNjtcblx0XHRhbW91bnQrKztcblxuXHRcdGlmIChQaXhhc3RpYy5DbGllbnQuaGFzQ2FudmFzSW1hZ2VEYXRhKCkpIHtcblx0XHRcdHZhciByZWN0ID0gcGFyYW1zLm9wdGlvbnMucmVjdDtcblxuXHRcdFx0dmFyIGJsdXJDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuXHRcdFx0Ymx1ckNhbnZhcy53aWR0aCA9IHBhcmFtcy53aWR0aDtcblx0XHRcdGJsdXJDYW52YXMuaGVpZ2h0ID0gcGFyYW1zLmhlaWdodDtcblx0XHRcdHZhciBibHVyQ3R4ID0gYmx1ckNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG5cdFx0XHRibHVyQ3R4LmRyYXdJbWFnZShwYXJhbXMuY2FudmFzLDAsMCk7XG5cblx0XHRcdHZhciBzY2FsZSA9IDI7XG5cdFx0XHR2YXIgc21hbGxXaWR0aCA9IE1hdGgucm91bmQocGFyYW1zLndpZHRoIC8gc2NhbGUpO1xuXHRcdFx0dmFyIHNtYWxsSGVpZ2h0ID0gTWF0aC5yb3VuZChwYXJhbXMuaGVpZ2h0IC8gc2NhbGUpO1xuXG5cdFx0XHR2YXIgY29weSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG5cdFx0XHRjb3B5LndpZHRoID0gc21hbGxXaWR0aDtcblx0XHRcdGNvcHkuaGVpZ2h0ID0gc21hbGxIZWlnaHQ7XG5cblx0XHRcdHZhciBzdGVwcyA9IE1hdGgucm91bmQoYmx1ckFtb3VudCAqIDIwKTtcblxuXHRcdFx0dmFyIGNvcHlDdHggPSBjb3B5LmdldENvbnRleHQoXCIyZFwiKTtcblx0XHRcdGZvciAodmFyIGk9MDtpPHN0ZXBzO2krKykge1xuXHRcdFx0XHR2YXIgc2NhbGVkV2lkdGggPSBNYXRoLm1heCgxLE1hdGgucm91bmQoc21hbGxXaWR0aCAtIGkpKTtcblx0XHRcdFx0dmFyIHNjYWxlZEhlaWdodCA9IE1hdGgubWF4KDEsTWF0aC5yb3VuZChzbWFsbEhlaWdodCAtIGkpKTtcblxuXHRcdFx0XHRjb3B5Q3R4LmNsZWFyUmVjdCgwLDAsc21hbGxXaWR0aCxzbWFsbEhlaWdodCk7XG5cblx0XHRcdFx0Y29weUN0eC5kcmF3SW1hZ2UoXG5cdFx0XHRcdFx0Ymx1ckNhbnZhcyxcblx0XHRcdFx0XHQwLDAscGFyYW1zLndpZHRoLHBhcmFtcy5oZWlnaHQsXG5cdFx0XHRcdFx0MCwwLHNjYWxlZFdpZHRoLHNjYWxlZEhlaWdodFxuXHRcdFx0XHQpO1xuXHRcblx0XHRcdFx0Ymx1ckN0eC5jbGVhclJlY3QoMCwwLHBhcmFtcy53aWR0aCxwYXJhbXMuaGVpZ2h0KTtcblx0XG5cdFx0XHRcdGJsdXJDdHguZHJhd0ltYWdlKFxuXHRcdFx0XHRcdGNvcHksXG5cdFx0XHRcdFx0MCwwLHNjYWxlZFdpZHRoLHNjYWxlZEhlaWdodCxcblx0XHRcdFx0XHQwLDAscGFyYW1zLndpZHRoLHBhcmFtcy5oZWlnaHRcblx0XHRcdFx0KTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGRhdGEgPSBQaXhhc3RpYy5wcmVwYXJlRGF0YShwYXJhbXMpO1xuXHRcdFx0dmFyIGJsdXJEYXRhID0gUGl4YXN0aWMucHJlcGFyZURhdGEoe2NhbnZhczpibHVyQ2FudmFzLG9wdGlvbnM6cGFyYW1zLm9wdGlvbnN9KTtcblx0XHRcdHZhciB3ID0gcmVjdC53aWR0aDtcblx0XHRcdHZhciBoID0gcmVjdC5oZWlnaHQ7XG5cdFx0XHR2YXIgdzQgPSB3KjQ7XG5cdFx0XHR2YXIgeSA9IGg7XG5cdFx0XHRkbyB7XG5cdFx0XHRcdHZhciBvZmZzZXRZID0gKHktMSkqdzQ7XG5cdFx0XHRcdHZhciB4ID0gdztcblx0XHRcdFx0ZG8ge1xuXHRcdFx0XHRcdHZhciBvZmZzZXQgPSBvZmZzZXRZICsgKHgqNC00KTtcblxuXHRcdFx0XHRcdHZhciBkaWZSID0gZGF0YVtvZmZzZXRdIC0gYmx1ckRhdGFbb2Zmc2V0XTtcblx0XHRcdFx0XHRpZiAoZGlmUiA+IHRocmVzaG9sZCB8fCBkaWZSIDwgdGhyZXNob2xkTmVnKSB7XG5cdFx0XHRcdFx0XHR2YXIgYmx1clIgPSBibHVyRGF0YVtvZmZzZXRdO1xuXHRcdFx0XHRcdFx0Ymx1clIgPSBhbW91bnQgKiBkaWZSICsgYmx1clI7XG5cdFx0XHRcdFx0XHRkYXRhW29mZnNldF0gPSBibHVyUiA+IDI1NSA/IDI1NSA6IChibHVyUiA8IDAgPyAwIDogYmx1clIpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHZhciBkaWZHID0gZGF0YVtvZmZzZXQrMV0gLSBibHVyRGF0YVtvZmZzZXQrMV07XG5cdFx0XHRcdFx0aWYgKGRpZkcgPiB0aHJlc2hvbGQgfHwgZGlmRyA8IHRocmVzaG9sZE5lZykge1xuXHRcdFx0XHRcdFx0dmFyIGJsdXJHID0gYmx1ckRhdGFbb2Zmc2V0KzFdO1xuXHRcdFx0XHRcdFx0Ymx1ckcgPSBhbW91bnQgKiBkaWZHICsgYmx1ckc7XG5cdFx0XHRcdFx0XHRkYXRhW29mZnNldCsxXSA9IGJsdXJHID4gMjU1ID8gMjU1IDogKGJsdXJHIDwgMCA/IDAgOiBibHVyRyk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0dmFyIGRpZkIgPSBkYXRhW29mZnNldCsyXSAtIGJsdXJEYXRhW29mZnNldCsyXTtcblx0XHRcdFx0XHRpZiAoZGlmQiA+IHRocmVzaG9sZCB8fCBkaWZCIDwgdGhyZXNob2xkTmVnKSB7XG5cdFx0XHRcdFx0XHR2YXIgYmx1ckIgPSBibHVyRGF0YVtvZmZzZXQrMl07XG5cdFx0XHRcdFx0XHRibHVyQiA9IGFtb3VudCAqIGRpZkIgKyBibHVyQjtcblx0XHRcdFx0XHRcdGRhdGFbb2Zmc2V0KzJdID0gYmx1ckIgPiAyNTUgPyAyNTUgOiAoYmx1ckIgPCAwID8gMCA6IGJsdXJCKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSB3aGlsZSAoLS14KTtcblx0XHRcdH0gd2hpbGUgKC0teSk7XG5cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fSxcblx0Y2hlY2tTdXBwb3J0IDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIFBpeGFzdGljLkNsaWVudC5oYXNDYW52YXNJbWFnZURhdGEoKTtcblx0fVxufVxuXG5cblxuXG47IGJyb3dzZXJpZnlfc2hpbV9fZGVmaW5lX19tb2R1bGVfX2V4cG9ydF9fKHR5cGVvZiBQaXhhc3RpYyAhPSBcInVuZGVmaW5lZFwiID8gUGl4YXN0aWMgOiB3aW5kb3cuUGl4YXN0aWMpO1xuXG59KS5jYWxsKGdsb2JhbCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBmdW5jdGlvbiBkZWZpbmVFeHBvcnQoZXgpIHsgbW9kdWxlLmV4cG9ydHMgPSBleDsgfSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLy8gICAgIFVuZGVyc2NvcmUuanMgMS42LjBcbi8vICAgICBodHRwOi8vdW5kZXJzY29yZWpzLm9yZ1xuLy8gICAgIChjKSAyMDA5LTIwMTQgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbi8vICAgICBVbmRlcnNjb3JlIG1heSBiZSBmcmVlbHkgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuXG4oZnVuY3Rpb24oKSB7XG5cbiAgLy8gQmFzZWxpbmUgc2V0dXBcbiAgLy8gLS0tLS0tLS0tLS0tLS1cblxuICAvLyBFc3RhYmxpc2ggdGhlIHJvb3Qgb2JqZWN0LCBgd2luZG93YCBpbiB0aGUgYnJvd3Nlciwgb3IgYGV4cG9ydHNgIG9uIHRoZSBzZXJ2ZXIuXG4gIHZhciByb290ID0gdGhpcztcblxuICAvLyBTYXZlIHRoZSBwcmV2aW91cyB2YWx1ZSBvZiB0aGUgYF9gIHZhcmlhYmxlLlxuICB2YXIgcHJldmlvdXNVbmRlcnNjb3JlID0gcm9vdC5fO1xuXG4gIC8vIEVzdGFibGlzaCB0aGUgb2JqZWN0IHRoYXQgZ2V0cyByZXR1cm5lZCB0byBicmVhayBvdXQgb2YgYSBsb29wIGl0ZXJhdGlvbi5cbiAgdmFyIGJyZWFrZXIgPSB7fTtcblxuICAvLyBTYXZlIGJ5dGVzIGluIHRoZSBtaW5pZmllZCAoYnV0IG5vdCBnemlwcGVkKSB2ZXJzaW9uOlxuICB2YXIgQXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZSwgT2JqUHJvdG8gPSBPYmplY3QucHJvdG90eXBlLCBGdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cbiAgLy8gQ3JlYXRlIHF1aWNrIHJlZmVyZW5jZSB2YXJpYWJsZXMgZm9yIHNwZWVkIGFjY2VzcyB0byBjb3JlIHByb3RvdHlwZXMuXG4gIHZhclxuICAgIHB1c2ggICAgICAgICAgICAgPSBBcnJheVByb3RvLnB1c2gsXG4gICAgc2xpY2UgICAgICAgICAgICA9IEFycmF5UHJvdG8uc2xpY2UsXG4gICAgY29uY2F0ICAgICAgICAgICA9IEFycmF5UHJvdG8uY29uY2F0LFxuICAgIHRvU3RyaW5nICAgICAgICAgPSBPYmpQcm90by50b1N0cmluZyxcbiAgICBoYXNPd25Qcm9wZXJ0eSAgID0gT2JqUHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbiAgLy8gQWxsICoqRUNNQVNjcmlwdCA1KiogbmF0aXZlIGZ1bmN0aW9uIGltcGxlbWVudGF0aW9ucyB0aGF0IHdlIGhvcGUgdG8gdXNlXG4gIC8vIGFyZSBkZWNsYXJlZCBoZXJlLlxuICB2YXJcbiAgICBuYXRpdmVGb3JFYWNoICAgICAgPSBBcnJheVByb3RvLmZvckVhY2gsXG4gICAgbmF0aXZlTWFwICAgICAgICAgID0gQXJyYXlQcm90by5tYXAsXG4gICAgbmF0aXZlUmVkdWNlICAgICAgID0gQXJyYXlQcm90by5yZWR1Y2UsXG4gICAgbmF0aXZlUmVkdWNlUmlnaHQgID0gQXJyYXlQcm90by5yZWR1Y2VSaWdodCxcbiAgICBuYXRpdmVGaWx0ZXIgICAgICAgPSBBcnJheVByb3RvLmZpbHRlcixcbiAgICBuYXRpdmVFdmVyeSAgICAgICAgPSBBcnJheVByb3RvLmV2ZXJ5LFxuICAgIG5hdGl2ZVNvbWUgICAgICAgICA9IEFycmF5UHJvdG8uc29tZSxcbiAgICBuYXRpdmVJbmRleE9mICAgICAgPSBBcnJheVByb3RvLmluZGV4T2YsXG4gICAgbmF0aXZlTGFzdEluZGV4T2YgID0gQXJyYXlQcm90by5sYXN0SW5kZXhPZixcbiAgICBuYXRpdmVJc0FycmF5ICAgICAgPSBBcnJheS5pc0FycmF5LFxuICAgIG5hdGl2ZUtleXMgICAgICAgICA9IE9iamVjdC5rZXlzLFxuICAgIG5hdGl2ZUJpbmQgICAgICAgICA9IEZ1bmNQcm90by5iaW5kO1xuXG4gIC8vIENyZWF0ZSBhIHNhZmUgcmVmZXJlbmNlIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdCBmb3IgdXNlIGJlbG93LlxuICB2YXIgXyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogaW5zdGFuY2VvZiBfKSByZXR1cm4gb2JqO1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBfKSkgcmV0dXJuIG5ldyBfKG9iaik7XG4gICAgdGhpcy5fd3JhcHBlZCA9IG9iajtcbiAgfTtcblxuICAvLyBFeHBvcnQgdGhlIFVuZGVyc2NvcmUgb2JqZWN0IGZvciAqKk5vZGUuanMqKiwgd2l0aFxuICAvLyBiYWNrd2FyZHMtY29tcGF0aWJpbGl0eSBmb3IgdGhlIG9sZCBgcmVxdWlyZSgpYCBBUEkuIElmIHdlJ3JlIGluXG4gIC8vIHRoZSBicm93c2VyLCBhZGQgYF9gIGFzIGEgZ2xvYmFsIG9iamVjdCB2aWEgYSBzdHJpbmcgaWRlbnRpZmllcixcbiAgLy8gZm9yIENsb3N1cmUgQ29tcGlsZXIgXCJhZHZhbmNlZFwiIG1vZGUuXG4gIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IF87XG4gICAgfVxuICAgIGV4cG9ydHMuXyA9IF87XG4gIH0gZWxzZSB7XG4gICAgcm9vdC5fID0gXztcbiAgfVxuXG4gIC8vIEN1cnJlbnQgdmVyc2lvbi5cbiAgXy5WRVJTSU9OID0gJzEuNi4wJztcblxuICAvLyBDb2xsZWN0aW9uIEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFRoZSBjb3JuZXJzdG9uZSwgYW4gYGVhY2hgIGltcGxlbWVudGF0aW9uLCBha2EgYGZvckVhY2hgLlxuICAvLyBIYW5kbGVzIG9iamVjdHMgd2l0aCB0aGUgYnVpbHQtaW4gYGZvckVhY2hgLCBhcnJheXMsIGFuZCByYXcgb2JqZWN0cy5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYGZvckVhY2hgIGlmIGF2YWlsYWJsZS5cbiAgdmFyIGVhY2ggPSBfLmVhY2ggPSBfLmZvckVhY2ggPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gb2JqO1xuICAgIGlmIChuYXRpdmVGb3JFYWNoICYmIG9iai5mb3JFYWNoID09PSBuYXRpdmVGb3JFYWNoKSB7XG4gICAgICBvYmouZm9yRWFjaChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgfSBlbHNlIGlmIChvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IG9iai5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpbaV0sIGksIG9iaikgPT09IGJyZWFrZXIpIHJldHVybjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtrZXlzW2ldXSwga2V5c1tpXSwgb2JqKSA9PT0gYnJlYWtlcikgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgcmVzdWx0cyBvZiBhcHBseWluZyB0aGUgaXRlcmF0b3IgdG8gZWFjaCBlbGVtZW50LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgbWFwYCBpZiBhdmFpbGFibGUuXG4gIF8ubWFwID0gXy5jb2xsZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0cztcbiAgICBpZiAobmF0aXZlTWFwICYmIG9iai5tYXAgPT09IG5hdGl2ZU1hcCkgcmV0dXJuIG9iai5tYXAoaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHJlc3VsdHMucHVzaChpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIHZhciByZWR1Y2VFcnJvciA9ICdSZWR1Y2Ugb2YgZW1wdHkgYXJyYXkgd2l0aCBubyBpbml0aWFsIHZhbHVlJztcblxuICAvLyAqKlJlZHVjZSoqIGJ1aWxkcyB1cCBhIHNpbmdsZSByZXN1bHQgZnJvbSBhIGxpc3Qgb2YgdmFsdWVzLCBha2EgYGluamVjdGAsXG4gIC8vIG9yIGBmb2xkbGAuIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGByZWR1Y2VgIGlmIGF2YWlsYWJsZS5cbiAgXy5yZWR1Y2UgPSBfLmZvbGRsID0gXy5pbmplY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBtZW1vLCBjb250ZXh0KSB7XG4gICAgdmFyIGluaXRpYWwgPSBhcmd1bWVudHMubGVuZ3RoID4gMjtcbiAgICBpZiAob2JqID09IG51bGwpIG9iaiA9IFtdO1xuICAgIGlmIChuYXRpdmVSZWR1Y2UgJiYgb2JqLnJlZHVjZSA9PT0gbmF0aXZlUmVkdWNlKSB7XG4gICAgICBpZiAoY29udGV4dCkgaXRlcmF0b3IgPSBfLmJpbmQoaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgICAgcmV0dXJuIGluaXRpYWwgPyBvYmoucmVkdWNlKGl0ZXJhdG9yLCBtZW1vKSA6IG9iai5yZWR1Y2UoaXRlcmF0b3IpO1xuICAgIH1cbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAoIWluaXRpYWwpIHtcbiAgICAgICAgbWVtbyA9IHZhbHVlO1xuICAgICAgICBpbml0aWFsID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1lbW8gPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG1lbW8sIHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKCFpbml0aWFsKSB0aHJvdyBuZXcgVHlwZUVycm9yKHJlZHVjZUVycm9yKTtcbiAgICByZXR1cm4gbWVtbztcbiAgfTtcblxuICAvLyBUaGUgcmlnaHQtYXNzb2NpYXRpdmUgdmVyc2lvbiBvZiByZWR1Y2UsIGFsc28ga25vd24gYXMgYGZvbGRyYC5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYHJlZHVjZVJpZ2h0YCBpZiBhdmFpbGFibGUuXG4gIF8ucmVkdWNlUmlnaHQgPSBfLmZvbGRyID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgbWVtbywgY29udGV4dCkge1xuICAgIHZhciBpbml0aWFsID0gYXJndW1lbnRzLmxlbmd0aCA+IDI7XG4gICAgaWYgKG9iaiA9PSBudWxsKSBvYmogPSBbXTtcbiAgICBpZiAobmF0aXZlUmVkdWNlUmlnaHQgJiYgb2JqLnJlZHVjZVJpZ2h0ID09PSBuYXRpdmVSZWR1Y2VSaWdodCkge1xuICAgICAgaWYgKGNvbnRleHQpIGl0ZXJhdG9yID0gXy5iaW5kKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICAgIHJldHVybiBpbml0aWFsID8gb2JqLnJlZHVjZVJpZ2h0KGl0ZXJhdG9yLCBtZW1vKSA6IG9iai5yZWR1Y2VSaWdodChpdGVyYXRvcik7XG4gICAgfVxuICAgIHZhciBsZW5ndGggPSBvYmoubGVuZ3RoO1xuICAgIGlmIChsZW5ndGggIT09ICtsZW5ndGgpIHtcbiAgICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgICBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB9XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaW5kZXggPSBrZXlzID8ga2V5c1stLWxlbmd0aF0gOiAtLWxlbmd0aDtcbiAgICAgIGlmICghaW5pdGlhbCkge1xuICAgICAgICBtZW1vID0gb2JqW2luZGV4XTtcbiAgICAgICAgaW5pdGlhbCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtZW1vID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCBtZW1vLCBvYmpbaW5kZXhdLCBpbmRleCwgbGlzdCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKCFpbml0aWFsKSB0aHJvdyBuZXcgVHlwZUVycm9yKHJlZHVjZUVycm9yKTtcbiAgICByZXR1cm4gbWVtbztcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIGZpcnN0IHZhbHVlIHdoaWNoIHBhc3NlcyBhIHRydXRoIHRlc3QuIEFsaWFzZWQgYXMgYGRldGVjdGAuXG4gIF8uZmluZCA9IF8uZGV0ZWN0ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0O1xuICAgIGFueShvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpIHtcbiAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGFsbCB0aGUgZWxlbWVudHMgdGhhdCBwYXNzIGEgdHJ1dGggdGVzdC5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYGZpbHRlcmAgaWYgYXZhaWxhYmxlLlxuICAvLyBBbGlhc2VkIGFzIGBzZWxlY3RgLlxuICBfLmZpbHRlciA9IF8uc2VsZWN0ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdHM7XG4gICAgaWYgKG5hdGl2ZUZpbHRlciAmJiBvYmouZmlsdGVyID09PSBuYXRpdmVGaWx0ZXIpIHJldHVybiBvYmouZmlsdGVyKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpIHJlc3VsdHMucHVzaCh2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGFsbCB0aGUgZWxlbWVudHMgZm9yIHdoaWNoIGEgdHJ1dGggdGVzdCBmYWlscy5cbiAgXy5yZWplY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHJldHVybiBfLmZpbHRlcihvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgcmV0dXJuICFwcmVkaWNhdGUuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpO1xuICAgIH0sIGNvbnRleHQpO1xuICB9O1xuXG4gIC8vIERldGVybWluZSB3aGV0aGVyIGFsbCBvZiB0aGUgZWxlbWVudHMgbWF0Y2ggYSB0cnV0aCB0ZXN0LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgZXZlcnlgIGlmIGF2YWlsYWJsZS5cbiAgLy8gQWxpYXNlZCBhcyBgYWxsYC5cbiAgXy5ldmVyeSA9IF8uYWxsID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgfHwgKHByZWRpY2F0ZSA9IF8uaWRlbnRpdHkpO1xuICAgIHZhciByZXN1bHQgPSB0cnVlO1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdDtcbiAgICBpZiAobmF0aXZlRXZlcnkgJiYgb2JqLmV2ZXJ5ID09PSBuYXRpdmVFdmVyeSkgcmV0dXJuIG9iai5ldmVyeShwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmICghKHJlc3VsdCA9IHJlc3VsdCAmJiBwcmVkaWNhdGUuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKSkgcmV0dXJuIGJyZWFrZXI7XG4gICAgfSk7XG4gICAgcmV0dXJuICEhcmVzdWx0O1xuICB9O1xuXG4gIC8vIERldGVybWluZSBpZiBhdCBsZWFzdCBvbmUgZWxlbWVudCBpbiB0aGUgb2JqZWN0IG1hdGNoZXMgYSB0cnV0aCB0ZXN0LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgc29tZWAgaWYgYXZhaWxhYmxlLlxuICAvLyBBbGlhc2VkIGFzIGBhbnlgLlxuICB2YXIgYW55ID0gXy5zb21lID0gXy5hbnkgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHByZWRpY2F0ZSB8fCAocHJlZGljYXRlID0gXy5pZGVudGl0eSk7XG4gICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdDtcbiAgICBpZiAobmF0aXZlU29tZSAmJiBvYmouc29tZSA9PT0gbmF0aXZlU29tZSkgcmV0dXJuIG9iai5zb21lKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKHJlc3VsdCB8fCAocmVzdWx0ID0gcHJlZGljYXRlLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkpIHJldHVybiBicmVha2VyO1xuICAgIH0pO1xuICAgIHJldHVybiAhIXJlc3VsdDtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgdGhlIGFycmF5IG9yIG9iamVjdCBjb250YWlucyBhIGdpdmVuIHZhbHVlICh1c2luZyBgPT09YCkuXG4gIC8vIEFsaWFzZWQgYXMgYGluY2x1ZGVgLlxuICBfLmNvbnRhaW5zID0gXy5pbmNsdWRlID0gZnVuY3Rpb24ob2JqLCB0YXJnZXQpIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgICBpZiAobmF0aXZlSW5kZXhPZiAmJiBvYmouaW5kZXhPZiA9PT0gbmF0aXZlSW5kZXhPZikgcmV0dXJuIG9iai5pbmRleE9mKHRhcmdldCkgIT0gLTE7XG4gICAgcmV0dXJuIGFueShvYmosIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IHRhcmdldDtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBJbnZva2UgYSBtZXRob2QgKHdpdGggYXJndW1lbnRzKSBvbiBldmVyeSBpdGVtIGluIGEgY29sbGVjdGlvbi5cbiAgXy5pbnZva2UgPSBmdW5jdGlvbihvYmosIG1ldGhvZCkge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHZhciBpc0Z1bmMgPSBfLmlzRnVuY3Rpb24obWV0aG9kKTtcbiAgICByZXR1cm4gXy5tYXAob2JqLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIChpc0Z1bmMgPyBtZXRob2QgOiB2YWx1ZVttZXRob2RdKS5hcHBseSh2YWx1ZSwgYXJncyk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgbWFwYDogZmV0Y2hpbmcgYSBwcm9wZXJ0eS5cbiAgXy5wbHVjayA9IGZ1bmN0aW9uKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIF8ubWFwKG9iaiwgXy5wcm9wZXJ0eShrZXkpKTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaWx0ZXJgOiBzZWxlY3Rpbmcgb25seSBvYmplY3RzXG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8ud2hlcmUgPSBmdW5jdGlvbihvYmosIGF0dHJzKSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgXy5tYXRjaGVzKGF0dHJzKSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgZmluZGA6IGdldHRpbmcgdGhlIGZpcnN0IG9iamVjdFxuICAvLyBjb250YWluaW5nIHNwZWNpZmljIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLmZpbmRXaGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy5maW5kKG9iaiwgXy5tYXRjaGVzKGF0dHJzKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBtYXhpbXVtIGVsZW1lbnQgb3IgKGVsZW1lbnQtYmFzZWQgY29tcHV0YXRpb24pLlxuICAvLyBDYW4ndCBvcHRpbWl6ZSBhcnJheXMgb2YgaW50ZWdlcnMgbG9uZ2VyIHRoYW4gNjUsNTM1IGVsZW1lbnRzLlxuICAvLyBTZWUgW1dlYktpdCBCdWcgODA3OTddKGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD04MDc5NylcbiAgXy5tYXggPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKCFpdGVyYXRvciAmJiBfLmlzQXJyYXkob2JqKSAmJiBvYmpbMF0gPT09ICtvYmpbMF0gJiYgb2JqLmxlbmd0aCA8IDY1NTM1KSB7XG4gICAgICByZXR1cm4gTWF0aC5tYXguYXBwbHkoTWF0aCwgb2JqKTtcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9IC1JbmZpbml0eSwgbGFzdENvbXB1dGVkID0gLUluZmluaXR5O1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHZhciBjb21wdXRlZCA9IGl0ZXJhdG9yID8gaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpIDogdmFsdWU7XG4gICAgICBpZiAoY29tcHV0ZWQgPiBsYXN0Q29tcHV0ZWQpIHtcbiAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIGxhc3RDb21wdXRlZCA9IGNvbXB1dGVkO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBtaW5pbXVtIGVsZW1lbnQgKG9yIGVsZW1lbnQtYmFzZWQgY29tcHV0YXRpb24pLlxuICBfLm1pbiA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAoIWl0ZXJhdG9yICYmIF8uaXNBcnJheShvYmopICYmIG9ialswXSA9PT0gK29ialswXSAmJiBvYmoubGVuZ3RoIDwgNjU1MzUpIHtcbiAgICAgIHJldHVybiBNYXRoLm1pbi5hcHBseShNYXRoLCBvYmopO1xuICAgIH1cbiAgICB2YXIgcmVzdWx0ID0gSW5maW5pdHksIGxhc3RDb21wdXRlZCA9IEluZmluaXR5O1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHZhciBjb21wdXRlZCA9IGl0ZXJhdG9yID8gaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpIDogdmFsdWU7XG4gICAgICBpZiAoY29tcHV0ZWQgPCBsYXN0Q29tcHV0ZWQpIHtcbiAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIGxhc3RDb21wdXRlZCA9IGNvbXB1dGVkO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gU2h1ZmZsZSBhbiBhcnJheSwgdXNpbmcgdGhlIG1vZGVybiB2ZXJzaW9uIG9mIHRoZVxuICAvLyBbRmlzaGVyLVlhdGVzIHNodWZmbGVdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRmlzaGVy4oCTWWF0ZXNfc2h1ZmZsZSkuXG4gIF8uc2h1ZmZsZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciByYW5kO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIHNodWZmbGVkID0gW107XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByYW5kID0gXy5yYW5kb20oaW5kZXgrKyk7XG4gICAgICBzaHVmZmxlZFtpbmRleCAtIDFdID0gc2h1ZmZsZWRbcmFuZF07XG4gICAgICBzaHVmZmxlZFtyYW5kXSA9IHZhbHVlO1xuICAgIH0pO1xuICAgIHJldHVybiBzaHVmZmxlZDtcbiAgfTtcblxuICAvLyBTYW1wbGUgKipuKiogcmFuZG9tIHZhbHVlcyBmcm9tIGEgY29sbGVjdGlvbi5cbiAgLy8gSWYgKipuKiogaXMgbm90IHNwZWNpZmllZCwgcmV0dXJucyBhIHNpbmdsZSByYW5kb20gZWxlbWVudC5cbiAgLy8gVGhlIGludGVybmFsIGBndWFyZGAgYXJndW1lbnQgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgbWFwYC5cbiAgXy5zYW1wbGUgPSBmdW5jdGlvbihvYmosIG4sIGd1YXJkKSB7XG4gICAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkge1xuICAgICAgaWYgKG9iai5sZW5ndGggIT09ICtvYmoubGVuZ3RoKSBvYmogPSBfLnZhbHVlcyhvYmopO1xuICAgICAgcmV0dXJuIG9ialtfLnJhbmRvbShvYmoubGVuZ3RoIC0gMSldO1xuICAgIH1cbiAgICByZXR1cm4gXy5zaHVmZmxlKG9iaikuc2xpY2UoMCwgTWF0aC5tYXgoMCwgbikpO1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIHRvIGdlbmVyYXRlIGxvb2t1cCBpdGVyYXRvcnMuXG4gIHZhciBsb29rdXBJdGVyYXRvciA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBfLmlkZW50aXR5O1xuICAgIGlmIChfLmlzRnVuY3Rpb24odmFsdWUpKSByZXR1cm4gdmFsdWU7XG4gICAgcmV0dXJuIF8ucHJvcGVydHkodmFsdWUpO1xuICB9O1xuXG4gIC8vIFNvcnQgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbiBwcm9kdWNlZCBieSBhbiBpdGVyYXRvci5cbiAgXy5zb3J0QnkgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0b3IgPSBsb29rdXBJdGVyYXRvcihpdGVyYXRvcik7XG4gICAgcmV0dXJuIF8ucGx1Y2soXy5tYXAob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICBjcml0ZXJpYTogaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpXG4gICAgICB9O1xuICAgIH0pLnNvcnQoZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgIHZhciBhID0gbGVmdC5jcml0ZXJpYTtcbiAgICAgIHZhciBiID0gcmlnaHQuY3JpdGVyaWE7XG4gICAgICBpZiAoYSAhPT0gYikge1xuICAgICAgICBpZiAoYSA+IGIgfHwgYSA9PT0gdm9pZCAwKSByZXR1cm4gMTtcbiAgICAgICAgaWYgKGEgPCBiIHx8IGIgPT09IHZvaWQgMCkgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGxlZnQuaW5kZXggLSByaWdodC5pbmRleDtcbiAgICB9KSwgJ3ZhbHVlJyk7XG4gIH07XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gdXNlZCBmb3IgYWdncmVnYXRlIFwiZ3JvdXAgYnlcIiBvcGVyYXRpb25zLlxuICB2YXIgZ3JvdXAgPSBmdW5jdGlvbihiZWhhdmlvcikge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICBpdGVyYXRvciA9IGxvb2t1cEl0ZXJhdG9yKGl0ZXJhdG9yKTtcbiAgICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgdmFyIGtleSA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBvYmopO1xuICAgICAgICBiZWhhdmlvcihyZXN1bHQsIGtleSwgdmFsdWUpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gR3JvdXBzIHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24uIFBhc3MgZWl0aGVyIGEgc3RyaW5nIGF0dHJpYnV0ZVxuICAvLyB0byBncm91cCBieSwgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIGNyaXRlcmlvbi5cbiAgXy5ncm91cEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCBrZXksIHZhbHVlKSB7XG4gICAgXy5oYXMocmVzdWx0LCBrZXkpID8gcmVzdWx0W2tleV0ucHVzaCh2YWx1ZSkgOiByZXN1bHRba2V5XSA9IFt2YWx1ZV07XG4gIH0pO1xuXG4gIC8vIEluZGV4ZXMgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbiwgc2ltaWxhciB0byBgZ3JvdXBCeWAsIGJ1dCBmb3JcbiAgLy8gd2hlbiB5b3Uga25vdyB0aGF0IHlvdXIgaW5kZXggdmFsdWVzIHdpbGwgYmUgdW5pcXVlLlxuICBfLmluZGV4QnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIGtleSwgdmFsdWUpIHtcbiAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xuICB9KTtcblxuICAvLyBDb3VudHMgaW5zdGFuY2VzIG9mIGFuIG9iamVjdCB0aGF0IGdyb3VwIGJ5IGEgY2VydGFpbiBjcml0ZXJpb24uIFBhc3NcbiAgLy8gZWl0aGVyIGEgc3RyaW5nIGF0dHJpYnV0ZSB0byBjb3VudCBieSwgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlXG4gIC8vIGNyaXRlcmlvbi5cbiAgXy5jb3VudEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCBrZXkpIHtcbiAgICBfLmhhcyhyZXN1bHQsIGtleSkgPyByZXN1bHRba2V5XSsrIDogcmVzdWx0W2tleV0gPSAxO1xuICB9KTtcblxuICAvLyBVc2UgYSBjb21wYXJhdG9yIGZ1bmN0aW9uIHRvIGZpZ3VyZSBvdXQgdGhlIHNtYWxsZXN0IGluZGV4IGF0IHdoaWNoXG4gIC8vIGFuIG9iamVjdCBzaG91bGQgYmUgaW5zZXJ0ZWQgc28gYXMgdG8gbWFpbnRhaW4gb3JkZXIuIFVzZXMgYmluYXJ5IHNlYXJjaC5cbiAgXy5zb3J0ZWRJbmRleCA9IGZ1bmN0aW9uKGFycmF5LCBvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0b3IgPSBsb29rdXBJdGVyYXRvcihpdGVyYXRvcik7XG4gICAgdmFyIHZhbHVlID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmopO1xuICAgIHZhciBsb3cgPSAwLCBoaWdoID0gYXJyYXkubGVuZ3RoO1xuICAgIHdoaWxlIChsb3cgPCBoaWdoKSB7XG4gICAgICB2YXIgbWlkID0gKGxvdyArIGhpZ2gpID4+PiAxO1xuICAgICAgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBhcnJheVttaWRdKSA8IHZhbHVlID8gbG93ID0gbWlkICsgMSA6IGhpZ2ggPSBtaWQ7XG4gICAgfVxuICAgIHJldHVybiBsb3c7XG4gIH07XG5cbiAgLy8gU2FmZWx5IGNyZWF0ZSBhIHJlYWwsIGxpdmUgYXJyYXkgZnJvbSBhbnl0aGluZyBpdGVyYWJsZS5cbiAgXy50b0FycmF5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFvYmopIHJldHVybiBbXTtcbiAgICBpZiAoXy5pc0FycmF5KG9iaikpIHJldHVybiBzbGljZS5jYWxsKG9iaik7XG4gICAgaWYgKG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoKSByZXR1cm4gXy5tYXAob2JqLCBfLmlkZW50aXR5KTtcbiAgICByZXR1cm4gXy52YWx1ZXMob2JqKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiBhbiBvYmplY3QuXG4gIF8uc2l6ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIDA7XG4gICAgcmV0dXJuIChvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCkgPyBvYmoubGVuZ3RoIDogXy5rZXlzKG9iaikubGVuZ3RoO1xuICB9O1xuXG4gIC8vIEFycmF5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS1cblxuICAvLyBHZXQgdGhlIGZpcnN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGZpcnN0IE5cbiAgLy8gdmFsdWVzIGluIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgaGVhZGAgYW5kIGB0YWtlYC4gVGhlICoqZ3VhcmQqKiBjaGVja1xuICAvLyBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8uZmlyc3QgPSBfLmhlYWQgPSBfLnRha2UgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICBpZiAoKG4gPT0gbnVsbCkgfHwgZ3VhcmQpIHJldHVybiBhcnJheVswXTtcbiAgICBpZiAobiA8IDApIHJldHVybiBbXTtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgMCwgbik7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgbGFzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEVzcGVjaWFsbHkgdXNlZnVsIG9uXG4gIC8vIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIGFsbCB0aGUgdmFsdWVzIGluXG4gIC8vIHRoZSBhcnJheSwgZXhjbHVkaW5nIHRoZSBsYXN0IE4uIFRoZSAqKmd1YXJkKiogY2hlY2sgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aFxuICAvLyBgXy5tYXBgLlxuICBfLmluaXRpYWwgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgMCwgYXJyYXkubGVuZ3RoIC0gKChuID09IG51bGwpIHx8IGd1YXJkID8gMSA6IG4pKTtcbiAgfTtcblxuICAvLyBHZXQgdGhlIGxhc3QgZWxlbWVudCBvZiBhbiBhcnJheS4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiB0aGUgbGFzdCBOXG4gIC8vIHZhbHVlcyBpbiB0aGUgYXJyYXkuIFRoZSAqKmd1YXJkKiogY2hlY2sgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgXy5tYXBgLlxuICBfLmxhc3QgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICBpZiAoKG4gPT0gbnVsbCkgfHwgZ3VhcmQpIHJldHVybiBhcnJheVthcnJheS5sZW5ndGggLSAxXTtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgTWF0aC5tYXgoYXJyYXkubGVuZ3RoIC0gbiwgMCkpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgZXZlcnl0aGluZyBidXQgdGhlIGZpcnN0IGVudHJ5IG9mIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgdGFpbGAgYW5kIGBkcm9wYC5cbiAgLy8gRXNwZWNpYWxseSB1c2VmdWwgb24gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgYW4gKipuKiogd2lsbCByZXR1cm5cbiAgLy8gdGhlIHJlc3QgTiB2YWx1ZXMgaW4gdGhlIGFycmF5LiBUaGUgKipndWFyZCoqXG4gIC8vIGNoZWNrIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5yZXN0ID0gXy50YWlsID0gXy5kcm9wID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIChuID09IG51bGwpIHx8IGd1YXJkID8gMSA6IG4pO1xuICB9O1xuXG4gIC8vIFRyaW0gb3V0IGFsbCBmYWxzeSB2YWx1ZXMgZnJvbSBhbiBhcnJheS5cbiAgXy5jb21wYWN0ID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIF8uaWRlbnRpdHkpO1xuICB9O1xuXG4gIC8vIEludGVybmFsIGltcGxlbWVudGF0aW9uIG9mIGEgcmVjdXJzaXZlIGBmbGF0dGVuYCBmdW5jdGlvbi5cbiAgdmFyIGZsYXR0ZW4gPSBmdW5jdGlvbihpbnB1dCwgc2hhbGxvdywgb3V0cHV0KSB7XG4gICAgaWYgKHNoYWxsb3cgJiYgXy5ldmVyeShpbnB1dCwgXy5pc0FycmF5KSkge1xuICAgICAgcmV0dXJuIGNvbmNhdC5hcHBseShvdXRwdXQsIGlucHV0KTtcbiAgICB9XG4gICAgZWFjaChpbnB1dCwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmIChfLmlzQXJyYXkodmFsdWUpIHx8IF8uaXNBcmd1bWVudHModmFsdWUpKSB7XG4gICAgICAgIHNoYWxsb3cgPyBwdXNoLmFwcGx5KG91dHB1dCwgdmFsdWUpIDogZmxhdHRlbih2YWx1ZSwgc2hhbGxvdywgb3V0cHV0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG91dHB1dC5wdXNoKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gb3V0cHV0O1xuICB9O1xuXG4gIC8vIEZsYXR0ZW4gb3V0IGFuIGFycmF5LCBlaXRoZXIgcmVjdXJzaXZlbHkgKGJ5IGRlZmF1bHQpLCBvciBqdXN0IG9uZSBsZXZlbC5cbiAgXy5mbGF0dGVuID0gZnVuY3Rpb24oYXJyYXksIHNoYWxsb3cpIHtcbiAgICByZXR1cm4gZmxhdHRlbihhcnJheSwgc2hhbGxvdywgW10pO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHZlcnNpb24gb2YgdGhlIGFycmF5IHRoYXQgZG9lcyBub3QgY29udGFpbiB0aGUgc3BlY2lmaWVkIHZhbHVlKHMpLlxuICBfLndpdGhvdXQgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHJldHVybiBfLmRpZmZlcmVuY2UoYXJyYXksIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gIH07XG5cbiAgLy8gU3BsaXQgYW4gYXJyYXkgaW50byB0d28gYXJyYXlzOiBvbmUgd2hvc2UgZWxlbWVudHMgYWxsIHNhdGlzZnkgdGhlIGdpdmVuXG4gIC8vIHByZWRpY2F0ZSwgYW5kIG9uZSB3aG9zZSBlbGVtZW50cyBhbGwgZG8gbm90IHNhdGlzZnkgdGhlIHByZWRpY2F0ZS5cbiAgXy5wYXJ0aXRpb24gPSBmdW5jdGlvbihhcnJheSwgcHJlZGljYXRlKSB7XG4gICAgdmFyIHBhc3MgPSBbXSwgZmFpbCA9IFtdO1xuICAgIGVhY2goYXJyYXksIGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgIChwcmVkaWNhdGUoZWxlbSkgPyBwYXNzIDogZmFpbCkucHVzaChlbGVtKTtcbiAgICB9KTtcbiAgICByZXR1cm4gW3Bhc3MsIGZhaWxdO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYSBkdXBsaWNhdGUtZnJlZSB2ZXJzaW9uIG9mIHRoZSBhcnJheS4gSWYgdGhlIGFycmF5IGhhcyBhbHJlYWR5XG4gIC8vIGJlZW4gc29ydGVkLCB5b3UgaGF2ZSB0aGUgb3B0aW9uIG9mIHVzaW5nIGEgZmFzdGVyIGFsZ29yaXRobS5cbiAgLy8gQWxpYXNlZCBhcyBgdW5pcXVlYC5cbiAgXy51bmlxID0gXy51bmlxdWUgPSBmdW5jdGlvbihhcnJheSwgaXNTb3J0ZWQsIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKF8uaXNGdW5jdGlvbihpc1NvcnRlZCkpIHtcbiAgICAgIGNvbnRleHQgPSBpdGVyYXRvcjtcbiAgICAgIGl0ZXJhdG9yID0gaXNTb3J0ZWQ7XG4gICAgICBpc1NvcnRlZCA9IGZhbHNlO1xuICAgIH1cbiAgICB2YXIgaW5pdGlhbCA9IGl0ZXJhdG9yID8gXy5tYXAoYXJyYXksIGl0ZXJhdG9yLCBjb250ZXh0KSA6IGFycmF5O1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgdmFyIHNlZW4gPSBbXTtcbiAgICBlYWNoKGluaXRpYWwsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgaWYgKGlzU29ydGVkID8gKCFpbmRleCB8fCBzZWVuW3NlZW4ubGVuZ3RoIC0gMV0gIT09IHZhbHVlKSA6ICFfLmNvbnRhaW5zKHNlZW4sIHZhbHVlKSkge1xuICAgICAgICBzZWVuLnB1c2godmFsdWUpO1xuICAgICAgICByZXN1bHRzLnB1c2goYXJyYXlbaW5kZXhdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBQcm9kdWNlIGFuIGFycmF5IHRoYXQgY29udGFpbnMgdGhlIHVuaW9uOiBlYWNoIGRpc3RpbmN0IGVsZW1lbnQgZnJvbSBhbGwgb2ZcbiAgLy8gdGhlIHBhc3NlZC1pbiBhcnJheXMuXG4gIF8udW5pb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXy51bmlxKF8uZmxhdHRlbihhcmd1bWVudHMsIHRydWUpKTtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGFuIGFycmF5IHRoYXQgY29udGFpbnMgZXZlcnkgaXRlbSBzaGFyZWQgYmV0d2VlbiBhbGwgdGhlXG4gIC8vIHBhc3NlZC1pbiBhcnJheXMuXG4gIF8uaW50ZXJzZWN0aW9uID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICB2YXIgcmVzdCA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gXy5maWx0ZXIoXy51bmlxKGFycmF5KSwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgcmV0dXJuIF8uZXZlcnkocmVzdCwgZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIF8uY29udGFpbnMob3RoZXIsIGl0ZW0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gVGFrZSB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIG9uZSBhcnJheSBhbmQgYSBudW1iZXIgb2Ygb3RoZXIgYXJyYXlzLlxuICAvLyBPbmx5IHRoZSBlbGVtZW50cyBwcmVzZW50IGluIGp1c3QgdGhlIGZpcnN0IGFycmF5IHdpbGwgcmVtYWluLlxuICBfLmRpZmZlcmVuY2UgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciByZXN0ID0gY29uY2F0LmFwcGx5KEFycmF5UHJvdG8sIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgcmV0dXJuIF8uZmlsdGVyKGFycmF5LCBmdW5jdGlvbih2YWx1ZSl7IHJldHVybiAhXy5jb250YWlucyhyZXN0LCB2YWx1ZSk7IH0pO1xuICB9O1xuXG4gIC8vIFppcCB0b2dldGhlciBtdWx0aXBsZSBsaXN0cyBpbnRvIGEgc2luZ2xlIGFycmF5IC0tIGVsZW1lbnRzIHRoYXQgc2hhcmVcbiAgLy8gYW4gaW5kZXggZ28gdG9nZXRoZXIuXG4gIF8uemlwID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxlbmd0aCA9IF8ubWF4KF8ucGx1Y2soYXJndW1lbnRzLCAnbGVuZ3RoJykuY29uY2F0KDApKTtcbiAgICB2YXIgcmVzdWx0cyA9IG5ldyBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdHNbaV0gPSBfLnBsdWNrKGFyZ3VtZW50cywgJycgKyBpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gQ29udmVydHMgbGlzdHMgaW50byBvYmplY3RzLiBQYXNzIGVpdGhlciBhIHNpbmdsZSBhcnJheSBvZiBgW2tleSwgdmFsdWVdYFxuICAvLyBwYWlycywgb3IgdHdvIHBhcmFsbGVsIGFycmF5cyBvZiB0aGUgc2FtZSBsZW5ndGggLS0gb25lIG9mIGtleXMsIGFuZCBvbmUgb2ZcbiAgLy8gdGhlIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlxuICBfLm9iamVjdCA9IGZ1bmN0aW9uKGxpc3QsIHZhbHVlcykge1xuICAgIGlmIChsaXN0ID09IG51bGwpIHJldHVybiB7fTtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3QubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh2YWx1ZXMpIHtcbiAgICAgICAgcmVzdWx0W2xpc3RbaV1dID0gdmFsdWVzW2ldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0W2xpc3RbaV1bMF1dID0gbGlzdFtpXVsxXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBJZiB0aGUgYnJvd3NlciBkb2Vzbid0IHN1cHBseSB1cyB3aXRoIGluZGV4T2YgKEknbSBsb29raW5nIGF0IHlvdSwgKipNU0lFKiopLFxuICAvLyB3ZSBuZWVkIHRoaXMgZnVuY3Rpb24uIFJldHVybiB0aGUgcG9zaXRpb24gb2YgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgYW5cbiAgLy8gaXRlbSBpbiBhbiBhcnJheSwgb3IgLTEgaWYgdGhlIGl0ZW0gaXMgbm90IGluY2x1ZGVkIGluIHRoZSBhcnJheS5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYGluZGV4T2ZgIGlmIGF2YWlsYWJsZS5cbiAgLy8gSWYgdGhlIGFycmF5IGlzIGxhcmdlIGFuZCBhbHJlYWR5IGluIHNvcnQgb3JkZXIsIHBhc3MgYHRydWVgXG4gIC8vIGZvciAqKmlzU29ydGVkKiogdG8gdXNlIGJpbmFyeSBzZWFyY2guXG4gIF8uaW5kZXhPZiA9IGZ1bmN0aW9uKGFycmF5LCBpdGVtLCBpc1NvcnRlZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gLTE7XG4gICAgdmFyIGkgPSAwLCBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gICAgaWYgKGlzU29ydGVkKSB7XG4gICAgICBpZiAodHlwZW9mIGlzU29ydGVkID09ICdudW1iZXInKSB7XG4gICAgICAgIGkgPSAoaXNTb3J0ZWQgPCAwID8gTWF0aC5tYXgoMCwgbGVuZ3RoICsgaXNTb3J0ZWQpIDogaXNTb3J0ZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaSA9IF8uc29ydGVkSW5kZXgoYXJyYXksIGl0ZW0pO1xuICAgICAgICByZXR1cm4gYXJyYXlbaV0gPT09IGl0ZW0gPyBpIDogLTE7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChuYXRpdmVJbmRleE9mICYmIGFycmF5LmluZGV4T2YgPT09IG5hdGl2ZUluZGV4T2YpIHJldHVybiBhcnJheS5pbmRleE9mKGl0ZW0sIGlzU29ydGVkKTtcbiAgICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSBpZiAoYXJyYXlbaV0gPT09IGl0ZW0pIHJldHVybiBpO1xuICAgIHJldHVybiAtMTtcbiAgfTtcblxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgbGFzdEluZGV4T2ZgIGlmIGF2YWlsYWJsZS5cbiAgXy5sYXN0SW5kZXhPZiA9IGZ1bmN0aW9uKGFycmF5LCBpdGVtLCBmcm9tKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiAtMTtcbiAgICB2YXIgaGFzSW5kZXggPSBmcm9tICE9IG51bGw7XG4gICAgaWYgKG5hdGl2ZUxhc3RJbmRleE9mICYmIGFycmF5Lmxhc3RJbmRleE9mID09PSBuYXRpdmVMYXN0SW5kZXhPZikge1xuICAgICAgcmV0dXJuIGhhc0luZGV4ID8gYXJyYXkubGFzdEluZGV4T2YoaXRlbSwgZnJvbSkgOiBhcnJheS5sYXN0SW5kZXhPZihpdGVtKTtcbiAgICB9XG4gICAgdmFyIGkgPSAoaGFzSW5kZXggPyBmcm9tIDogYXJyYXkubGVuZ3RoKTtcbiAgICB3aGlsZSAoaS0tKSBpZiAoYXJyYXlbaV0gPT09IGl0ZW0pIHJldHVybiBpO1xuICAgIHJldHVybiAtMTtcbiAgfTtcblxuICAvLyBHZW5lcmF0ZSBhbiBpbnRlZ2VyIEFycmF5IGNvbnRhaW5pbmcgYW4gYXJpdGhtZXRpYyBwcm9ncmVzc2lvbi4gQSBwb3J0IG9mXG4gIC8vIHRoZSBuYXRpdmUgUHl0aG9uIGByYW5nZSgpYCBmdW5jdGlvbi4gU2VlXG4gIC8vIFt0aGUgUHl0aG9uIGRvY3VtZW50YXRpb25dKGh0dHA6Ly9kb2NzLnB5dGhvbi5vcmcvbGlicmFyeS9mdW5jdGlvbnMuaHRtbCNyYW5nZSkuXG4gIF8ucmFuZ2UgPSBmdW5jdGlvbihzdGFydCwgc3RvcCwgc3RlcCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDw9IDEpIHtcbiAgICAgIHN0b3AgPSBzdGFydCB8fCAwO1xuICAgICAgc3RhcnQgPSAwO1xuICAgIH1cbiAgICBzdGVwID0gYXJndW1lbnRzWzJdIHx8IDE7XG5cbiAgICB2YXIgbGVuZ3RoID0gTWF0aC5tYXgoTWF0aC5jZWlsKChzdG9wIC0gc3RhcnQpIC8gc3RlcCksIDApO1xuICAgIHZhciBpZHggPSAwO1xuICAgIHZhciByYW5nZSA9IG5ldyBBcnJheShsZW5ndGgpO1xuXG4gICAgd2hpbGUoaWR4IDwgbGVuZ3RoKSB7XG4gICAgICByYW5nZVtpZHgrK10gPSBzdGFydDtcbiAgICAgIHN0YXJ0ICs9IHN0ZXA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJhbmdlO1xuICB9O1xuXG4gIC8vIEZ1bmN0aW9uIChhaGVtKSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUmV1c2FibGUgY29uc3RydWN0b3IgZnVuY3Rpb24gZm9yIHByb3RvdHlwZSBzZXR0aW5nLlxuICB2YXIgY3RvciA9IGZ1bmN0aW9uKCl7fTtcblxuICAvLyBDcmVhdGUgYSBmdW5jdGlvbiBib3VuZCB0byBhIGdpdmVuIG9iamVjdCAoYXNzaWduaW5nIGB0aGlzYCwgYW5kIGFyZ3VtZW50cyxcbiAgLy8gb3B0aW9uYWxseSkuIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBGdW5jdGlvbi5iaW5kYCBpZlxuICAvLyBhdmFpbGFibGUuXG4gIF8uYmluZCA9IGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQpIHtcbiAgICB2YXIgYXJncywgYm91bmQ7XG4gICAgaWYgKG5hdGl2ZUJpbmQgJiYgZnVuYy5iaW5kID09PSBuYXRpdmVCaW5kKSByZXR1cm4gbmF0aXZlQmluZC5hcHBseShmdW5jLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIGlmICghXy5pc0Z1bmN0aW9uKGZ1bmMpKSB0aHJvdyBuZXcgVHlwZUVycm9yO1xuICAgIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgcmV0dXJuIGJvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgYm91bmQpKSByZXR1cm4gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICB2YXIgc2VsZiA9IG5ldyBjdG9yO1xuICAgICAgY3Rvci5wcm90b3R5cGUgPSBudWxsO1xuICAgICAgdmFyIHJlc3VsdCA9IGZ1bmMuYXBwbHkoc2VsZiwgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICBpZiAoT2JqZWN0KHJlc3VsdCkgPT09IHJlc3VsdCkgcmV0dXJuIHJlc3VsdDtcbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUGFydGlhbGx5IGFwcGx5IGEgZnVuY3Rpb24gYnkgY3JlYXRpbmcgYSB2ZXJzaW9uIHRoYXQgaGFzIGhhZCBzb21lIG9mIGl0c1xuICAvLyBhcmd1bWVudHMgcHJlLWZpbGxlZCwgd2l0aG91dCBjaGFuZ2luZyBpdHMgZHluYW1pYyBgdGhpc2AgY29udGV4dC4gXyBhY3RzXG4gIC8vIGFzIGEgcGxhY2Vob2xkZXIsIGFsbG93aW5nIGFueSBjb21iaW5hdGlvbiBvZiBhcmd1bWVudHMgdG8gYmUgcHJlLWZpbGxlZC5cbiAgXy5wYXJ0aWFsID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHZhciBib3VuZEFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHBvc2l0aW9uID0gMDtcbiAgICAgIHZhciBhcmdzID0gYm91bmRBcmdzLnNsaWNlKCk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gYXJncy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYXJnc1tpXSA9PT0gXykgYXJnc1tpXSA9IGFyZ3VtZW50c1twb3NpdGlvbisrXTtcbiAgICAgIH1cbiAgICAgIHdoaWxlIChwb3NpdGlvbiA8IGFyZ3VtZW50cy5sZW5ndGgpIGFyZ3MucHVzaChhcmd1bWVudHNbcG9zaXRpb24rK10pO1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBCaW5kIGEgbnVtYmVyIG9mIGFuIG9iamVjdCdzIG1ldGhvZHMgdG8gdGhhdCBvYmplY3QuIFJlbWFpbmluZyBhcmd1bWVudHNcbiAgLy8gYXJlIHRoZSBtZXRob2QgbmFtZXMgdG8gYmUgYm91bmQuIFVzZWZ1bCBmb3IgZW5zdXJpbmcgdGhhdCBhbGwgY2FsbGJhY2tzXG4gIC8vIGRlZmluZWQgb24gYW4gb2JqZWN0IGJlbG9uZyB0byBpdC5cbiAgXy5iaW5kQWxsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGZ1bmNzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIGlmIChmdW5jcy5sZW5ndGggPT09IDApIHRocm93IG5ldyBFcnJvcignYmluZEFsbCBtdXN0IGJlIHBhc3NlZCBmdW5jdGlvbiBuYW1lcycpO1xuICAgIGVhY2goZnVuY3MsIGZ1bmN0aW9uKGYpIHsgb2JqW2ZdID0gXy5iaW5kKG9ialtmXSwgb2JqKTsgfSk7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBNZW1vaXplIGFuIGV4cGVuc2l2ZSBmdW5jdGlvbiBieSBzdG9yaW5nIGl0cyByZXN1bHRzLlxuICBfLm1lbW9pemUgPSBmdW5jdGlvbihmdW5jLCBoYXNoZXIpIHtcbiAgICB2YXIgbWVtbyA9IHt9O1xuICAgIGhhc2hlciB8fCAoaGFzaGVyID0gXy5pZGVudGl0eSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGtleSA9IGhhc2hlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIF8uaGFzKG1lbW8sIGtleSkgPyBtZW1vW2tleV0gOiAobWVtb1trZXldID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIERlbGF5cyBhIGZ1bmN0aW9uIGZvciB0aGUgZ2l2ZW4gbnVtYmVyIG9mIG1pbGxpc2Vjb25kcywgYW5kIHRoZW4gY2FsbHNcbiAgLy8gaXQgd2l0aCB0aGUgYXJndW1lbnRzIHN1cHBsaWVkLlxuICBfLmRlbGF5ID0gZnVuY3Rpb24oZnVuYywgd2FpdCkge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IHJldHVybiBmdW5jLmFwcGx5KG51bGwsIGFyZ3MpOyB9LCB3YWl0KTtcbiAgfTtcblxuICAvLyBEZWZlcnMgYSBmdW5jdGlvbiwgc2NoZWR1bGluZyBpdCB0byBydW4gYWZ0ZXIgdGhlIGN1cnJlbnQgY2FsbCBzdGFjayBoYXNcbiAgLy8gY2xlYXJlZC5cbiAgXy5kZWZlciA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICByZXR1cm4gXy5kZWxheS5hcHBseShfLCBbZnVuYywgMV0uY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSkpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgd2hlbiBpbnZva2VkLCB3aWxsIG9ubHkgYmUgdHJpZ2dlcmVkIGF0IG1vc3Qgb25jZVxuICAvLyBkdXJpbmcgYSBnaXZlbiB3aW5kb3cgb2YgdGltZS4gTm9ybWFsbHksIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gd2lsbCBydW5cbiAgLy8gYXMgbXVjaCBhcyBpdCBjYW4sIHdpdGhvdXQgZXZlciBnb2luZyBtb3JlIHRoYW4gb25jZSBwZXIgYHdhaXRgIGR1cmF0aW9uO1xuICAvLyBidXQgaWYgeW91J2QgbGlrZSB0byBkaXNhYmxlIHRoZSBleGVjdXRpb24gb24gdGhlIGxlYWRpbmcgZWRnZSwgcGFzc1xuICAvLyBge2xlYWRpbmc6IGZhbHNlfWAuIFRvIGRpc2FibGUgZXhlY3V0aW9uIG9uIHRoZSB0cmFpbGluZyBlZGdlLCBkaXR0by5cbiAgXy50aHJvdHRsZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgICB2YXIgY29udGV4dCwgYXJncywgcmVzdWx0O1xuICAgIHZhciB0aW1lb3V0ID0gbnVsbDtcbiAgICB2YXIgcHJldmlvdXMgPSAwO1xuICAgIG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSk7XG4gICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICBwcmV2aW91cyA9IG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UgPyAwIDogXy5ub3coKTtcbiAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBub3cgPSBfLm5vdygpO1xuICAgICAgaWYgKCFwcmV2aW91cyAmJiBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlKSBwcmV2aW91cyA9IG5vdztcbiAgICAgIHZhciByZW1haW5pbmcgPSB3YWl0IC0gKG5vdyAtIHByZXZpb3VzKTtcbiAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIGlmIChyZW1haW5pbmcgPD0gMCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICBwcmV2aW91cyA9IG5vdztcbiAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgfSBlbHNlIGlmICghdGltZW91dCAmJiBvcHRpb25zLnRyYWlsaW5nICE9PSBmYWxzZSkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgcmVtYWluaW5nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24sIHRoYXQsIGFzIGxvbmcgYXMgaXQgY29udGludWVzIHRvIGJlIGludm9rZWQsIHdpbGwgbm90XG4gIC8vIGJlIHRyaWdnZXJlZC4gVGhlIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIGFmdGVyIGl0IHN0b3BzIGJlaW5nIGNhbGxlZCBmb3JcbiAgLy8gTiBtaWxsaXNlY29uZHMuIElmIGBpbW1lZGlhdGVgIGlzIHBhc3NlZCwgdHJpZ2dlciB0aGUgZnVuY3Rpb24gb24gdGhlXG4gIC8vIGxlYWRpbmcgZWRnZSwgaW5zdGVhZCBvZiB0aGUgdHJhaWxpbmcuXG4gIF8uZGVib3VuY2UgPSBmdW5jdGlvbihmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcbiAgICB2YXIgdGltZW91dCwgYXJncywgY29udGV4dCwgdGltZXN0YW1wLCByZXN1bHQ7XG5cbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBsYXN0ID0gXy5ub3coKSAtIHRpbWVzdGFtcDtcbiAgICAgIGlmIChsYXN0IDwgd2FpdCkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCAtIGxhc3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIGlmICghaW1tZWRpYXRlKSB7XG4gICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgY29udGV4dCA9IHRoaXM7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgdGltZXN0YW1wID0gXy5ub3coKTtcbiAgICAgIHZhciBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0O1xuICAgICAgaWYgKCF0aW1lb3V0KSB7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgICAgIH1cbiAgICAgIGlmIChjYWxsTm93KSB7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgYXQgbW9zdCBvbmUgdGltZSwgbm8gbWF0dGVyIGhvd1xuICAvLyBvZnRlbiB5b3UgY2FsbCBpdC4gVXNlZnVsIGZvciBsYXp5IGluaXRpYWxpemF0aW9uLlxuICBfLm9uY2UgPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgdmFyIHJhbiA9IGZhbHNlLCBtZW1vO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChyYW4pIHJldHVybiBtZW1vO1xuICAgICAgcmFuID0gdHJ1ZTtcbiAgICAgIG1lbW8gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBmdW5jID0gbnVsbDtcbiAgICAgIHJldHVybiBtZW1vO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyB0aGUgZmlyc3QgZnVuY3Rpb24gcGFzc2VkIGFzIGFuIGFyZ3VtZW50IHRvIHRoZSBzZWNvbmQsXG4gIC8vIGFsbG93aW5nIHlvdSB0byBhZGp1c3QgYXJndW1lbnRzLCBydW4gY29kZSBiZWZvcmUgYW5kIGFmdGVyLCBhbmRcbiAgLy8gY29uZGl0aW9uYWxseSBleGVjdXRlIHRoZSBvcmlnaW5hbCBmdW5jdGlvbi5cbiAgXy53cmFwID0gZnVuY3Rpb24oZnVuYywgd3JhcHBlcikge1xuICAgIHJldHVybiBfLnBhcnRpYWwod3JhcHBlciwgZnVuYyk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgaXMgdGhlIGNvbXBvc2l0aW9uIG9mIGEgbGlzdCBvZiBmdW5jdGlvbnMsIGVhY2hcbiAgLy8gY29uc3VtaW5nIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZ1bmN0aW9uIHRoYXQgZm9sbG93cy5cbiAgXy5jb21wb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZ1bmNzID0gYXJndW1lbnRzO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgZm9yICh2YXIgaSA9IGZ1bmNzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGFyZ3MgPSBbZnVuY3NbaV0uYXBwbHkodGhpcywgYXJncyldO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFyZ3NbMF07XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgYWZ0ZXIgYmVpbmcgY2FsbGVkIE4gdGltZXMuXG4gIF8uYWZ0ZXIgPSBmdW5jdGlvbih0aW1lcywgZnVuYykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgtLXRpbWVzIDwgMSkge1xuICAgICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgLy8gT2JqZWN0IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUmV0cmlldmUgdGhlIG5hbWVzIG9mIGFuIG9iamVjdCdzIHByb3BlcnRpZXMuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBPYmplY3Qua2V5c2BcbiAgXy5rZXlzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBbXTtcbiAgICBpZiAobmF0aXZlS2V5cykgcmV0dXJuIG5hdGl2ZUtleXMob2JqKTtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIGtleXMucHVzaChrZXkpO1xuICAgIHJldHVybiBrZXlzO1xuICB9O1xuXG4gIC8vIFJldHJpZXZlIHRoZSB2YWx1ZXMgb2YgYW4gb2JqZWN0J3MgcHJvcGVydGllcy5cbiAgXy52YWx1ZXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgdmFsdWVzID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFsdWVzW2ldID0gb2JqW2tleXNbaV1dO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWVzO1xuICB9O1xuXG4gIC8vIENvbnZlcnQgYW4gb2JqZWN0IGludG8gYSBsaXN0IG9mIGBba2V5LCB2YWx1ZV1gIHBhaXJzLlxuICBfLnBhaXJzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgdmFyIHBhaXJzID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcGFpcnNbaV0gPSBba2V5c1tpXSwgb2JqW2tleXNbaV1dXTtcbiAgICB9XG4gICAgcmV0dXJuIHBhaXJzO1xuICB9O1xuXG4gIC8vIEludmVydCB0aGUga2V5cyBhbmQgdmFsdWVzIG9mIGFuIG9iamVjdC4gVGhlIHZhbHVlcyBtdXN0IGJlIHNlcmlhbGl6YWJsZS5cbiAgXy5pbnZlcnQgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0W29ialtrZXlzW2ldXV0gPSBrZXlzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHNvcnRlZCBsaXN0IG9mIHRoZSBmdW5jdGlvbiBuYW1lcyBhdmFpbGFibGUgb24gdGhlIG9iamVjdC5cbiAgLy8gQWxpYXNlZCBhcyBgbWV0aG9kc2BcbiAgXy5mdW5jdGlvbnMgPSBfLm1ldGhvZHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgbmFtZXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoXy5pc0Z1bmN0aW9uKG9ialtrZXldKSkgbmFtZXMucHVzaChrZXkpO1xuICAgIH1cbiAgICByZXR1cm4gbmFtZXMuc29ydCgpO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBhIGdpdmVuIG9iamVjdCB3aXRoIGFsbCB0aGUgcHJvcGVydGllcyBpbiBwYXNzZWQtaW4gb2JqZWN0KHMpLlxuICBfLmV4dGVuZCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGVhY2goc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLCBmdW5jdGlvbihzb3VyY2UpIHtcbiAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgICAgICBvYmpbcHJvcF0gPSBzb3VyY2VbcHJvcF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCBvbmx5IGNvbnRhaW5pbmcgdGhlIHdoaXRlbGlzdGVkIHByb3BlcnRpZXMuXG4gIF8ucGljayA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBjb3B5ID0ge307XG4gICAgdmFyIGtleXMgPSBjb25jYXQuYXBwbHkoQXJyYXlQcm90bywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICBlYWNoKGtleXMsIGZ1bmN0aW9uKGtleSkge1xuICAgICAgaWYgKGtleSBpbiBvYmopIGNvcHlba2V5XSA9IG9ialtrZXldO1xuICAgIH0pO1xuICAgIHJldHVybiBjb3B5O1xuICB9O1xuXG4gICAvLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSBvYmplY3Qgd2l0aG91dCB0aGUgYmxhY2tsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5vbWl0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGNvcHkgPSB7fTtcbiAgICB2YXIga2V5cyA9IGNvbmNhdC5hcHBseShBcnJheVByb3RvLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmICghXy5jb250YWlucyhrZXlzLCBrZXkpKSBjb3B5W2tleV0gPSBvYmpba2V5XTtcbiAgICB9XG4gICAgcmV0dXJuIGNvcHk7XG4gIH07XG5cbiAgLy8gRmlsbCBpbiBhIGdpdmVuIG9iamVjdCB3aXRoIGRlZmF1bHQgcHJvcGVydGllcy5cbiAgXy5kZWZhdWx0cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGVhY2goc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLCBmdW5jdGlvbihzb3VyY2UpIHtcbiAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgICAgICBpZiAob2JqW3Byb3BdID09PSB2b2lkIDApIG9ialtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgKHNoYWxsb3ctY2xvbmVkKSBkdXBsaWNhdGUgb2YgYW4gb2JqZWN0LlxuICBfLmNsb25lID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gICAgcmV0dXJuIF8uaXNBcnJheShvYmopID8gb2JqLnNsaWNlKCkgOiBfLmV4dGVuZCh7fSwgb2JqKTtcbiAgfTtcblxuICAvLyBJbnZva2VzIGludGVyY2VwdG9yIHdpdGggdGhlIG9iaiwgYW5kIHRoZW4gcmV0dXJucyBvYmouXG4gIC8vIFRoZSBwcmltYXJ5IHB1cnBvc2Ugb2YgdGhpcyBtZXRob2QgaXMgdG8gXCJ0YXAgaW50b1wiIGEgbWV0aG9kIGNoYWluLCBpblxuICAvLyBvcmRlciB0byBwZXJmb3JtIG9wZXJhdGlvbnMgb24gaW50ZXJtZWRpYXRlIHJlc3VsdHMgd2l0aGluIHRoZSBjaGFpbi5cbiAgXy50YXAgPSBmdW5jdGlvbihvYmosIGludGVyY2VwdG9yKSB7XG4gICAgaW50ZXJjZXB0b3Iob2JqKTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIEludGVybmFsIHJlY3Vyc2l2ZSBjb21wYXJpc29uIGZ1bmN0aW9uIGZvciBgaXNFcXVhbGAuXG4gIHZhciBlcSA9IGZ1bmN0aW9uKGEsIGIsIGFTdGFjaywgYlN0YWNrKSB7XG4gICAgLy8gSWRlbnRpY2FsIG9iamVjdHMgYXJlIGVxdWFsLiBgMCA9PT0gLTBgLCBidXQgdGhleSBhcmVuJ3QgaWRlbnRpY2FsLlxuICAgIC8vIFNlZSB0aGUgW0hhcm1vbnkgYGVnYWxgIHByb3Bvc2FsXShodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1oYXJtb255OmVnYWwpLlxuICAgIGlmIChhID09PSBiKSByZXR1cm4gYSAhPT0gMCB8fCAxIC8gYSA9PSAxIC8gYjtcbiAgICAvLyBBIHN0cmljdCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIGBudWxsID09IHVuZGVmaW5lZGAuXG4gICAgaWYgKGEgPT0gbnVsbCB8fCBiID09IG51bGwpIHJldHVybiBhID09PSBiO1xuICAgIC8vIFVud3JhcCBhbnkgd3JhcHBlZCBvYmplY3RzLlxuICAgIGlmIChhIGluc3RhbmNlb2YgXykgYSA9IGEuX3dyYXBwZWQ7XG4gICAgaWYgKGIgaW5zdGFuY2VvZiBfKSBiID0gYi5fd3JhcHBlZDtcbiAgICAvLyBDb21wYXJlIGBbW0NsYXNzXV1gIG5hbWVzLlxuICAgIHZhciBjbGFzc05hbWUgPSB0b1N0cmluZy5jYWxsKGEpO1xuICAgIGlmIChjbGFzc05hbWUgIT0gdG9TdHJpbmcuY2FsbChiKSkgcmV0dXJuIGZhbHNlO1xuICAgIHN3aXRjaCAoY2xhc3NOYW1lKSB7XG4gICAgICAvLyBTdHJpbmdzLCBudW1iZXJzLCBkYXRlcywgYW5kIGJvb2xlYW5zIGFyZSBjb21wYXJlZCBieSB2YWx1ZS5cbiAgICAgIGNhc2UgJ1tvYmplY3QgU3RyaW5nXSc6XG4gICAgICAgIC8vIFByaW1pdGl2ZXMgYW5kIHRoZWlyIGNvcnJlc3BvbmRpbmcgb2JqZWN0IHdyYXBwZXJzIGFyZSBlcXVpdmFsZW50OyB0aHVzLCBgXCI1XCJgIGlzXG4gICAgICAgIC8vIGVxdWl2YWxlbnQgdG8gYG5ldyBTdHJpbmcoXCI1XCIpYC5cbiAgICAgICAgcmV0dXJuIGEgPT0gU3RyaW5nKGIpO1xuICAgICAgY2FzZSAnW29iamVjdCBOdW1iZXJdJzpcbiAgICAgICAgLy8gYE5hTmBzIGFyZSBlcXVpdmFsZW50LCBidXQgbm9uLXJlZmxleGl2ZS4gQW4gYGVnYWxgIGNvbXBhcmlzb24gaXMgcGVyZm9ybWVkIGZvclxuICAgICAgICAvLyBvdGhlciBudW1lcmljIHZhbHVlcy5cbiAgICAgICAgcmV0dXJuIGEgIT0gK2EgPyBiICE9ICtiIDogKGEgPT0gMCA/IDEgLyBhID09IDEgLyBiIDogYSA9PSArYik7XG4gICAgICBjYXNlICdbb2JqZWN0IERhdGVdJzpcbiAgICAgIGNhc2UgJ1tvYmplY3QgQm9vbGVhbl0nOlxuICAgICAgICAvLyBDb2VyY2UgZGF0ZXMgYW5kIGJvb2xlYW5zIHRvIG51bWVyaWMgcHJpbWl0aXZlIHZhbHVlcy4gRGF0ZXMgYXJlIGNvbXBhcmVkIGJ5IHRoZWlyXG4gICAgICAgIC8vIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9ucy4gTm90ZSB0aGF0IGludmFsaWQgZGF0ZXMgd2l0aCBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnNcbiAgICAgICAgLy8gb2YgYE5hTmAgYXJlIG5vdCBlcXVpdmFsZW50LlxuICAgICAgICByZXR1cm4gK2EgPT0gK2I7XG4gICAgICAvLyBSZWdFeHBzIGFyZSBjb21wYXJlZCBieSB0aGVpciBzb3VyY2UgcGF0dGVybnMgYW5kIGZsYWdzLlxuICAgICAgY2FzZSAnW29iamVjdCBSZWdFeHBdJzpcbiAgICAgICAgcmV0dXJuIGEuc291cmNlID09IGIuc291cmNlICYmXG4gICAgICAgICAgICAgICBhLmdsb2JhbCA9PSBiLmdsb2JhbCAmJlxuICAgICAgICAgICAgICAgYS5tdWx0aWxpbmUgPT0gYi5tdWx0aWxpbmUgJiZcbiAgICAgICAgICAgICAgIGEuaWdub3JlQ2FzZSA9PSBiLmlnbm9yZUNhc2U7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgYSAhPSAnb2JqZWN0JyB8fCB0eXBlb2YgYiAhPSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuICAgIC8vIEFzc3VtZSBlcXVhbGl0eSBmb3IgY3ljbGljIHN0cnVjdHVyZXMuIFRoZSBhbGdvcml0aG0gZm9yIGRldGVjdGluZyBjeWNsaWNcbiAgICAvLyBzdHJ1Y3R1cmVzIGlzIGFkYXB0ZWQgZnJvbSBFUyA1LjEgc2VjdGlvbiAxNS4xMi4zLCBhYnN0cmFjdCBvcGVyYXRpb24gYEpPYC5cbiAgICB2YXIgbGVuZ3RoID0gYVN0YWNrLmxlbmd0aDtcbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgIC8vIExpbmVhciBzZWFyY2guIFBlcmZvcm1hbmNlIGlzIGludmVyc2VseSBwcm9wb3J0aW9uYWwgdG8gdGhlIG51bWJlciBvZlxuICAgICAgLy8gdW5pcXVlIG5lc3RlZCBzdHJ1Y3R1cmVzLlxuICAgICAgaWYgKGFTdGFja1tsZW5ndGhdID09IGEpIHJldHVybiBiU3RhY2tbbGVuZ3RoXSA9PSBiO1xuICAgIH1cbiAgICAvLyBPYmplY3RzIHdpdGggZGlmZmVyZW50IGNvbnN0cnVjdG9ycyBhcmUgbm90IGVxdWl2YWxlbnQsIGJ1dCBgT2JqZWN0YHNcbiAgICAvLyBmcm9tIGRpZmZlcmVudCBmcmFtZXMgYXJlLlxuICAgIHZhciBhQ3RvciA9IGEuY29uc3RydWN0b3IsIGJDdG9yID0gYi5jb25zdHJ1Y3RvcjtcbiAgICBpZiAoYUN0b3IgIT09IGJDdG9yICYmICEoXy5pc0Z1bmN0aW9uKGFDdG9yKSAmJiAoYUN0b3IgaW5zdGFuY2VvZiBhQ3RvcikgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5pc0Z1bmN0aW9uKGJDdG9yKSAmJiAoYkN0b3IgaW5zdGFuY2VvZiBiQ3RvcikpXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAoJ2NvbnN0cnVjdG9yJyBpbiBhICYmICdjb25zdHJ1Y3RvcicgaW4gYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gQWRkIHRoZSBmaXJzdCBvYmplY3QgdG8gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgIGFTdGFjay5wdXNoKGEpO1xuICAgIGJTdGFjay5wdXNoKGIpO1xuICAgIHZhciBzaXplID0gMCwgcmVzdWx0ID0gdHJ1ZTtcbiAgICAvLyBSZWN1cnNpdmVseSBjb21wYXJlIG9iamVjdHMgYW5kIGFycmF5cy5cbiAgICBpZiAoY2xhc3NOYW1lID09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgIC8vIENvbXBhcmUgYXJyYXkgbGVuZ3RocyB0byBkZXRlcm1pbmUgaWYgYSBkZWVwIGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5LlxuICAgICAgc2l6ZSA9IGEubGVuZ3RoO1xuICAgICAgcmVzdWx0ID0gc2l6ZSA9PSBiLmxlbmd0aDtcbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgLy8gRGVlcCBjb21wYXJlIHRoZSBjb250ZW50cywgaWdub3Jpbmcgbm9uLW51bWVyaWMgcHJvcGVydGllcy5cbiAgICAgICAgd2hpbGUgKHNpemUtLSkge1xuICAgICAgICAgIGlmICghKHJlc3VsdCA9IGVxKGFbc2l6ZV0sIGJbc2l6ZV0sIGFTdGFjaywgYlN0YWNrKSkpIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERlZXAgY29tcGFyZSBvYmplY3RzLlxuICAgICAgZm9yICh2YXIga2V5IGluIGEpIHtcbiAgICAgICAgaWYgKF8uaGFzKGEsIGtleSkpIHtcbiAgICAgICAgICAvLyBDb3VudCB0aGUgZXhwZWN0ZWQgbnVtYmVyIG9mIHByb3BlcnRpZXMuXG4gICAgICAgICAgc2l6ZSsrO1xuICAgICAgICAgIC8vIERlZXAgY29tcGFyZSBlYWNoIG1lbWJlci5cbiAgICAgICAgICBpZiAoIShyZXN1bHQgPSBfLmhhcyhiLCBrZXkpICYmIGVxKGFba2V5XSwgYltrZXldLCBhU3RhY2ssIGJTdGFjaykpKSBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gRW5zdXJlIHRoYXQgYm90aCBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUgbnVtYmVyIG9mIHByb3BlcnRpZXMuXG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIGZvciAoa2V5IGluIGIpIHtcbiAgICAgICAgICBpZiAoXy5oYXMoYiwga2V5KSAmJiAhKHNpemUtLSkpIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9ICFzaXplO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBSZW1vdmUgdGhlIGZpcnN0IG9iamVjdCBmcm9tIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICBhU3RhY2sucG9wKCk7XG4gICAgYlN0YWNrLnBvcCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUGVyZm9ybSBhIGRlZXAgY29tcGFyaXNvbiB0byBjaGVjayBpZiB0d28gb2JqZWN0cyBhcmUgZXF1YWwuXG4gIF8uaXNFcXVhbCA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gZXEoYSwgYiwgW10sIFtdKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIGFycmF5LCBzdHJpbmcsIG9yIG9iamVjdCBlbXB0eT9cbiAgLy8gQW4gXCJlbXB0eVwiIG9iamVjdCBoYXMgbm8gZW51bWVyYWJsZSBvd24tcHJvcGVydGllcy5cbiAgXy5pc0VtcHR5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoXy5pc0FycmF5KG9iaikgfHwgXy5pc1N0cmluZyhvYmopKSByZXR1cm4gb2JqLmxlbmd0aCA9PT0gMDtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSBpZiAoXy5oYXMob2JqLCBrZXkpKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIERPTSBlbGVtZW50P1xuICBfLmlzRWxlbWVudCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiAhIShvYmogJiYgb2JqLm5vZGVUeXBlID09PSAxKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGFuIGFycmF5P1xuICAvLyBEZWxlZ2F0ZXMgdG8gRUNNQTUncyBuYXRpdmUgQXJyYXkuaXNBcnJheVxuICBfLmlzQXJyYXkgPSBuYXRpdmVJc0FycmF5IHx8IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhcmlhYmxlIGFuIG9iamVjdD9cbiAgXy5pc09iamVjdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IE9iamVjdChvYmopO1xuICB9O1xuXG4gIC8vIEFkZCBzb21lIGlzVHlwZSBtZXRob2RzOiBpc0FyZ3VtZW50cywgaXNGdW5jdGlvbiwgaXNTdHJpbmcsIGlzTnVtYmVyLCBpc0RhdGUsIGlzUmVnRXhwLlxuICBlYWNoKFsnQXJndW1lbnRzJywgJ0Z1bmN0aW9uJywgJ1N0cmluZycsICdOdW1iZXInLCAnRGF0ZScsICdSZWdFeHAnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIF9bJ2lzJyArIG5hbWVdID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0ICcgKyBuYW1lICsgJ10nO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIERlZmluZSBhIGZhbGxiYWNrIHZlcnNpb24gb2YgdGhlIG1ldGhvZCBpbiBicm93c2VycyAoYWhlbSwgSUUpLCB3aGVyZVxuICAvLyB0aGVyZSBpc24ndCBhbnkgaW5zcGVjdGFibGUgXCJBcmd1bWVudHNcIiB0eXBlLlxuICBpZiAoIV8uaXNBcmd1bWVudHMoYXJndW1lbnRzKSkge1xuICAgIF8uaXNBcmd1bWVudHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiAhIShvYmogJiYgXy5oYXMob2JqLCAnY2FsbGVlJykpO1xuICAgIH07XG4gIH1cblxuICAvLyBPcHRpbWl6ZSBgaXNGdW5jdGlvbmAgaWYgYXBwcm9wcmlhdGUuXG4gIGlmICh0eXBlb2YgKC8uLykgIT09ICdmdW5jdGlvbicpIHtcbiAgICBfLmlzRnVuY3Rpb24gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nO1xuICAgIH07XG4gIH1cblxuICAvLyBJcyBhIGdpdmVuIG9iamVjdCBhIGZpbml0ZSBudW1iZXI/XG4gIF8uaXNGaW5pdGUgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gaXNGaW5pdGUob2JqKSAmJiAhaXNOYU4ocGFyc2VGbG9hdChvYmopKTtcbiAgfTtcblxuICAvLyBJcyB0aGUgZ2l2ZW4gdmFsdWUgYE5hTmA/IChOYU4gaXMgdGhlIG9ubHkgbnVtYmVyIHdoaWNoIGRvZXMgbm90IGVxdWFsIGl0c2VsZikuXG4gIF8uaXNOYU4gPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gXy5pc051bWJlcihvYmopICYmIG9iaiAhPSArb2JqO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYSBib29sZWFuP1xuICBfLmlzQm9vbGVhbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHRydWUgfHwgb2JqID09PSBmYWxzZSB8fCB0b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgQm9vbGVhbl0nO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgZXF1YWwgdG8gbnVsbD9cbiAgXy5pc051bGwgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSBudWxsO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgdW5kZWZpbmVkP1xuICBfLmlzVW5kZWZpbmVkID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdm9pZCAwO1xuICB9O1xuXG4gIC8vIFNob3J0Y3V0IGZ1bmN0aW9uIGZvciBjaGVja2luZyBpZiBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gcHJvcGVydHkgZGlyZWN0bHlcbiAgLy8gb24gaXRzZWxmIChpbiBvdGhlciB3b3Jkcywgbm90IG9uIGEgcHJvdG90eXBlKS5cbiAgXy5oYXMgPSBmdW5jdGlvbihvYmosIGtleSkge1xuICAgIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KTtcbiAgfTtcblxuICAvLyBVdGlsaXR5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJ1biBVbmRlcnNjb3JlLmpzIGluICpub0NvbmZsaWN0KiBtb2RlLCByZXR1cm5pbmcgdGhlIGBfYCB2YXJpYWJsZSB0byBpdHNcbiAgLy8gcHJldmlvdXMgb3duZXIuIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICByb290Ll8gPSBwcmV2aW91c1VuZGVyc2NvcmU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gS2VlcCB0aGUgaWRlbnRpdHkgZnVuY3Rpb24gYXJvdW5kIGZvciBkZWZhdWx0IGl0ZXJhdG9ycy5cbiAgXy5pZGVudGl0eSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIF8uY29uc3RhbnQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcbiAgfTtcblxuICBfLnByb3BlcnR5ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9ialtrZXldO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIHByZWRpY2F0ZSBmb3IgY2hlY2tpbmcgd2hldGhlciBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gc2V0IG9mIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLm1hdGNoZXMgPSBmdW5jdGlvbihhdHRycykge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgIGlmIChvYmogPT09IGF0dHJzKSByZXR1cm4gdHJ1ZTsgLy9hdm9pZCBjb21wYXJpbmcgYW4gb2JqZWN0IHRvIGl0c2VsZi5cbiAgICAgIGZvciAodmFyIGtleSBpbiBhdHRycykge1xuICAgICAgICBpZiAoYXR0cnNba2V5XSAhPT0gb2JqW2tleV0pXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9O1xuXG4gIC8vIFJ1biBhIGZ1bmN0aW9uICoqbioqIHRpbWVzLlxuICBfLnRpbWVzID0gZnVuY3Rpb24obiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICB2YXIgYWNjdW0gPSBBcnJheShNYXRoLm1heCgwLCBuKSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIGFjY3VtW2ldID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCBpKTtcbiAgICByZXR1cm4gYWNjdW07XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgcmFuZG9tIGludGVnZXIgYmV0d2VlbiBtaW4gYW5kIG1heCAoaW5jbHVzaXZlKS5cbiAgXy5yYW5kb20gPSBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgIGlmIChtYXggPT0gbnVsbCkge1xuICAgICAgbWF4ID0gbWluO1xuICAgICAgbWluID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIG1pbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSk7XG4gIH07XG5cbiAgLy8gQSAocG9zc2libHkgZmFzdGVyKSB3YXkgdG8gZ2V0IHRoZSBjdXJyZW50IHRpbWVzdGFtcCBhcyBhbiBpbnRlZ2VyLlxuICBfLm5vdyA9IERhdGUubm93IHx8IGZ1bmN0aW9uKCkgeyByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7IH07XG5cbiAgLy8gTGlzdCBvZiBIVE1MIGVudGl0aWVzIGZvciBlc2NhcGluZy5cbiAgdmFyIGVudGl0eU1hcCA9IHtcbiAgICBlc2NhcGU6IHtcbiAgICAgICcmJzogJyZhbXA7JyxcbiAgICAgICc8JzogJyZsdDsnLFxuICAgICAgJz4nOiAnJmd0OycsXG4gICAgICAnXCInOiAnJnF1b3Q7JyxcbiAgICAgIFwiJ1wiOiAnJiN4Mjc7J1xuICAgIH1cbiAgfTtcbiAgZW50aXR5TWFwLnVuZXNjYXBlID0gXy5pbnZlcnQoZW50aXR5TWFwLmVzY2FwZSk7XG5cbiAgLy8gUmVnZXhlcyBjb250YWluaW5nIHRoZSBrZXlzIGFuZCB2YWx1ZXMgbGlzdGVkIGltbWVkaWF0ZWx5IGFib3ZlLlxuICB2YXIgZW50aXR5UmVnZXhlcyA9IHtcbiAgICBlc2NhcGU6ICAgbmV3IFJlZ0V4cCgnWycgKyBfLmtleXMoZW50aXR5TWFwLmVzY2FwZSkuam9pbignJykgKyAnXScsICdnJyksXG4gICAgdW5lc2NhcGU6IG5ldyBSZWdFeHAoJygnICsgXy5rZXlzKGVudGl0eU1hcC51bmVzY2FwZSkuam9pbignfCcpICsgJyknLCAnZycpXG4gIH07XG5cbiAgLy8gRnVuY3Rpb25zIGZvciBlc2NhcGluZyBhbmQgdW5lc2NhcGluZyBzdHJpbmdzIHRvL2Zyb20gSFRNTCBpbnRlcnBvbGF0aW9uLlxuICBfLmVhY2goWydlc2NhcGUnLCAndW5lc2NhcGUnXSwgZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgX1ttZXRob2RdID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICBpZiAoc3RyaW5nID09IG51bGwpIHJldHVybiAnJztcbiAgICAgIHJldHVybiAoJycgKyBzdHJpbmcpLnJlcGxhY2UoZW50aXR5UmVnZXhlc1ttZXRob2RdLCBmdW5jdGlvbihtYXRjaCkge1xuICAgICAgICByZXR1cm4gZW50aXR5TWFwW21ldGhvZF1bbWF0Y2hdO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gSWYgdGhlIHZhbHVlIG9mIHRoZSBuYW1lZCBgcHJvcGVydHlgIGlzIGEgZnVuY3Rpb24gdGhlbiBpbnZva2UgaXQgd2l0aCB0aGVcbiAgLy8gYG9iamVjdGAgYXMgY29udGV4dDsgb3RoZXJ3aXNlLCByZXR1cm4gaXQuXG4gIF8ucmVzdWx0ID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkge1xuICAgIGlmIChvYmplY3QgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICB2YXIgdmFsdWUgPSBvYmplY3RbcHJvcGVydHldO1xuICAgIHJldHVybiBfLmlzRnVuY3Rpb24odmFsdWUpID8gdmFsdWUuY2FsbChvYmplY3QpIDogdmFsdWU7XG4gIH07XG5cbiAgLy8gQWRkIHlvdXIgb3duIGN1c3RvbSBmdW5jdGlvbnMgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLm1peGluID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgZWFjaChfLmZ1bmN0aW9ucyhvYmopLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICB2YXIgZnVuYyA9IF9bbmFtZV0gPSBvYmpbbmFtZV07XG4gICAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXJncyA9IFt0aGlzLl93cmFwcGVkXTtcbiAgICAgICAgcHVzaC5hcHBseShhcmdzLCBhcmd1bWVudHMpO1xuICAgICAgICByZXR1cm4gcmVzdWx0LmNhbGwodGhpcywgZnVuYy5hcHBseShfLCBhcmdzKSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIEdlbmVyYXRlIGEgdW5pcXVlIGludGVnZXIgaWQgKHVuaXF1ZSB3aXRoaW4gdGhlIGVudGlyZSBjbGllbnQgc2Vzc2lvbikuXG4gIC8vIFVzZWZ1bCBmb3IgdGVtcG9yYXJ5IERPTSBpZHMuXG4gIHZhciBpZENvdW50ZXIgPSAwO1xuICBfLnVuaXF1ZUlkID0gZnVuY3Rpb24ocHJlZml4KSB7XG4gICAgdmFyIGlkID0gKytpZENvdW50ZXIgKyAnJztcbiAgICByZXR1cm4gcHJlZml4ID8gcHJlZml4ICsgaWQgOiBpZDtcbiAgfTtcblxuICAvLyBCeSBkZWZhdWx0LCBVbmRlcnNjb3JlIHVzZXMgRVJCLXN0eWxlIHRlbXBsYXRlIGRlbGltaXRlcnMsIGNoYW5nZSB0aGVcbiAgLy8gZm9sbG93aW5nIHRlbXBsYXRlIHNldHRpbmdzIHRvIHVzZSBhbHRlcm5hdGl2ZSBkZWxpbWl0ZXJzLlxuICBfLnRlbXBsYXRlU2V0dGluZ3MgPSB7XG4gICAgZXZhbHVhdGUgICAgOiAvPCUoW1xcc1xcU10rPyklPi9nLFxuICAgIGludGVycG9sYXRlIDogLzwlPShbXFxzXFxTXSs/KSU+L2csXG4gICAgZXNjYXBlICAgICAgOiAvPCUtKFtcXHNcXFNdKz8pJT4vZ1xuICB9O1xuXG4gIC8vIFdoZW4gY3VzdG9taXppbmcgYHRlbXBsYXRlU2V0dGluZ3NgLCBpZiB5b3UgZG9uJ3Qgd2FudCB0byBkZWZpbmUgYW5cbiAgLy8gaW50ZXJwb2xhdGlvbiwgZXZhbHVhdGlvbiBvciBlc2NhcGluZyByZWdleCwgd2UgbmVlZCBvbmUgdGhhdCBpc1xuICAvLyBndWFyYW50ZWVkIG5vdCB0byBtYXRjaC5cbiAgdmFyIG5vTWF0Y2ggPSAvKC4pXi87XG5cbiAgLy8gQ2VydGFpbiBjaGFyYWN0ZXJzIG5lZWQgdG8gYmUgZXNjYXBlZCBzbyB0aGF0IHRoZXkgY2FuIGJlIHB1dCBpbnRvIGFcbiAgLy8gc3RyaW5nIGxpdGVyYWwuXG4gIHZhciBlc2NhcGVzID0ge1xuICAgIFwiJ1wiOiAgICAgIFwiJ1wiLFxuICAgICdcXFxcJzogICAgICdcXFxcJyxcbiAgICAnXFxyJzogICAgICdyJyxcbiAgICAnXFxuJzogICAgICduJyxcbiAgICAnXFx0JzogICAgICd0JyxcbiAgICAnXFx1MjAyOCc6ICd1MjAyOCcsXG4gICAgJ1xcdTIwMjknOiAndTIwMjknXG4gIH07XG5cbiAgdmFyIGVzY2FwZXIgPSAvXFxcXHwnfFxccnxcXG58XFx0fFxcdTIwMjh8XFx1MjAyOS9nO1xuXG4gIC8vIEphdmFTY3JpcHQgbWljcm8tdGVtcGxhdGluZywgc2ltaWxhciB0byBKb2huIFJlc2lnJ3MgaW1wbGVtZW50YXRpb24uXG4gIC8vIFVuZGVyc2NvcmUgdGVtcGxhdGluZyBoYW5kbGVzIGFyYml0cmFyeSBkZWxpbWl0ZXJzLCBwcmVzZXJ2ZXMgd2hpdGVzcGFjZSxcbiAgLy8gYW5kIGNvcnJlY3RseSBlc2NhcGVzIHF1b3RlcyB3aXRoaW4gaW50ZXJwb2xhdGVkIGNvZGUuXG4gIF8udGVtcGxhdGUgPSBmdW5jdGlvbih0ZXh0LCBkYXRhLCBzZXR0aW5ncykge1xuICAgIHZhciByZW5kZXI7XG4gICAgc2V0dGluZ3MgPSBfLmRlZmF1bHRzKHt9LCBzZXR0aW5ncywgXy50ZW1wbGF0ZVNldHRpbmdzKTtcblxuICAgIC8vIENvbWJpbmUgZGVsaW1pdGVycyBpbnRvIG9uZSByZWd1bGFyIGV4cHJlc3Npb24gdmlhIGFsdGVybmF0aW9uLlxuICAgIHZhciBtYXRjaGVyID0gbmV3IFJlZ0V4cChbXG4gICAgICAoc2V0dGluZ3MuZXNjYXBlIHx8IG5vTWF0Y2gpLnNvdXJjZSxcbiAgICAgIChzZXR0aW5ncy5pbnRlcnBvbGF0ZSB8fCBub01hdGNoKS5zb3VyY2UsXG4gICAgICAoc2V0dGluZ3MuZXZhbHVhdGUgfHwgbm9NYXRjaCkuc291cmNlXG4gICAgXS5qb2luKCd8JykgKyAnfCQnLCAnZycpO1xuXG4gICAgLy8gQ29tcGlsZSB0aGUgdGVtcGxhdGUgc291cmNlLCBlc2NhcGluZyBzdHJpbmcgbGl0ZXJhbHMgYXBwcm9wcmlhdGVseS5cbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBzb3VyY2UgPSBcIl9fcCs9J1wiO1xuICAgIHRleHQucmVwbGFjZShtYXRjaGVyLCBmdW5jdGlvbihtYXRjaCwgZXNjYXBlLCBpbnRlcnBvbGF0ZSwgZXZhbHVhdGUsIG9mZnNldCkge1xuICAgICAgc291cmNlICs9IHRleHQuc2xpY2UoaW5kZXgsIG9mZnNldClcbiAgICAgICAgLnJlcGxhY2UoZXNjYXBlciwgZnVuY3Rpb24obWF0Y2gpIHsgcmV0dXJuICdcXFxcJyArIGVzY2FwZXNbbWF0Y2hdOyB9KTtcblxuICAgICAgaWYgKGVzY2FwZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGVzY2FwZSArIFwiKSk9PW51bGw/Jyc6Xy5lc2NhcGUoX190KSkrXFxuJ1wiO1xuICAgICAgfVxuICAgICAgaWYgKGludGVycG9sYXRlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgaW50ZXJwb2xhdGUgKyBcIikpPT1udWxsPycnOl9fdCkrXFxuJ1wiO1xuICAgICAgfVxuICAgICAgaWYgKGV2YWx1YXRlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIic7XFxuXCIgKyBldmFsdWF0ZSArIFwiXFxuX19wKz0nXCI7XG4gICAgICB9XG4gICAgICBpbmRleCA9IG9mZnNldCArIG1hdGNoLmxlbmd0aDtcbiAgICAgIHJldHVybiBtYXRjaDtcbiAgICB9KTtcbiAgICBzb3VyY2UgKz0gXCInO1xcblwiO1xuXG4gICAgLy8gSWYgYSB2YXJpYWJsZSBpcyBub3Qgc3BlY2lmaWVkLCBwbGFjZSBkYXRhIHZhbHVlcyBpbiBsb2NhbCBzY29wZS5cbiAgICBpZiAoIXNldHRpbmdzLnZhcmlhYmxlKSBzb3VyY2UgPSAnd2l0aChvYmp8fHt9KXtcXG4nICsgc291cmNlICsgJ31cXG4nO1xuXG4gICAgc291cmNlID0gXCJ2YXIgX190LF9fcD0nJyxfX2o9QXJyYXkucHJvdG90eXBlLmpvaW4sXCIgK1xuICAgICAgXCJwcmludD1mdW5jdGlvbigpe19fcCs9X19qLmNhbGwoYXJndW1lbnRzLCcnKTt9O1xcblwiICtcbiAgICAgIHNvdXJjZSArIFwicmV0dXJuIF9fcDtcXG5cIjtcblxuICAgIHRyeSB7XG4gICAgICByZW5kZXIgPSBuZXcgRnVuY3Rpb24oc2V0dGluZ3MudmFyaWFibGUgfHwgJ29iaicsICdfJywgc291cmNlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBlLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgaWYgKGRhdGEpIHJldHVybiByZW5kZXIoZGF0YSwgXyk7XG4gICAgdmFyIHRlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuIHJlbmRlci5jYWxsKHRoaXMsIGRhdGEsIF8pO1xuICAgIH07XG5cbiAgICAvLyBQcm92aWRlIHRoZSBjb21waWxlZCBmdW5jdGlvbiBzb3VyY2UgYXMgYSBjb252ZW5pZW5jZSBmb3IgcHJlY29tcGlsYXRpb24uXG4gICAgdGVtcGxhdGUuc291cmNlID0gJ2Z1bmN0aW9uKCcgKyAoc2V0dGluZ3MudmFyaWFibGUgfHwgJ29iaicpICsgJyl7XFxuJyArIHNvdXJjZSArICd9JztcblxuICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgfTtcblxuICAvLyBBZGQgYSBcImNoYWluXCIgZnVuY3Rpb24sIHdoaWNoIHdpbGwgZGVsZWdhdGUgdG8gdGhlIHdyYXBwZXIuXG4gIF8uY2hhaW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gXyhvYmopLmNoYWluKCk7XG4gIH07XG5cbiAgLy8gT09QXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuICAvLyBJZiBVbmRlcnNjb3JlIGlzIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLCBpdCByZXR1cm5zIGEgd3JhcHBlZCBvYmplY3QgdGhhdFxuICAvLyBjYW4gYmUgdXNlZCBPTy1zdHlsZS4gVGhpcyB3cmFwcGVyIGhvbGRzIGFsdGVyZWQgdmVyc2lvbnMgb2YgYWxsIHRoZVxuICAvLyB1bmRlcnNjb3JlIGZ1bmN0aW9ucy4gV3JhcHBlZCBvYmplY3RzIG1heSBiZSBjaGFpbmVkLlxuXG4gIC8vIEhlbHBlciBmdW5jdGlvbiB0byBjb250aW51ZSBjaGFpbmluZyBpbnRlcm1lZGlhdGUgcmVzdWx0cy5cbiAgdmFyIHJlc3VsdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0aGlzLl9jaGFpbiA/IF8ob2JqKS5jaGFpbigpIDogb2JqO1xuICB9O1xuXG4gIC8vIEFkZCBhbGwgb2YgdGhlIFVuZGVyc2NvcmUgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyIG9iamVjdC5cbiAgXy5taXhpbihfKTtcblxuICAvLyBBZGQgYWxsIG11dGF0b3IgQXJyYXkgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyLlxuICBlYWNoKFsncG9wJywgJ3B1c2gnLCAncmV2ZXJzZScsICdzaGlmdCcsICdzb3J0JywgJ3NwbGljZScsICd1bnNoaWZ0J10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWV0aG9kID0gQXJyYXlQcm90b1tuYW1lXTtcbiAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG9iaiA9IHRoaXMuX3dyYXBwZWQ7XG4gICAgICBtZXRob2QuYXBwbHkob2JqLCBhcmd1bWVudHMpO1xuICAgICAgaWYgKChuYW1lID09ICdzaGlmdCcgfHwgbmFtZSA9PSAnc3BsaWNlJykgJiYgb2JqLmxlbmd0aCA9PT0gMCkgZGVsZXRlIG9ialswXTtcbiAgICAgIHJldHVybiByZXN1bHQuY2FsbCh0aGlzLCBvYmopO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIEFkZCBhbGwgYWNjZXNzb3IgQXJyYXkgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyLlxuICBlYWNoKFsnY29uY2F0JywgJ2pvaW4nLCAnc2xpY2UnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcmVzdWx0LmNhbGwodGhpcywgbWV0aG9kLmFwcGx5KHRoaXMuX3dyYXBwZWQsIGFyZ3VtZW50cykpO1xuICAgIH07XG4gIH0pO1xuXG4gIF8uZXh0ZW5kKF8ucHJvdG90eXBlLCB7XG5cbiAgICAvLyBTdGFydCBjaGFpbmluZyBhIHdyYXBwZWQgVW5kZXJzY29yZSBvYmplY3QuXG4gICAgY2hhaW46IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fY2hhaW4gPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIEV4dHJhY3RzIHRoZSByZXN1bHQgZnJvbSBhIHdyYXBwZWQgYW5kIGNoYWluZWQgb2JqZWN0LlxuICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl93cmFwcGVkO1xuICAgIH1cblxuICB9KTtcblxuICAvLyBBTUQgcmVnaXN0cmF0aW9uIGhhcHBlbnMgYXQgdGhlIGVuZCBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIEFNRCBsb2FkZXJzXG4gIC8vIHRoYXQgbWF5IG5vdCBlbmZvcmNlIG5leHQtdHVybiBzZW1hbnRpY3Mgb24gbW9kdWxlcy4gRXZlbiB0aG91Z2ggZ2VuZXJhbFxuICAvLyBwcmFjdGljZSBmb3IgQU1EIHJlZ2lzdHJhdGlvbiBpcyB0byBiZSBhbm9ueW1vdXMsIHVuZGVyc2NvcmUgcmVnaXN0ZXJzXG4gIC8vIGFzIGEgbmFtZWQgbW9kdWxlIGJlY2F1c2UsIGxpa2UgalF1ZXJ5LCBpdCBpcyBhIGJhc2UgbGlicmFyeSB0aGF0IGlzXG4gIC8vIHBvcHVsYXIgZW5vdWdoIHRvIGJlIGJ1bmRsZWQgaW4gYSB0aGlyZCBwYXJ0eSBsaWIsIGJ1dCBub3QgYmUgcGFydCBvZlxuICAvLyBhbiBBTUQgbG9hZCByZXF1ZXN0LiBUaG9zZSBjYXNlcyBjb3VsZCBnZW5lcmF0ZSBhbiBlcnJvciB3aGVuIGFuXG4gIC8vIGFub255bW91cyBkZWZpbmUoKSBpcyBjYWxsZWQgb3V0c2lkZSBvZiBhIGxvYWRlciByZXF1ZXN0LlxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKCd1bmRlcnNjb3JlJywgW10sIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF87XG4gICAgfSk7XG4gIH1cbn0pLmNhbGwodGhpcyk7XG4iLCJ2YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcbi8vdmFyICQgPSByZXF1aXJlKCdqcXVlcnknKTtcbi8vdmFyIEJhY29uID0gcmVxdWlyZSgnYmFjb25qcycpO1xuLy8kLmZuLmFzRXZlbnRTdHJlYW0gPSBCYWNvbi4kLmFzRXZlbnRTdHJlYW07XG4vL3ZhciBkMyA9IHJlcXVpcmUoJ2QzJyk7XG4vL3ZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbndpbmRvdy5QaXhhc3RpYyA9IHJlcXVpcmUoJ3BpeGFzdGljJyk7XG5cbnZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbmltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbi8vICAgIFBpeGFzdGljLnByb2Nlc3MoaW1nLCAnZGVzYXR1cmF0ZScpO1xuICAgIHZhciBibGVuZEltZyA9IG5ldyBJbWFnZSgpO1xuICAgIGJsZW5kSW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBQaXhhc3RpYy5wcm9jZXNzKGltZywgJ2Rlc2F0dXJhdGUnLCBudWxsLCBmdW5jdGlvbihkZXNhdHVyYXRlZCkge1xuICAgICAgICAgICAgUGl4YXN0aWMucHJvY2VzcyhkZXNhdHVyYXRlZCwgXCJibGVuZFwiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYW1vdW50IDogMSxcbiAgICAgICAgICAgICAgICAgICAgbW9kZSA6IFwibXVsdGlwbHlcIixcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2UgOiBibGVuZEltZ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBibGVuZEltZy5jcm9zc09yaWdpbiA9ICdhbm9ueW1vdXMnO1xuICAgIGJsZW5kSW1nLnNyYyA9IFwiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3Nkby5nc2ZjLm5hc2EuZ292L2Fzc2V0cy9pbWcvbGF0ZXN0L2xhdGVzdF8xMDI0XzAxOTMuanBnXCI7XG5cbi8vICAgIGJsZW5kSW1nLnNyYyA9IFwiaW1hZ2VzLzIwMTQwMTExXzAwMDEwMl8xMDI0XzAwOTQuanBnXCI7XG59O1xuaW1nLmNyb3NzT3JpZ2luID0gJ2Fub255bW91cyc7XG5pbWcuc3JjID0gXCJodHRwOi8vbG9jYWxob3N0OjgwODAvc2RvLmdzZmMubmFzYS5nb3YvYXNzZXRzL2ltZy9sYXRlc3QvbGF0ZXN0XzEwMjRfMDIxMS5qcGdcIjtcbi8vaW1nLnNyYyA9IFwiaW1hZ2VzLzIwMTQwMTExXzAwMDAwMF8xMDI0XzAxNzEuanBnXCI7XG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGltZyk7XG5cbi8vd2luZG93Lm1vbmEgPSBpbWc7XG4vL1BpeGkuVGV4dHVyZS5mcm9tSW1hZ2UoXCJcIik7XG4vL3ZhciBpbWdCbHVlID0gUGl4aS5UZXh0dXJlLmZyb21JbWFnZShcIlwiKTtcbi8vdmFyIGltZ1JlZCA9IFBpeGkuVGV4dHVyZS5mcm9tSW1hZ2UoXCJodHRwOi8vbG9jYWxob3N0OjgwODAvc2RvLmdzZmMubmFzYS5nb3YvYXNzZXRzL2ltZy9icm93c2UvMjAxNC8wMS8wMS8yMDE0MDEwMV8wMDAyMDdfNTEyXzE3MDAuanBnXCIpOyJdfQ==
