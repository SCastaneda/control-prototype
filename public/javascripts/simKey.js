//Creates a new Simulated Keyboard
function createSimKey(element_id){

    var o = new Object();

    o.element = document.getElementById(element_id); 

    o.moveLeft = function(){
        this.pressKey(37);
    }

    o.moveRight = function(){
        this.pressKey(39);
    }

    o.moveUp   = function(){
        this.pressKey(38);
    }


    //Simulates a keypress, keydown_time is optional default is 50ms
    o.pressKey = function(keyCode, keydown_time){

        if(!keydown_time){
            keydown_time = 50;
        }

        this.trigger(keyCode, 'keydown');

        setTimeout(function(o){
            o.trigger(keyCode, 'keyup');
        }, keydown_time, this);
        

    }



    //Raw Trigger Event
    o.trigger = function(keyCode, type){

        var keyEvent = document.createEvent('KeyboardEvent');

        // Override getters
        Object.defineProperty(keyEvent, 'keyCode', {
                    get : function() {
                        return this.keyCodeVal;
                    }
        });  

        Object.defineProperty(keyEvent, 'which', {
                    get : function() {
                        return this.keyCodeVal;
                    }
        });     

        //Find right initKeyBoardEvent function
        if (keyEvent.initKeyboardEvent) {
            keyEvent.initKeyboardEvent(type, true, true, document.defaultView, false, false, false, false, keyCode, keyCode);
        } else {
            keyEvent.initKeyEvent(type, true, true, document.defaultView, false, false, false, false, keyCode, 0);
        }

        keyEvent.keyCodeVal = keyCode;

        this.element.dispatchEvent(keyEvent);

    }


    return o;

}