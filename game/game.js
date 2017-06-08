var app = angular.module("game", ["ngMessages"]);
app.config(function($locationProvider) { $locationProvider.html5Mode(true); });
app.constant("Config", {
    debug: true,
    board : {width: 5, height: 5},
    figure : {size: 2},
    player : {hand_size: 3, player_cards: 6, board: {width: 5, height: 5}}
});