// This gulpfile is not required to create banners. 
// Rather, it iterates through the assets folders for each size, 
// and creates an assets.js file in the src folders for each size

// Include gulp
var gulp = require('gulp'); 
var fs = require('fs');
var path = require('path');
var merge = require('merge-stream');
var imageminPngquant = require('imagemin-pngquant');
var assetsPath = 'assets';
var sourcePath = 'src';
var through = require('through2');
var concat = require('gulp-concat');
// iterate through each folder within assets

function getFolders(dir) {
    return fs.readdirSync(dir)
      .filter(function(file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
      });
}

function tryBase64(){
	return(function(f){
		console.log(f);
		return f;
	});
}

gulp.task('default',function(){

	sourceFolders = getFolders(assetsPath);

	sourceFolders.map(function(folder){
		gulp.src(path.join(assetsPath, folder, '/*.png'))
			.pipe(imageminPngquant({quality: '65-80', speed: 4})())
			.pipe(gulp64())
			.pipe(concat('assetList.js'))
			.pipe(gulp.dest(path.join(sourcePath,folder))),
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
      var pngPrefix = 'data:image/png;base64,'
      var lineString = parsed.name + parsed.ext.substr(1) + ':"' + pngPrefix + file.contents.toString('base64') + '",';
      var lineBuffer = new Buffer(lineString,'ascii');
      file.contents = lineBuffer;
      
    }
    if (file.isStream()) {
    	 this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
      //file.contents = file.contents.pipe(prefixStream(prefixText));
    }
    this.push(file);
    cb();

  });

}

// run pngquant, base64 encode, and then dump into assets.js

