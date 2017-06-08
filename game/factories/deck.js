app.factory("Deck", function(NumberCard, ActionCard, $q){
    var Deck = function(){
        this.cards = [];
        
        for(var i = 1; i <= 6; i++){
            for(var j = 1; j <= 6; j++){                
                this.cards.push(new NumberCard(null, i, j));
            }
            for(var j = 1; j <= 6; j++){
                this.cards.push(new NumberCard(i,null , j));
            }
            for(var j = 1; j <= 6; j++){
                this.cards.push(new NumberCard(i, j, null));
            }
        }
        
        for(var i = 1; i <= 6; i++){
            this.cards.push(new NumberCard(i, null, null));
            this.cards.push(new NumberCard(null, i, null));
            this.cards.push(new NumberCard(null, null, i));
            this.cards.push(new NumberCard(i, i, i));
        }
        
        //Action Cards        
        this.cards.unshift(new ActionCard("Finalizar turno", function(ctrl){
            ctrl.active_player.removeCard(this);
            return ctrl.endTurn();
        }));
        
        this.cards.unshift(new ActionCard("Lanzar 3 dados", function(ctrl){
            if(ctrl.board.isEmpty()){
                return $q.reject("No se puede usar esta carta con el tablero vacío");
            }
            _.forEach(ctrl.dice, function(die){
                die.active = true;
                die.number = _.random(1, 6);
            });
            return $q.resolve({text: "Comprobar resultados", fn: ctrl.checkHits});
        }));
             
        this.cards.unshift(new ActionCard("Intercambiar carta al rival", function(ctrl){
            function reset(){
                _.forEach(ctrl.players, function(player) {
                    player.active = true;
                });
            }            
            
            reset();
            return $q.resolve({text: "Seleccionar una carta de la mano y una del rival", fn: function(){
                _.forEach(ctrl.players, function(player) {
                      player.active = false;
                });
                ctrl.active_player.active = true;
                
                var target_players = _.filter(ctrl.players, function(player){
                    return !player.active && _.filter(player.hand, "active").length > 0;
                });
                
                if(target_players.length != 1){
                    reset();
                    return $q.reject("Select a card from one opponent");
                }
                
                var target_cards = _.filter(target_players[0].hand, "active");
                if(target_cards.length != 1){
                    reset();
                    return $q.reject("Select just one card from your opponent");
                }
                
                var active_player_cards = _.filter(ctrl.active_player.hand, "active");
                if(active_player_cards.length != 1){
                    reset();
                    return $q.reject("Select one card from your hand");
                }
                
                target_players[0].hand.push(active_player_cards[0]);
                ctrl.active_player.hand.push(target_cards[0]);
                
                target_players[0].removeCard(target_cards[0]);
                ctrl.active_player.removeCard(active_player_cards[0]);
                
                target_cards[0].active = false;
                active_player_cards[0].active = false;
                
                return ctrl.board.isEmpty() ? ctrl.endTurn() : $q.resolve({text: "Lanzar 2 dados", fn: ctrl.throwDice});                
            }});
        }));
        
        this.shuffle();
    };
    
    
    Deck.prototype.shuffle = function(){
        angular.copy(_.shuffle(this.cards), this.cards);
    };
    
    return Deck;
});