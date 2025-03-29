import { myInput } from "./myInput.js";

export class Player extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, texture){
        super(scene, x, y, texture);
        
        scene.physics.add.existing(this);
        scene.add.existing(this);
        
        this.scene = scene;
   
        this.initProperties()
        this.scene.events.on("update", this.update, this);
    }
    

    initProperties(){
        this.graphics = this.scene.add.graphics()
            .setScrollFactor(1)
            .setDepth(209);
        this.scene.add.existing(this.graphics);
        
        this.isOnSlope = false;
        
        //CREATE Player
        this.speedX = 75;
        this.speedY = 400;
        this.bottomTile;
        this.gravity = 982;
        this.body.gravity.y = this.gravity;
        this.jumping;
        
        this
            .setDepth(200)
            .setCollideWorldBounds(true)
            .setSize(15, 32)
    }
    
    jump(){
        this.body.setAllowGravity(true);
        this.body.setGravityY(this.gravity);
        this.setVelocityY(-this.speedY);
    }
    handleMovement(){
        //movement
        if(myInput.keys[0] === "left"){
            this.play("run", true);
            this.setVelocityX(-this.speedX);
            this.setFlipX(true);
        }
        else if(myInput.keys[0] === "right"){
            this.play("run", true);
            this.setVelocityX(this.speedX);
            this.setFlipX(false);
        }
        else{
            this.play("idle");
            this.body.setVelocityX(0); 
        }
        
        if(this.body.onFloor() && myInput.keys[0]==="up"){
            this.play("jump", true);
            this.jump();
        }
 
    }
    
    handleInterSection(){
        const { left_to_right_slopes, left_to_right_boxes, right_to_left_slopes, right_to_left_boxes } = this.scene.slopes;
        //left slopes
        left_to_right_boxes.forEach(box=>{
            if(this.scene.physics.world.intersects(this.body, box.body)){
                left_to_right_slopes.forEach(slope=>{
                    if(this.intersects(this, slope)){
                        this.isOnSlope = true;
                        if(myInput.keys[0]=== "up"){
                            this.jump();
                        }
                        else{
                            this.isOnSlope = false;
                            const dX = this.body.right - box.body.left;
                            this.body.position.y = box.body.bottom - this.height - dX;
                            if(myInput.keys[0] !== "right" ){
                                this.body.position.x -= 0.6; //auto slide
                                this.setFlipX(true);
                            }
                            this.body.setAllowGravity(false);
                        }
                    }
                })
            }
            else{
                this.body.setAllowGravity(true);
            }
        })
        //right slopes
        right_to_left_boxes.forEach(box=>{
            if(this.scene.physics.world.intersects(this.body, box.body)){
                right_to_left_slopes.forEach(slope=>{
                    if(this.intersects(this, slope)){
                        this.isOnSlope = true;
                        if(myInput.keys[0]=== "up"){
                            this.jump();
                        }
                        else{
                            this.isOnSlope = false;
                            const dX = box.body.right - this.body.left;
                            this.body.position.y = box.body.bottom - this.height - dX;
                            if(myInput.keys[0] !== "left" ){
                                this.body.position.x += 0.6; //auto slide
                                this.setFlipX(false);
                            }
                                this.body.setAllowGravity(false);
                        }
                    }
                })
            }
            else {
                this.body.setAllowGravity(true);
            }
        })
    }
    //CREATE Intersect function
    intersects(rectangleBody, triangle){
        return Phaser.Geom.Intersects.RectangleToTriangle(rectangleBody.getBounds(), triangle);
    }
    
    update(time, delta){
        this.handleMovement();
        this.handleInterSection();
    }
}