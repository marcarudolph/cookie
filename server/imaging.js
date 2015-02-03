"use strict";

var Promise = require('es6-promise').Promise,
    config = require('../config/cookie-config.js'),
    fs = require('fs'),
    gm = require('gm');

exports.generatePicAndThumb = function generatePicAndThumb(rawPicture) {
    return new Promise(function(resolve, reject) {
        var targetPath = config.pictures.directory + "/" +  rawPicture.targetFileName;
        var thumbnailPath = config.pictures.directory + "/thumbnails/" +  rawPicture.targetFileName;

        gm(rawPicture.localPath.path)
        .resize(2048)
        .quality(45)
        .autoOrient()
        .write(targetPath, function (err) {
            if (err){
                return reject(err);
            }
            else {
                gm(targetPath)
                .resize(150)
                .write(thumbnailPath, function (err) {
                    if(!err){
                        return resolve(targetPath);
                    }
                    else{
                        return reject(err);
                    }
                });
            }
        });
    });
}