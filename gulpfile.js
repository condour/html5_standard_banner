// This gulpfile is not required to create banners. 
// Rather, it iterates through the assets folders for each size, 
// and creates an assets.js file in the src folders for each size

// Include gulp
var gulp = require('gulp');
var fs = require('fs');
var path = require('path');
var merge = require('merge-stream');
var gfile = require('gulp-file');
var es = require('event-stream')
var imageminPngquant = require('imagemin-pngquant');
var assetsPath = 'assets';
var sourcePath = 'src';
var through = require('through2');
var concat = require('gulp-concat');
var gutil = require('gutil');
var streamqueue = require('streamqueue');
var svgmin = require('gulp-svgmin');
var PNG = require('pngjs').PNG;

var newer = require('gulp-newer');
var replace = require('gulp-replace');
var argv = require('yargs').argv;
var gulpif = require('gulp-if');

// iterate through each folder within assets
var fileTypes = {
    jpg: 'jpeg',
    png: 'png',
    gif: 'gif',
    svg: 'svg+xml'
}

function getFolders(dir) {
    return fs.readdirSync(dir)
        .filter(function(file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
}

function tryBase64() {
    return (function(f) {
        console.log(f);
        return f;
    });
}


gulp.task('default', function() {

    if (argv.b64){
        console.log("base64 encoding all images..")
    }
    if (argv.img){
        console.log("pushing images as links (no base64 encoding)")
    }

    sourceFolders = getFolders(assetsPath);

    sourceFolders.map(function(folder) {
        streamqueue({
                    objectMode: true
                },
                gfile('header', 'function createAssets() { return {', {
                    src: true
                }),
                gulp.src(path.join(assetsPath, folder, '/*.png'))
                .pipe(gulpTrimPng())
                .pipe(imageminPngquant({
                    quality: '65-80',
                    speed: 4
                })())
                .pipe(gulpif(argv.img,gulp.dest(path.join(sourcePath, folder))))
                .pipe(gulpif(argv.img,gulpImg()))
                .pipe(gulpif(argv.b64,gulp64()))
                .pipe(concat('assetList')),
                gulp.src(path.join(assetsPath, folder, '/*.{gif,jpg}'))
                .pipe(gulpif(argv.img,gulp.dest(path.join(sourcePath, folder))))
                .pipe(gulpif(argv.img,gulpImg()))
                .pipe(gulpif(argv.b64,gulp64()))
                .pipe(concat('assetList')),
                gulp.src(path.join(assetsPath, folder, '/*.svg'))
                .pipe(svgmin())
                .pipe(gulpif(argv.img,gulp.dest(path.join(sourcePath, folder))))
                .pipe(gulpif(argv.img,gulpImg()))
                .pipe(gulpif(argv.b64,gulp64()))
                .pipe(concat('assetList')),
                gfile('footer', '}}', {
                    src: true
                })
            )
            .pipe(concat('assets.js')).pipe(gulp.dest(path.join(sourcePath, folder)));
    })

});


//task generates a cache based on current files
gulp.task('changed', function() {
    sourceFolders = getFolders(assetsPath);

    sourceFolders.map(function(folder) {
        var imgCache = path.join(sourcePath,folder,'/.cache');

        //only push new files through streamqueue to build new js file
        var stream = streamqueue({
                    objectMode: true
                },
                gfile('header', 'function createAssets() { return {', {
                    src: true
                }),

                gulp.src(path.join(assetsPath, folder, '/*.png'))
                .pipe(newer(imgCache))
                .pipe(gulpTrimPng())
                .pipe(imageminPngquant({
                    quality: '65-80',
                    speed: 4
                })())
                .pipe(gulpif(argv.img,gulp.dest(path.join(sourcePath, folder))))
                .pipe(gulpif(argv.img,gulpImg()))
                .pipe(gulpif(argv.b64,gulp64()))
                .pipe(gulp.dest(path.join(sourcePath, folder + "/.cache")))
                .pipe(concat('assetList')),

                gulp.src(path.join(assetsPath, folder, '/*.{gif,jpg}'))
                .pipe(newer(imgCache))
                .pipe(gulpif(argv.img,gulp.dest(path.join(sourcePath, folder))))
                .pipe(gulpif(argv.img,gulpImg()))
                .pipe(gulpif(argv.b64,gulp64()))
                .pipe(gulp.dest(path.join(sourcePath, folder + "/.cache")))
                .pipe(concat('assetList')),

                gulp.src(path.join(assetsPath, folder, '/*.svg'))
                .pipe(newer(imgCache))
                .pipe(svgmin())
                .pipe(gulpif(argv.img,gulp.dest(path.join(sourcePath, folder))))
                .pipe(gulpif(argv.img,gulpImg()))
                .pipe(gulpif(argv.b64,gulp64()))
                .pipe(gulp.dest(imgCache))
                .pipe(concat('assetList')),
                gfile('footer', '}}', {
                    src: true
                })
            )
            .pipe(concat('assets_cache.js'))
            .pipe(gulp.dest(path.join(sourcePath, folder + "/.cache")))

            //at the end of the stream run pushNew to write cache to assets.js file
            stream.on('end',function(){
               pushNew(path.join(sourcePath,folder + '/.cache/assets_cache.js'),path.join(sourcePath,folder + '/assets.js'));
            }); 
    });
   
});

//compares old and new files and consolidates changed to assets
//pass the cache directory and the assets directory
function pushNew(cacheDir,assetsDir){
    var cacheFile, oldFile;
    //read source and cache files
    cacheFile =  fs.readFileSync(cacheDir,'utf8');
    oldFile = fs.readFileSync(assetsDir,'utf8');
    //regex to split the files to arrays by (just a new line)
    var re = /\n/;
    //split files into arrays based on the newline regex
    var cacheFileSplit = cacheFile.split(re);
    var oldFileSplit = oldFile.split(re);
    //loop through assets.js file array
    for (i=0;i<oldFileSplit.length;i++){
        //regex to find first word match (filename)
        var re = /\w+/
        //loop through cached files array
        for (j=0;j<cacheFileSplit.length;j++){
            //if the first word match for both positions in current iteration are not null
            if ((re.exec(oldFileSplit[i]) != null) && (re.exec(cacheFileSplit[j]) != null)){
               //store the filenames to match
               var oldFileMatch = re.exec(oldFileSplit[i])[0];
               var cacheFileMatch = re.exec(cacheFileSplit[j])[0];
               //compare the filenames
               if (oldFileMatch == cacheFileMatch) {
                    //if a match is found
                    //the current array position in your assets.js file becomes equal to the current array position in the cached file
                    oldFileSplit[i] = cacheFileSplit[j];
                    //log the match positions
                    //console.log('have a match at ' + i + " " + j)
               }
            }
        }   
    }
    writeFiles();
    //write the changed files
    function writeFiles(){
      //write the oldFile array with its new places from the cache joined by a new line to your assets.js file
      fs.writeFileSync(assetsDir,oldFileSplit.join("\n"))
    }
}

function gulp64() {

    // var encoded = new Buffer(); // allocate ahead of time

    // Creating a stream through which each file will pass
    return through.obj(function(file, enc, cb) {
        if (file.isNull()) {
            // return empty file
            return cb(null, file);
        }
        if (file.isBuffer()) {

            var parsed = path.parse(file.history[0]);
            var cleanExt = parsed.ext.substr(1).toLowerCase();
            file.bbox = file.bbox || {};
            if(parsed.name.indexOf('_1x') !== -1){
            	file.bbox.multiplier = 1;
        	} else {
        		file.bbox.multiplier = .5;
        	} 
            var isSvg = cleanExt === 'svg';
            var encoding = isSvg ? 'utf8' : 'base64';
            var stringifiedFile = isSvg ? encodeURIComponent(file.contents.toString(encoding)) : file.contents.toString(encoding);
            var encodingString = encoding === 'utf8' ? 'charset=utf-8' : 'base64'
            var prefix = 'data:image/' + fileTypes[cleanExt] + ';' + encodingString + ',';
            var lineString = '\t' + parsed.name + ':{ bbox:' + JSON.stringify(file.bbox) + ', type: "' + cleanExt + '", uri:\'' + prefix + stringifiedFile + '\'},';
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

function gulpImg() {

    // var encoded = new Buffer(); // allocate ahead of time

    // Creating a stream through which each file will pass
    return through.obj(function(file, enc, cb) {
        if (file.isNull()) {
            // return empty file
            return cb(null, file);
        }
        if (file.isBuffer()) {

            var parsed = path.parse(file.history[0]);
            var cleanExt = parsed.ext.substr(1).toLowerCase();
            file.bbox = file.bbox || {};
            if(parsed.name.indexOf('_1x') !== -1){
                file.bbox.multiplier = 1;
            } else {
                file.bbox.multiplier = .5;
            } 
            var isSvg = cleanExt === 'svg';
            var encoding = isSvg ? 'utf8' : 'base64';
            //var stringifiedFile = isSvg ? encodeURIComponent(file.contents.toString(encoding)) : file.contents.toString(encoding);
            var encodingString = encoding === 'utf8' ? 'charset=utf-8' : 'base64'
            var prefix = 'data:image/' + fileTypes[cleanExt] + ';' + encodingString + ',';
            var lineString = '\t' + parsed.name + ':{ bbox:' + JSON.stringify(file.bbox) + ', type: "' + cleanExt + '", uri:\'' + './' + parsed.name + parsed.ext + '\'},';
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
                console.log(bbox)
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

// run pngquant, base64 encode, and then dump into assets.js
