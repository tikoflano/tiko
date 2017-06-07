app.controller("GameController", ["Player", "Deck", "Board", "$q", function(Player, Deck, Board, $q) {
    var self = this;
    
    self.phase = {};
    self.deck = new Deck();
    self.board = new Board(5, 5);
    self.dice = [
        {color: "black", selected: false, number: null},
        {color: "green", selected: false, number: null},
        {color: "blue", selected: false, number: null}
    ];
    self.players = [];    
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
    
    self.playPhase = function(){
        self.phase.fn(self.phase.args)
        .catch(function(error){
            self.message = {type: "error", header: "Error", message: error};
        });
    };
    
    self.playCard = function(){
        self.message = false;
        
        var selected_card = _.filter(self.active_player.hand, "active");

        if(selected_card.length == 0){
            return $q.reject("Select one card to play");
        }
        
        if(selected_card.length > 1){
            return $q.reject("Select just one card to play");
        }
        
        var player = self.active_player;
        return selected_card[0].play(self)
        .then(function(){
            player.removeCard(selected_card[0]);
        });
        
    };
    
    self.throwDice = function(amount){
        self.message = false;
        
        var selected_dice = _.filter(self.dice, "active");
        
        if(selected_dice.length != amount){
            return $q.reject("Select "+amount+" dice to throw");
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
            var chains = self.getChains();
            if(!chains.length){
                return self.endTurn();
            }
            else{
                console.log(chains);
                self.phase = {text: "Seleccionar figura", fn: self.selectFigure};
            }
        }
        else{
            return self.endTurn();
        }
    };
    
    self.selectFigure = function(){
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
        self.active_player.deactivateHand().refillHand(self.deck);
        self.deactivateDice();
        self.resetDice();
        self.activeNextPlayer();
        self.phase = {text: "Jugar carta", fn: self.playCard};
        return $q.resolve();
    };
    
    self.getChains = function(){
        var filtered = [];
        for(var i = 0, len = self.board.rows.length; i < len; i++){
            for(var j = 0, len2 = self.board.rows[i].length; j < len2; j++){
                if(self.board.rows[i][j].type == "player" && self.board.rows[i][j].player == self.active_player){
                    filtered.push({row: i, column: j});
                }
            }
        }

        var groups = [];
        var checked = [];

        for(var i = 0, len = filtered.length; i < len; i++){
            if(!_.find(checked, filtered[i])){
                var group = [filtered[i]];
                findNeighbors(filtered[i], group, checked);
                if(group.length >= 4){
                    groups.push(group);
                }
            }
        }

        function findNeighbors(element, group, checked){
            checked.push(element);

            var neighbors = [
                {row: element.row - 1, column: element.column},
                {row: element.row, column: element.column + 1},
                {row: element.row + 1, column: element.column},
                {row: element.row, column: element.column - 1},
            ];

            for(var i = 0, len = neighbors.length; i < len; i++){
                var neighbor = _.find(filtered, neighbors[i]);
                if(neighbor && !_.find(checked, neighbors[i])){
                    group.push(neighbor);
                    findNeighbors(neighbor, group, checked);
                }
            }	
        }
        
        return groups;
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
        self.phase = {text: "Jugar carta", fn: self.playCard};
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
            var starting_player = _.random(self.players.length - 1);
            self.players[starting_player].active = true;
            self.active_player = self.players[starting_player];
        }
        else{
            var next_index = (active_player_index + 1) % (self.players.length);
            self.players[next_index].active = true;
            self.active_player = self.players[next_index];
        }
    };
    
}]);
