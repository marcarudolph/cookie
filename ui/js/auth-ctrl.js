'use strict';

angular.module('cookie')
    .controller('AuthCtrl', AuthCtrl);

function AuthCtrl() {    
    window.location.href = '/auth/google';
}

