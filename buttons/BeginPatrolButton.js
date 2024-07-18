class BeginPatrolButton extends Button {
    constructor(...args){
        super(...args);
    }

    click() {
        this.beginPatrol();
    }

    //for begin patrol button to start patrol loop
    beginPatrol() {
        this.gm.beginPatrol();
        this.changeState("Disabled");
    }
}