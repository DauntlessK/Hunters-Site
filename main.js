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
      
       //Place some Game Objects!
      const sub = new GameObject({
        x: 5,
        y: 6,
        src: "images/ships/Uboat_VIIC.png",
        width: 479,
        height: 128
      })

      setTimeout(() => {
        sub.sprite.draw(this.ctx);
      }, 200)
  }
}