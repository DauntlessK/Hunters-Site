class UI{
    constructor(config){
        
        this.subNum = "U-5901";
        this.rank = "Kapitan";
        this.date = "Sept - 1939";
        this.orders = "Orders: Patrol Atlantic"

        this.bgdUI = new Image();
        this.src = config.src;

        this.width = 480;
        this.height = 360;

        this.uiBgd = new Image();
        this.uiBgd.src = "images/ui/uibgd.png";

        this.uiBgd.onload = () => {
            this.isLoaded = true;
          }

        this.button1 = new Button({
            src: "images/ui/torpbutton.png",
            x: 502,
            y: 115,
            width: 50,
            height: 50,
            frames: 4
          });
        this.button2 = new Button({
            src: "images/ui/torpbutton.png",
            x: 554,
            y: 115,
            width: 50,
            height: 50,
            frames: 4
        });
        this.button3 = new Button({
            src: "images/ui/torpbutton.png",
            x: 502,
            y: 163,
            width: 50,
            height: 50,
            frames: 4
          });
        this.button4 = new Button({
            src: "images/ui/torpbutton.png",
            x: 554,
            y: 163,
            width: 50,
            height: 50,
            frames: 4
        });
        this.button5 = new Button({
            src: "images/ui/torpbutton.png",
            x: 528,
            y: 215,
            width: 50,
            height: 50,
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
        ctx.font = "bold 24px courier";
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.fillText(this.subNum, 475, 24);

        //Sub #
        ctx.font = "italic 8px courier";
        ctx.fillStyle = "white";
        ctx.textAlign = "right";
        ctx.fillText(this.rank, 630, 14);

        //date
        ctx.fillText(this.date, 630, 24);

        //orders
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(this.orders, 554, 45);
    }
}

UI.elements = {
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
}