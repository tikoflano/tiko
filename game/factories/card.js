app.factory("NumberCard", function(){
    var self = this;
    
    var NumberCard = function(a, b, c){
        this.type = "number";
        this.numbers = {
            black: a,
            green: b,
            blue: c,
            white: null
        };
        this.active = false;
    };
    
    NumberCard.prototype.isEmpty = function(){
        return _.filter(this.numbers, function(number) { return number; }).length === 0;
    };
    
    return NumberCard;
});

app.factory("PlayerCard", function(){
    var self = this;
    
    var PlayerCard = function(player){
        this.type = "player";
        this.player = player;
        this.active = false;
    };
    
    return PlayerCard;
});