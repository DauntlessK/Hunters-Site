class Popup{
    constructor(message, tv, gm, uniqueOrders) {
        this.message = message;
        this.tv = tv;
        this.gm = gm;
        this.uniqueOrders = uniqueOrders;
        this.tv.pauseGame();

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");
        this.element.classList.add("TextMessage");

        //create correct popup based on message
        switch(message){
            case "startGameText":
                this.startGameTextElement();
                this.container.appendChild(this.element);
                break;
            case "subResupply1":
                this.subResupply1();
                this.container.appendChild(this.element);
                break;
            case "orders":
                this.orders();
                this.container.appendChild(this.element);
                break;
            case "pick orders":
                this.pickOrders();
                break;
            default:
                console.log("Error selecting correct message to popup");
        }

        //container.appendChild(this.element);
    }

    startGameTextElement() {
        //Message to announce starting rank, sub, date, etc
        var storyIntroText = "";
        if (this.gm.date_year == 1939){
            storyIntroText = "The invasion of Poland has begun... Hostilities with England effective immediately. It is time to prove your mettle and help the war effort in disrupting shipping to the allies."
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

    orders(){
        //Message at start of patrol to show orders
        this.tv.changeScene("Sunny");
        var message = "";
        switch (this.gm.currentOrders){
            case "British Isles":
                message = " is to proceed to the enclosed area to patrol the British Isles."
                break;
            case "West African Coast":
            case "Spanish Coast":
                message = " is hereby ordered to patrol off the " + this.gm.currentOrders + "."
                break;
            case "British Isles(Minelaying)":
                message = " is directed to take the loaded mines to the enclosed target area and lay the mines, then proceed to patrol the British Isles."
                break;
            case "Norway":
                message = " has been assigned to a patrol off Norway. Proceed to the enclosed target area."
                break;
            case "British Isles(Abwehr Agent Delivery":
                message = " has been entrusted to safely deliver the onboard Abwehr agent to the enclosed area, then proceed to patrol the British Isles."
                break;
            case "Atlantic":
                message = " is hereby ordered to patrol the enclosed area in the Mid-Atlantic."
                break;
            case "Atlantic(Wolfpack)":
                message = " has been assigned to a Wolfpack. Proceed to the area enclosed in these orders and maintain contact with the Wolfpack."
                break;
            case "Mediterranean":
                message = " has been reassigned to the Mediterranean. Immediately upon receipt of this order, proceed through the Gibraltar Strait to join the Mediterranean fleet."
                break;
        }
        

        //new div to add
        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">Incoming Orders from BdU
            <p class="TextMessage_p">${this.gm.getFullDate()}<br>
            ${this.gm.getLRankAndName()}<br><br>
            ${this.gm.getFullUboatID()}${message}<br><br>Happy Hunting.</p>
            <button class="TextMessage_button">Next</button>
        `)

        this.element.querySelector("button").addEventListener("click", ()=> {
            //close popup
            this.done();
            this.gm.eventResolved = true;
        })
    }

    pickOrders(){
        var elementsArray = [];

        for (let i = 0; i < this.uniqueOrders.length; i++){
            elementsArray[i] = document.createElement("div");
            elementsArray[i].classList.add("TextMessage");
            elementsArray[i].innerHTML = (`
                <p class="TextMessage_p> Test </p>
                `)
      
        }

        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">Choose Your Orders
            <p class="TextMessage_p">You are being given the opportunity to pick your orders. Choose from below.<br>
            ${this.element[0]}<br>
            ${this.element[1]}<br>
            </p>
        `)

        this.container.appendChild(this.element);//container is not THIS

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
                this.done2();
            }
        });
    }

    done(){
        this.element.remove();
        this.tv.unpauseGame();
    }

    done2(){
        
        this.element.remove();
        this.tv.unpauseGame();
    }
}