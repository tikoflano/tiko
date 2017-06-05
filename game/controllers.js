app.controller("GameController", ["Player", "Deck", "Board", "$scope", function(Player, Deck, Board, $scope) {
    var self = this;
    
    self.phase = 0;
    self.phases = [
        {text: "Jugar carta", fn: playCard},
        {text: "Lanzar dado", fn: throwDice},
        {text: "Seleccionar figura", fn: selectFigure}
    ];
   
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
    
    self.addPlayer = function(name){
        if(self.players.length >= 2){
            self.message = {type: "error", header: "Error", message: "Can't add more players"};
            return false;
        }
        var player = new Player(name, self.players.length ? "#03A9F4" : "red");
        player.refillHand(self.deck);
        self.players.push(player);
        
        if(self.players.length == 2){
            self.activeNextPlayer();
        }
    };
    
    //Phases functions
    function playCard(){
        self.message = false;
        
        var selected_card = _.filter(self.active_player.hand, "active");

        if(selected_card.length == 0){
            self.message = {type: "error", header: "Error", message: "Select one card to play"};
            return false;
        }
        
        if(selected_card.length > 1){
            self.message = {type: "error", header: "Error", message: "Select just one card to play"};
            return false;
        }
        
        self.board.playCard(selected_card[0])
        .then(function(){
            self.active_player.removeCard(selected_card[0]);
            self.phase = 1;
        }, function(error){
            self.message = {type: "error", header: "Error", message: error};
        });
        
    };
    
    function throwDice(){
        self.message = false;
        
        var selected_dice = _.filter(self.dice, "active");
        
        if(selected_dice.length != 2){
            self.message = {type: "error", header: "Error", message: "Select two dice to throw"};
            return false;
        }
        
        _.forEach(_.filter(self.dice, "active"), function(die){
            die.number = _.random(1, 6);
            console.log(die.color, die.number);
        })
        
        //Check cards number
        var number_hitted = false;
        for(var i = 0, len = self.board.rows.length; i < len; i++){
            for(var j = 0, len2 = self.board.rows[i].length; j < len2; j++){
                if(self.board.rows[i][j].type == "number" && !self.board.rows[i][j].isEmpty()){
                    _.forEach(_.filter(self.dice, "active"), function(die){
                        if(angular.isDefined(self.board.rows[i][j].numbers[die.color]) && die.number == self.board.rows[i][j].numbers[die.color]){
                            self.board.rows[i][j] = self.active_player.player_cards.pop();
                            number_hitted = true;
                            return false;
                        }
                    });
                }
            } 
        }

        //Check groups of 4+ if any card number was hitted
        if(number_hitted){
            var chain = self.getChain();
            if(!chain){
                self.endTurn();
            }
            else{
                self.phase = 2;
            }
        }
        else{
            self.endTurn();
        }
    };
    
    function selectFigure(){
        self.message = false;
        
        var selected_cards = [];
        for(var i = 0, len = self.board.rows.length; i < len; i++){
            for(var j = 0, len2 = self.board.rows[i].length; j < len2; j++){
                if(self.board.rows[i][j].active){
                    selected_cards.push(self.board.rows[i][j]);
                }
            } 
        }
        
        if(selected_cards.length != 4){
            self.message = {type: "error", header: "Error", message: "Select 4 cards"};
            return false;
        }
        
        
        self.endTurn();
    };
    
    self.endTurn = function(){
        self.active_player.refillHand(self.deck);
        self.deactivateDice();
        self.resetDice();
        self.activeNextPlayer();
        self.phase = 0;
    };
    
    self.getChain = function(){
        var chain = [];
        for(var i = 0, len = self.board.rows.length; i < len; i++){
            for(var j = 0, len2 = self.board.rows[i].length; j < len2; j++){
                if(self.board.rows[i][j].type == "player" && self.board.rows[i][j].player == self.active_player){
                    chain.push({row: i, column: j});
                }
            } 
        }
        
        var response = [];
        for(var i = 0, len = chain.length; i < len; i++){
            if(_.findIndex(chain, {row: chain[i].row - 1, column: chain[i].column}) != -1 || 
                _.findIndex(chain, {row: chain[i].row, column: chain[i].column + 1}) != -1 ||
                _.findIndex(chain, {row: chain[i].row + 1, column: chain[i].column}) != -1 ||
                _.findIndex(chain, {row: chain[i].row, column: chain[i].column - 1}) != -1){
                response.push(chain[i]);
            }
        }
        
        return response.length >= 4 ? response : false;
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
        self.addPlayer("a");
        self.addPlayer("b");
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
