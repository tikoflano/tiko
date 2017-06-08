app.factory("Player", function(Config, PlayerCard, Board){
    var Player = function(name, color){
        this.name = name;
        this.color = color;
        this.hand = [];
        this.active = false;
        this.player_cards = new Array(Config.player.player_cards);
        this.board = new Board(Config.player.board.width, Config.player.board.height);
        this.score = 0;
        
        for(var i = 0, len = this.player_cards.length; i < len; i++){
            this.player_cards[i] = new PlayerCard(this);
        }
    };
    
    Player.prototype.hasActionCard = function(){
        for(var i = 0, len = this.hand.length; i < len; i++){
            if(this.hand[i].type == "action"){
                return true;
            }
        }
        
        return false;
    };
    
    Player.prototype.refillHand = function(deck){
        while(this.hand.length < Config.player.hand_size){
            this.hand.push(deck.cards.shift());
        }
        return this;
    };
    
    Player.prototype.removeCard = function(card){
        _.remove(this.hand, card);
        return this;
    };
    
    Player.prototype.deactivateHand = function(){
        _.each(this.hand, function(card){ card.active = false; });
        return this;
    };
    
    return Player;
});
