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

There's extremely little overhead to a large area of transparency in a png, so we just size most elements as a png.

#### Problem: Creative has retina macbooks

#### Solution: Where feasible, use 2x graphics.
