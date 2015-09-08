function createBanner(utils,assets) {
	"use strict";

    // onetime setup 
    // create a variable to track banner time.
    var initialTime = new Date().getTime();
    // declare all necessary dom objects
    var container,
    	image0, 
    	image1, 
    	resolveImage,
    	copy0, 
    	copy1, 
    	resolveCopy0, 
    	resolveCopy1,
    	replayButton,
		cta,
    	ctaRolledOut,
    	ctaRolledOver,
        aboveClickTag, 
        ctaContainer, 
        belowClickTag;

    // extract dimension sizes from metatag in markup
    utils.dimensions = utils.extractSize(document.querySelectorAll("[name='ad.size']")[0].getAttributeNode("content").value);
    
    // retrieve main layers from markup
    container = document.querySelectorAll('.container')[0];
    aboveClickTag = document.querySelectorAll('.above-click-tag')[0]; // items that don't respond to clicktag
    ctaContainer = document.querySelectorAll('.cta-container')[0]; // cta itself (with rollover)
    belowClickTag = document.querySelectorAll('.below-click-tag')[0]; // anything below cta, which just responds to clicktag

    // render, below, is the private function that creates the banner.
    // it also runs when the banner is replayed.

    function render() {
      
      	container.style.width = utils.dimensions.width + "px";
      	container.style.height = utils.dimensions.height + "px";
        image0 = utils.generateSprite(assets.image0jpg); // note that because this image is base64 in the file, we reference it by variable
        image1 = utils.generateSprite('image1.jpg');
        resolveImage = utils.generateSprite('resolveImage.jpg');

        copy0 = utils.generateSprite('copy0-fs8.png');
        copy1 = utils.generateSprite('copy1-fs8.png');
        resolveCopy0 = utils.generateSprite('resolveCopy0-fs8.png');
        resolveCopy1 = utils.generateSprite('resolveCopy1-fs8.png');
        replayButton = utils.generateSizedSprite('replayButton.svg',utils.dimensions.width-20,5,15,15);
        // REPLAY SETUP

        
        utils.clone(replayButton.style,{
        	
        	cursor: 'pointer',
        })


        // CTA SETUP


        ctaRolledOut = utils.generateSizedSprite('ctaRolledOut-fs8.png',0,0,116,28);
        ctaRolledOver = utils.generateSizedSprite('ctaRolledOver-fs8.png',0,0,116,28); 

        cta = utils.generateContainer(); // create a sized container for the cta
        utils.clone(cta.style, {

            left: "15px",
            top: "173px",
            width: '116px',
            height: '28px'
        });
        cta.appendChild(ctaRolledOut);
        cta.appendChild(ctaRolledOver);
       
        
        ctaRolledOver.style.transition = ctaRolledOver.style.WebkitTransition = "opacity .3s";
        ctaContainer.appendChild(cta);

        // ----------------------------------------------------

        // Set up 

        utils.clone(belowClickTag.style, {
            width: utils.dimensions.width + 'px',
            height: utils.dimensions.height + 'px',
            overflow: "hidden",
            position: "absolute"
        });
        utils.appendChildrenTo(belowClickTag)(image0, copy0, image1, copy1, resolveImage,resolveCopy0,resolveCopy1);

        utils.hide(image1, copy1, aboveClickTag, cta, resolveImage, resolveCopy0, resolveCopy1, ctaRolledOver);

        addListeners();
        

    }


    //The first function in our sequence of animations

    function seq01() {

        var twnDelay = 0; // running tally of the animation
        var tt = .75; // short for transition time

        TweenLite.from(image0, tt, {
            opacity: 0,
            ease: Expo.easeOut 
        });
        TweenLite.from(copy0, tt, {
            x:-utils.dimensions.width,
            ease: Expo.easeOut,
            delay:twnDelay += .2
        });
       TweenLite.delayedCall(twnDelay + 2, seq02);

    }

    function seq02() {
        var twnDelay = 0;
        var tt = .75;
        
		utils.show(image1,copy1);

        TweenLite.to(copy0, tt, {
            x: utils.dimensions.width,
            ease: Expo.easeIn,
            delay:twnDelay
        });
        twnDelay += tt;         

		TweenLite.from(image1,tt,{
        	opacity:0,
        	ease:Expo.easeOut,
        	delay:twnDelay
        });
        TweenLite.from(copy1, tt, {
            x: -utils.dimensions.width,
            ease: Expo.easeOut,
            delay:twnDelay += .2
        });
         TweenLite.delayedCall(twnDelay + 2, doResolve);
    }


    function doResolve() {

        var twnDelay = 0;
        utils.appendChildrenTo(aboveClickTag)( replayButton);
        utils.show(resolveCopy0, resolveCopy1, resolveImage, cta, aboveClickTag);
        var tt = .75;
        TweenLite.to(copy1, tt, {
            x: utils.dimensions.width,
            ease: Expo.easeIn
        });

        twnDelay += tt;
        
		TweenLite.from(resolveImage, tt, {
            opacity: 0,
            delay: twnDelay += .1,
            ease: Expo.easeOut,
        });

        TweenLite.from(resolveCopy0, tt, {
            
            x: -utils.dimensions.width,
            delay: twnDelay += .1,
            ease: Expo.easeOut,
        });

        TweenLite.from(resolveCopy1, tt, {
            
            x: -utils.dimensions.width,
            delay: twnDelay += .1,
            ease: Expo.easeOut,
        });

        TweenLite.from(cta, tt, {
            opacity: 0,
            delay: twnDelay += .1,
            ease: Expo.easeOut,
        });
        TweenLite.from(replayButton, tt, {
            opacity: 0,
            delay: twnDelay += .1,
            ease: Expo.easeOut
        })

    }

    function doCtaRollover() {


        TweenLite.set(ctaRolledOver, {
            opacity: 1
        })
    }

    function doCtaRollout() {

        TweenLite.set(ctaRolledOver, {
            opacity: 0
        })
    }

    function doReplayRollover() {
        TweenLite.to(replayButton, .5, {
            rotation: -360,
            transformOrigin: "50% 54%",
            onComplete: resetReplay,
            ease:Linear.easeNone
        });
    }

    function resetReplay() {
        TweenLite.set(replayButton, {
            rotation: 0
        })
    }


    //Replay the ad
    function replay() {

        
        utils.removeAllChildren(aboveClickTag);
        utils.removeAllChildren(belowClickTag);
        utils.removeAllChildren(ctaContainer);
        removeListeners();
        
        render();
        seq01();

    }

    /*

        //This is where we add any rollovers or clicks    

    */

    function removeListeners() {
        cta.removeEventListener('mouseout', doCtaRollout);
        cta.removeEventListener('mouseover', doCtaRollover);
        replayButton.removeEventListener('mouseover', doReplayRollover);
        replayButton.removeEventListener('click', replay);
    }

    function addListeners() {
        cta.addEventListener('mouseout', doCtaRollout);
        cta.addEventListener('mouseover', doCtaRollover);
        replayButton.addEventListener('mouseover', doReplayRollover);
        replayButton.addEventListener('click', replay);
    }



    return {
        start: function() {
            render();
            seq01();
        }
    }



}
