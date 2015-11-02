'use strict';

/**
 * @ngdoc function
 * @name cb-node-fts.controller:MainCtrl
 * @description
 * # MyCtrl
 */
var app = angular.module('cb-node-fts');

app.controller('MyCtrl', function($scope, MyService, FtsService) {
    
    
   $scope.msg_status = "alert-info hidden";    
    
   //Execute when add is clicked
   $scope.onAddClicked = function (id, msg) {
    
       //Validate
       var validated = true;
       
       if (id == null || id  =='') validated = false;
       if (msg == null || msg =='') validated = false;
       
       if (!validated) { 
           
           $scope.msg_status = "alert-warning";
           $scope.msg ='You did not pass all mandatory parameters!';
       }
       else {
           
           MyService.add(id, msg).then(

               function(ctx) { 

                   var result = ctx.data;

                   if (result.error)
                   {
                        $scope.msg_status = "alert-danger";
                        $scope.msg = 'Error: ' + JSON.stringify(result.error);
                   }
                   else
                   {
                       FtsService.indexit(id, msg).then(
                           
                           function(ctx2) {
                            
                                $scope.msg_status = "alert-success";
                                $scope.msg = 'Successfully added.';
                               
                           },
                           function(error2) {
                               
                               $scope.msg_status = "alert-danger";
                               $scope.msg = 'An internal error occoured: ' + JSON.stringify(error2.data.error);  
                           }
                        );
                           
                      
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