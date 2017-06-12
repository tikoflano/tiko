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
        this.play = function(ctrl){
            var selected_position;
            var empty = ctrl.board.isEmpty();

            for(var i = 0, len = ctrl.board.rows.length; i < len; i++){
                for(var j = 0, len2 = ctrl.board.rows[i].length; j < len2; j++){
                    if(ctrl.board.rows[i][j].active){
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

            if(!ctrl.board.rows[selected_position.row][selected_position.column].isEmpty()){
                return $q.reject("Select an empty position in the board");
            }

            if(empty && (
                    ((selected_position.row != Math.floor((ctrl.board.rows.length - 1) / 2)) && (selected_position.row != Math.ceil((ctrl.board.rows.length - 1) / 2))) ||
                    ((selected_position.column != Math.floor((ctrl.board.rows[0].length - 1) / 2)) && (selected_position.column != Math.ceil((ctrl.board.rows[0].length - 1) / 2)))
                )){
                return $q.reject("The first card must be placed in the center of the board");
            }

            if(!empty && (
                    (selected_position.row <= 0 || ctrl.board.rows[selected_position.row - 1][selected_position.column].isEmpty()) &&
                    (selected_position.column + 1 >= ctrl.board.rows[selected_position.row].length || ctrl.board.rows[selected_position.row][selected_position.column + 1].isEmpty()) &&
                    (selected_position.row + 1 >= ctrl.board.rows.length || ctrl.board.rows[selected_position.row + 1][selected_position.column].isEmpty()) &&
                    (selected_position.column <= 0 || ctrl.board.rows[selected_position.row][selected_position.column - 1].isEmpty())
                )){
                return $q.reject("Select one position next to a card in the board");
            }

            ctrl.board.rows[selected_position.row][selected_position.column] = this;
            ctrl.board.rows[selected_position.row][selected_position.column].active = false;

            return $q.resolve({text: "Lanzar 2 dados", fn: ctrl.throwDice});
        };
    };
    NumberCard.prototype = new Card();
    NumberCard.prototype.constructor = NumberCard;
    
    return NumberCard;
});

app.factory("PlayerCard", function(Card){
    var PlayerCard = function(player){
        this.type = "player";
//        this.player = player;
        this.color = player.color;
    };
    PlayerCard.prototype = new Card();
    PlayerCard.prototype.constructor = PlayerCard;
    
    return PlayerCard;
});

app.factory("ActionCard", function(Card){
    var ActionCard = function(text, action){
        this.type = "action";
        this.text = text;
        this.play = action;
    };
    ActionCard.prototype = new Card();
    ActionCard.prototype.constructor = ActionCard;
    
    return ActionCard;
});