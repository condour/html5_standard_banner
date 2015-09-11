// This gulpfile is not required to create banners. 
// Rather, it iterates through the assets folders for each size, 
// and creates an assets.js file in the src folders for each size

// Include gulp
var gulp = require('gulp'); 
var fs = require('fs');
var path = require('path');
var merge = require('merge-stream');
var es = require('event-stream')
var imageminPngquant = require('imagemin-pngquant');
var assetsPath = 'assets';
var sourcePath = 'src';
var through = require('through2');
var concat = require('gulp-concat');
var gutil = require('gutil');
var streamqueue = require('streamqueue');
var svgmin = require('gulp-svgmin');
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

function tryBase64(){
	return(function(f){
		console.log(f);
		return f;
	});
}

function string_src(filename, string) {
  var src = require('stream').Readable({ objectMode: true })
  src._read = function () {
    this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }))
    this.push(null)
  }
  return src
}

gulp.task('default',function(){

	sourceFolders = getFolders(assetsPath);

	sourceFolders.map(function(folder){
		streamqueue({objectMode: true}, 
			gulp.src('./header.js'),
			gulp.src(path.join(assetsPath, folder, '/*.{png,gif,jpg}'))
				.pipe(imageminPngquant({quality: '65-80', speed: 4})())
				.pipe(gulp64())
				.pipe(concat('assetList')),
			gulp.src(path.join(assetsPath,folder,'/*.svg'))
				.pipe(svgmin())
				.pipe(gulp64())
				.pipe(concat('assetList')),
			gulp.src('./footer.js')
		)
		.pipe(concat('assets.js')).pipe(gulp.dest(path.join(sourcePath,folder)));
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
      var isSvg = cleanExt === 'svg';
      var encoding = isSvg ? 'utf8' : 'base64';
      var stringifiedFile = isSvg ? encodeURIComponent(file.contents.toString(encoding)) : file.contents.toString(encoding);
      var encodingString = encoding === 'utf8' ? 'charset=utf-8' : 'base64'
      var prefix = 'data:image/' + fileTypes[cleanExt] + ';' + encodingString + ',';
      var lineString = parsed.name + cleanExt + ':\'' + prefix + stringifiedFile + '\',';
      var lineBuffer = new Buffer(lineString,'ascii');
      file.contents = lineBuffer;
      
    }
    if (file.isStream()) {
    	 this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
    }
    this.push(file);
    cb();

  });

}

// run pngquant, base64 encode, and then dump into assets.js

