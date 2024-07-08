class AttackDepthPopup{
    constructor(tv, gm, enc, shipList) {
        this.tv = tv;
        this.gm = gm;
        this.enc = enc
        this.shipList = shipList;

        this.depth = null;

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");

        this.element.classList.add("PatrolMessage");
        this.getDepthPopup();
    }
    
    //Popup to allow the player to choose depth, disallowing certain selections
    getDepthPopup(){

        //determine if a surface attack is possible (escorted or not, etc)
        if (this.shipList[0].getType() == "Escort") {
            console.log("Disabling Surface due to Escort");
            document.getElementById("SurfaceDepth").disabled = true;
        }

        //new div to add
        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">How will we attack?</h3>
            <p class="PatrolMessage_p">
            <input type="radio" id="PeriscopeDepth" name="depth" value="Periscope Depth" checked="checked">
            <label for="Periscope Depth">Periscore Depth</label>
            <input type="radio" id="SufaceDepth" name="depth" value="Surfaced">
            <label for="Surfaced">Surfaced</label>
            <button class="AttackPopup_button" id="attack">Continue</button>
            </p>
        `)

        this.element.addEventListener("click", ()=> {
            if (event.target.id == "attack"){
                //get selected value and close popup
                this.done();
            }
        })

        this.container.appendChild(this.element);
    }
    
    done(){
        this.depth = document.querySelector('input[name="depth"]:checked').value;
        this.element.remove();
        this.gm.setEventResolved(true);
    }

    getDepth() {
        return this.depth;
    }

}