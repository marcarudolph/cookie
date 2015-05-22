"use strict";

var Promise = require('es6-promise').Promise,
    config = require('../config/cookie-config.js'),
    lwip = require('lwip');

exports.generatePicAndThumb = function generatePicAndThumb(rawPicture) {

    var targetPath = config.pictures.directory + "/" +  rawPicture.targetFileName;
    var thumbnailPath = config.pictures.directory + "/thumbnails/" +  rawPicture.targetFileName;

    return new Promise(function(resolve, reject) {
        resize(rawPicture.localPath.path, targetPath, 2048)
        .then(function() {
            resize(targetPath, thumbnailPath, 150)
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);
    });
}

function resize(sourcePath, targetPath, maxSize) {
    return new Promise(function(resolve, reject) {
        lwip.open(sourcePath, function(err, image){
            if (err) {
                return reject(err);
            }

            var width = image.width(),
                height = image.height(),
                longerSide = Math.max(width, height),
                scaleFactor = maxSize / longerSide;

            image.batch()
            .scale(scaleFactor, 'lanczos') 
            .writeFile(targetPath, {quality: 45}, function(err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });
    });     
}