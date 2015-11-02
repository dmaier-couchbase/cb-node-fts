'use strict';

/**
 * @ngdoc function
 * @name cb-node-fts.controller:SearchCtrl
 * @description
 * # SearchCtrl
 */
var app = angular.module('cb-node-fts');

app.controller('SearchCtrl', function($scope, MyService, FtsService) {
    
    $scope.msg_status = "alert-info hidden";
    $scope.result_status = "hidden";
    
    $scope.onSearchClicked = function (words) {
        
        //Init output
        var out = [];
        var processed = 0;
        
        //Validate
        var validated = true;
        if (words == null || words  == '') validated = false;
        
        if (!validated) {
            
           $scope.msg_status = "alert-warning";
           $scope.msg ='You did not pass all mandatory parameters!';
        }
        else {
        
            FtsService.search(words).then(

                function(ctx) { 

                    var result = ctx.data;

                    if (result.success) {

                        var refs = result.refs;
                        var numOfRefs = Object.keys(refs).length;

                        for (var ref in refs) {

                            MyService.get(ref).then(

                                function(ctx2) {

                                    var id = ctx2.config.url.split('=')[1].split('"')[0];                                
                                    var msg = ctx2.data.value.msg;

                                    out.push({ "id" : id, "text" : msg});
                                    processed++;

                                    if (processed == numOfRefs) {

                                        $scope.msg_status = "alert-info hidden";
                                        $scope.result_status = "hidden";
                                        $scope.result_status = "";
                                        $scope.result = out;
                                        
                                    }
                                },

                                function(error2) {

                                   $scope.msg_status = "alert-danger";
                                   $scope.msg = 'An internal error occoured: ' + JSON.stringify(error2.data.error);
                                }
                            );


                        }
                    }
                    else {

                        $scope.result_status = "hidden";
                        $scope.msg_status = "alert-warning";
                        $scope.msg = "The search result was empty.";
                    }

                },
                function(error) {

                    $scope.msg_status = "alert-danger";
                    $scope.msg = 'An internal error occoured: ' + JSON.stringify(error.data.error);
                }
            );
        }
    }
    
});