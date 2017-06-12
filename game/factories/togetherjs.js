app.factory("TogetherJS", function($timeout, Deck, $window){    
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
            session.on("self-updated", function() {
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
                    TogetherJS.send({type: "get-deck", deck: ctrl.deck});
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
                ctrl.deck = msg.deck;
            });
        });
        
        TogetherJS.hub.on("start-game", function(msg){
            $timeout(function(){
                ctrl.phase = {text: "Iniciar partida", fn: ctrl.startGame, args: msg.order};
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
    
    return TJS;
});