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
      image.src = "images/scrollingwater.gif";

      const x = 0;
      const y = 0;
      
       //Place some Game Objects!
      const sub = new GameObject({
        x: 20,
        y: 200,
        src: "images/ships/Uboat_VIIC_spritesheet.png",
        width: 455,
        height: 85
      })

      setTimeout(() => {
        sub.sprite.draw(this.ctx);
      }, 200)
  }
}