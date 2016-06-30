# HTML5 Standard Banner

## A template for standard (IAB, Atlas, DCM) banners using Greensock as tween engine.
## Includes a basic template and optional utilities for processing assets using Gulp.

###USING THE TEMPLATE:

	⁃ The entire delieverable banner is contained inside of the 'src' folder, utilities are not required.
	⁃ There are three subdirectories in src, one for the js (com), one for the css, and another for the images (img).
	⁃ The only library this template pulls from is the Greensock tween engine, everything else is native js.
	⁃ The base template uses Greensock's TimelineLite, but CSSPlugin, EasePack, and TweenLite are also supported.

DOM:
	•	The head contains your script calls, a template title tag, and a stylesheet link, the clicktag variable definition (default is DCM), as well as an important meta tag that determines the sie of the ad.
	•   The body of the DOM consists of a container div that will be sized in JS according to the meta.adsize information provided above it, and an important **AUTO DIV START** comment that will determine where divs will be inserted by the gulp process.
	•	At the bottom, after the closing body tag, main.js is referenced and another script tag is opened to set the clicktag and call init() on window.onload

Sprites:
	•	All assets are given the 'sprite' class by default, which absolutely positions them and gives them a background repeat of none.
	•	To make a sprite manually, just add a div to the DOM tree and give it the sprite class and an ID, then style it with CSS.
	•	All sprites become global variables in main.js based on their ID name for easy use with Greensock tween engine.
	
CSS:
	•	There is a single main.css file in the template with all styling information contained in it.

JS:
	•	A single main.js file is contained in the com subfolder.
	•	At the top are two utility functions:
	⁃	An immediately invoked function expression that gets the dimensions from the meta tag in the DOM, returns them as an object and sets it to a dimensions variable.
	⁃	An IDsToVars function, which sets all ID selectors in the DOM to global variables.
	⁃	The init function is called on window.onload in the DOM, it sets the dimensions to the container div, sets the timeline, adds listeners if needed, and starts the animate function which runs the timeline.
	⁃	The animate function contains the timeline animations for the whole banner.
	⁃	The clickThrough function opens a new window with the assigned clicktag variable.

###USING THE UTILITIES:

This template also includes a number of utilities that are not necessary for development, but greatly improve workflow.
Here is a quick start guide on how to use them:

	1.	Install Node.js (https://nodejs.org/en/).

	2.	Install Gulp globally (http://gulpjs.com/) run this command in terminal: sudo npm install --global gulp .

	3.	Name each asset image according to how you want to address it in your javascript and css, they will become global variables assigned by ID selector.

	4.	Open terminal and navigate to the 'utils/' directory in a terminal window. (the command 'cd' is change directory)
		⁃	If node_modules is not present in the folder, type 'npm install' and hit return to automatically fetch the dependencies, the process will not run without them.

	5.	In your terminal window, which should still be in the 'utils/' directory, run the following command: 'gulp' and hit enter
		⁃	If you want, you can set up gulp to automatically poll your files for changes and run the command upon a change by running 'gulp watch'

	6.	Begin saving out your images from your psd file into the ASSETS directory, in the subfolder of your chosen size.

	7.	Keep an eye on your terminal, which will echo the names of the images you are saving out and run the gulp process over each new image. This process will populate your main.css file with style information for each asset as they appear in the psd, automatically add properly formatted divs to the DOM for assets that do not have a div yet, and populate the src/img subdirectory with trimmed and optimized images for you to deliver in the banner.

	8.	Blaze through banner dev faster than ever.


###GULP TASKS AND DESCRIPTIONS:

	•	gulp watch :
		⁃	Runs the gulp default task and polls for changes, running the task continually when changes are seen.

	•	gulp :
		⁃	Runs the gulp default task once and exits the process

	•   The gulp 'default' task :
		-   Gulp is a streaming front end build system for nodejs. Files are treated as streams of binary or encoded data and operated on. The process used here pushes .jpg and .png files through a stream, parses them to get their pixel data, and determines the proper positioning of these assets to be written to css based on their transparent areas. It then runs a png compressor over the images, and writes them to their corresponding folders in trimmed, compressed form. Images are also stored in a hidden .cache folder and compared against each other in subesquent runs before being pushed through the stream and operated on for the sake of efficiency.

File Structure:

	+ assets
		- <size>
		|	<all image files to be processed by gulp>

	+ src
		- <size>
		|	index.html (markup here, used like any other src file)
			- <com>
			|	main.js (your code here)
			- <css>
			|	main.css (gulp generated file with ID selectors for each asset)
			|   * You can edit this file as much as you need, it will not be
			    overwritten when 'gulp changed' is run. *
			- <img>
			|   trimmed and optimized files are placed in this folder and referenced
			|   by the main.css file. They will be overwritten by the gulp process.
	+ utils
		| gulpfile.js (code for the build process)
		| LICENSE
			- <node_modules>
			|	dependencies here, navigate to the 'utils' directory and 
			|   run 'npm install' to automatically install dependencies if this folder is missing
		| package.json (json file containing npm dependency data)
		| README.md (this file)
