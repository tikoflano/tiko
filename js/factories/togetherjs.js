app.factory("TogetherJS", function($timeout, Deck){    
    TogetherJS.config("dontShowClicks", true);
    TogetherJS.config("suppressJoinConfirmation", true);
    
    var TJS = function(ctrl){        
        TogetherJS.on("close", function(){
            $timeout(function(){
                TogetherJS.running = false;
                ctrl.players = [];
                ctrl.deck = {};
            });
        });

        TogetherJS.hub.on("togetherjs.init-connection", function(msg){
            $timeout(function(){
                if(!msg.peerCount){
                    ctrl.deck = new Deck();
                    ctrl.host = true;
                }
                
                var local_peer = TogetherJS.require("peers").Self;
                ctrl.local_player = ctrl.addPlayer(local_peer.name ? local_peer.name : local_peer.defaultName, local_peer.color, local_peer.id);
                ctrl.loading = false;
            });

            var session = TogetherJS.require("session");
            session.on("self-updated", function(){
                $timeout(function(){
                    var player = TogetherJS.require("peers").Self;
                    ctrl.local_player.name = player.name ? player.name : player.defaultName;
                    ctrl.local_player.color = player.color;
                });
            });
        });

        TogetherJS.hub.on("togetherjs.hello", function(msg){
            $timeout(function(){
                if(!_.find(ctrl.players, {id: msg.peer.id})){
                    var new_player = ctrl.addPlayer(msg.peer.name, msg.peer.color, msg.peer.id);
                }
                if(ctrl.host){
                    TogetherJS.send({type: "get-deck", deck_order: ctrl.deck.order});
                }
            });
        });
        
        TogetherJS.hub.on("togetherjs.hello-back", function(msg){
            $timeout(function(){
                var local_peer = TogetherJS.require("peers").Self;
                if(!_.find(ctrl.players, {id: local_peer.id})){
                    ctrl.local_player = ctrl.addPlayer(local_peer.name ? local_peer.name : local_peer.defaultName, local_peer.color, local_peer.id);
                }
                if(!_.find(ctrl.players, {id: msg.peer.id})){
                    var new_player = ctrl.addPlayer(msg.peer.name, msg.peer.color, msg.peer.id);
                }
            });
        });
        
        TogetherJS.hub.on("togetherjs.peer-update", function(msg){
            $timeout(function(){
                var player = _.find(ctrl.players, {id: msg.peer.id});
                player.name = msg.peer.name;
                player.color = msg.peer.color;
            });
        });

        TogetherJS.hub.on("get-deck", function(msg){
            $timeout(function(){
                ctrl.deck = new Deck(msg.deck_order);
            });
        });
        
        TogetherJS.hub.on("start-game", function(msg){
            $timeout(function(){
                ctrl.phase = {text: "Iniciar partida", fn: ctrl.startGame, args: msg.order};
                ctrl.playPhase();
            });
        });
        
        TogetherJS.hub.on("card-clicked", function(msg){
            $timeout(function(){
                var elementFinder = TogetherJS.require("elementFinder");
                var element = angular.element(elementFinder.findElement(msg.element)).scope();
                
                element.card.active = !element.card.active;
            });
        });
        
        TogetherJS.hub.on("die-clicked", function(msg){
            $timeout(function(){
                var elementFinder = TogetherJS.require("elementFinder");
                var element = angular.element(elementFinder.findElement(msg.element)).scope();
                
                element.die.active = !element.die.active;
            });
        });
        
        TogetherJS.hub.on("playerboard-card-clicked", function(msg){
            $timeout(function(){
                ctrl.active_player.board.rows[msg.coords.row][msg.coords.col].active = !ctrl.active_player.board.rows[msg.coords.row][msg.coords.col].active;
            });
        });
        
        TogetherJS.hub.on("play-phase", function(){
            $timeout(function(){
                ctrl.playPhase();
            });
        });
        
        TogetherJS.hub.on("dice-thrown", function(msg){
            $timeout(function(){
                ctrl.dice = msg.dice;
            });
        });
        
        TogetherJS.hub.on("end-turn", function(){
            $timeout(function(){
                ctrl.playPhase();
            });
        });
    };
    
    TJS.prototype.run = function(){
        TogetherJS();
    };
    
    TJS.prototype.isRunning = function(){
        return TogetherJS.running;
    };
    
    TJS.prototype.send = function(event){
        TogetherJS.send(event);
    };
    
    TJS.prototype.elementFinder = function(element){
        var elementFinder = TogetherJS.require("elementFinder");
        return elementFinder.elementLocation(element);
    };
    
    return TJS;
});