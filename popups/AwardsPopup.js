class AwardsPopup{
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

        this.awardsAndPromotionRunDown()
    }

    //Systematically go through each possible award, promotion and possible level upgrade
    awardsAndPromotionRunDown() {
        
        //Experience check
        let expText = this.crewExperience();

        //Knight's Cross Check
        let knightsCrossText = this.knightsCrossCheck();

        //Additional awards
        let uboatWarBadgeText = this.uboatWarBadgeCheck();
        let woundBadgeText = this.woundBadgeCheck();
        let uboatFrontClaspText = this.uboatFrontClaspCheck();
        let germanCrossText = this.germanCrossCheck();

        //Upgrade check (must perform after knight's cross)
        if (this.gm.uboatUpgrade) { 
            this.showUboatUpgrade = true;
        }

        
        //LAST check for promotion possibility- every 12 months minimum
        let promotionText = "Not up for promotion at this time.";
        if ((this.gm.monthsAtSea + this.gm.monthsInPort) / 12 >= this.gm.numPromotionChecks + 1) {
            this.gm.numPromotionChecks++;
            this.showPromotion = true;
            promotionText = this.promotionEvalulation();
        }

        if (this.showKnightsCross || this.showUboatWarBadge || this.showWoundBadge || this.showCrewLevelUp || 
            this.showUboatFrontClasp || this.showGermanCross || this.showUboatUpgrade || this.showPromotion
            || this.gm.uboatUpgrade) {
            this.awards(expText, knightsCrossText, uboatWarBadgeText, uboatFrontClaspText, germanCrossText, woundBadgeText, promotionText);
        }
        else {
            this.noAwards();
        }

    }

    /**
     * Checks if crew has enough patrols for an increased level, if it does,
     * rolls for crew experience and returns a string for the popup to display.
     * @return {string} Text to display in popup about crew experience 
     */
    crewExperience() {
        let toReturn = "";
        const crewLevelLong = ["green", "trained", "veteran", "elite"];
        const officerLevelLong = ["trained", "expert"];

        //Check for possible increase to crew skill - done every 3 successful patrols
        if (this.gm.successfulPatrols % 3 == 0 && !this.gm.checkedForCrewLevelUp && this.gm.successfulPatrols != 0) {
            this.showCrewLevelUp = true;
            let crewLevelUpgradeRoll = d6Roll();
            let crewMan = "";
            let bonus = "";

            switch (crewLevelUpgradeRoll) {
                case 1:
                    crewMan = "Engineer";
                    bonus = " (all  repair  rolls receive favorable -1 modifier)";
                    break;
                case 2:
                    crewMan = "Doctor";
                    bonus = " (all crew injury recovery  rolls  receive  favorable  -1 modifier)";
                    break;
                case 3:
                    crewMan = "Watch Officer 1";
                    bonus = " (no penalty if he takes command of boat)";
                    break;
                case 4:
                    crewMan = "Watch Officer 2";
                    bonus = " (no penalty if he takes command of boat)";
                    break;
                case 5:
                case 6:
                    crewMan = "Crew";
                    bonus = " (bonuses to flak effectiveness and reduction in dive times to avoid aircraft attacks)"
                    break;
            }

            this.gm.sub.crew_levels[crewMan] += 1;
            if (crewMan != "Crew") {
                toReturn = `The ${crewMan} has improved to ${officerLevelLong[this.gm.sub.crew_levels[crewMan]]} level!`;
            }
            else {
                toReturn = `The ${crewMan} have improved to ${crewLevelLong[this.gm.sub.crew_levels[crewMan]]} level!`;
            }
            toReturn += bonus;

            if (this.gm.sub.crew_levels[crewMan] >= 4 && crewMan == "Crew") {
                toReturn = `The ${crewMan} are already at elite level and cannot improve further.`;
                this.gm.sub.crew_levels[crewMan] = 3;   //ensure doesn't go over elite
            }
            else if (crewMan != "Crew" && this.gm.sub.crew_levels[crewMan] > 1) {
                toReturn = `The ${crewMan} is already an expert and cannot improve further.`;
                this.gm.sub.crew_levels[crewMan] = 1;
            }

            this.gm.checkedForCrewLevelUp = true;
        }
        // Check for 3 unsuccessful patrols in a row for crew level exp decrease
        else if ((this.gm.unsuccessfulPatrolsInARow > 0 && this.gm.unsuccessfulPatrolsInARow % 3 == 0) || this.gm.sub.isCrewKnockedOut()) {
            this.gm.sub.crew_levels["Crew"] -= 1;
            if (this.gm.sub.crew_levels["Crew"] < 0) {
                this.gm.sub.crew_levels["Crew"] = 0;   //ensure doesn't go below green
                toReturn = `The crew are already at green level and cannot decrease further.`;
            }
            else {
                toReturn = `The crew have fallen to ${crewLevelLong[this.gm.sub.crew_levels["Crew"]]} level due to poor performance.`;
            }
        }
        else {
            toReturn = "No changes to crew<br>experience levels.";
        }
        return toReturn;
    }

    /**
     * Checks if the player qualifies for a Knight's Cross award or upgrade
     * @returns string to display in popup about Knight's Cross status
     */
    knightsCrossCheck() {

        let toReturn = "No change to Knight's Cross status.";
        //Check to see if award from 0 -> 1
        if (this.gm.sub.knightsCross == 0) {
            if (this.gm.getTotalGRT("Int") >= 100000 || this.gm.capitalShipsSunkSinceLastKnightsCross > 0) {
                this.showKnightsCross = true;
                this.gm.uboatUpgrade = true;
                this.gm.sub.knightsCross = 1;
                toReturn = "Awarded the Knight's Cross for outstanding performance!";
                toReturn += " (Can fire fore & aft salvo without penalty)";
                this.gm.capitalShipsSunkSinceLastKnightsCross = 0;
                this.gm.knightsCrossSinceLastPromotionCheck++;            
            }
            else {
                toReturn = "You currently do not have<br>the Knight's Cross.";
            }
        }
        //Check to see if award from 1 -> 2
        else if (this.gm.sub.knightsCross == 1) {
            if (this.gm.getTotalGRT("Int") >= 175000 || this.gm.capitalShipsSunkSinceLastKnightsCross > 0) {
                this.showKnightsCross = true;
                this.gm.uboatUpgrade = true;
                this.gm.sub.knightsCross = 2;
                toReturn = "Awarded the Knight's Cross & Oakleaves for outstanding performance!";
                toReturn += " (Deck gun and torpedo accuracy bonus + can fire fore & aft salvo without penalty)";
                this.gm.capitalShipsSunkSinceLastKnightsCross = 0;
                this.gm.knightsCrossSinceLastPromotionCheck++; 
            }
            else {
                toReturn = "You currently have the Knight's Cross.";
                toReturn += " (Can fire fore & aft salvo without penalty.)";
            }
        }
        //Check to see if award from 2 -> 3
        else if (this.gm.sub.knightsCross == 2) { 
            if (this.gm.getTotalGRT("Int") >= 250000 || this.gm.capitalShipsSunkSinceLastKnightsCross > 0) {
                this.showKnightsCross = true;
                this.gm.uboatUpgrade = true;
                this.gm.sub.knightsCross = 3;
                toReturn = "Awarded the Knight's Cross & Oakleaves & Swords for outstanding performance!";
                toReturn += " (Harder to detect at close range + deck gun and torpedo accuracy bonus + can fire fore & aft salvo without penalty)";
                this.gm.capitalShipsSunkSinceLastKnightsCross = 0;
                this.gm.knightsCrossSinceLastPromotionCheck++; 
            }
            else {
                toReturn = "You currently have the Knight's Cross with Oakleaves.";
                toReturn += " (Deck gun and torpedo accuracy bonus + can fire fore & aft salvo without penalty)";;
            }
        }
        else if (this.gm.sub.knightsCross == 3) {
            if (this.gm.getTotalGRT("Int") >= 300000 || this.gm.capitalShipsSunkSinceLastKnightsCross > 0) {
                this.showKnightsCross = true;
                this.gm.uboatUpgrade = true;
                this.gm.sub.knightsCross = 4;
                toReturn = "Awarded the Knight's Cross with Oakleaves, Swords and Diamonds for outstanding performance!";
                toReturn += " (Able to follow any target ships or convoys + Harder to detect at close range + Deck gun and torpedo accuracy bonus + can fire fore & aft salvo without penalty)";
                this.gm.capitalShipsSunkSinceLastKnightsCross = 0;
                this.gm.knightsCrossSinceLastPromotionCheck++; 
            }
            else {
                toReturn = "You currently have the Knight's Cross with Oakleaves and Swords.";
                toReturn += " (Harder to detect at close range + deck gun and torpedo accuracy bonus + can fire fore & aft salvo without penalty)";
            }
        }
        else if (this.gm.sub.knightsCross == 4) {
            toReturn = "You currently have the Knight's Cross with Oakleaves, Swords and Diamonds. The highest you can achieve.";
            toReturn += " (Able to follow any target ships or convoys + Harder to detect at close range + Deck gun and torpedo accuracy bonus + can fire fore & aft salvo without penalty)";
        }
        return toReturn;
    }

    /**
     * Check uboat war badge award
     * @returns string to display in popup about U-Boat War Badge award
     */
    uboatWarBadgeCheck() {
        let toReturn = "";


        if (this.gm.patrolNum == 5 && this.gm.uboatWarBadgeLevel == 0) {
            this.showUboatWarBadge = true;
            this.gm.uboatWarBadgeLevel = 1;
            toReturn = "You've been awarded the U-Boat War Badge!";
        }
        else if (this.gm.patrolNum == 15 && this.gm.uboatWarBadgeLevel == 1) {
            this.showUboatWarBadge = true;
            this.gm.uboatWarBadgeLevel = 2;
            toReturn = "You've been awarded the U-Boat War Badge with Diamonds!";;
        }
        else {
            switch (this.gm.uboatWarBadgeLevel) {
                case 0:
                    toReturn = "You currently do not have<br>the U-Boat War Badge.";
                    break;
                case 1:
                    toReturn = "You currently have the U-Boat War Badge.";
                    break;
                case 2:
                    toReturn = "You currently have the U-Boat War Badge with Diamonds. The highest you can achieve.";
                    break;
            }
        }

        return toReturn;
    }

    /**
     * check uboat front clasp award
     * @returns string to display in popup about U-Boat Front Clasp award
     */
    uboatFrontClaspCheck() {
        let toReturn = "";

        if (this.gm.mostShipsSunkOnPatrol >= 5 && this.gm.uboatFrontClaspLevel == 0) {
            this.showUboatFrontClasp = true;
            this.gm.uboatFrontClaspLevel = 1;
            toReturn += "You've been awarded the U-Boat Front Clasp in Black!";
        }
        else if (this.gm.mostShipsSunkOnPatrol >= 12 && this.gm.uboatFrontClaspLevel == 1) {
            this.showUboatFrontClasp = true;
            this.gm.uboatFrontClaspLevel = 2;
            toReturn += "You've been awarded the U-Boat Front Clasp in Silver!";
        }
        else if (this.gm.mostShipsSunkOnPatrol >= 16 && this.gm.uboatFrontClaspLevel == 2) {
            this.showUboatFrontClasp = true;
            this.gm.uboatFrontClaspLevel = 3;
            toReturn += "You've been awarded the U-Boat Front Clasp in Gold!";
        }
        else {
            switch (this.gm.uboatFrontClaspLevel) {
                case 0:
                    toReturn = "You currently do not have<br>the U-Boat Front Clasp.";
                    break;
                case 1:
                    toReturn = "You currently have the U-Boat Front Clasp in Black.";
                    break;
                case 2:
                    toReturn = "You currently have the U-Boat Front Clasp in Silver.";
                    break;
                case 3:
                    toReturn = "You currently have the U-Boat Front Clasp in Gold. The highest you can achieve.";
                    break;
            }
        }

        return toReturn;
    }

    woundBadgeCheck() {
        let toReturn = "";

        //check wound badge award
        if (this.gm.KMDTWasWoundedThisPatrol && this.gm.numPatrolsKMDTWounded >= 1 && this.gm.woundBadgeLevel == 0) {
            this.showWoundBadge = true;
            this.gm.woundBadgeLevel = 1;
            toReturn += "You've been awarded the Wound Badge in Black!";
        }
        else if (this.gm.KMDTWasWoundedThisPatrol && this.gm.numPatrolsKMDTWounded >= 3 && this.gm.woundBadgeLevel == 1) {
            this.showWoundBadge = true;
            this.gm.woundBadgeLevel = 2;
            toReturn += "You've been awarded the Wound Badge in Silver!";
        }
        else if (this.gm.KMDTWasWoundedThisPatrol && this.gm.numPatrolsKMDTWounded >= 5 && this.gm.woundBadgeLevel == 2) {
            this.showWoundBadge = true;
            this.gm.woundBadgeLevel = 3;
            toReturn += "You've been awarded the Wound Badge in Gold!";
        }
        else {
            switch (this.gm.woundBadgeLevel) {
                case 0:
                    toReturn = "You currently do not have<br>the Wound Badge.";
                    break;
                case 1:
                    toReturn = "You currently have the Wound Badge in Black.";
                    break;
                case 2:
                    toReturn = "You currently have the Wound Badge in Silver.";
                    break;
                case 3:
                    toReturn = "You currently have the Wound Badge in Gold. The highest you can achieve.";
                    break;
            }
        }
        return toReturn;
    }

    germanCrossCheck() {
        let toReturn = "";

        //check german cross award
        if (this.gm.planesShotDown >= 2 && this.gm.germanCrossLevel == 0) {
            this.showGermanCross = true;
            this.gm.germanCrossLevel = 1;
            toReturn += "You've been awarded the German Cross in Black!";
        }
        else if (this.gm.planesShotDown >= 5 && this.gm.germanCrossLevel == 1) {
            this.showGermanCross = true;
            this.gm.germanCrossLevel = 2;
            toReturn += "You've been awarded the German Cross in Silver!";
        }
        else if (this.gm.planesShotDown >= 7 && this.gm.germanCrossLevel == 2) {
            this.showGermanCross = true;
            this.gm.germanCrossLevel = 3;
            toReturn += "You've been awarded the German Cross in Gold!";
        }
        else {
            switch (this.gm.germanCrossLevel) {
                case 0:
                    toReturn = "You currently do not have<br>the German Cross.";
                    break;
                case 1:
                    toReturn = "You currently have the German Cross in Black.";
                    break;
                case 2:
                    toReturn = "You currently have the German Cross in Silver.";
                    break;
                case 3:
                    toReturn = "You currently have the German Cross in Gold. The highest you can achieve.";
                    break;
            }
        }
        return toReturn;
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
            toReturn = "You've been promoted!<br>Congratulations " + this.gm.getLRankAndName() + "!";
        }
        else {
            toReturn = "Unfortunately command believes<br>you are not fit for promotion, yet.";
        }

        this.gm.knightsCrossSinceLastPromotionCheck = 0;
        this.gm.shipsSunkSinceLastPromotionCheck = 0;
        this.gm.unsuccessfulPatrolsSinceLastPromotionCheck = 0;

        return toReturn;
    }

    /**
     * Displays HTML for awards popup
     * @param {string} expText 
     * @param {string} knightsText 
     * @param {string} warBadgeText
     * @param {string} frontClaspText 
     * @param {string} germanCrossText 
     * @param {string} woundBadgeText 
     * @param {string} promotionText 
     */
    awards(expText, knightsText, warBadgeText, frontClaspText, germanCrossText, woundBadgeText, promotionText) {
        //Crate image paths
        let rankImagePath = "images/ui/ranks/Rank" + this.gm.sub.crew_levels["Kommandant"].toString() + ".png";
        let upgradeTokenNum = 0;
        if (this.gm.uboatUpgrade) {
            upgradeTokenNum = 1;
        }
        let uboatUpgradeImagePath = "images/ui/decorations/UpgradeToken" + upgradeTokenNum +".png";
        let knightsCrossImagePath = "images/ui/decorations/KnightsCross" + (this.gm.sub.knightsCross) +".png";
        let warBadgeImagePath = "images/ui/decorations/UboatWarBadge" + (this.gm.uboatWarBadgeLevel) +".png";
        let frontClaspImagePath = "images/ui/decorations/UboatFrontClasp" + (this.gm.uboatFrontClaspLevel) +".png";
        let germanCrossImagePath = "images/ui/decorations/GermanCross" + (this.gm.germanCrossLevel) +".png";
        let woundBadgeImagePath = "images/ui/decorations/WoundBadge" + (this.gm.woundBadgeLevel) +".png";
        let upgradeSection = "";        //Full HTML for upgrade section

        //Award id (for new / highlighted awards and non)
        let award_promotion_id = "award";
        let award_experience_id = "award";
        let award_knights_id = "award";
        let award_warbadge_id = "award";
        let award_frontclasp_id = "award";
        let award_germancross_id = "award";
        let award_woundbadge_id = "award";

        const award_new = "awardNEW";

        if  (this.showPromotion) {
            award_promotion_id = award_new;
        }
        if  (this.showCrewLevelUp) {
            award_experience_id = award_new;
        }
        if  (this.showKnightsCross) {
            award_knights_id = award_new;
        }
        if  (this.showUboatWarBadge) {
            award_warbadge_id = award_new;
        }
        if (this.showUboatFrontClasp) {
            award_frontclasp_id = award_new;
        }
        if (this.showGermanCross) {
            award_germancross_id = award_new;
        }
        if (this.showWoundBadge) {
            award_woundbadge_id = award_new;
        }

        //Build HTML for upgrade section
        if (this.showUboatUpgrade) {
            let upgradeChoice = this.gm.getLatestAvailableUboatType();
            if (upgradeChoice == "VIID") {
                upgradeChoice = "VIIC or VIID";
            }

            upgradeSection = (`
                <div class = "Awards_Upgrade" id = "awardNEW">
                    <p class ="AwardMessage_p"><span class = "Bold">U-Boat Upgrade</span></p>
                    <div class = "AwardImage">
                        <img src = ${uboatUpgradeImagePath}>
                    </div>
                    <p class = "AwardDetails_p">
                    <input type="radio" id="VIIC" name="upgradepicker" value="noupgrade" checked="checked">
                    <label for="noupgrade">Do Not Upgrade Yet</label><br>
                    <input type="radio" id="VIID" name="upgradepicker" value="upgrade">
                    <label for="upgrade">Upgrade / Reassign to Type ${upgradeChoice}</label></p>
                </div>
            `);
        }
        else {
            upgradeSection = (`
                <div class = "Awards_Upgrade" id = "award">
                    <p class ="AwardMessage_p"><span class = "Bold">U-Boat Upgrade</span></p>
                    <div class = "AwardImage">
                        <img src = ${uboatUpgradeImagePath}>
                    </div>
                    <p class ="AwardDetails_p">No upgrade available.</p>
                </div>
            `);
        }

        //new div to add----------

        this.element.innerHTML = (`
            <div class = "Awards_Header">
                <h3 class="HeaderMessage_h3">Awards, Decorations & Promotions<br></h3>
            </div>


            <div class = "Awards_Rank" id = "${award_promotion_id}">
                <p class ="AwardMessage_p"><span class = "Bold">Rank</span></p>
                <div class = "AwardImage">
                    <img src = ${rankImagePath}>
                </div>
                <p class ="AwardDetails_p">${promotionText}</p>
            </div>

            <div class = "Awards_Experience" id = "${award_experience_id}">
                <p class ="AwardMessage_p"><span class = "Bold">Crew Experience</span></p>
                <p class ="AwardDetails_p">${expText}</p>
            </div>

            <div class = "Awards_Knights" id = "${award_knights_id}">
                <p class ="AwardMessage_p"><span class = "Bold">Knight's Cross</span></p>
                <div class = "AwardImage">
                    <img src = ${knightsCrossImagePath}>
                </div>
                <p class ="AwardDetails_p">${knightsText}</p>
            </div>

            ${upgradeSection}




            <div class = "Awards_WarBadge" id = "${award_warbadge_id}">
                <p class ="AwardMessage_p"><span class = "Bold">U-boat War Badge</span></p>
                <div class = "AwardImage">
                    <img src = ${warBadgeImagePath}>
                </div>
                <p class ="AwardDetails_p">${warBadgeText}</p>
            </div>

            <div class = "Awards_FrontClasp" id = "${award_frontclasp_id}">
                <p class ="AwardMessage_p"><span class = "Bold">U-boat Front Clasp</span></p>
                <div class = "AwardImage">
                    <img src = ${frontClaspImagePath}>
                </div>
                <p class ="AwardDetails_p">${frontClaspText}</p>
            </div>

            <div class = "Awards_GermanCross" id = "${award_germancross_id}">
                <p class ="AwardMessage_p"><span class = "Bold">German Cross</span></p>
                <div class = "AwardImage">
                    <img src = ${germanCrossImagePath}>
                </div>
                <p class ="AwardDetails_p">${germanCrossText}</p>
            </div>

            <div class = "Awards_WoundBadge" id = "${award_woundbadge_id}">
                <p class ="AwardMessage_p"><span class = "Bold">Wound Badge</span></p>
                <div class = "AwardImage">
                    <img src = ${woundBadgeImagePath}>
                </div>
                <p class ="AwardDetails_p">${woundBadgeText}</p>
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
        if (this.showUboatUpgrade) {
            console.log("Processing upgrade choice...");
            if (document.querySelector('input[name="upgradepicker"]:checked').value == "upgrade") {
                console.log("Player chose to upgrade U-boat.");
                this.gm.uboatUpgradeChoice = true;
            }
        }
        this.element.remove();
        this.tv.pauseGame(false);
        this.gm.awardsResolved = true;
    }

    noAwards() {
        //this.element.remove();
        this.tv.pauseGame(false);
        this.gm.awardsResolved = true;
    }

}