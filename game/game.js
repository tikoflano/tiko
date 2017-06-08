var app = angular.module("game", ["ngMessages"]);
app.config(function($locationProvider) { $locationProvider.html5Mode(true); });
app.constant("Config", {
    board : {width: 5, height: 5},
    figure : {size: 4}
});