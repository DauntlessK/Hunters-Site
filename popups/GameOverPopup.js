class GameOverPopup{
    constructor(tv, gm, enc, cause) {
        this.tv = tv;
        this.gm = gm;
        this.enc = enc;
        this.cause = cause;

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");

        this.element.classList.add("TextMessage");

        this.gameOver();
    }

    gameOver() {
        //new div to add
        this.element.innerHTML = (`
            <h3 class="HeaderMessage_h3">GAME OVER!</h3>
            <p class="TextMessage_p">${this.cause}<br>
            </p>
        `)

        this.container.appendChild(this.element);
        this.tv.pauseGame(true);
    }
    
    done(id){
        if (!this.tv.isPaused) {
            this.element.remove();
            this.gm.setEventResolved(true);
        }
    }

    remove() {
        this.element.remove();
    }
}