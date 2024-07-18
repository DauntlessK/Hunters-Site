class ReloadButton extends Button {
    constructor(...args){
        super(...args);
    }

    click() {
        this.commitReload();
    }

    //called when finished with the reload mode
    commitReload(){

        this.tv.reloadMode = false;

        if (!this.tv.isDeparted) {
            this.gm.newPatrol();
            this.tv.gameObjects.uboat.sprite.setDeparted();
            this.tv.gameObjects.waterline.sprite.setDeparted();
            this.tv.setDeparted(true);
        }

        this.changeState("Disabled");
    }
}