app.controller("GameController", function(Player, Deck, Board) {
    var self = this;
   
    self.deck = new Deck();
    self.board = new Board(5, 5);
    
    self.dice = [
        {color: "black", selected: false},
        {color: "green", selected: false},
        {color: "blue", selected: false}
    ];
    
    self.players = [];
    self.next_card = {};
    
    self.active_player = {};
    
    self.addPlayer = function(name, color){
        if(self.players.length >= 2){
            console.log("Can't add more players");
            return false;
        }
        var player = new Player(name, self.players.length ? "blue" : "red");
        player.refillHand(self.deck);
        self.players.push(player);
        
        if(self.players.length == 2){
            self.activeNextPlayer();
        }
    };
    
    self.playTurn = function(){
        var selected_card = _.filter(self.active_player.hand, "active");
        var selected_dice = _.filter(self.dice, "active");

        if(selected_card.length == 0){
            console.log("Select one card to play");
            return false;
        }
        
        if(selected_card.length > 1){
            console.log("Select just one card to play");
            return false;
        }
        
        if(selected_dice.length != 2){
            console.log("Select two dice to throw");
            return false;
        }
        
        var response = self.board.playCard(selected_card[0]);
        if(response){
            self.active_player.removeCard(selected_card[0]).refillHand(self.deck);
            self.activeNextPlayer();
            self.deactivateDice();
        }
        
    };
    
    self.deactivateDice = function(){
        for(var i = 0, len = self.dice.length; i < len; i++){
            self.dice[i].active = false;
        }
    };
    
    self.init = function(){
        self.addPlayer("a", "red");
        self.addPlayer("b", "blue");
    };
    
    self.activeNextPlayer = function(){
        var active_player_index;
        for(var i = 0, len = self.players.length; i < len; i++){
            if(self.players[i].active){
                self.players[i].active = false;
                active_player_index = i;
            }
        }
        
        if(angular.isUndefined(active_player_index)){
            self.players[0].active = true;
            self.active_player = self.players[0];
        }
        else{
            var next_index = (active_player_index + 1) % (self.players.length);
            self.players[next_index].active = true;
            self.active_player = self.players[next_index];
        }
    };
});
