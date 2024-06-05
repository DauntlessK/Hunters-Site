class Main{
  constructor(config){
      this.element = config.element;
      this.canvas = this.element.querySelector(".game-canvas");
      this.ctx = this.canvas.getContext("2d");
      this.tv = null;
  }

  startGameLoop() {
    const step = () => {

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      //Draw Lower Layer
      this.tv.drawLowerImage(this.ctx);
      this.tv.drawLowerImage(this.ctx);

      //Draw Game Objects
      Object.values(this.tv.gameObjects).forEach(object => {
      Object.values(this.tv.gameObjects).forEach(object => {
        object.sprite.draw(this.ctx);
      })

      //Draw Buttons
      //this.button.draw(this.ctx);

      //Draw Upper Layer
      this.tv.drawUpperImage(this.ctx);

      //Draw UI
      this.tv.drawUI(this.ctx);

      requestAnimationFrame(() => {
        step();
      })
    }
    step();
  }

  init(){
    this.tv = new TacticalView(window.Scenes.Sunny);
    this.tv = new TacticalView(window.Scenes.Sunny);
    this.startGameLoop();
    this.canvas.addEventListener('click', this.tv);
    this.canvas.addEventListener('mousemove', this.tv);
  }
}