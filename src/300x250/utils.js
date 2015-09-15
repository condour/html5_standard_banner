// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function() {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Utils object (by convention, referred to as u within banner);

var createUtils = function() {
    'use strict';

    var my = {};

    my.imageLoadCount = 0;

    my.removeAllChildren = function(el) {
            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }
        }
        //This will echo how many seconds have passed
    my.returnTimer = function(initialTime) {
        var stopWatch = ((new Date().getTime()) - initialTime) * .001;
    }


    my.createListFunction = function(callback) {
        return function() {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i]) {
                    callback(arguments[i], i);
                }
            }
        }
    }

    my.kill = my.createListFunction(function(result, i) {
        if (result.parentNode) {
            result.parentNode.removeChild(result);
        }
    })
    my.hide = my.createListFunction(function(result, i) {
        result.style.opacity = 0;
    });
    my.show = my.createListFunction(function(result, i) {
        result.style.opacity = 1;
    });

    my.appendChildrenTo = function(parentNode) {
        return this.createListFunction(function(result, i) {
            parentNode.appendChild(result);
        });
    }
    my.generateSizedSprite = function(imgURL, x, y, w, h) {
        var div = this.generateSizedContainer(w + 1, h + 1);
        div.style.backgroundRepeat = 'no-repeat';
        var urlString = "url(\"" + imgURL + "\")"
        var image = new Image();
        image.onload = this.decrementImageLoadCount.bind(this);
        this.incrementImageLoadCount();
        image.src = imgURL;
        div.style.backgroundImage = urlString;
        div.style.backgroundSize = w + 'px ' + h + 'px';
        div.style.left = x + 'px'
        div.style.top = y + 'px'
        return div;
    }

    my.decrementImageLoadCount = function() {

        this.imageLoadCount--;
        
        if (this.imageLoadCount < 1) {
            this.publish('loaded');
        }
    }
    my.incrementImageLoadCount = function() {
        this.imageLoadCount++;
    }
    my.subscribe = function(ev, callback) {
        var calls = this._callbacks || (this._callbacks = {});
        (this._callbacks[ev] || (this._callbacks[ev] = [])).push(callback);

        return this;
    };

    my.publish = function() {
        var args = Array.prototype.slice.call(arguments, 0);

        var ev = args.shift();

        var list, calls, i, l;

        if (!(calls = this._callbacks)) return this;
        if (!(list = this._callbacks[ev])) return this;

        for (i = 0, l = list.length; i < l; i++)
            list[i].apply(this, args);

        return this;
    }

    my.generateSprite = function(imgURL) {
        return this.generateSizedSprite(imgURL, 0, 0, this.dimensions.width, this.dimensions.height);
    }

    my.generateContainer = function() {
        return this.generateSizedContainer(this.dimensions.width, this.dimensions.height);
    }
    my.generateSizedContainer = function(w, h) {
        var div = document.createElement("div");
        div.style.width = w + "px";
        div.style.height = h + "px";
        div.style.position = "absolute";
        div.style.overflow = "hidden";
        return div;
    }
    my.clone = function(target, obj) {

        for (var i in obj) {
            try {
                target[i] = obj[i];
            } catch (e) {
                console.log("couldn't clone property");
            }

        }

    }
    my.extractSize = function(str) {
        var widthMatch = /width\=(\d+)/.exec(str);
        var heightMatch = /height\=(\d+)/.exec(str);
        return {
            width: parseInt(widthMatch[1]),
            height: parseInt(heightMatch[1])
        }
    }

    my.generateSplitSprite = function(imgURL) {
        var imageObj = new Image();
        var returnedContainer = this.generateContainer();
        imageObj.onload = this.splitImage(imageObj, returnedContainer).bind(this);
        this.incrementImageLoadCount();
        imageObj.src = imgURL;
        return returnedContainer;

    }

    my.splitImage = function(imageObj, returnedContainer) {
        var scope = this;
        return function splitImageInClosure() {
            scope.decrementImageLoadCount();
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');

            var imageWidth = canvas.width = imageObj.width;
            var imageHeight = canvas.height = imageObj.height;
            var imageX = 0,
                imageY = 0;
            context.drawImage(imageObj, 0, 0);
            
            
            var imageData = context.getImageData(imageX, imageY, imageWidth, imageHeight);
            var data = imageData.data;
            var inContent = false;
            var currentInd = 0;
            var sections = [];
            sections[currentInd] = {};
            // iterate over all pixels based on x and y coordinates; find in and out points
            for (var y = 0; y < imageHeight; y++) {
                // loop through each column
                var blankLine = true;

                for (var x = 0; x < imageWidth; x++) {
                    var prevLines = imageWidth * y;
                    var currentPixel = ((prevLines) + x) * 4;
                   /* for (var b = 0; b < 4; b++) {
                        images[currentInd].push(data[currentPixel + b]);
                    }*/
                    if (data[currentPixel + 3] > 0) {
                        blankLine = false;
                        break;
                    }

                }
                if (!blankLine && !inContent) {
                    inContent = true;
                    sections[currentInd].inpoint = y;

                } else if (blankLine && inContent) {
                    inContent = false;

                    sections[currentInd].outpoint = y;
                    currentInd++;
                    sections[currentInd] = {};
                }
            }

            sections.forEach(function(result){
                if(result.inpoint && result.outpoint){
                    scope.addArrayAsImage(data,result.inpoint,result.outpoint,imageWidth,imageHeight,returnedContainer)
                }
            })

        }

    }

    my.copyPixelsExpensively = function(dataIn,inIndex,outIndex,dataOut){
        for(var i = inIndex;i<outIndex;i++){
            dataOut[i-inIndex] = dataIn[i];
        }
    }

    my.addArrayAsImage = function(data, inY, outY, w, h, container) {
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = outY - inY;
        var ctx = canvas.getContext('2d');
        var imgData = ctx.createImageData(w, h); 
        if(imgData.data.set && data.slice){
            var pixelArray = data.slice(inY*w*4,outY*w*4);
            imgData.data.set(new Uint8ClampedArray(pixelArray));
        } else {
            my.copyPixelsExpensively(data,inY*w*4,outY*w*4,imgData.data);
        }   
        ctx.putImageData(imgData, 0, 0);
        canvas.style.position = 'absolute';
        canvas.style.width = this.dimensions.width + 'px';
        canvas.style.height = Math.round(.5 * (outY - inY)) + 'px';
        canvas.style.top = inY*.5 + 'px';
        container.appendChild(canvas);
    }
    my.dimensions = {
        width: 0,
        height: 0
    }
    return my;
}
