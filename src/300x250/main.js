function createBanner(utils, assets) { // u is utils, a is assets
    "use strict";
    // onetime setup 

    /* 

    Main.js, written 2015 by Michael Condouris
    Closure which creates a standard banner object.

    Objects to know:

    utils                               Contains a series of utility functions.

    utils.clone(object1,object2)        Takes the values in object2 and overwrites those values in object1. 
                                        Easy shorthand for copying styles into object.

    makeSprite(asset)                   Curried to take dimensions. Takes an asset, as specified in assets.js. Returns a div, positioned per the bounding 
                                        box in the asset object. Asset contains a bounding box reflecting the original asset size and offset, a multiplier reflecting whether it's 
                                        intended to be 1x or retina.

    makeSplitSprite(asset)              Curried to take dimensions. Takes an asset, as specified in assets.js, and splits it along transparenct vertical lines. 
                                        Returns a div that has divs representing each split within it.
                                        Ideal for copy that needs to stagger.

    makeSizedSprite(                    Curried to take dimensions. Takes any url as the first param, sets it up as an image with the exact positioning specified. 
                uri,x,y,width,height)   Useful for elements that aren't in Assets, or aren't automatically positioned.

    utils.pixify(number)                Rounds the number and adds 'px'.

    assets                              An object which contains all the assets made by the gulp process. These can be used to make sprites using 
                                        the methods above.

    sprites                             An object to which divs are assigned a reference, to maintain a clean namespace.

    */

    // create a variable to track banner time.
    var initialTime = new Date().getTime();
    var observer = undefined;
    var tl = new TimelineLite({onUpdate: function(){if(tl.observer){tl.observer.update(tl)}}});
    var sprites = {};
    var BORDER = '1px solid #666666'
    // extract dimension sizes from metatag in markup
    var dimensions = utils.extractSize(document.querySelectorAll("[name='ad.size']")[0].getAttributeNode("content").value);
   

    function render() {
        

        
        var makeSprite = utils.makeSprite(dimensions);
        var makeContainer = utils.makeContainer(dimensions);
        var makeSplitSprite = utils.makeSplitSprite(dimensions);
        console.log(makeContainer);

        // pass assets through filter to remove those we don't need, based on whether we're retina or not.
        assets = utils.eliminateRedundantAssetsBasedOnDPI(assets);
        
        // retrieve main layers from markup
        
        sprites.container = document.querySelectorAll('.container')[0]; // everything goes in here
        sprites.aboveClickTag = document.querySelectorAll('.above-click-tag')[0]; // items that don't respond to clicktag, like replay
        sprites.ctaContainer = document.querySelectorAll('.cta-container')[0]; // cta itself (with rollover)
        sprites.belowClickTag = document.querySelectorAll('.below-click-tag')[0]; // anything below cta, which just responds to clicktag

        // set css for the main container to the metatag dimensions

        TweenLite.set(sprites.container, {
            width: utils.pixify(dimensions.width),
            height: utils.pixify(dimensions.height)
        })

        // add border and dimensions to belowClickTag.
        utils.clone(sprites.belowClickTag.style, {
            width: utils.pixify(dimensions.width),
            height: utils.pixify(dimensions.height),
            border: BORDER,
        });

        sprites.image0        =  makeSprite(assets.image0);
        sprites.copy0         =  makeSplitSprite(assets.copy0);
        sprites.copy1         =  makeSplitSprite(assets.copy1);
        sprites.image1        =  makeSprite(assets.image1);
        sprites.resolveImage  =  makeSprite(assets.resolveImage);
        sprites.resolveCopy0  =  makeSplitSprite(assets.resolveCopy0);
        sprites.resolveCopy1  =  makeSprite(assets.resolveCopy1);
        sprites.ctaRolledOut  =  makeSprite(assets.ctaRolledOut);
        sprites.ctaRolledOver =  makeSprite(assets.ctaRolledOver);
        sprites.testContainer = utils.makeContainer(dimensions);
        sprites.cta = utils.containerize([sprites.ctaRolledOut,sprites.ctaRolledOver],assets.ctaRolledOut.bbox);
        sprites.ctaContainer.appendChild(sprites.cta);

        // REPLAY SETUP

        sprites.replayButton = utils.makeSizedSprite(assets.replayButton.uri, dimensions.width - 20, 5, 15, 15);

        sprites.replayButton.style.cursor = 'pointer';

        utils.appendChildrenTo(sprites.belowClickTag)(
                            sprites.image0, 
                            sprites.copy0, 
                            sprites.image1, 
                            sprites.copy1, 
                            sprites.resolveImage, 
                            sprites.resolveCopy0, 
                            sprites.resolveCopy1
                            );

        utils.appendChildrenTo(sprites.aboveClickTag)(
            sprites.replayButton
            );

        utils.hide(sprites.ctaRolledOver);

        sprites.cta.addEventListener('mouseout', doCtaRollout);
        sprites.cta.addEventListener('mouseover', doCtaRollover);
        sprites.replayButton.addEventListener('mouseover', doReplayRollover);
        sprites.replayButton.addEventListener('click', replay);
        utils.subscribe("loaded", animate);

    }

    //The first function in our sequence of animations

    function animate() {
        sprites.container.style.display = 'block';
        var twnDelay = 0; // running tally of the animation
        var tt = .75; // short for transition time
        var lastPlusSmall = "-=" + (tt * .9);
        tl.set(sprites.replayButton, {
                display: "none"
            })
            .from(sprites.image0, tt, {
                opacity: 0,
                ease: Expo.easeOut
            }, "seq01")
            .staggerFrom(sprites.copy0.childNodes, tt, {
                x: -dimensions.width,
                ease: Expo.easeOut,
            }, .1, "-=.65")


        .add("seq02", "+=2")

        .staggerTo(sprites.copy0.childNodes, tt, {
                x: dimensions.width,
                ease: Expo.easeIn
            }, .1, "seq02")
            .from(sprites.image1, tt, {
                opacity: 0,
                ease: Expo.easeOut
            })
            .set(sprites.image0, {
                opacity: 0
            })
            .staggerFrom(sprites.copy1.childNodes, tt, {
                x: -dimensions.width,
                ease: Expo.easeOut
            }, .1, "-=.5")

        .add("doResolve", "+=2")

        .staggerTo(sprites.copy1.childNodes, tt, {
                x: dimensions.width,
                ease: Expo.easeIn
            }, .1, "doResolve")
            .to(sprites.image1, tt, {
                opacity: 0,
                ease: Expo.easeOut
            })

        .from(sprites.resolveImage, tt, {
                x: dimensions.width,
                ease: Expo.easeOut
            }, lastPlusSmall)
            .set(sprites.replayButton, {
                display: "block"
            })
            .staggerFrom(sprites.resolveCopy0.childNodes, tt, {
                x: -dimensions.width,
                ease: Expo.easeOut,
            }, .1, lastPlusSmall)
            .from(sprites.resolveCopy1, tt, {
                opacity: 0
            })
            .staggerFrom([sprites.cta, sprites.replayButton], tt, {
                opacity: 0,
                ease: Expo.easeOut,
            }, .1, lastPlusSmall);

    }

    function doCtaRollover() {
        TweenLite.to(sprites.ctaRolledOver, .3, {
            opacity: 1
        })
    }

    function doCtaRollout() {
        TweenLite.to(sprites.ctaRolledOver, .3, {
            opacity: 0
        })
    }

    function doReplayRollover() {
        TweenLite.to(sprites.replayButton, .5, {
            rotation: -360,
            transformOrigin: "50% 54%",
            onComplete: resetReplay,
            ease: Linear.easeNone
        });
    }

    function resetReplay() {
        TweenLite.set(sprites.replayButton, {
            rotation: 0
        })
    }

    //Replay the ad
    function replay() {
        tl.restart();
    }

    return {
        start: function() {
            render();
        },
        replay: function(){
            replay();
        },
        pause: function(){
            tl.pause();
        },
        seek: function(t){
            tl.seek(t);
        },
        play: function(){
            tl.play();
        },
        registerUpdateObserver: function(observer){
            tl.observer = observer;
        },
        getDuration: function(){
            return tl.duration();
        }
    }

}
