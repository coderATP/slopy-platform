export class PreloadScene extends Phaser.Scene{
    constructor(config){
        super("PreloadScene");
        
    }
    loadTilemaps(){
        this.load.tilemapTiledJSON("map", "crypt01.json");
    }
    
    loadTilesets(){
        this.load.image("Tileset01", "forest_extruded.png");
    }
    loadHero(){
        this.load.spritesheet("player", "hero.png", {
            frameWidth: 20, frameHeight: 32
        })
    }
    loadOthers(){
        this.load.image("tile", "tile.png");
    }
    preload(){
        this.loadTilemaps();
        this.loadTilesets();
        this.loadHero();
        this.loadOthers();
        
        this.load.once("complete", ()=>{
            this.scene.start("PlayScene");
        })
    }
}