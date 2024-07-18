class FireAttackButton extends Button {
    constructor(...args){
        super(...args);
    }

    click() {
        this.fire();
    }

    //Resolve 
    fire(){
        this.gm.resolveAttack();
    }
}