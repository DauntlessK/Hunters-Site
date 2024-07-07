class AttackDepthPopup{
    constructor(tv, gm, enc, shipList) {
        this.tv = tv;
        this.gm = gm;
        this.enc = enc
        this.shipList = shipList;

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");

        this.element.classList.add("PatrolMessage");
        this.getDepthPopup();
    }
    
    //Popup to allow the player to choose depth, disallowing certain selections
    getDepthPopup(){

        //determine if a surface attack is possible (escorted or not, etc)
        if (this.shipList[0].type == "Escort") {
            console.log("Disabling");
            document.getElementById("SurfaceDepth").disabled = true;
        }

        //new div to add
        this.element.innerHTML = (`
            <p class="PatrolMessage_p">How will we attack?<br>
            <input type="radio" id="PeriscopeDepth" name="depth" value="Periscope Depth" checked="checked">
            <label for="Periscope Depth">Periscore Depth</label>
            <input type="radio" id="SufaceDepth" name="depth" value="Surfaced">
            <label for="Surfaced">Surfaced</label>
            </p>
        `)

        this.container.appendChild(this.element);
    }
    
    done(){
        this.element.remove();
    }

}