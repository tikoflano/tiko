app.controller("GameController", function($scope, $q, Config, Utils, TogetherJS, Player, Board, PlayerCard) {
    var self = this;
    
    self.config = Config;
    self.message = false;
    self.phase = {text: "Esperando jugadores"};
    
    self.loading = false;
    self.local_player = false;
    self.active_player = false;
    self.host = false;
    
    self.deck = false;
    self.board = new Board(Config.board.width, Config.board.height);
    self.dice = [
        {color: "black", selected: false, number: null},
        {color: "green", selected: false, number: null},
        {color: "blue", selected: false, number: null}
    ];
    self.players = [];    
    self.togetherjs = new TogetherJS(self);
    
    self.spacebarPressed = function($event){
        if(angular.element($event.target).is("body")){
            $event.preventDefault();
        }
        if(self.phase &&  $event.key == " "){
            self.playPhase();
        }
    };
    
    self.isMyTurn = function(){
        return self.active_player && self.local_player == self.active_player;
    };
    
    self.newGame = function(){
        self.loading = true;
        self.togetherjs.run();
    };
    
    self.showBoard = function(player){
        $scope.$broadcast("show-board", player);
    };
    
    self.clickCard = function(card, ui_element){
        if(self.isMyTurn()){
            card.active = !card.active;
            self.togetherjs.send({type: "card-clicked", element: self.togetherjs.elementFinder(ui_element)});
        }        
    };
    
    self.clickDie = function(die, ui_element){
        if(self.isMyTurn()){
            die.active = !die.active;
            self.togetherjs.send({type: "die-clicked", element: self.togetherjs.elementFinder(ui_element)});
        }        
    };
    
    self.playPhase = function(){
        self.message = false;
        
        if(_.isFunction(self.phase.fn)){
            self.phase.fn(self.phase.args)
            .then(function(next_phase){
                if(self.isMyTurn()){
                    self.togetherjs.send({type: "play-phase", phase: self.phase});
                }
                if(next_phase){
                    self.phase = next_phase;
                }
            })
            .catch(function(error_message){
                if(error_message && self.isMyTurn()){
                    self.message = {type: "error", header: "", message: error_message};
                }
            });
        }
    };
    
    self.addPlayer = function(name, color, id){
        self.message = false;
        if(!name){
            self.message = {type: "error", header: "Error", message: "Enter player's name"};
            return false;
        }
        
        if(self.players.length >= Config.player.amount){
            self.message = {type: "error", header: "Error", message: "Can't add more players"};
            return false;
        }
        var player = new Player(name, color, id);
        self.players.push(player);
        
        if(self.players.length == Config.player.amount){
            if(self.host){
                self.phase = {text: "Iniciar partida", fn: self.startGame};
            }
            else{
                self.phase = {text: "Esperando inicio de partida", fn: function(){return $q.resolve();}};
            }
        }
        
        return player;
    };
    
    self.removePlayer = function(player){
        for(var i = 0, len = self.board.rows.length; i < len; i++){
            for(var j = 0, len2 = self.board.rows[i].length; j < len2; j++){
                if(self.board.rows[i][j].type == "player" && self.board.rows[i][j].player == player){
                    self.board.removeCardInCell(i, j);
                }
            }
        }
        
        if(player == self.active_player){
            self.endTurn();
        }
        
        _.pull(self.players, player);

        if(!self.active_player){
            self.phase = {text: "Esperando jugadores"};
        }
        else if(self.active_player && self.players.length == 1){
            self.endGame();
        }
    };
    
    self.startGame = function(order){
        if(self.host){
            order = _.shuffle(_.map(self.players, "id"));
            self.togetherjs.send({type: "start-game", order: order});
        }
        
        self.players = _.orderBy(self.players, function(player){
            return _.indexOf(order, player.id);
        });
        
        _.forEach(self.players, function(player){
            player.refillHand(self.deck);
        });
        
        self.players[0].active = true;
        self.active_player = self.players[0];
        
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
    
            if(player.finished){
                return self.endTurn();
            }
            else{
                return next_phase;
            }
        });
    };
    
    self.throwDice = function(amount){    
        if(self.isMyTurn()){
            amount = angular.isDefined(amount) ? amount : 2;
            var selected_dice = _.filter(self.dice, "active");

            if(selected_dice.length != amount){
                return $q.reject("Select "+amount+" dice to throw");
            }

            _.forEach(_.filter(self.dice, "active"), function(die){
                die.number = self.config.debug ? self.number :_.random(1, 6);
            });
            
            self.togetherjs.send({type: "dice-thrown", dice: self.dice});
        }
        
        //Check hit cards
        var hit_cards = [];
        for(var i = 0, len = self.board.rows.length; i < len; i++){
            for(var j = 0, len2 = self.board.rows[i].length; j < len2; j++){
                if(self.board.rows[i][j].type == "number"){
                    _.forEach(_.filter(self.dice, "active"), function(die){
                        if(self.board.rows[i][j].numbers[die.color] && die.number == self.board.rows[i][j].numbers[die.color]){
                            self.board.rows[i][j].hit = true;
                            return false;
                        }
                    });
                }
            } 
        }
        
        return $q.resolve({text: "Comprobar resultados", fn: self.checkHits, args: hit_cards});
    };
    
    self.checkHits = function(){
        //Get player cards and hit cards coords
        var player_cards = [];
        var hit_cards = [];
        for(var i = 0, len = self.board.rows.length; i < len; i++){
            for(var j = 0, len2 = self.board.rows[i].length; j < len2; j++){
                if(self.board.rows[i][j].type == "player" && self.board.rows[i][j].player == self.active_player){
                    player_cards.push({row: i, column: j});
                }
                else if(self.board.rows[i][j].type == "number"){
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
        else if(hit_cards.length <= self.active_player.player_cards.length){
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
                self.board.rows[i][j].hit = false;
                if(self.board.rows[i][j].type == "player" && self.board.rows[i][j].player == self.active_player){
                    cells.push({row: i, column: j});
                }
            }
        }
        
        var chains = _.filter(Utils.getChains(cells), function(group){ return group.length >= Config.figure.size; });
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
            self.board.rows[card.row][card.column].active = false;
            self.active_player.player_cards.push(self.board.rows[card.row][card.column]);
            self.board.removeCardInCell(card.row, card.column);
        });
        
        return self.checkHits();
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
        
        var chains = _.filter(Utils.getChains(selected_cards), function(group){ return group.length == Config.figure.size; });
        if(chains.length == 0){
            return $q.reject("Select one group of "+Config.figure.size+" adyacent cards of your color");
        }
        
        if(chains.length > 1){
            return $q.reject("Select just one group of "+Config.figure.size+" adyacent cards of your color");
        }
        
        _.forEach(selected_cards, function(card){
            self.board.rows[card.row][card.column].active = false;
            self.active_player.player_cards.push(self.board.rows[card.row][card.column]);
            self.board.removeCardInCell(card.row, card.column);
        });
        
        if(!self.figureCanBeAdded(selected_cards)){
            self.active_player.finished = true;
            return self.endTurn();
        }
        
        $scope.$broadcast("show-board", self.active_player, selected_cards);
        return $q.resolve({text: "Agregar figura", fn: self.addFigure, args: selected_cards});
    };
    
    self.figureCanBeAdded = function(selected_cards){
        //Check if the figure can be added
        var min_figure = Utils.minFigure(selected_cards);
        
        var can_be_added = false;
        for(var i = 0, len = self.active_player.board.rows[0].length; i < len; i++){
            var fits = true;
            for(var j = 0, len2 = min_figure.length; j < len2; j++){
                if((min_figure[j].row) >= self.active_player.board.rows.length || 
                        (min_figure[j].column + i) >= self.active_player.board.rows[0].length || 
                        self.active_player.board.rows[min_figure[j].row][min_figure[j].column + i].type != "empty"){
                    fits = false;
                    break;
                }
            }
            if(fits){
                can_be_added = true;
                break;
            }
        }
        
        return can_be_added;
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
        
        var min_figure = Utils.minFigure(figure);
        var min_selected_cards = Utils.minFigure(selected_cards);
        
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
        
        var opening = true;
        for(var i = 0, len = selected_cards.length; i < len; i++){
            for(var a = 0; a <= selected_cards[i].row; a++){
                if(self.active_player.board.rows[a][selected_cards[i].column].type != "empty"){
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
        
        var chains = Utils.getChains(occupied_cells);
        
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
        return self.checkCompleteLines();
    };
    
    self.checkCompleteLines = function(){
        var completed_lines = [];
        
        for(var i = 0, len = self.active_player.board.rows.length; i < len; i++){
            var completed_line = true;
            for(var j = 0, len2 = self.active_player.board.rows[i].length; j < len2; j++){
                if(self.active_player.board.rows[i][j].type == "empty"){
                    completed_line = false;
                    break;
                }
            } 
            if(completed_line){
                completed_lines.push(i);
            }
        }
        
        if(completed_lines.length){      
            self.active_player.score += (2 * completed_lines.length) - 1;

            for(var i = 0, len = completed_lines.length; i < len; i++){
                self.active_player.board.removeRow(completed_lines[i]);
            }
        }
        
        return self.endTurn();
    };
    
    self.endTurn = function(){
        if(self.isMyTurn()){
            self.togetherjs.send({type: "play-phase"});
        }
        
        var playing_players = _.filter(self.players, {finished: false});
        var finished_players = _.filter(self.players, {finished: true});
        
        if(playing_players.length == 0){
            return self.endGame();
        }
        else if(playing_players.length == 1 && self.players.length > 1){
            var max_score = 0;
            for(var i = 0, len = finished_players.length; i < len; i++){
                max_score = Math.max(max_score, finished_players[i].score);
            }
            
            if(playing_players[0].score > max_score){
                return self.endGame();
            }
        }
        else if(self.active_player.score >= self.config.game.target_score){
            return self.endGame();
        }
        
        self.active_player.deactivateHand().refillHand(self.deck);
        self.board.deactivate();
        
        _.forEach(self.dice, function(die){
            die.number = null;
            die.active = false;
        });
        
        return self.nextPlayer();
    }; 
    
    self.nextPlayer = function(){
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
        
        if(!self.board.isFull() || self.active_player.hasActionCard()){
            return $q.resolve({text: "Jugar carta de la mano", fn: self.playCard});
        }
        else{
            return $q.resolve({text: "Lanzar 2 dados", fn: self.throwDice});
        }
    };
    
    self.endGame = function(){
        var winning_score = _.maxBy(self.players, "score").score;
        var winners = _.map(_.filter(self.players, {score: winning_score}), "name");
        self.message = {type: "positive", header: "Game Over", message: (winners.length == 1 ? "Winner: " + winners[0] : "Winners: " + _.join(winners, ", "))+" with "+winning_score+" points"};
        self.phase = false;
        self.active_player = false;
        
        return $q.reject();
    };
});
