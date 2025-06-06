class Main{
  constructor(config){
      this.version = .75
      this.element = config.element;
      this.canvas = this.element.querySelector(".game-canvas");
      this.ctx = this.canvas.getContext("2d");
      this.tv = null;

      //inputs for game start
      this.inputField = document.getElementById('input-container');
      this.kmdtTextField = document.getElementById('Commander');
      this.numField = document.getElementById('SubNum');
      this.button = document.getElementById('StartButton');

      this.windowPause = false;
      this.previousMs;
  }

  gameLoopWork() {
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    //Draw Lower Layer
    this.tv.drawLowerImage(this.ctx);

    //Draw Game Objects (misc sprites and airplanes)
    if (this.tv.gameObjects != null) {
      Object.values(this.tv.gameObjects).forEach(object => {
      object.draw(this.ctx);
      })
    }

    //Draw Ship Objects (other ships)
    if (this.tv.shipObjects != null) {
      Object.values(this.tv.shipObjects).forEach(object => {
      object.draw(this.ctx);
      })
    }

    //Draw Uboat
    this.tv.uboat.draw(this.ctx);

    //Draw Upper Layer
    this.tv.drawUpperImage(this.ctx);

    //Draw Wake / water around hull
    if (this.tv.waves != null){
      this.tv.waves.draw(this.ctx);
    }
    this.tv.uboatwake.draw(this.ctx);

    //Draw Night Overlay
    this.tv.drawNightOverlayImage(this.ctx);

    //Draw UI
    if (this.tv.mainUI != null){
      this.tv.drawUI(this.ctx);
    }

    this.tv.updateAnimationProgress();
  }

  startGameLoop() {
    const step = 1/60;

    const stepFn = (timestampMs) => {
      if (this.previousMs === undefined || this.windowPause) {
        this.previousMs = timestampMs;
      }
      let delta = (timestampMs - this.previousMs) / 1000;
      while (delta >= step) {
        if (!this.windowPause) {
          this.gameLoopWork();
        }
        delta -= step;
      }
      this.previousMs = timestampMs - delta * 1000;

      //Normal tick
      if (!this.windowPause) {
        requestAnimationFrame(stepFn)
      }
    }

    // First kickoff step
    requestAnimationFrame(stepFn)
  }

  handleEvent(){
    if (event.target.id == "StartButton"){
      if (this.numField.value > 9999 || this.numField.value < 1) {
        console.log("Error in U-Boat ID #");
        this.numField.style.backgroundColor = "red";
      }
      else{
        var e = document.getElementById("uboat");
        var type = e.options[e.selectedIndex].text;
        type = type.replace("Type ", "");
        document.getElementById("Commander").style.visibility = "hidden";
        document.getElementById("SubNum").style.visibility = "hidden";
        document.getElementById("StartButton").style.visibility = "hidden";
        document.getElementById("subSelectTable").style.visibility = "hidden";
        this.tv.startGame(this.kmdtTextField.value, this.numField.value, type);
      }
    }
  }

  init(){
    this.tv = new TacticalView("IntroPort");
    this.startGameLoop();
    this.canvas.addEventListener('click', this.tv);
    this.canvas.addEventListener('mousemove', this.tv);
    this.button.addEventListener('click', this);
    console.log("The Hunters: German Uboats at War\nArt, Design & Programming By Kyle Breen-Bondie\nBased on the GMT Board Game Designed by Gregory M. Smith");
    console.log("Version: " + this.version);

    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        // Pause your JavaScript execution here
        console.log('Page is hidden. Pausing...');
        this.windowPause = true;
        // Example: clearInterval(myInterval); // If you have intervals running
      } else {
        // Resume your JavaScript execution here
        console.log('Page is visible. Resuming...');
        this.windowPause = false;
        // Example: myInterval = setInterval(myFunction, 1000);
      }
    });
  }
}