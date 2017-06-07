app.factory("Player", function(PlayerCard){
    var Player = function(name, color){
        this.name = name;
        this.color = color;
        this.hand = [];
        this.active = false;
        this.player_cards = new Array(4);
        this.score = 0;
        
        for(var i = 0, len = this.player_cards.length; i < len; i++){
            this.player_cards[i] = new PlayerCard(this);
        }
    };
    
    Player.prototype.refillHand = function(deck){
        while(this.hand.length < 3){
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