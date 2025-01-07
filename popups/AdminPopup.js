class AdminPopup{
    constructor(tv, gm, rollFor) {
        this.tv = tv;
        this.gm = gm;
        this.rollFor = rollFor
        this.choice = null;

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");

        this.element.classList.add("TextMessage");

        this.choose("2D6");
    }

    choose(dieRoll) {

        if (dieRoll == "2D6") {
            //new div to add
            this.element.innerHTML = (`
                <p class="TextMessage_p">Roll for ${this.rollFor}:<br></p>
                <button class="Orders_button" id="2">2</button>
                <button class="Orders_button" id="3">3</button>
                <button class="Orders_button" id="4">4</button>
                <button class="Orders_button" id="5">5</button>
                <button class="Orders_button" id="6">6</button>
                <button class="Orders_button" id="7">7</button>
                <button class="Orders_button" id="8">8</button>
                <button class="Orders_button" id="9">9</button>
                <button class="Orders_button" id="10">10</button>
                <button class="Orders_button" id="11">11</button>
                <button class="Orders_button" id="12">12</button>
            `)
        }

        this.container.appendChild(this.element);
        this.tv.pauseGame(true);

        this.element.addEventListener("click", ()=> {
            //determine which button was clicked
            this.choice = parseInt(event.target.id);
            if (this.choice < 13){
                this.choice = event.target.id;
                this.done();
            }

        });
    }

    getChoice() {
        return this.choice;
    }
    
    done(){
        this.element.remove();
        this.gm.setEventResolved(true);
        this.tv.pauseGame(false);
    }

    remove() {
        this.element.remove();
    }
}