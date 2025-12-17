class AbortButton extends Button {
    constructor(...args){
        super(...args);
    }

    click() {
        this.abortPatrol();
    }

    //called when finished with the reload mode
    abortPatrol(){
        if (!this.tv.reloadMode && this.gm.patrolling && !this.tv.isInEncounter && !this.tv.statusMode) {
            this.gm.abortPatrolPrompt();
        }
    }
}