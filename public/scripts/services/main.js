var services = angular.module('cb-node-fts');

// DON'T REMOVE OR MODIFY THE FOLLOWING LINE
//-- cean: Services

services.factory('MyService', function($http) {
   
    var myService = new TMyService($http);
    
    return myService;
});