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
                .pipe(gulp64())
                .pipe(concat('assetList')),
                gulp.src(path.join(assetsPath, folder, '/*.{gif,jpg}'))
                .pipe(gulp64())
                .pipe(concat('assetList')),
                gulp.src(path.join(assetsPath, folder, '/*.svg'))
                .pipe(svgmin())
                .pipe(gulp64())
                .pipe(concat('assetList')),
                gfile('footer', '}}', {
                    src: true
                })
            )
            .pipe(concat('assets.js')).pipe(gulp.dest(path.join(sourcePath, folder)));
    })

});

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
            	//parsed.name = parsed.name.replace('_1x','');
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
        //this.push(file);
        //cb();

    });
}

// run pngquant, base64 encode, and then dump into assets.js
