/* 
This gulpfile is not required to create banners, but serves as a utility.
It iterates through the assets folders for each size, and creates an 
assets.css file in the each src folders with the proper ID selectors, 
size, positioning, and background image for each asset.

Authors: Nick Russo, Nathan Wray, Michael Condouris
*/

// Include gulp (http://gulpjs.com/)
var gulp = require('gulp');
// Filesystem node core module for reading a writing files (https://nodejs.org/docs/latest/api/fs.html)
var fs = require('fs');
// Path node core module (https://nodejs.org/docs/latest/api/path.html)
var path = require('path');
// Gulp-file module for creating vinyl files with gulp
var gfile = require('gulp-file');
// Define assests and source paths
var assetsPath = '../assets';
var sourcePath = '../src';
// Through module for processing files passing through streams
var through = require('through2');
// Concat for concatenating files in gulp
var concat = require('gulp-concat');
// Streamqueue for piping streams in a preserved order
var streamqueue = require('streamqueue');
// Svgmin for minification of svgs in stream
var svgmin = require('gulp-svgmin');
// Pngjs for processing pngs
var PNG = require('pngjs').PNG;
// Small module for extracting sizes of jpgs.
var sizeOf = require('image-size');
// Get command line arguments
var argv = require('yargs').argv;
// Conditional gulp processing
var gulpif = require('gulp-if');
// Run gulp process automatically on folder changes
var watch = require('gulp-watch');
// zip
var zip = require('gulp-zip');
//delete dependency
var del = require('del');
//for pushing changed files through stream
var changed = require('gulp-changed');
//for batching with gulp-watch
var batch = require('gulp-batch');
//png minification dependency
var pngmin = require('gulp-pngmin');
//colored output
var colors = require('colors')

// Iterate through each folder within assets
var fileTypes = {
    jpg: 'jpeg',
    png: 'png',
    gif: 'gif',
    svg: 'svg+xml'
}

