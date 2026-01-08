class FinalPromotionPopup {
    constructor(tv, gm) {
        this.tv = tv;
        this.gm = gm;

        this.showCrewLevelUp = false;
        this.showKnightsCross = false;
        this.showUboatWarBadge = false;
        this.showWoundBadge = false;
        this.showUboatFrontClasp = false;
        this.showGermanCross = false;
        this.showUboatUpgrade = false;
        this.showPromotion = false;

        this.tv.pauseGame(true);

        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");
        this.element.classList.add("AwardsMessage");

        let promotionText = this.promotionEvalulation();
        this.promotion(promotionText);
    }

    promotionEvalulation() {
        let toReturn = "";
        let promotionRoll = d6Roll();
        let promotionRollMods = 0;

        promotionRollMods -= this.gm.knightsCrossSinceLastPromotionCheck;
        promotionRollMods -= Math.floor(this.gm.shipsSunkSinceLastPromotionCheck / 10);
        promotionRollMods += this.gm.unsuccessfulPatrolsSinceLastPromotionCheck;

        if (promotionRoll + promotionRollMods <= 4) {
            this.gm.sub.crew_levels["Kommandant"] += 1;
            toReturn = "You've been promoted! Congratulations " + this.gm.getLRankAndName() + "!";
        }
        else {
            toReturn = "Unfortunately command believes you are not fit for promotion.";
        }

        this.gm.knightsCrossSinceLastPromotionCheck = 0;
        this.gm.shipsSunkSinceLastPromotionCheck = 0;
        this.gm.unsuccessfulPatrolsSinceLastPromotionCheck = 0;

        return toReturn;
    }

    /**
     * Displays HTML for promotion popup
     */
    promotion(promotionText) {
        //Crate image paths
        let rankImagePath = "images/ui/ranks/Rank" + this.gm.sub.crew_levels["Kommandant"].toString() + ".png";

        //new div to add----------

        this.element.innerHTML = (`
            <div class = "Awards_Header">
                <h3 class="HeaderMessage_h3">Career Evaluation<br></h3>
            </div>


            <div class="Commander_Image">
                    <img src = "images/ui/ranks/CommanderPortrait.png" style="max-height: 140px;">
            </div>
            <div class="Rank_Image">
                    <img src = "${rankImagePath}" style="max-height: 100px;">
            </div>

            <div class="Promotion_Text">
                <p class="Promotion_Text_p">${promotionText}</p>
            </div>


            <button class="AttackPopup_button" id="continue">Continue</button>
            
        `)

        this.element.addEventListener("click", ()=> {
            if (event.target.id == "continue"){
                //close popup
                this.done();
            }
        })

        this.container.appendChild(this.element);
    }

    done(){
        this.element.remove();
        this.tv.pauseGame(false);
        this.gm.awardsResolved = true;
    }

}