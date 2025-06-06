class FollowTimePopup{
    constructor(tv, gm, enc) {
        this.tv = tv;
        this.gm = gm;
        this.enc = enc;

        this.choice = null;
        this.isResolved = false;

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");

        this.element.classList.add("PatrolMessage");

        this.createPopup();
    }

    createPopup() {
        //new div to add
        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">When should we attack?</h3>
            <button class="AttackPopup_button" id="day">Day</button>
            <button class="WaitPopup_button" id="night">Night</button>
        `)

        this.element.addEventListener("click", ()=> {
            var action = null;
            if (event.target.id == "night" || event.target.id == "day"){
                this.isResolved = true;
                //set choice
                if (event.target.id == "night") {
                    this.choice = "Night";
                }
                else {
                    this.choice = "Day";
                }
                //close popup
                this.done(event.target.id);
            }
        })

        this.container.appendChild(this.element);
    }

    getChoice() {
        if (this.choice == "day") {
            return "Day";
        }
        else {
            return "Night";
        }
    }

    done(id){
        if (!this.tv.isPaused) {
            this.element.remove();
            this.gm.setEventResolved(true);
            this.choice = id;
        }
    }
}