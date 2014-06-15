//Controls the drawing of all objects, 1000/60 => 60fps
function gameTick(fps, context, objects){

    setInterval(function(){

        // console.log("tick");
        context.clearRect(0,0,w,h);

        for(var id in objects){
            objects[id].draw();
        }


    }, fps);

}



//Returns a pixel object
function newPixelObject(context, color){

    var new_object = {
                        "pos":{},
                        "size":{}, 
                        "context":context, 
                        "color":color, 
                        "nextMove":{"right":0, "up":0}};

    new_object.pos.x = 0;
    new_object.pos.y = 0;

    new_object.size.width = 10;
    new_object.size.height = 10;

    //This function will be called for all elements on the screen.
    new_object.draw = function(){

        //Limit movement to canvas size X
        if(this.nextMove.right != 0){
            var new_x = this.pos.x + this.nextMove.right;

            if((new_x < w-20) && new_x >= 0){
                this.pos.x = new_x;
            }
        }

        //Limit movement to canvas size Y
        if(this.nextMove.up != 0){
            var new_y = this.pos.y + this.nextMove.up;

            if( (new_y <= h-20) && new_y >= 0){
                this.pos.y = new_y;
            }
        }

        this.context.fillStyle = this.color;
        this.context.fillRect(this.pos.x, this.pos.y, this.size.width, this.size.height);
    }

    new_object.moveRight = function(direction){
        this.nextMove.right = direction * X_VELOCITY;
    }

    new_object.moveUp = function(direction){
        this.nextMove.up = direction * -Y_VELOCITY;
    }

    return new_object;
}