//Get and return folders in directories
function getFolders(dir) {
    return fs.readdirSync(dir)
        .filter(function(file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
}

//add an intersect method to the array class
Array.prototype.intersect = function(arr){
 return this.filter(function(a){return ~this.indexOf(a);},arr);
}

//add a diff method to the array class
Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

//filters an array to remove duplicates
function uniq(a) {
    var prims = {"boolean":{}, "number":{}, "string":{}}, objs = [];

    return a.filter(function(item) {
        var type = typeof item;
        if(type in prims)
            return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
        else
            return objs.indexOf(item) >= 0 ? false : objs.push(item);
    });
}

//changed task that creates a cache for your files, compares the 
//cache to the current main.css file, and generates changed selectors
gulp.task('default', function() {

    sourceFolders = getFolders(assetsPath);

    sourceFolders.map(function(folder) {
        var imgCache = path.join(assetsPath,folder,'/.cache');
        
        var stream = streamqueue({
                    objectMode: true
                },
                gfile('header', '\n', {
                    src: true
                }),
                gulp.src(path.join(assetsPath, folder, '/*.png'))
                /**/
                .pipe(gulpTrimPng())
                .pipe(changed(imgCache + '/img',{hasChanged:changed.compareSha1Digest}))
                .pipe(gulp.dest(imgCache + '/img'))
                .pipe(pngmin([256]))
                .pipe(gulp.dest(path.join(sourcePath, folder + '/img')))
                .pipe(gulpImg())
                .pipe(concat('assetList')),
                gulp.src(path.join(assetsPath, folder, '/*.{gif,jpg}'))
                .pipe(gulp.dest(path.join(sourcePath, folder + '/img')))
                .pipe(changed(imgCache + '/img',{hasChanged:changed.compareSha1Digest}))
                .pipe(gulp.dest(imgCache + '/img'))
                .pipe(gulpImg())
                .pipe(concat('assetList')),
                gulp.src(path.join(assetsPath, folder, '/*.svg'))
                .pipe(changed(imgCache + '/img',{hasChanged:changed.compareSha1Digest}))
                .pipe(svgmin())
                .pipe(gulp.dest(path.join(sourcePath, folder + '/img')))
                .pipe(gulp.dest(imgCache + '/img')) 
                .pipe(gulpImg())
                .pipe(concat('assetList'))
                //gfile('footer', '}', {
                //    src: true
               //})
            )
            .pipe(concat('main_cache.css')).pipe(gulp.dest(path.join(assetsPath, folder + '/.cache/css/')));
            
            stream.on('end',function(){
               pushNew(path.join(assetsPath,folder),path.join(sourcePath,folder));
            });
    })
});

//watch for changes in any files and continuously 
//run the changed task if any are found
gulp.task('watch',function(){
   gulp.start('default')
   gulp.watch(['../assets/*/*'],batch(function(events, cb) {
      var run = function(){
         gulp.start('default');
      }
      events.on('end',run());
   }));
})

// var combinedFile = [];

// //buld file for comparison
// function BuildFile(file){
//      //encode file
//      var encFile = file.toString('utf8');
//      //push to array for comparison
//      combinedFile.push(encFile);
// }

//builds a combined file of the main.css and main_cache.css files 
//and returns a promise containing it
function buildFile(srcFile,cacheFile){
    return new Promise(function(res,rej,err){
        var encSrc = srcFile.toString('utf8');
        var encCache = cacheFile.toString('utf8');
        var combinedFile = [];
        combinedFile.push(encSrc);
        combinedFile.push(encCache);
        res(combinedFile);
    })
}

function diff(a, b) {
  var seen = [], diff = [];
  for ( var i = 0; i < b.length; i++)
      seen[b[i]] = true;
  for ( var i = 0; i < a.length; i++)
      if (!seen[a[i]])
          diff.push(a[i]);
  return diff;
}

function Compare(cFile,assetsDir,srcDir){
    return new Promise((res,rej,err) => {
        var re = /\}/
        // console.log(cFile);
        var src= cFile[0];
        var cache = cFile[1];
        var newSelectors = [];
        var oldSelectors = [];

        if (cache.length > 1){
            src = cFile[0].split(re);
            cache = cFile[1].split(re);

            cache.forEach((cacheSel,cacheIndex) =>{
                src.forEach((srcSel,srcIndex) =>{
                    //if the last character of the src sel is a closed bracket and the length is greater
                    //than five (something exists there)
                   if (src[srcIndex].slice(-1) != '}' && src[srcIndex].length > 5){
                       src[srcIndex] = src[srcIndex] + '}'
                   }
                   //if the cache 
                   if (cache[cacheIndex].slice(-1) != '}'){
                   	   cache[cacheIndex] = cache[cacheIndex] + '}'
                   }
                   //regex for class and id names
                   var re = /[#.][\w,-]+/;
                   var srcSelID, cacheSelID;
                   
                   //if there are selectors in the src doc
                   if (re.exec(srcSel) != null){
                        //find em with a regexp
                        srcSelID = re.exec(srcSel)[0];
                   }
                   //if there are selectors in the cache doc
                   if (re.exec(cacheSel) != null){
                        //find em with a regexp
                        cacheSelID = re.exec(cacheSel)[0];
                   }
                   //if src selector is equal to cache selector (there is an existing id already)
                   if ((srcSelID == cacheSelID) && srcSelID != undefined && srcSelID != null){
                        //assign the contents of the generated cache to that id
                        console.log("Changed CSS properties of: ".green.bold + /([^/]*)$/.exec(srcDir)[0].white + ' -- '.white + srcSelID.white)
                        src[srcIndex] = cache[cacheIndex];
                        oldSelectors.push(srcSelID);
                   }
                    // console.log(srcSelID,cacheSelID)
                   //if the src selector is not equal to the cache selector (there is no existing id in the current css) 
                   if ((srcSelID != cacheSelID) && (cacheSelID !== undefined) && (srcSelID !== undefined)){
                       newSelectors.push(cacheSelID);
                       //push the newly generated selector to the src selector array to be written to css
                       src.push(cache[cacheIndex]);
                   }  
                })
            })
            //remove redundant selectors using uniq array filter
            src = uniq(src);
            newSelectors = uniq(newSelectors);
            oldSelectors = uniq(oldSelectors);
            // console.log('newselsarray: ' + newSelectors)
            newSelectors = diff(newSelectors,oldSelectors);

            if (newSelectors.length > 0){
                console.log('New CSS selectors detected for: '.cyan.bold + /([^/]*)$/.exec(srcDir)[0].white + ' -- '.white + newSelectors.join(' ').white)
                res({'updatedFile':src.join(''),'newSelectors':newSelectors});
            } else {
                // src = src.replace(',','}')
                res({'updatedFile':src.join(''),'newSelectors':null}); 
            }
         } else{
            res({'updatedFile':src,'newSelectors':null})
         }
    })

}

//deletes removed files from assets from the cache img folder
function delCache(assetsDir,srcDir){     
    //read file directories to compare cache to current dir
    var assetsDirFiles = fs.readdirSync(assetsDir + '/.cache/img');
    var srcDirFiles = fs.readdirSync(assetsDir)
    
    //build a list of files to dump from the cache based on the differences
    //between the cache and the assets directories
    var cacheDump = assetsDirFiles.diff(srcDirFiles)
    var assetsDump = [];
    
    //iterate through cacheDump and delete extra files
    for (var i=0;i<cacheDump.length;i++){
       var regex =/(?!.*\/).+/
       var fname = regex.exec(assetsDir)
       console.log("DELETED ".bgRed.white.bold + fname.toString().bgRed.white.bold + ' : '.white + cacheDump[i].white)
       var assetPath = srcDir + '/img/' + cacheDump[i];
       cacheDump[i] = assetsDir + '/.cache/img/' + cacheDump[i];
       assetsDump.push(assetPath);
    }
    cacheDump = assetsDump.concat(cacheDump)
    
    del.sync(cacheDump,{force:true});
}

function addToDOM(assetsDir,srcDir,newSelectors){
    fs.readFile(srcDir + '/index.html',{encoding:'utf8'},function(err,data){
        if (err){
            console.log(err);
        } else if(newSelectors !== null){
            var DOMarray =[]
            // if(data.indexOf(/(<a href="javascript:void(window.open(window.clickTag))">)/)){
            //     // console.log('dcm clicktag detected')
            //     DOMarray = data.split(/(<a href=\"javascript:void\(window.open\(window.clickTag\)\)\">)/);
            // } else{
            //     DOMarray = data.split(/(<div id="container">)/);
            // }

            DOMarray = data.split(/(<!-- \*\*AUTO DIV START\*\* -->)/);
                     
            newSelectors.forEach(function(sel){
                // console.log(sel.replace('#',''))
                // console.log(data.indexOf(sel.replace('#','')))
                var sel = "id=\"" + sel.replace('#','') + '\"';
                if(data.indexOf(sel) == -1){
                    DOMarray.splice(2,0,'\n\t\t\t' + '<div ' + sel + ' class=\"sprite\"></div>');
                } else {
                   
                }
            })
            // console.log(newSelectors)
            // if(data.indexOf())
            fs.writeFile(srcDir + '/index.html',DOMarray.join(''));

        } else if(newSelectors == null){
            // console.log('No new divs were added to the DOM for' + srcDir)
        }
    })
}
       
function pushNew(assetsDir,srcDir){
    ////////
    //read css files syncronously

    var srcFile = fs.readFileSync(srcDir + '/css/main.css',{encoding:'utf8'});
    var cacheFile = fs.readFileSync(assetsDir+ '/.cache/css/main_cache.css',{encoding:'utf8'});
    
    buildFile(srcFile,cacheFile)
        .then((combinedFile) =>{
            return Compare(combinedFile,assetsDir,srcDir)
        })
        .then((resolveObj) =>{
            addToDOM(assetsDir,srcDir,resolveObj.newSelectors)
            fs.writeFile(srcDir + '/css/main.css',resolveObj.updatedFile);
            // console.log('Changed CSS for: ' )
        })
        .catch(function(err){
            console.log(err.red.bold);
    });

    delCache(assetsDir,srcDir);

}

function gulpImg() {
    // Creating a stream through which each file will pass
    return through.obj(function(file, enc, cb) {
        if (file.isNull()) {
            // return empty file
            return cb(null, file);
        }
        if (file.isBuffer()) {
            
            var parsed = path.parse(file.history[0]);
            var regex =/(?!.*\/).+/
            var fname = regex.exec(parsed.dir)[0];
            var cleanExt = parsed.ext.substr(1).toLowerCase();
            var imgdata = sizeOf(parsed.dir + '/' + parsed.base);
            //if the file bounding box does not exist it will default to
            //
            file.bbox = file.bbox || {x:0, y:0, width:imgdata.width, height:imgdata.height};
            
            file.bbox.multiplier = 1;
        	
            var isSvg = cleanExt === 'svg';
            var encoding = isSvg ? 'utf8' : 'base64';
            var stringifiedFile = isSvg ? encodeURIComponent(file.contents.toString(encoding)) : file.contents.toString(encoding);
            var encodingString = encoding === 'utf8' ? 'charset=utf-8' : 'base64'
            //var prefix = 'data:image/' + fileTypes[cleanExt] + ';' + encodingString + ',';
            //if (parsed.ext )
            var lineString;
            if (parsed.ext === '.png'){
                if (parsed.name.endsWith("_2x")){
                    lineString = '#' + parsed.name + ' {\n' +
                                '\tleft:' + Math.floor(file.bbox.x/2) + 'px;\n' +
                                '\ttop:' + Math.floor(file.bbox.y/2) + 'px;\n' +
                                '\twidth:' + Math.floor(file.bbox.width/2) + 'px;\n' +
                                '\theight:' + Math.floor(file.bbox.height/2) + 'px;\n' +
                                '\tbackground-image:url(../img/' + parsed.name + parsed.ext + ');\n' +
                                '\tbackground-size:100%;\n' +
                                '}\n';

                }else{
                    lineString = '#' + parsed.name + ' {\n' +
                                '\tleft:' + file.bbox.x + 'px;\n' +
                                '\ttop:' + file.bbox.y + 'px;\n' +
                                '\twidth:' + file.bbox.width + 'px;\n' +
                                '\theight:' + file.bbox.height + 'px;\n' +
                                '\tbackground-image:url(../img/' + parsed.name + parsed.ext + ');\n' +
                                '}\n';
                }   
            } else {
                 if (parsed.name.endsWith("_2x")){
                    lineString = '#' + parsed.name + ' {\n' +
                                '\tleft:' + 0 + 'px;\n' +
                                '\ttop:' + 0 + 'px;\n' +
                                '\twidth:' + Math.floor(imgdata.width/2) + 'px;\n' +
                                '\theight:' + Math.floor(imgdata.height/2) + 'px;\n' + 
                                '\tbackground-image:url(../img/' + parsed.name + parsed.ext + ');\n' +
                                '\tbackground-size:100%;\n' +
                                '}\n';

                 }else{
                    lineString = '#' + parsed.name + ' {\n' +
                                '\tleft:' + 0 + 'px;\n' +
                                '\ttop:' + 0 + 'px;\n' +
                                '\twidth:' + imgdata.width + 'px;\n' +
                                '\theight:' + imgdata.height + 'px;\n' + 
                                '\tbackground-image:url(../img/' + parsed.name + parsed.ext + ');\n' +
                                '}\n';
                            }
            }
            var lineBuffer = new Buffer(lineString, 'ascii');
            file.contents = lineBuffer;
        }
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
        }
        this.push(file);
        cb();
    });
}

//this function parses pngs to read pixel data, trimming 
//off excess alpha information and returning a new png
function gulpTrimPng() {
    return through.obj(function(file, enc, cb) {
    	var scope = this;
        if (file.isNull()) {
            // return empty file
            return cb(null, file);
        }
        if (file.isBuffer()) {
            var png = new PNG();
            png.parse(file.contents, function(err, data) {
                if(err){
                    // console.log(JSON.stringify(file));
                    var stringified = JSON.stringify(file);
                    var jsonobj = JSON.parse(stringified);
                    console.log("ERROR OCCURRED AT IMAGE:".bgRed.white.bold + " " + jsonobj.history[0])
                }
                var stream = through();
                var w = data.width;
                var h = data.height;
                var lowestX = w;
                var lowestY = h;
                var highestX = 0;
                var highestY = 0;
                for (var y = 0; y < h; y++) {
                    for (var x = 0; x < w; x++) {
                        var pixelnum = (y * w * 4) + (x * 4);
                        var alpha = data.data[pixelnum + 3];
                        if (alpha !== 0) {
                            lowestX = Math.min(x, lowestX);
                            lowestY = Math.min(y, lowestY);
                            highestX = Math.max(x, highestX);
                            highestY = Math.max(y, highestY);
                        }
                    }
                }
                var bbox = {
                    x: lowestX,
                    y: lowestY,
                    width: Math.min((highestX - lowestX) + 2,data.width-lowestX),
                    height: Math.min((highestY - lowestY) + 2,data.height-lowestY)
                };
                destPng = new PNG({
                    width: bbox.width,
                    height: bbox.height
                });
                png.bitblt(destPng, bbox.x, bbox.y, bbox.width, bbox.height, 0, 0);
                var readable = destPng.pack();
                var buffer = new Buffer([]);
                readable.on('data', function(chunk) {
                	//console.log(typeof(chunk))
                    buffer = Buffer.concat([buffer,new Buffer(chunk)])
                });
                readable.on('end', function() {
                    file.contents = buffer;
                    file.bbox = bbox;
                    scope.push(file);
                    cb();
                });
            })
        }
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
        }
    });
}

