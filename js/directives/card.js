app.directive("card", function () {
    return {
        restrict: "E",
        scope:{
            card: "="
        },
        templateUrl: "js/templates/card.html"
    };
});