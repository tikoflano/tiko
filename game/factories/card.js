app.factory("Card", function(){
    var Card = function(){
        this.type = null;
        this.active = false;
    };
    
    Card.prototype.isEmpty = function(){return false;};
    
    return Card;
});

app.factory("EmptyCard", function(Card){
    var EmptyCard = function(){
        this.type = "empty";
    };
    EmptyCard.prototype = new Card();
    EmptyCard.prototype.constructor = EmptyCard;
    
    EmptyCard.prototype.isEmpty = function(){return true;};
    
    return EmptyCard;
});

app.factory("NumberCard", function(Card, $q){
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
    
    NumberCard.prototype.play = function(board){
        var selected_position;
        var empty = board.isEmpty();
        
        for(var i = 0, len = board.rows.length; i < len; i++){
            for(var j = 0, len2 = board.rows[i].length; j < len2; j++){
                if(board.rows[i][j].active){
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
        
        if(!board.rows[selected_position.row][selected_position.column].isEmpty()){
            return $q.reject("Select an empty position in the board");
        }
        
        if(empty && (
                ((selected_position.row != Math.floor((board.rows.length - 1) / 2)) && (selected_position.row != Math.ceil((board.rows.length - 1) / 2))) ||
                ((selected_position.column != Math.floor((board.rows[0].length - 1) / 2)) && (selected_position.column != Math.ceil((board.rows[0].length - 1) / 2)))
            )){
            return $q.reject("The first card must be placed in the center");
        }
        
        if(!empty && (
                (selected_position.row <= 0 || board.rows[selected_position.row - 1][selected_position.column].isEmpty()) &&
                (selected_position.column + 1 >= board.rows[selected_position.row].length || board.rows[selected_position.row][selected_position.column + 1].isEmpty()) &&
                (selected_position.row + 1 >= board.rows.length || board.rows[selected_position.row + 1][selected_position.column].isEmpty()) &&
                (selected_position.column <= 0 || board.rows[selected_position.row][selected_position.column - 1].isEmpty())
            )){
            return $q.reject("Select one position next to a card in the board");
        }
        
        board.rows[selected_position.row][selected_position.column] = this;
        board.rows[selected_position.row][selected_position.column].active = false;
        return $q.resolve();
    };
    
    return NumberCard;
});

app.factory("PlayerCard", function(Card){
    var PlayerCard = function(player){
        this.type = "player";
        this.player = player;
    };
    PlayerCard.prototype = new Card();
    PlayerCard.prototype.constructor = PlayerCard;
    
    return PlayerCard;
});

app.factory("ActionCard", function(Card){
    var self = this;
    
    var ActionCard = function(action){
        this.type = "action";
        this.action = action;
    };
    ActionCard.prototype = new Card();
    ActionCard.prototype.constructor = ActionCard;
    
    return ActionCard;
});