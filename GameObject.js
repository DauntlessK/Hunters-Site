class GameObject {
  constructor(config) {
    
    if (config.shipNum == null) {
      this.shipNum = -1;
    }
    else {
      this.shipNum = config.shipNum;
    }
    

    this.x = config.x || 0;
    this.y = config.y || 0;
    this.sprite = new Sprite({
      gameObject: this,
      src: config.src,
      shipNum: this.shipNum,
      width: config.width,
      height: config.height,
      frames: config.frames,
      isPlayer: config.isPlayer,
      shipList: config.shipList
    });
  }
}
  