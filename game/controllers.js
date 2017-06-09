app.controller("GameController", function($scope, $q, Config, Player, Deck, Board, PlayerCard) {
    var self = this;
    
    self.debug = Config.debug;
    self.phase = {};
    self.deck = new Deck();
    self.board = new Board(Config.board.width, Config.board.height);
    self.dice = [
        {color: "black", selected: false, number: null},
        {color: "green", selected: false, number: null},
        {color: "blue", selected: false, number: null}
    ];
    self.players = [];    
    self.active_player = {};
    
    self.init = function(){
        self.addPlayer("John Doe");
        self.addPlayer("Robin Hood");
    };
    
    self.playPhase = function(){
        self.message = false;
        
        self.phase.fn(self.phase.args)
        .then(function(next_phase){
            self.phase = next_phase;
        })
        .catch(function(error_message){
            self.message = {type: "error", header: "Error", message: error_message};
        });
    };
    
    self.addPlayer = function(name){
        if(self.players.length >= 2){
            self.message = {type: "error", header: "Error", message: "Can't add more players"};
            return false;
        }
        var player = new Player(name, self.players.length ? "#03A9F4" : "#FF5722");
        player.refillHand(self.deck);
        self.players.push(player);
        
        if(self.players.length == 2){
            self.phase = {text: "Iniciar partida", fn: self.startGame};
        }
    };
    
    self.startGame = function(){
        var starting_player = _.random(self.players.length - 1);
        self.players[starting_player].active = true;
        self.active_player = self.players[starting_player];
        
        return $q.resolve({text: "Jugar carta de la mano", fn: self.playCard});
    };
    
    self.playCard = function(){
        var selected_card = _.filter(self.active_player.hand, "active");

        if(selected_card.length == 0){
            return $q.reject("Select one card to play");
        }
        
        if(selected_card.length > 1){
            return $q.reject("Select just one card to play");
        }
        
        if(self.board.isFull() && selected_card[0].type != "action"){
            return $q.reject("The board is full. Play an action card.");
        }
        
        var player = self.active_player;
        return selected_card[0].play(self)
        .then(function(next_phase){
            player.removeCard(selected_card[0]);
            return next_phase;
        });
        
    };
    
    self.throwDice = function(){
        var selected_dice = _.filter(self.dice, "active");
        
        if(selected_dice.length != 2){
            return $q.reject("Select 2 dice to throw");
        }
        
        _.forEach(_.filter(self.dice, "active"), function(die){
            die.number = self.debug ? self.number :_.random(1, 6);
        });
        
        return $q.resolve({text: "Comprobar resultados", fn: self.checkHits});
    };
    
    self.checkHits = function(){
        //Check cards number
        var hit_cards = [];
        var player_cards = [];
        for(var i = 0, len = self.board.rows.length; i < len; i++){
            for(var j = 0, len2 = self.board.rows[i].length; j < len2; j++){
                if(self.board.rows[i][j].type == "player" && self.board.rows[i][j].player == self.active_player){
                    player_cards.push({row: i, column: j});
                }
                if(self.board.rows[i][j].type == "number" && !self.board.rows[i][j].isEmpty()){
                    _.forEach(_.filter(self.dice, "active"), function(die){
                        if(self.board.rows[i][j].numbers[die.color] && die.number == self.board.rows[i][j].numbers[die.color]){
                            hit_cards.push({row: i, column: j});
                            return false;
                        }
                    });
                }
            } 
        }
        
        if(!hit_cards.length){
            return self.endTurn();
        }
        
        if(hit_cards.length <= self.active_player.player_cards.length){
            for(var i = 0, len = hit_cards.length; i < len; i++){
                self.board.rows[hit_cards[i].row][hit_cards[i].column] = self.active_player.player_cards.pop();
            }
            return self.checkChains();
        }
        else if(hit_cards.length > self.active_player.player_cards.length){
            if(hit_cards.length > (self.active_player.player_cards.length + player_cards.length)){
                _.forEach(player_cards, function(card){
                    self.active_player.player_cards.push(self.board.rows[card.row][card.column]);
                    self.board.removeCardInCell(card.row, card.column);
                });
                return $q.resolve({text: "Seleccionar "+self.active_player.player_cards.length+" carta(s) de número", fn: self.selectHitNumberCards, args: hit_cards});
            }
            else{
                var amount = hit_cards.length - self.active_player.player_cards.length;
                return $q.resolve({text: "Seleccionar "+amount+" carta(s) de jugador", fn: self.selectPlayerCards, args: amount});
            }
        }
    };
    
    self.checkChains = function(){
        var cells = [];
        for(var i = 0, len = self.board.rows.length; i < len; i++){
            for(var j = 0, len2 = self.board.rows[i].length; j < len2; j++){
                if(self.board.rows[i][j].type == "player" && self.board.rows[i][j].player == self.active_player){
                    cells.push({row: i, column: j});
                }
            }
        }
        
        var chains = _.filter(self.getChains(cells), function(group){ return group.length >= Config.figure.size; });
        if(!chains.length){
            return self.endTurn();
        }
        else{
            return $q.resolve({text: "Seleccionar figura", fn: self.selectFigure});
        }
    };
    
    self.selectHitNumberCards = function(cards_hit){
        var amount = self.active_player.player_cards.length;
        
        var selected_cards = [];
        for(var i = 0, len = self.board.rows.length; i < len; i++){
            for(var j = 0, len2 = self.board.rows[i].length; j < len2; j++){
                if(self.board.rows[i][j].active && self.board.rows[i][j].type == "number" && _.find(cards_hit, {row: i, column: j})){
                    selected_cards.push({row: i, column: j});
                }
            } 
        }
        
        if(selected_cards.length != amount){
            return $q.reject("Select "+amount+" card(s) with the hit numbers");
        }
        
        for(var i = 0, len = selected_cards.length; i < len; i++){
            self.board.rows[selected_cards[i].row][selected_cards[i].column] = self.active_player.player_cards.pop();
        }
        
        return self.checkChains();
    };
    
    self.selectPlayerCards = function(amount){
        var selected_cards = [];
        for(var i = 0, len = self.board.rows.length; i < len; i++){
            for(var j = 0, len2 = self.board.rows[i].length; j < len2; j++){
                if(self.board.rows[i][j].active && self.board.rows[i][j].type == "player" && self.board.rows[i][j].player == self.active_player){
                    selected_cards.push({row: i, column: j});
                }
            } 
        }
        
        if(selected_cards.length != amount){
            return $q.reject("Select "+amount+" cards of your color");
        }
        
        _.forEach(selected_cards, function(card){
            self.active_player.player_cards.push(self.board.rows[card.row][card.column]);
            self.board.removeCardInCell(card.row, card.column);
        });
        
        return self.checkHits();
    };
    
    self.showBoard = function(player){
        $scope.$broadcast("show-board", player);
    };
    
    self.selectFigure = function(){
        var selected_cards = [];
        for(var i = 0, len = self.board.rows.length; i < len; i++){
            for(var j = 0, len2 = self.board.rows[i].length; j < len2; j++){
                if(self.board.rows[i][j].active && self.board.rows[i][j].type == "player" && self.board.rows[i][j].player == self.active_player){
                    selected_cards.push({row: i, column: j});
                }
            } 
        }
        
        var chains = _.filter(self.getChains(selected_cards), function(group){ return group.length == Config.figure.size; });
        if(chains.length == 0){
            return $q.reject("Select one group of "+Config.figure.size+" contiguous cards of your color");
        }
        
        if(chains.length > 1){
            return $q.reject("Select just one group of "+Config.figure.size+" contiguous cards of your color");
        }
        
        _.forEach(selected_cards, function(card){
            self.board.rows[card.row][card.column].active = false;
            self.active_player.player_cards.push(self.board.rows[card.row][card.column]);
            self.board.removeCardInCell(card.row, card.column);
        });
        
        $scope.$broadcast("show-board", self.active_player, selected_cards);
        return $q.resolve({text: "Agregar figura", fn: self.addFigure, args: selected_cards});
    };
    
    self.addFigure = function(figure){
        var selected_cards = [];
        for(var i = 0, len = self.active_player.board.rows.length; i < len; i++){
            for(var j = 0, len2 = self.active_player.board.rows[i].length; j < len2; j++){
                if(self.active_player.board.rows[i][j].active && self.active_player.board.rows[i][j].type == "empty"){
                    selected_cards.push({row: i, column: j});
                }
            } 
        }
        
        if(!selected_cards.length){
            return $q.reject("Select "+figure.length+" spaces forming the shape");
        }
        
        var min_figure = minFigure(figure);
        var min_selected_cards = minFigure(selected_cards);
        
        if(!_.isEqual(min_figure, min_selected_cards)){
            return $q.reject("Select "+figure.length+" spaces forming the shape");
        }
        
        var bottom = false;
        for(var i = 0, len = selected_cards.length; i < len; i++){
            if((selected_cards[i].row + 1) ==  self.active_player.board.rows.length ||
                self.active_player.board.rows[selected_cards[i].row + 1][selected_cards[i].column].type == "player"){
                bottom = true;
            }
        }        
        if(!bottom){
           return $q.reject("The figure must rest over the bottom edge or a colored block"); 
        }
        
        var max_row = _.maxBy(selected_cards, "row").row;
        var min_col = _.minBy(selected_cards, "column").column;
        var max_col = _.maxBy(selected_cards, "column").column;
        var opening = true;
        for(var i = 0; i <= max_row; i++){
            for(var j = min_col; j <= max_col; j++){
                if(self.active_player.board.rows[i][j].type != "empty"){
                    opening = false;
                }
            } 
        }
        if(!opening){
           return $q.reject("There must be an opening wide enough to let the figure go down"); 
        }
        
        for(var i = 0, len = selected_cards.length; i < len; i++){
            self.active_player.board.rows[selected_cards[i].row][selected_cards[i].column] = new PlayerCard(self.active_player);
        }
        
        var occupied_cells = [];
        for(var i = 0, len = self.board.rows.length; i < len; i++){
            for(var j = 0, len2 = self.board.rows[i].length; j < len2; j++){
                if(self.board.rows[i][j].type != "empty"){
                    occupied_cells.push({row: i, column: j});
                }
            } 
        }
        
        var chains = self.getChains(occupied_cells);
        
        for(var i = 0, len = chains.length; i < len; i++){
            var clear_chain = true;
            for(var j = 0, len2 = chains[i].length; j < len2; j++){
                if(self.board.rows[chains[i][j].row][chains[i][j].column].type == "number"){
                    clear_chain = false;
                    break;
                }
            }
            
            if(clear_chain){
                for(var j = 0, len2 = chains[i].length; j < len2; j++){
                    self.board.rows[chains[i][j].row][chains[i][j].column].player.player_cards.push(self.board.rows[chains[i][j].row][chains[i][j].column]);
                    self.board.removeCardInCell(chains[i][j].row, chains[i][j].column);
                }
            }
        }
        
        $scope.$broadcast("hide-board");
        return self.endTurn();
    };
    
    function minFigure(figure){
        var min_row = _.minBy(figure, "row").row;
        var min_column = _.minBy(figure, "column").column;
        return  _.map(figure, function(coords){
            return {row: coords.row - min_row, column: coords.column - min_column}
        });
    };
    
    self.getChains = function(cells){
        var groups = [];
        var checked = [];

        for(var i = 0, len = cells.length; i < len; i++){
            if(!_.find(checked, cells[i])){
                var group = [cells[i]];
                findNeighbors(cells[i], group, checked);
                groups.push(group);
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
                var neighbor = _.find(cells, neighbors[i]);
                if(neighbor && !_.find(checked, neighbors[i])){
                    group.push(neighbor);
                    findNeighbors(neighbor, group, checked);
                }
            }	
        }
        
        return groups;
    };
    
    self.endTurn = function(){
        self.active_player.deactivateHand().refillHand(self.deck);
        self.board.deactivate();
        self.deactivateDice();
        self.resetDice();
        self.activeNextPlayer();
        
        if(!self.board.isFull() || self.active_player.hasActionCard()){
            return $q.resolve({text: "Jugar carta de la mano", fn: self.playCard});
        }
        else{
            return $q.resolve({text: "Lanzar 2 dados", fn: self.throwDice});
        }
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
    
    self.activeNextPlayer = function(){
        var active_player_index;
        for(var i = 0, len = self.players.length; i < len; i++){
            if(self.players[i].active){
                self.players[i].active = false;
                active_player_index = i;
            }
        }
        
        var next_index = (active_player_index + 1) % (self.players.length);
        self.players[next_index].active = true;
        self.active_player = self.players[next_index];
    };
    
});
