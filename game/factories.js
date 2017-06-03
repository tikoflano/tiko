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

app.factory("Board", function(NumberCard){
    var self = this;
    
    var Board = function(width, height){
        this.rows = new Array(height);
        
        for(var i = 0; i < this.rows.length; i++){
            this.rows[i] = new Array(width);
        }
        
        this.reset();
    };
    
    Board.prototype.reset = function(){
        for(var i = 0, len = this.rows.length; i < len; i++){
            for(var j = 0, len2 = this.rows[i].length; j < len2; j++){
                this.rows[i][j] = new NumberCard();
            } 
        }
        angular.copy(_.shuffle(this.cards), this.cards);
    };
    
    Board.prototype.playCard = function(card){
        var selected_position;
        
        for(var i = 0, len = this.rows.length; i < len; i++){
            for(var j = 0, len2 = this.rows[i].length; j < len2; j++){
                if(this.rows[i][j].active){
                    if(selected_position){
                        console.log("Select just one position in the board");
                        return false;
                    }
                    selected_position = this.rows[i][j];
                }
            } 
        }
        
        if(!selected_position){
            console.log("Select one position in the board");
            return false;
        }
        
        angular.copy(card, selected_position);
        selected_position.active = false;
        return true;
    };
    
    return Board;
});