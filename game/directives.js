app.directive("card", function () {
    return {
        restrict: "E",
        scope:{
            card: "="
        },
        templateUrl: "game/templates/card.html"
    };
});