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
        this.tubeButton1 = new TorpedoButton({
            src: "images/ui/TorpButton.png",
            x: 1007,
            y: 245,
            width: 100,
            height: 100,
            frames: 8,
            tube: 1,
            gm: this.gm,
            tv: this.tv
          });
        this.tubeButton2 = new TorpedoButton({
            src: "images/ui/TorpButton.png",
            x: 1110,
            y: 245,
            width: 100,
            height: 100,
            frames: 8,
            tube: 2,
            gm: this.gm,
            tv: this.tv
        });
        this.tubeButton3 = new TorpedoButton({
            src: "images/ui/TorpButton.png",
            x: 1007,
            y: 341,
            width: 100,
            height: 100,
            frames: 8,
            tube: 3,
            gm: this.gm,
            tv: this.tv
          });
        this.tubeButton4 = new TorpedoButton({
            src: "images/ui/TorpButton.png",
            x: 1110,
            y: 341,
            width: 100,
            height: 100,
            frames: 8,
            tube: 4,
            gm: this.gm,
            tv: this.tv
        });
        //torpedo buttons for IXA and IXB (two)
        if (this.gm.sub.getType() == "IXA" || this.gm.sub.getType() == "IXB"){
            this.tubeButton5 = new TorpedoButton({
                src: "images/ui/TorpButton.png",
                x: 1007,
                y: 449,
                width: 100,
                height: 100,
                frames: 8,
                tube: 5,
                gm: this.gm,
                tv: this.tv
            });
            this.tubeButton6 = new TorpedoButton({
                src: "images/ui/TorpButton.png",
                x: 1110,
                y: 449,
                width: 100,
                height: 100,
                frames: 8,
                tube: 6,
                gm: this.gm,
                tv: this.tv
            });
        }
        else{   //single button for VII types
            this.tubeButton5 = new TorpedoButton({
                src: "images/ui/TorpButton.png",
                x: 1057,
                y: 449,
                width: 100,
                height: 100,
                frames: 8,
                tube: 5,
                gm: this.gm,
                tv: this.tv
            });
        }
        this.reloadButton = new Button({
            src: "images/ui/TorpButton.png",
            x: 1057,
            y: 650,
            width: 50,
            height: 50,
            frames: 8,
            tube: null,
            gm: this.gm,
            tv: this.tv
        });

    }

    handleEvent(){
        //passes events from UI to individual buttons
        this.tubeButton1.handleEvent(event);
        this.tubeButton2.handleEvent(event);
        this.tubeButton3.handleEvent(event);
        this.tubeButton4.handleEvent(event);
        this.tubeButton5.handleEvent(event);
        if (this.gm.sub.getType() == "IXA" || this.gm.sub.getType() == "IXB"){
            this.tubeButton6.handleEvent(event);
        }
        this.reloadButton.handleEvent(event);
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
        //draws elemnts of UI
        if (this.uiIsOn()){
            this.drawBgd(ctx);
            this.tubeButton1.draw(ctx);
            this.tubeButton2.draw(ctx);
            this.tubeButton3.draw(ctx);
            this.tubeButton4.draw(ctx);
            this.tubeButton5.draw(ctx);
            if (this.gm.sub.getType() == "IXA" || this.gm.sub.getType() == "IXB"){
                this.tubeButton6.draw(ctx);
            }
            if (this.tv.reloadMode){
                this.reloadButton.draw(ctx);
            }
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
        //draws all text-based UI elements
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
        //ctx.fillStyle = "black";
        //ctx.textAlign = "center";
        //ctx.font = "italic 14px courier";
        //ctx.fillText(this.orders, 1108, 85);

        //Torpedo totals
        ctx.textAlign = "center";
        ctx.fillStyle = "blue";
        ctx.font = "bold 16px Courier";
        //draw G7a (blue) text UI
        ctx.fillText(this.gm.sub.reloads_forward_G7a, 975, 258);
        ctx.fillText(this.gm.sub.reloads_aft_G7a, 975, 545);

        //draw G7e (red) text UI
        ctx.fillStyle = "darkred";
        ctx.fillText(this.gm.sub.reloads_forward_G7e, 1240, 258);
        ctx.fillText(this.gm.sub.reloads_aft_G7e, 1240, 545);

        const leftSide = 983;
        const rightSide = 1234;
        const topRow = 292
        const secondRow = 395;
        const bottomRow = 499;

        //draw tube text
        ctx.font = "bold 12px Courier";
        if (this.gm.sub.tube[1] == 1){
            ctx.fillStyle = "blue";
            ctx.fillText("G7a", leftSide, topRow);
        }
        else if (this.gm.sub.tube[1] == 2){
            ctx.fillStyle = "darkred";
            ctx.fillText("G7e", leftSide, topRow);
        }
        else if (this.gm.sub.tube[1] == 3){
            ctx.fillStyle = "black";
            ctx.fillText("MINES", leftSide, topRow);
        }
        else{
            ctx.fillStyle = "black";
            ctx.fillText("--", leftSide, topRow);
        }

        if (this.gm.sub.tube[2] == 1){
            ctx.fillStyle = "blue";
            ctx.fillText("G7a", rightSide, topRow);
        }
        else if (this.gm.sub.tube[2] == 2){
            ctx.fillStyle = "darkred";
            ctx.fillText("G7e", rightSide, topRow);
        }
        else if (this.gm.sub.tube[2] == 3){
            ctx.fillStyle = "black";
            ctx.fillText("MINES", rightSide, topRow);
        }
        else{
            ctx.fillStyle = "black";
            ctx.fillText("--", rightSide, topRow);
        }

        if (this.gm.sub.tube[3] == 1){
            ctx.fillStyle = "blue";
            ctx.fillText("G7a", leftSide, secondRow);
        }
        else if (this.gm.sub.tube[3] == 2){
            ctx.fillStyle = "darkred";
            ctx.fillText("G7e", leftSide, secondRow);
        }
        else if (this.gm.sub.tube[3] == 3){
            ctx.fillStyle = "black";
            ctx.fillText("MINES", leftSide, secondRow);
        }
        else{
            ctx.fillStyle = "black";
            ctx.fillText("--", leftSide, secondRow);
        }

        if (this.gm.sub.tube[4] == 1){
            ctx.fillStyle = "blue";
            ctx.fillText("G7a", rightSide, secondRow);
        }
        else if (this.gm.sub.tube[4] == 2){
            ctx.fillStyle = "darkred";
            ctx.fillText("G7e", rightSide, secondRow);
        }
        else if (this.gm.sub.tube[4] == 3){
            ctx.fillStyle = "black";
            ctx.fillText("MINES", rightSide, secondRow);
        }
        else{
            ctx.fillStyle = "black";
            ctx.fillText("--", rightSide, secondRow);
        }

        if (this.gm.sub.getType() == "IXA" || this.gm.sub.getType() == "IXB"){
            if (this.gm.sub.tube[5] == 1){
                ctx.fillStyle = "blue";
                ctx.fillText("G7a", leftSide, bottomRow);
            }
            else if (this.gm.sub.tube[5] == 2){
                ctx.fillStyle = "darkred";
                ctx.fillText("G7e", leftSide, bottomRow);
            }
            else if (this.gm.sub.tube[5] == 3){
                ctx.fillStyle = "black";
                ctx.fillText("MINES", leftSide, bottomRow);
            }
            else{
                ctx.fillStyle = "black";
                ctx.fillText("--", leftSide, bottomRow);
            }
    
            if (this.gm.sub.tube[6] == 1){
                ctx.fillStyle = "blue";
                ctx.fillText("G7a", rightSide, bottomRow);
            }
            else if (this.gm.sub.tube[6] == 2){
                ctx.fillStyle = "darkred";
                ctx.fillText("G7e", rightSide, bottomRow);
            }
            else if (this.gm.sub.tube[6] == 3){
                ctx.fillStyle = "black";
                ctx.fillText("MINES", rightSide, bottomRow);
            }
            else{
                ctx.fillStyle = "black";
                ctx.fillText("--", rightSide, bottomRow);
            }
        }
        else {
            if (this.gm.sub.tube[5] == 1){
                ctx.fillStyle = "blue";
                ctx.fillText("G7a", leftSide + 50, bottomRow);
            }
            else if (this.gm.sub.tube[5] == 2){
                ctx.fillStyle = "darkred";
                ctx.fillText("G7e", leftSide + 50, bottomRow);
            }
            else if (this.gm.sub.tube[5] == 3){
                ctx.fillStyle = "black";
                ctx.fillText("MINES", leftSide + 50, bottomRow);
            }
            else{
                ctx.fillStyle = "black";
                ctx.fillText("--", leftSide + 50, bottomRow);
            }
        }
        
        //Bottom Right (either reloading flag or telegraph)
        if (this.tv.reloadMode == true){
            ctx.fillStyle = "darkred";
            ctx.font = "bold 30px Courier";
            ctx.fillText("LOADING TORPEDOES", 1108, 640);
        }

    }

    reloadMode(){
        this.tv.reloadMode = true;
    }
}