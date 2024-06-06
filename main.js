class Main{
  constructor(config){
      this.element = config.element;
      this.canvas = this.element.querySelector(".game-canvas");
      this.ctx = this.canvas.getContext("2d");
      this.tv = null;

      //inputs for game start
      this.inputField = document.getElementById('input-container');
      this.kmdtTextField = document.getElementById('Commander');
      this.numField = document.getElementById('SubNum');
      this.button = document.getElementById('StartButton');
  }

  startGameLoop() {
    const step = () => {

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      //Draw Lower Layer
      this.tv.drawLowerImage(this.ctx);

      //Draw Game Objects
      Object.values(this.tv.gameObjects).forEach(object => {
        object.sprite.draw(this.ctx);
      })

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

  handleEvent(){
    if (event.target.id == "StartButton"){
      if (this.numField.value > 9999 || this.numField.value < 1) {
        console.log("Error");
        this.numField.style.backgroundColor = "red";
      }
      else{
        document.getElementById("Commander").style.visibility = "hidden";
        document.getElementById("SubNum").style.visibility = "hidden";
        document.getElementById("StartButton").style.visibility = "hidden";
        this.submarine.startGame(this.kmdtTextField.value, this.numField.value);
      }
    }
  }

  init(){
    this.tv = new TacticalView(window.Scenes.Sunny);
    this.startGameLoop();
    this.canvas.addEventListener('click', this.tv);
    this.canvas.addEventListener('mousemove', this.tv);
    this.button.addEventListener('click', this);

    this.submarine = new Submarine(this.tv);
  }
}