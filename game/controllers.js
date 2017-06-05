app.controller("GameController", ["Player", "Deck", "Board", "$scope", function(Player, Deck, Board, $scope) {
    var self = this;
   
    self.deck = new Deck();
    self.board = new Board(5, 5);
    
    self.dice = [
        {color: "black", selected: false, number: null},
        {color: "green", selected: false, number: null},
        {color: "blue", selected: false, number: null}
    ];
    
    self.players = [];
    self.next_card = {};
    
    self.active_player = {};
    
    self.addPlayer = function(name, color){
        if(self.players.length >= 2){
            self.message = {type: "error", header: "Error", message: "Can't add more players"};
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
        self.message = false;
        
        var selected_card = _.filter(self.active_player.hand, "active");
        var selected_dice = _.filter(self.dice, "active");

        if(selected_card.length == 0){
            self.message = {type: "error", header: "Error", message: "Select one card to play"};
            return false;
        }
        
        if(selected_card.length > 1){
            self.message = {type: "error", header: "Error", message: "Select just one card to play"};
            return false;
        }
        
        if(selected_dice.length != 2){
            self.message = {type: "error", header: "Error", message: "Select two dice to throw"};
            return false;
        }
        
        self.board.playCard(selected_card[0])
        .then(function(){
            self.active_player.removeCard(selected_card[0]).refillHand(self.deck);
            
            self.throwDice();
            
            //Check cards number
            for(var i = 0, len = self.board.rows.length; i < len; i++){
                for(var j = 0, len2 = self.board.rows[i].length; j < len2; j++){
                    if(self.board.rows[i][j].type == "number" && !self.board.rows[i][j].isEmpty()){
                        _.forEach(_.filter(self.dice, "active"), function(die){
                            if(angular.isDefined(self.board.rows[i][j].numbers[die.color]) && die.number == self.board.rows[i][j].numbers[die.color]){
                                self.board.rows[i][j] = self.active_player.player_cards.pop();
                                return false;
                            }
                        });
                    }
                } 
            }
            
            self.deactivateDice();
            self.resetDice();
            self.activeNextPlayer();
        }, function(error){
            self.message = {type: "error", header: "Error", message: error};
        });
        
    };
    
    self.throwDice = function(){
        _.forEach(_.filter(self.dice, "active"), function(die){
            die.number = _.random(1, 6);
            console.log(die.color, die.number);
        });
    };
    
    self.resetDice = function(){
        _.forEach(self.dice, function(die){
            die.number = null;
        });
    };
    
    self.deactivateDice = function(){
        _.forEach(self.dice, function(die){
            die.active = false;
        });
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
    
}]);
