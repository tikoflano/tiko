app.directive("numberCard", function () {
    return {
        restrict: "E",
        scope:{
            numberCard: "="
        },
        templateUrl: "game/templates/number-card.html"
    };
});