app.factory("Card", function(){
    var self = this;
    
    var Card = function(){
        this.type = null;
        this.active = false;
    };
    
    Card.prototype.isEmpty = function(){return false;};
    
    return Card;
});

app.factory("EmptyCard", function(Card){
    var self = this;
    
    var EmptyCard = function(){
        this.type = "empty";
    };
    EmptyCard.prototype = new Card();
    EmptyCard.prototype.constructor = EmptyCard;
    
    EmptyCard.prototype.isEmpty = function(){return true;};
    
    return EmptyCard;
});

app.factory("NumberCard", function(Card){
    var self = this;
    
    var NumberCard = function(a, b, c){
        this.type = "number";
        this.numbers = {
            black: a,
            green: b,
            blue: c,
            white: null
        };
    };
    NumberCard.prototype = new Card();
    NumberCard.prototype.constructor = NumberCard;
    
    return NumberCard;
});

app.factory("PlayerCard", function(Card){
    var self = this;
    
    var PlayerCard = function(player){
        this.type = "player";
        this.player = player;
    };
    PlayerCard.prototype = new Card();
    PlayerCard.prototype.constructor = PlayerCard;
    
    return PlayerCard;
});