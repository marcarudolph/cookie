'use strict';

exports.init = init;

function init(app) {
    app.get('/api/init', function(req, resp) {
        
        var appData = {};
        
        if (req.user) {
            appData.user = {
                name: req.user.email,
                id: req.user._id,
                authType: req.user.authType
            };
        }
        
        resp.send(appData);
    });
}