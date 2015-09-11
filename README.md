# HTML5 Standard Banner

## Starting point for standard (IAB, Atlas, DCM) banners using Greensock as tween engine.

This template is designed to solve some recurring problems with banner development. While some of the decisions may seem counterintuitive, there's a reason for each. Here's a list of the problems we wanted to solve, and the solutions we've come up with.

#### Problem: Repetition between markup, css, and javascript. 

When developing in a more conventional style, we noticed that assets were being named and called three times. Once, specified in the markup with a class, once in the css with a style describing position, and then in the javascript whenever a move was made.

#### Solution: Javascript instantiates and appends most elements.

Rather than querying the dom for each page element, we just declare a variable for the element, create it, and append it to the container.

#### Problem: Individual sizes and positions for every element.

We found that in creating things conventionally, we were painstakingly declaring the width, height, left, and top of every graphical element. This meant quite a workload per resize as well.

#### Solution: Most elements sized to banner size.

There's extremely little overhead to a large area of transparency in a png, so we just size most elements as a png at the size of the stage (or 2x where retina is feasible).

#### Problem: Creative has Retina Macbooks

#### Solution: Where feasible, use 2x graphics.

#### Problem: files must be handed to 3rd parties, sometimes non-technical, and occasionally edited

#### Solution: Make sure output is human-readable

We're going to consider a fuller build process in the future, but the philosophy will remain that any developer can take the output and work directly with it, as many parties may be involved with the banners at different stages in the process (localization, external QA, traffickers). If we decide to adopt a build process, it will be strictly to automate process (base64 encoding images, pngquant, zipping, etc.) and not to minify or transpile. Minification is not great bang for the buck if gzip compression is present (see comparison of file sizes here: https://css-tricks.com/the-difference-between-minification-and-gzipping/)

#### Problem: Strict file number and type limits among traffickers

#### Solution: Base64 encode assets
Spritesheeting can be labor intensive or complex if changes have to be made, so we'll use base64 encoding for images beyond the allowable number. This is also a solution for disallowed file types.

#### Problem: Base 64 encoding, and pngquanting, and svg minifying, is tedious.

#### Solution: gulp task automatically takes any assets in assets/<size> folders, URI encodes, minifies as necessary, dumping the results into assets.js. 
