class UI{
    constructor(config){
        
        this.subNum = "";
        this.rank = "";
        this.date = "";
        this.orders = "";

        this.bgdUI = new Image();
        this.src = config.src;

        this.width = 1280;
        this.height = 720;

        this.uiBgd = new Image();
        this.uiBgd.src = "images/ui/uibgd.png";

        this.uiBgd.onload = () => {
            this.isLoaded = true;
          }

        this.button1 = new Button({
            src: "images/ui/torpbutton.png",
            x: 1007,
            y: 245,
            width: 100,
            height: 100,
            frames: 4
          });
        this.button2 = new Button({
            src: "images/ui/TorpButton.png",
            x: 1110,
            y: 245,
            width: 100,
            height: 100,
            frames: 4
        });
        this.button3 = new Button({
            src: "images/ui/torpbutton.png",
            x: 1007,
            y: 341,
            width: 100,
            height: 100,
            frames: 4
          });
        this.button4 = new Button({
            src: "images/ui/torpbutton.png",
            x: 1110,
            y: 341,
            width: 100,
            height: 100,
            frames: 4
        });
        this.button5 = new Button({
            src: "images/ui/torpbutton.png",
            x: 1057,
            y: 449,
            width: 100,
            height: 100,
            frames: 4
        });

    }

    handleEvent(){
        this.button1.handleEvent(event);
        this.button2.handleEvent(event);
        this.button3.handleEvent(event);
        this.button4.handleEvent(event);
        this.button5.handleEvent(event);
    }
        
    draw(ctx){
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
        ctx.fillText(this.subNum, 945, 40);

        //Sub #
        ctx.font = "italic 12px courier";
        ctx.fillStyle = "white";
        ctx.textAlign = "right";
        ctx.fillText(this.rank, 1260, 24);

        //date
        ctx.fillText(this.date, 1260, 40);

        //orders
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.font = "italic 14px courier";
        ctx.fillText(this.orders, 1108, 85);
    }
}

/**UI.elements = {
    main: {
        bgdUIsrc: "images/ui/uibgd.png",
        buttons: {
            tube1: new Button({
                x: 5,
                y: 230,
                src: "images/buttontext.png",
                width: 200,
                height: 100,
                frames: 4
            }),
            tube2: new Button({
                x: 100,
                y: 230,
                src: "images/buttontext.png",
                width: 200,
                height: 100,
                frames: 4
            })
        }
    }
}*/