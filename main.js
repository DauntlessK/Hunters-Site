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

        const x = 0;
        const y = 0;
        const sub = new Image();
        sub.onload = () => {
            this.ctx.drawImage(
                sub,
                0,     //left cut
                0,     //top cut
                479,   //width of cut
                128,   //height of cut
                x,     //x position of draw 
                y,     //y position of draw
                479,
                128
            )
        };
        sub.src = "images/ships/Uboat_VIIC.png";
    }
}