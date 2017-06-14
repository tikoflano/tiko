app.factory("Board", ["EmptyCard", function(EmptyCard){
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
                if(this.rows[i][j].type != "empty"){
                    return false;
                }
            } 
        }
        
        return true;
    };
    
    Board.prototype.isFull = function(){
        for(var i = 0, len = this.rows.length; i < len; i++){
            for(var j = 0, len2 = this.rows[i].length; j < len2; j++){
                if(this.rows[i][j].type == "empty"){
                    return false;
                }
            } 
        }
        
        return true;
    };
    
    Board.prototype.deactivate = function(){
        for(var i = 0, len = this.rows.length; i < len; i++){
            for(var j = 0, len2 = this.rows[i].length; j < len2; j++){
                this.rows[i][j].active = false;
            } 
        }
    };
    
    Board.prototype.removeCardInCell = function(row, column){
        this.rows[row][column] = new EmptyCard();
    };
    
    Board.prototype.removeRow = function(index){
        var width = this.rows[index].length;
        this.rows.splice(index, 1);
        
        this.rows.unshift(new Array(width));
        for(var i = 0; i < width; i++){
            this.rows[0][i] = new EmptyCard();
        }
        
    };
    
    return Board;
}]);