app.directive("card", function () {
    return {
        restrict: "E",
        scope:{
            card: "="
        },
        templateUrl: "game/directives/templates/card.html"
    };
});