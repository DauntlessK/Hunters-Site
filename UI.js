class UI{
    construtor(config){
        
        bgdUI = new Image();
        this.src = config.src;

        this.width = 480;
        this.height = 360;

        this.uiBgd = new Image();
        this.uiBgd.src = "images/ui/uibgd.png";
    }


    draw(ctx){
        this.drawBgd(ctx);
        //Object.values(this.buttons).forEach(object => {
        //object.button.draw(this.ctx);
      //})
    }

    drawBgd(ctx){
        ctx.drawImage(
            this.uiBgd,
            0, 0,
            640, 360,
            0, 0,
            640, 360
          )
    }
}

UI.elements = {
    main: {
        bgdUIsrc: "",
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