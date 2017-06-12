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
                var player = TogetherJS.require("peers").Self;
                ctrl.local_player = ctrl.addPlayer(player.name ? player.name : player.defaultName, player.color);
                ctrl.loading = false;
                if(!msg.peerCount){
                    ctrl.deck = new Deck();
                    ctrl.local_player.refillHand(ctrl.deck);
                }
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
                TogetherJS.send({type: "get-deck", deck: ctrl.deck});
                ctrl.addPlayer(msg.name, msg.color).refillHand(ctrl.deck);
            });
        });
        
//        TogetherJS.hub.on("togetherjs.hello-back", function(msg){
//            $timeout(function(){
//                var player = ctrl.addPlayer(msg.name, msg.color);
//                player.refillHand(ctrl.deck);
//            });
//        });

        TogetherJS.hub.on("get-deck", function(msg){
            $timeout(function(){
                ctrl.deck = msg.deck;
                ctrl.local_player.refillHand(ctrl.deck);
            });
        });
        
        TogetherJS.hub.on("togetherjs.peer-updated", function(msg){
            $timeout(function(){
                console.log("TIKO", msg)
            });
        });
    };
    
    TJS.prototype.run = function(){
        TogetherJS();
    };
    
    TJS.prototype.isRunning = function(){
        return TogetherJS.running;
    };
    
    return TJS;
});