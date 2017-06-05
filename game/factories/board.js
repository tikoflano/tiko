app.factory("Board", ["EmptyCard", "$q", function(EmptyCard, $q){
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
                this.rows[i][j] = new EmptyCard();
            } 
        }
        angular.copy(_.shuffle(this.cards), this.cards);
    };
    
    Board.prototype.playCard = function(card){
        var selected_position;
        var empty = this.isEmpty();
        
        for(var i = 0, len = this.rows.length; i < len; i++){
            for(var j = 0, len2 = this.rows[i].length; j < len2; j++){
                if(this.rows[i][j].active){
                    if(selected_position){
                        return $q.reject("Select just one position in the board");
                    }
                    selected_position = {row: i, column: j};
                }
            } 
        }
        
        
        if(!selected_position){
            return $q.reject("Select one position in the board");
        }
        
        if(empty && (selected_position.row != (this.rows.length - 1) / 2 || selected_position.column != (this.rows[0].length - 1) / 2)){
            return $q.reject("The first card must be placed in the center");
        }
        
        if(!empty && (
                (selected_position.row <= 0 || this.rows[selected_position.row - 1][selected_position.column].isEmpty()) &&
                (selected_position.column + 1 >= this.rows[selected_position.row].length || this.rows[selected_position.row][selected_position.column + 1].isEmpty()) &&
                (selected_position.row + 1 >= this.rows.length || this.rows[selected_position.row + 1][selected_position.column].isEmpty()) &&
                (selected_position.column <= 0 || this.rows[selected_position.row][selected_position.column - 1].isEmpty())
            )){
            return $q.reject("Select one position next to a number card in the board");
        }
        
        
        
        angular.copy(card, this.rows[selected_position.row][selected_position.column]);
        this.rows[selected_position.row][selected_position.column].active = false;
        return $q.resolve();
    };
    
    Board.prototype.isEmpty = function(){
        for(var i = 0, len = this.rows.length; i < len; i++){
            for(var j = 0, len2 = this.rows[i].length; j < len2; j++){
                if(!this.rows[i][j].isEmpty()){
                    return false;
                }
            } 
        }
        
        return true;
    };
    
    return Board;
}]);