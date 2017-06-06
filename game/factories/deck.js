app.factory("Deck", function(NumberCard){
    var self = this;
    
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
        
        this.shuffle();
    };
    
    
    Deck.prototype.shuffle = function(){
        angular.copy(_.shuffle(this.cards), this.cards);
    };
    
    return Deck;
});