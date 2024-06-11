class UI{
    constructor(config){
        this.gm = config.gm;
        this.tv = config.tv;

        this.bgdUI = new Image();
        this.src = config.src;

        this.width = 1280;
        this.height = 720;

        this.uiBgd = new Image();
        this.uiBgd.src = "images/ui/uibgd.png";

        this.uiBgd.onload = () => {
            this.isLoaded = true;
        }

        //create buttons
        this.button1 = new TorpedoButton({
            src: "images/ui/torpbutton.png",
            x: 1007,
            y: 245,
            width: 100,
            height: 100,
            frames: 4,
            tube: 1,
            gm: this.gm
          });
        this.button2 = new TorpedoButton({
            src: "images/ui/TorpButton.png",
            x: 1110,
            y: 245,
            width: 100,
            height: 100,
            frames: 4,
            tube: 2,
            gm: this.gm
        });
        this.button3 = new TorpedoButton({
            src: "images/ui/torpbutton.png",
            x: 1007,
            y: 341,
            width: 100,
            height: 100,
            frames: 4,
            tube: 3,
            gm: this.gm
          });
        this.button4 = new TorpedoButton({
            src: "images/ui/torpbutton.png",
            x: 1110,
            y: 341,
            width: 100,
            height: 100,
            frames: 4,
            tube: 4,
            gm: this.gm
        });
        this.button5 = new TorpedoButton({
            src: "images/ui/torpbutton.png",
            x: 1057,
            y: 449,
            width: 100,
            height: 100,
            frames: 4,
            tube: 5,
            gm: this.gm
        });

    }

    handleEvent(){
        this.button1.handleEvent(event);
        this.button2.handleEvent(event);
        this.button3.handleEvent(event);
        this.button4.handleEvent(event);
        this.button5.handleEvent(event);
    }
    
    uiIsOn(){
        //checks if UI should be on or off
        if (this.tv.scene === "Sunny" || this.tv.reloadMode == true){
            return true;
        }
        else {
            return false;
        }
    }

    draw(ctx){
        if (this.uiIsOn()){
            this.drawBgd(ctx);
            this.button1.draw(ctx);
            this.button2.draw(ctx);
            this.button3.draw(ctx);
            this.button4.draw(ctx);
            this.button5.draw(ctx);
            this.drawHeaderTxt(ctx);
            //Object.values(this.buttons).forEach(object => {
            //object.button.draw(this.ctx);
          //})
        }
    }

    drawBgd(ctx){
        this.isLoaded && ctx.drawImage(
            this.uiBgd,
            0, 0
          )
    }

    drawHeaderTxt(ctx){
        //Sub #
        ctx.font = "bold 30px courier";
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.fillText(this.gm.getFullUboatID(), 945, 40);

        //Rank and Name
        ctx.font = "italic 12px courier";
        ctx.fillStyle = "white";
        ctx.textAlign = "right";
        ctx.fillText(this.gm.getRankAndName(), 1260, 24);

        //date
        ctx.fillText(this.gm.getFullDate(), 1260, 40);

        //orders
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.font = "italic 14px courier";
        ctx.fillText(this.orders, 1108, 85);

        //Torpedo totals
        ctx.fillStyle = "red";
        ctx.font = "12px courier";
        ctx.fillText(this.gm.sub.tube[1], 1000, 500);
        ctx.fillText(this.gm.sub.tube[2], 1100, 500);

    }

    reloadMode(){
        this.tv.reloadMode = true;
    }
}