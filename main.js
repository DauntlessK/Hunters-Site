class Main{
    constructor(config){
        this.element = config.element;
        this.canvas = this.element.querySelector(".game-canvas");
        this.ctx = this.canvas.getContext("2d");
    }

    init(){
        const image = new Image();
        image.onload = () => {
            this.ctx.drawImage(image, 0, 0)
        };
        image.src = "images/waterbgd2.gif";

        const hero = new Image();
        hero.onload = () => {
            this.ctx.drawImage(
                hero,
                0,
                0,
                100,
                100,
                0,
                0,
                100,
                100
            )
        }
        hero.src = "images/ships/Uboat_VIIC.png"

        //Place some Game Objects
        /**const sub = new GameObject({
            x: 0,
            y: 0,
            src: "images/ships/Uboat_VIIC_spritesheet.png",
            width: 455,
            height: 85
        })
        
        setTimeout(() => {
            sub.sprite.draw(this.ctx);
        }, 200)**/

    }
}