app.directive("card", function () {
    return {
        restrict: "E",
        scope:{
            card: "="
        },
        templateUrl: "game/templates/card.html"
    };
});
app.directive("playerBoard", function () {
    return {
        restrict: "E",
        scope:{
            player: "="
        },
        link: function($scope, $element, attrs, controller){
            var $modal = $element.find(".modal");
            var player = $scope.$parent.player;
            
            player.showBoard = function(){
                if(!this.active){return;}
                
                $modal.modal({
                    closable: false,
                    onApprove : function() {return false;}
                }).modal("show");
            };
            
            player.hideBoard = function(){
                $modal.modal("hide");
            };
            
            player.addFigure = function(figure){
                controller.figure = figure;
                player.showBoard();
            };
        },
        controller: function(){
            var self = this;
            self.figure = [];
        },
        bindToController: true,
        controllerAs: "ctrl",
        templateUrl: "game/templates/player_board.html"
    };
});
app.directive("figure", function () {
    return {
        restrict: "E",
        scope:{
            figure: "="
        },
        link: function($scope){
            $scope.$watch("figure", function(newValue){
                if(!newValue || !newValue.length){return;}
                                
                var min_row = _.minBy($scope.figure, "row").row;
                var min_column = _.minBy($scope.figure, "column").column;
                var min_figure = _.map($scope.figure, function(coords){
                    return {row: coords.row - min_row, column: coords.column - min_column}
                });

                var width = _.maxBy(min_figure, "column").column + 1;
                var height = _.maxBy(min_figure, "row").row + 1;

                $scope.minfig = new Array(height);
                for(var i = 0; i < $scope.minfig.length; i++){
                    $scope.minfig[i] = new Array(width);
                }

                _.forEach(min_figure, function(coords){
                    $scope.minfig[coords.row][coords.column] = 1;
                });
            });

        },
        templateUrl: "game/templates/figure.html"
    };
});