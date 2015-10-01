# HTML5 Standard Banner

## Starting point for standard (IAB, Atlas, DCM) banners using Greensock as tween engine, Gulp to process assets.

This template is designed to solve some recurring problems with banner development. Here's a few features:

1. Eliminates nearly all pixel positioning of assets by using png transparency.
2. Eliminates duplicative addressing of assets, dom elements and classes.
3. Automatically optimizes, trims, and URI encodes images.
4. Allows for nearly no changes to basic timeline animations from size to size.
5. Allows for 1x and 2x assets for retina / non-retina screens.

Here's the basics on how to use:

1. Make sure you have gulp and npm installed. Run npm install to make sure you have all dependencies. 
2. Duplicate any assets that aren't full bleed into pngs the size of the banner stage. Don't bother cutting line-by-line for stacks of copy.
3. For most assets, double the size for retina. If the asset is problematic for retina (some thin text, or a low-res original) leave 1x.
4. Name each file according to how you want to address it in your javascript. For any 1x assets, append '_1x' to the name.
5. All assets should be placed in the assets/<size> folder.
6. Run gulp. src/<size>/assets.js file will be updated with URI encoded contents of assets folder.
7. Instantiate assets using several utility functions designed to quickly generate sprites.
8. Animate using TimelineLite.

File Structure:

	+ assets
		- <size>
		|	<all image files to be processed by gulp>

	+ src
		- <size>
		|	index.html (should only contain:
		|				 basic markup describing containers, 
		|				 an onload function, 
		|				 the clicktag implementation,
		|				 metatag declaring banner size)
		|	main.js (your code here)
		|	utils.js (functions for generating sprites, helpers, &c.)
		|	assets.js (gulp generated file with an object for each encoded asset) 

	gulpfile.js (asset processing)
	package.json (npm dependencies)
	.gitignore (for anything you'd like to ignore, possibly including assets.js)
