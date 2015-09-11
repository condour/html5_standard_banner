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

var createUtils = function(){
   'use strict';
    var my = {}; 



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
    my.generateSizedSprite = function(imgURL,x,y,w,h){
      var div = this.generateSizedContainer(w+1,h+1);
        div.style.backgroundRepeat = 'no-repeat';
        var urlString = "url('" + imgURL + "')"
        console.log(urlString);
        div.style.backgroundImage = urlString;
        div.style.backgroundSize = w + 'px ' + h + 'px';
        div.style.left = x+'px'
        div.style.top = y+'px'
        return div;
    }
    my.generateSprite = function(imgURL) {
      return this.generateSizedSprite(imgURL,0,0,this.dimensions.width,this.dimensions.height);
    }
    
    my.generateContainer = function() {
      return this.generateSizedContainer(this.dimensions.width,this.dimensions.height);
    }
    my.generateSizedContainer = function(w,h){
      var div = document.createElement("div");
        div.style.width = w + "px";
        div.style.height = h + "px";
        div.style.position = "absolute";
        div.style.overflow = "hidden";
        return div;
    }
    my.clone = function(target, obj) {

        for (var i in obj) {
            try{
                target[i] = obj[i];
            } catch(e){
                console.log("couldn't clone property")
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
    my.dimensions = {width:0,height:0}
    return my;
}