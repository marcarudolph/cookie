'use strict';

exports.withData = withData;
exports.withError = withError;
exports.sendFourOhFour = sendFourOhFour;

function withData(resp) {
    return function (data) {
        return resp.send(data);
    }
}

function withError(resp) {
    return function (err) {
        console.log(err.stack);
        return resp.sendStatus(500);
    }
}

function sendFourOhFour(resp) {
    return resp.sendStatus(404);
}
