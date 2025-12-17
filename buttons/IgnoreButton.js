class IgnoreButton extends Button {
    constructor(...args){
        super(...args);
    }

    click() {
        this.ignore();
    }

    //Resolve 
    ignore(){
        this.gm.currentEncounter.leftWithoutEngaging = true;
        this.gm.currentEncounter.endEncounter();
    }
}