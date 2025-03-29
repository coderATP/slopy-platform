import { Player } from "./Player.js";

export class PlayScene extends Phaser.Scene{
    constructor(config){
        super("PlayScene");
        
        this.config = config;
        this.revealControlButtons()
        this.cameraZoomFactor = config.zoomFactor;
    }
    loadAnims() {
        this.anims.create({
            key: "run",
            frames: this.anims.generateFrameNumbers("player", {
                start: 0,
                end: 3,
                first: 1
            }),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
          key: "idle",
          frames: this.anims.generateFrameNumbers("player", {
            start: 0,
            end: 0
          })
        });
        this.anims.create({
          key: "jump",
          frames: this.anims.generateFrameNumbers("player", {
            start: 3,
            end: 3
          })
        }); 
    }
    create(){
        //graphics
        this.graphics = this.add.graphics().setDepth(2000);
        //debug
        this.debug = false;
        this.createDebug();
        //text
        this.createText();
        //tilemap
        this.map = this.createMap();
        this.mapLayers = this.createMapLayers(this.map);
        this.player = new Player(this, 0, 0, "player");
        this.loadAnims();
        //slopes
        this.slopes = this.createSlopes(this.map);
        this.slopes.plain_boxes.forEach(box=>{
           this.physics.add.collider(this.player, box)
        })
 
        this.camera = this.cameraSetup(this.player);
    }
    
    createDebug() {
        this.debug = true;
        down.addEventListener("click", () => {
          if (!this.physics.world.drawDebug)
            this.physics.world.createDebugGraphic();
          this.physics.world.debugGraphic.visible = this.debug = !this.debug;
        });
    }
    createText() {
        this.text = this.add.text(
          this.config.topLeft.x + 16,
          this.config.topLeft.y + 16,
          "L and R buttons to move, U to jump\nDebug button press D",
          { fontSize: 12, color: "#fff" }
        ).setScrollFactor(0);
    }

    createMap(){
        const map = this.make.tilemap({key: "map"});
        //tile bleeding/extrusion
        map.addTilesetImage("Assets", "Tileset01", 16, 16, 1, 2);
        
        this.mapWidth = map.tileWidth * map.width;
        this.mapHeight = map.tileHeight * map.height;
        
        return map;
    }
    
    createMapLayers(map){

        {
            if(!map) return;
            const tileset1 = map.getTileset("Assets");
            
            const collisionblocks = map.createLayer( "collisionblocks", tileset1).setAlpha(0).setDepth(10)
           // const mobile_platforms_zones = map.getObjectLayer("mobile_platforms", tileset1).objects;
            const stationary_platforms = map.createLayer( "stationary_platforms", tileset1).setDepth(9);
            
            //const beams = map.createLayer("beams", tileset1).setDepth(9) || null;
            const traps = map.createLayer("traps", tileset1);
            const foreground_decoration = map.createLayer("foreground_decoration", tileset1).setDepth(8);
            const background_decoration = map.createLayer("background_decoration", tileset1).setDepth(6);
            //const exit_zone = map.getObjectLayer("exit_zones").objects;
            const player_spawn_zone = map.getObjectLayer("player_spawn_zone").objects;
            
            const enemy_spawn_zones = map.getObjectLayer("enemy_spawn_zones").objects;
            
            const ladders = map.createLayer("ladders", tileset1).setDepth(10).setCollisionByExclusion(-1, true);
            ladders.y = -0.01;
            
            const foreground = map.createLayer( "foreground", tileset1).setDepth(7); 
            return { collisionblocks, player_spawn_zone, enemy_spawn_zones, ladders, foreground, traps, stationary_platforms, foreground_decoration, background_decoration};  
        }
    }
    
    createSlopes(map){
        if(!map) return;
        const left_to_right_slopes = [];
        const left_to_right_boxes= [];
        const right_to_left_slopes = [];
        const right_to_left_boxes = [], plain_boxes = [];
        
        map.getLayer("foreground").tilemapLayer.forEachTile(tile=>{
            switch(tile.index){
                case 13: case 37:{
                    //push left slopes
                    left_to_right_slopes.push(new Phaser.Geom.Triangle(
                        tile.pixelX, tile.bottom,
                        tile.right, tile.pixelY,
                        tile.right, tile.bottom
                        ));
                    //push left rectangles
                    const img = this.physics.add.image(tile.pixelX, tile.pixelY, "tile")
                                .setOrigin(0).setImmovable(true).setAlpha(0)
                                img.body.setAllowGravity(false);
                    left_to_right_boxes.push(img);
                break;
                }
                
                case 17: case 43:{
                    //push right slopes
                    right_to_left_slopes.push(new Phaser.Geom.Triangle(
                        tile.right, tile.bottom,
                        tile.pixelX, tile.pixelY,
                        tile.pixelX, tile.bottom
                        ));
                    //push right rectangles
                    const img = this.physics.add.image(tile.pixelX, tile.pixelY, "tile")
                                .setOrigin(0).setImmovable(true).setAlpha(0)
                                img.body.setAllowGravity(false);
                    right_to_left_boxes.push(img); 
                break;
                }
                
                case -1:{
                break;
                }
                
                default:{
                    const img = this.physics.add.image(tile.pixelX, tile.pixelY, "tile")
                                .setOrigin(0).setImmovable(true)
                                img.body.setAllowGravity(false);
                    plain_boxes.push(img);
                break;
                }
            }
        })
        return { plain_boxes, left_to_right_slopes, left_to_right_boxes, right_to_left_slopes, right_to_left_boxes }; 
    }
    
    renderSlopes(){
        //render slopes
        this.graphics.clear()
        this.graphics.lineStyle(2, 0x4400ff) 
        if(this.player && this.player.isOnSlope){

            this.slopes.left_to_right_slopes.forEach(slope => {
                this.graphics.strokeTriangleShape(slope)
             })
            this.slopes.right_to_left_slopes.forEach(slope => {
                this.graphics.strokeTriangleShape(slope)
             }) 
        }
    }
  
    //CAMERA SETUP
    cameraSetup(cameraPerson){
        if(!this.map || !cameraPerson) return;
        const cam = this.cameras.main;
        
        //const minicam= this.cameras.add(this.config.width-100, 0, 100, 100).startFollow(cameraPerson);
        
        cam.setBackgroundColor(0xfff)
        cam.startFollow(cameraPerson);
        cam.pan(0, 0, 0, 'Linear');
        cam.zoomTo(this.cameraZoomFactor, 0);
        //world bounds
        this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
        //camera bounds
        cam.setBounds(0, 0, this.mapWidth, this.mapHeight);
        //smooth px, also solved issue with tiles bleeding (to some degrees)
        //cam.roundPixels = false; 
        //lerp
        cam.setLerp(0.1, 0.1);
        cam.fadeIn(3000);
       // cam.rotateTo(0.1)
       
       return cam;
    }
     
    revealControlButtons(){
       const a = document.getElementById("PlayScreen");
        
    }
    
    update(time, delta){
        //this.renderSlopes();
    }
}