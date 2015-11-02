var services = angular.module('cb-node-fts');

// DON'T REMOVE OR MODIFY THE FOLLOWING LINE
//-- cean: Services
services.factory("FtsService", function($http) {
    var service = new TFtsService($http);
    return service;
});


services.factory('MyService', function($http) {
   
    var myService = new TMyService($http);
    return myService;
});