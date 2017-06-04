app.factory("Board", ["NumberCard", "$q", function(NumberCard, $q){
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
                        return $q.reject("Select just one position in the board");
                    }
                    selected_position = this.rows[i][j];
                }
            } 
        }
        
        if(!selected_position){
            return $q.reject("Select one position in the board");
        }
        
        angular.copy(card, selected_position);
        selected_position.active = false;
        return $q.resolve();
    };
    
    return Board;
}]);