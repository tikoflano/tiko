app.directive("figure", function (Utils) {
    return {
        restrict: "E",
        scope:{
            figure: "="
        },
        link: function($scope){
            $scope.$watch("figure", function(newValue){
                if(!newValue || !newValue.length){return;}
                
                var min_figure = Utils.minFigure($scope.figure);

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
        templateUrl: "js/templates/figure.html"
    };
});