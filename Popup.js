class Popup{
    constructor(message, tv, sub) {
        this.message = message;
        //this.onComplete = onConplete;
        this.tv = tv;
        this.sub = sub;
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
            default:
                console.log("Error selecting correct message to popup");
        }
        container.appendChild(this.element);
    }


    subSelectElement() {
        //Message to select sub at start of game

        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">Hunters: German U-Boats at War
            <p class="TextMessage_p">Choose your U-Boat / start date:<br>
            <button class="Option_button">Type VIIA    •   Sept - 39</button><br>
            <button class="Option_button">Type VIIB   •   Sept - 39</button><br>
            <button class="Option_button" id="IXA">Type IXA    •   Sept - 39</button><br>
            <button class="Option_button">Type IXB • Apr - 40</button><br>
            <button class="Option_button">Type VIIC • Oct - 40</button><br>
            <button class="Option_button">Type VIID • Jan - 42</button>
            </p>
        `)

        console.log(document.getElementById("IXA"));

        this.element.querySelector("button").addEventListener("click", ()=> {
            //close popup
            this.done();
        })
    }

    startGameTextElement() {
        //Message to announce starting rank, sub, date, etc

        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">Hunters: German U-Boats at War
            <p class="TextMessage_p">Welcome, ${this.sub.getRankAndName()}. Report to ${this.sub.getFullUboatID()} immediately.</p>
            <button class="TextMessage_button">Next</button>
        `)

        this.element.querySelector("button").addEventListener("click", ()=> {
            //close popup
            console.log(event);
            this.done();
        })
    }

    done(){
        this.element.remove();
        this.tv.unpauseGame();
    }
}