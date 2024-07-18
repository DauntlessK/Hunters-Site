class ContinuePatrolButton extends Button {
    constructor(...args){
        super(...args);
    }

    click() {
        this.continuePatrol();
    }

    //Move to next step of patrol
    continuePatrol(){
        this.gm.advancePatrol();
    }
}