/* EXTRA GULP UTILITY TASKS */

//RUN A CLEAN SWEEP AND GENERATE A NEW VERSION OF YOUR CSS FILE
gulp.task('clean', function() {

    sourceFolders = getFolders(assetsPath);

    sourceFolders.map(function(folder) {
        var imgCache = path.join(sourcePath,folder,'/cache');
        
        var stream = streamqueue({
                    objectMode: true
                },
                gfile('header', 'body { margin:0px 0px; padding:0px; } \n\n* { box-sizing: Border-box } \n\n#container{\n\tbackground-color:white;\n\tposition:absolute;\n\toverflow:hidden;\n\tborder:1px solid black;\n}\n\n.sprite{\n\tposition:absolute;\n\tbackground-repeat:no-repeat;\n}\n'
                , {
                    src: true
                }),
                gulp.src(path.join(assetsPath, folder, '/*.png'))
                .pipe(gulpTrimPng())
                .pipe(imageminPngquant({
                    quality: '100',
                    speed: 4
                })())
                .pipe(gulp.dest(path.join(sourcePath, folder + '/img')))
                .pipe(gulpImg())
                .pipe(concat('assetList')),
                gulp.src(path.join(assetsPath, folder, '/*.{gif,jpg}'))
                .pipe(gulp.dest(path.join(sourcePath, folder + '/img')))
                .pipe(gulpImg())
                .pipe(concat('assetList')),
                gulp.src(path.join(assetsPath, folder, '/*.svg'))
                .pipe(svgmin())
                .pipe(gulp.dest(path.join(sourcePath, folder + '/img')))
                .pipe(gulpImg())              
                .pipe(concat('assetList'))
            )
            .pipe(concat('/css/main.css')).pipe(gulp.dest(path.join(sourcePath, folder)));

    })
});

//CREATE A DELIVERY READY VERSION OF YOUR BANNER
gulp.task('zip', function () {
     sourceFolders = getFolders(assetsPath);
     var projname = argv.proj || "";
     
     sourceFolders.map(function(folder) {
      gulp.src(path.join(sourcePath,folder,'/**'))
        .pipe(zip(projname + '_' + folder + '.zip'))
        .pipe(gulp.dest(sourcePath));
     })
   
});