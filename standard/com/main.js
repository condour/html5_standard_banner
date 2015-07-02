//Set these to the banner dimentions
var BANNER_WIDTH=300;
var BANNER_HEIGHT=250;

//This gets called when the ad is finished loading
function mainInit(){
	addListeners();

	setInitialStates();

	seq01();
}

//The first function in our sequence of animations
function seq01(){
	console.log("seq01");

	var twnDelay=3;

	TweenLite.to($(".mainImage"), 1, {alpha:0, delay:twnDelay});

	twnDelay+=1;
	TweenLite.delayedCall(twnDelay, seq02);
}

function seq02(){
	console.log("seq02");

	var twnDelay=0;

	TweenLite.from($(".copy1"), .5, {alpha:0});
	$(".copy1").show();

	twnDelay+=1;
	TweenLite.from($(".copy2"), .5, {alpha:0, delay:twnDelay});
	$(".copy2").show();
	
	twnDelay+=1;
	TweenLite.from($(".CTA"), .4, {scale:0, ease:Back.easeOut, delay:twnDelay});
	$(".CTA").show();

	twnDelay+=.4;
	TweenLite.from($(".replayBtn"), .4, {scale:0, ease:Back.easeOut, delay:twnDelay});
	$(".replayBtn").show();
}

//Set the initial states of all divs here
function setInitialStates(){
	hideAll([".copy1", ".copy2", ".CTA", ".replayBtn"]);
}

//A simple helper function to do display:none to multiple items
function hideAll(whichOnes){
	for (q=0;q<whichOnes.length;q++){
		$(whichOnes[q]).hide();
	}
}

//This funciton should be called when someone clicks on the unit or any CTA
function clickThrough(){
	console.log("clickThrough");
}

//Replay the ad
function replay(){
	TweenLite.killTweensOf($(".container").find('*'));

	resetAll();

	setInitialStates();
	
	seq01();
}

//This resets everything in the container div to its original state as mandated by the css file
function resetAll(){
	TweenLite.set($(".container").find('*'), {clearProps:"all"});
}

//This is where we add any rollovers or clicks
function addListeners(){
	//ClickScreen
	$(".clickScreen").click(function(){
		clickThrough();
	});

	//CTA
	$(".CTA").click(function(){
		clickThrough();
	});

	$(".CTA").hover(
		function(){
			TweenLite.to($(".CTABG"), .3, {scale:1.1, ease:Quad.easeInOut });
		}, function(){
			TweenLite.to($(".CTABG"), .3, {scale:1, ease:Quad.easeInOut });
		}
	);

	//replay button
	$(".replayBtn").click(function(){
		replay();
	});

	$(".replayBtn").hover(
		function(){
			TweenLite.to($(".replayBtn"), 0.5, {rotation:-360, overwrite:true});
		}, function(){
			TweenLite.set($(".replayBtn"), {rotation:0, overwrite:true});
		}
	);
}