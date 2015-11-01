'use strict';

/**
 * @ngdoc overview
 * @name cbDemoQaApp
 * @description
 * # 'cb-node-fts
 *
 * Main module of the application.
 */
var app = angular.module('cb-node-fts', [
    'ngCookies',
    'ngResource',
    'ngRoute'
]);

app.config(function($routeProvider) {
   
    
    $routeProvider
    //-- cean: Routes
    .when('/', {
       templateUrl : 'views/main.html',
       controller : 'MyCtrl'
    })
    .otherwise({
        redirectTo: '/'
    });
});
