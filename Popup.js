class Popup{
    constructor(message, tv, gm) {
        this.message = message;
        this.tv = tv;
        this.gm = gm;
        this.tv.pauseGame();

        const container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");
        this.element.classList.add("TextMessage");

        //create correct popup based on message
        switch(message){
            case "subSelect":
                this.subSelectElement();
                break;
            case "startGameText":
                this.startGameTextElement();
                break;
            case "subResupply1":
                this.subResupply1();
                break;
            default:
                console.log("Error selecting correct message to popup");
        }
        container.appendChild(this.element);
    }

    startGameTextElement() {
        //Message to announce starting rank, sub, date, etc
        var storyIntroText = "";
        if (this.gm.date_year == 1939){
            storyIntroText = "The invasion of Poland has begun and Great Britain and France have declared war on Germany. It is time to prove your mettle and help the war effort in disrupting shipping to the allies."
        }
        else if (this.gm.date_year == 1940 && this.gm.date_month < 6){
            storyIntroText = "With Poland defeated, Germany looks to tighten its control of the Atlantic. We must continue to strangle the Allies' supply lines."
        }
        else if (this.gm.date_year == 1940){
            storyIntroText = "With France defeated, Germany's U-Boats have mostly relocated to French ports. Help tip the Battle of the Atlantic, now in full swing, in favor of Germany."
        }
        else {
            storyIntroText = "The Battle for the Atlantic has swung against Germany, as hundreds of U-Boats have been lost. Exercise caution as the allies have learned to hunt U-Boats."
        }

        //new div to add
        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">The Hunters: German U-Boats at War
            <p class="TextMessage_p">${this.gm.getFullDate()}<br>
            ${this.gm.getLRankAndName()}, please report to ${this.gm.getFullUboatID()} immediately.<br><br>
            ${storyIntroText}<br><br>Formal orders to follow shortly.</p>
            <button class="TextMessage_button">Next</button>
        `)

        this.element.querySelector("button").addEventListener("click", ()=> {
            //close popup
            this.done();
            this.gm.eventResolved = true;
        })
    }

    subResupply1() {
        //Popup to select loadout of torpedoes
        var currentG7a = this.gm.sub.G7aStarting;
        var currentG7e = this.gm.sub.G7eStarting;


        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">Port Resupply
            <p class="TextMessage_p">${this.gm.getFullUboatID()} has been assigned ${this.gm.sub.G7aStarting} G7a (steam) torpedoes and
            ${this.gm.sub.G7eStarting} G7e (electric) torpedoes.<br>You may adjust this spread by +/- ${this.gm.sub.torpedo_type_spread}.<br>
            <button class="Option_button" id="DecG7a"><---</button> ${currentG7a} <button class="Option_button" id="IncG7a">---></button><br>
            <button class="Option_button" id="DecG7e"><---</button> ${currentG7e} <button class="Option_button" id="IncG7e">---></button><br>
            </p>
        `)

        this.element.addEventListener("click", ()=> {
            //determine which button was clicked
            if (event.target.id == "DecG7a"){
                currentG7a--;
                currentG7e++;
            }
            else if (event.target.id == "IncG7a"){
                currentG7a++;
                currentG7e--;
            }
            else if (event.target.id == "DecG7e"){
                currentG7a++;
                currentG7e--;
            }
            else if (event.target.id == "IncG7e"){
                currentG7a--;
                currentG7e++;
            }
            else{
                this.done();
            }
        });
    }

    done(){
        this.element.remove();
        this.tv.unpauseGame();
    }
}