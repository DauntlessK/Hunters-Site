class OpenStatusButton extends Button {
    constructor(...args){
        super(...args);
    }

    click() {
        this.openStatus();
    }

    //Opens Uboat Status Popup
    openStatus(){
        this.gm.statusResolved = false;
        const popup = new StatusPopup(this.tv, this.gm);
    }
}