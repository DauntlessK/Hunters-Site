class Main{
  constructor(config){
      this.element = config.element;
      this.canvas = this.element.querySelector(".game-canvas");
      this.ctx = this.canvas.getContext("2d");
      this.map = null;
      const rect = this.element.getBoundingClientRect();
      this.button = new Button({
        rect: rect,
        x: 400,
        y: 20,
        width: 200,
        height: 100,
        frames: 4
      });
      this.canvas.addEventListener('click', this.button);
      this.canvas.addEventListener('mousemove', this.button);
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

      //Draw Buttons
      this.button.draw(this.ctx);

      //Draw Upper Layer
      this.map.drawUpperImage(this.ctx);

      requestAnimationFrame(() => {
        step();
      })
    }
    step();
  }

  init(){
    this.map = new TacticalView(window.Scenes.Sunny);
    this.startGameLoop();

  }
}