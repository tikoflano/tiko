var app = angular.module("game", []);
app.constant("Config", {
    debug: false,
    board : {width: 5, height: 5},
    figure : {size: 4},
    player : {amount: 2, hand_size: 3, player_cards: 6, board: {width: 5, height: 5}}
});