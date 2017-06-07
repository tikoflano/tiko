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