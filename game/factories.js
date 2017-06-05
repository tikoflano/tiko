app.factory("Player", function(){
    var self = this;
    
    var Player = function(name, color){
        this.name = name;
        this.color = color;
        this.hand = [];
        this.active = false;
    };
    
    Player.prototype.refillHand = function(deck){
        while(this.hand.length < 3){
            this.hand.push(deck.cards.shift());
        }
        return this;
    };
    
    Player.prototype.removeCard = function(card){
        _.remove(this.hand, function(x){
            return x == card;
        });
        return this;
    };
    
    return Player;
});

app.factory("NumberCard", function(){
    var self = this;
    
    var NumberCard = function(a, b, c){
        this.numbers = {
            black: a,
            green: b,
            blue: c,
            white: null
        };
        this.active = false;
    };
    
    NumberCard.prototype.isEmpty = function(){
        console.log(_.filter(this.numbers, function(o) { return o; }).length === 0)
        return _.filter(this.numbers, function(o) { return o; }).length === 0;
    };
    
    return NumberCard;
});

app.factory("Deck", function(NumberCard){
    var self = this;
    
    var Deck = function(){
        this.cards = [];
        
        for(var i = 1; i <= 6; i++){
            for(var j = 1; j <= 6; j++){
                this.cards.push(new NumberCard(null, i, j));
            }
            for(var j = 1; j <= 6; j++){
                this.cards.push(new NumberCard(i,null, j));
            }
            for(var j = 1; j <= 6; j++){
                this.cards.push(new NumberCard(i, j, null));
            }
        }
        
        this.shuffle();
    };
    
    
    Deck.prototype.shuffle = function(){
        angular.copy(_.shuffle(this.cards), this.cards);
    };
    
    return Deck;
});