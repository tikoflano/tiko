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
            
            $scope.changeActive = function(card){
                if($scope.$parent.$parent.ctrl.isMyTurn()){
                    card.active = !card.active;
                    
                    for(var i = 0, len = $scope.player.board.rows.length; i < len; i++){
                        for(var j = 0, len2 = $scope.player.board.rows[i].length; j < len2; j++){
                            if($scope.player.board.rows[i][j] == card){
                                $scope.$parent.$parent.ctrl.togetherjs.send({type: "playerboard-card-clicked", coords: {row: i, col: j}});
                                return;
                            }
                        }
                    }
                    
                    
                }        
            };
        },
        templateUrl: "js/templates/player_board.html"
    };
});