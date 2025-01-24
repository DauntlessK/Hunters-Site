class ContinuePatrolButton extends Button {
    constructor(...args){
        super(...args);
    }

    click() {
        this.continuePatrol();
    }

    //Move to next step of patrol
    continuePatrol(){
        if (this.gm.currentBox <= this.gm.patrol.getPatrolLength()) {
            this.gm.advancePatrol();
        }
    }
}