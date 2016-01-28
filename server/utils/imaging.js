"use strict";

var Promise = require('es6-promise').Promise;


exports.generatePicAndThumb = function generatePicAndThumb(rawPicture) {

    var targetPath = global.config.pictures.directory + "/" +  rawPicture.targetFileName;
    var thumbnailPath = global.config.pictures.directory + "/thumbnails/" +  rawPicture.targetFileName;

    return new Promise(function(resolve, reject) {
        resize(rawPicture.localPath.path, targetPath, 2048, 40)
        .then(function() {
            resize(targetPath, thumbnailPath, 300, 20)
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);
    });
};

function resize(sourcePath, targetPath, maxSize, quality) {
   return new Promise(function(resolve, reject) {
        getSharp(sourcePath)        
        .resize(maxSize).max().withoutEnlargement()
        .rotate()
        .quality(quality)
        .toFile(targetPath, function(err) {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });     
}

var sharp;
function getSharp() {
    if (!sharp) {
        sharp = require('sharp');
        sharp.concurrency(1);
    }
    return sharp;
}