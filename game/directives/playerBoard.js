app.directive("playerBoard", function ($timeout) {
    return {
        restrict: "E",
        scope: true,
        link: function($scope, $element){
            var $modal = $element.find(".modal");
            
            $scope.$on("show-board", function(event, player, figure){
                $scope.player = player;
                $scope.figure = figure;
                
                $timeout(function(){$scope.showBoard();});
            });
            
             $scope.$on("hide-board", function(){
                $scope.player = null;
                $scope.figure = null;
                $scope.hideBoard();
            });
            
            
            $scope.showBoard = function(){
                $modal.modal({
                    closable: false
                }).modal("show");
            };
            
            $scope.hideBoard = function(){
                $modal.modal("hide");
            };
        },
        templateUrl: "game/directives/templates/player_board.html"
    };
});