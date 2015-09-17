function createBanner(u, a) { // u is utils, a is assets
    "use strict";
    // onetime setup 
    // create a variable to track banner time.
    var initialTime = new Date().getTime();
    var tl = new TimelineLite();
    var s = {};

    // render, below, is the private function that creates the banner.

    function render() {
        // extract dimension sizes from metatag in markup
        u.dimensions = u.extractSize(document.querySelectorAll("[name='ad.size']")[0].getAttributeNode("content").value);
        a = u.eliminateRedundantAssetsBasedOnDPI(a);
        // retrieve main layers from markup
        s.container = document.querySelectorAll('.container')[0];
        s.aboveClickTag = document.querySelectorAll('.above-click-tag')[0]; // items that don't respond to clicktag
        s.ctaContainer = document.querySelectorAll('.cta-container')[0]; // cta itself (with rollover)
        s.belowClickTag = document.querySelectorAll('.below-click-tag')[0]; // anything below cta, which just responds to clicktag

        // add border and dimensions to belowClickTag.
        u.clone(s.belowClickTag.style, {
            position: 'absolute',
            width: u.dimensions.width + 'px',
            height: u.dimensions.height + 'px',
            border: '1px solid #ccc'
        });
        TweenLite.set(s.container, {
            width: u.dimensions.width,
            height: u.dimensions.height
        })


        s.cta = u.generateContainer(); // create a sized container for the cta
        
        u.clone(s.cta.style, {
            left: a.ctaRolledOver.bbox.x * a.ctaRolledOver.bbox.multiplier + 'px',
            top: a.ctaRolledOver.bbox.y * a.ctaRolledOver.bbox.multiplier + 'px',
            width: a.ctaRolledOver.bbox.width * a.ctaRolledOver.bbox.multiplier + 'px',
            height: a.ctaRolledOver.bbox.height * a.ctaRolledOver.bbox.multiplier + 'px',
        });
        u.clone(a.ctaRolledOver.bbox,{x:0,y:0})
        u.clone(a.ctaRolledOut.bbox,{x:0,y:0})

        for (var asset in a) {
            if (a.hasOwnProperty(asset)) {
                var spriteName = asset;
                if (a[asset].type == 'png') { // check all pngs for transparency
                    s[spriteName] = u.generateSplitSprite(a[asset]);
                } else {
                    s[spriteName] = u.generateSprite(a[asset]);
                }
            }
        }
        
        s.cta.appendChild(s.ctaRolledOut);
        s.cta.appendChild(s.ctaRolledOver);
        

        s.replayButton = u.generateSizedSprite(a.replayButton.uri, u.dimensions.width - 20, 5, 15, 15);
        // REPLAY SETUP
        u.clone(s.replayButton.style, {
            cursor: 'pointer',
        })

        
        s.ctaRolledOver.style.transition = s.ctaRolledOver.style.WebkitTransition = "opacity .3s";
        s.ctaContainer.appendChild(s.cta);

        // ----------------------------------------------------

        u.clone(s.belowClickTag.style, {
            width: u.dimensions.width + 'px',
            height: u.dimensions.height + 'px',
            overflow: "hidden",
            position: "absolute"
        });


        u.appendChildrenTo(s.belowClickTag)(s.image0, s.copy0, s.image1, s.copy1, s.resolveImage, s.resolveCopy0, s.resolveCopy1);
        u.appendChildrenTo(s.aboveClickTag)(s.replayButton);
        u.hide(s.ctaRolledOver);
        addListeners();
        u.subscribe("loaded", animate);

    }

    //The first function in our sequence of animations

    function animate() {
        s.container.style.display = 'block';
        var twnDelay = 0; // running tally of the animation
        var tt = .75; // short for transition time
        var lastPlusSmall = "-=" + (tt * .9);
        tl.set(s.replayButton, {
                display: "none"
            })
            .from(s.image0, tt, {
                opacity: 0,
                ease: Expo.easeOut
            }, "seq01")
            .staggerFrom(s.copy0.childNodes, tt, {
                x: -u.dimensions.width,
                ease: Expo.easeOut,
            }, .1, "-=.65")


        .add("seq02", "+=2")

        .staggerTo(s.copy0.childNodes, tt, {
                x: u.dimensions.width,
                ease: Expo.easeIn
            }, .1, "seq02")
            .from(s.image1, tt, {
                opacity: 0,
                ease: Expo.easeOut
            })
            .set(s.image0, {
                opacity: 0
            })
            .staggerFrom(s.copy1.childNodes, tt, {
                x: -u.dimensions.width,
                ease: Expo.easeOut
            }, .1, "-=.5")

        .add("doResolve", "+=2")

        .staggerTo(s.copy1.childNodes, tt, {
                x: u.dimensions.width,
                ease: Expo.easeIn
            }, .1, "doResolve")
            .to(s.image1, tt, {
                opacity: 0,
                ease: Expo.easeOut
            })

        .from(s.resolveImage, tt, {
                x: u.dimensions.width,
                ease: Expo.easeOut
            }, lastPlusSmall)
            .set(s.replayButton, {
                display: "block"
            })
            .staggerFrom(s.resolveCopy0.childNodes, tt, {
                x: -u.dimensions.width,
                ease: Expo.easeOut,
            }, .1, lastPlusSmall)
            .from(s.resolveCopy1, tt, {
                opacity: 0
            })
            .staggerFrom([s.cta, s.replayButton], tt, {
                opacity: 0,
                ease: Expo.easeOut,
            }, .1, lastPlusSmall);

    }

    function doCtaRollover() {
        TweenLite.set(s.ctaRolledOver, {
            opacity: 1
        })
    }

    function doCtaRollout() {
        TweenLite.set(s.ctaRolledOver, {
            opacity: 0
        })
    }

    function doReplayRollover() {
        TweenLite.to(s.replayButton, .5, {
            rotation: -360,
            transformOrigin: "50% 54%",
            onComplete: resetReplay,
            ease: Linear.easeNone
        });
    }

    function resetReplay() {
        TweenLite.set(s.replayButton, {
            rotation: 0
        })
    }
    //Replay the ad
    function replay() {
        tl.restart();
    }
    /*
        //This is where we add any rollovers or clicks    
    */
    function addListeners() {
        s.cta.addEventListener('mouseout', doCtaRollout);
        s.cta.addEventListener('mouseover', doCtaRollover);
        s.replayButton.addEventListener('mouseover', doReplayRollover);
        s.replayButton.addEventListener('click', replay);
    }
    return {
        start: function() {
            render();
        }
    }

}
