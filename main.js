class Main{
  constructor(config){
      this.element = config.element;
      this.canvas = this.element.querySelector(".game-canvas");
      this.ctx = this.canvas.getContext("2d");
      this.map = null;
  }

  startGameLoop() {
    const step = () => {

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      //Draw Lower Layer
      this.map.drawLowerImage(this.ctx);

      //Draw Game Objects
      Object.values(this.map.gameObjects).forEach(object => {
        object.sprite.draw(this.ctx);
      })

      requestAnimationFrame(() => {
        step();
      })
    }
    step();
  }

  init(){
<<<<<<< HEAD
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
=======
    this.map = new TacticalView(window.Scenes.Sunny);
    this.startGameLoop();

>>>>>>> 6c19bc819c9ab4b9f72d08f1c730bfa08335cb16
  }
}