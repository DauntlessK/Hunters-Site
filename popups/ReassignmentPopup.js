class ReassignmentPopup{
    /**
     * Popup for U-boat reassignment, either automatic or player choice.
     * Responsible for creating new U-boat and assigning to GameManager.
     * @param {TacticalView} tv 
     * @param {GameManager} gm 
     * @param {boolean} upgrade set to true if reassigned due to injury to KMDT
     * @param {boolean} choice set to true if player chose to upgrade in award screen
     * @param {boolean} upgrade set to true if player has an updgrade
     */
    constructor(tv, gm, injury, choice, upgrade) {
        this.tv = tv;
        this.gm = gm;

        this.newSubType = "";
        this.newSubID = 0;


        this.container = document.querySelector(".game-container");

        //Create the element
        this.element = document.createElement("div");
        this.element.classList.add("TextMessage");

        this.assignNewUboat(upgrade, choice, injury);
        
    }

    /**
     * Assigns a new U-boat to the player.
     */
    assignNewUboat(upgradeAvail, choice, injury) {

        if (choice) {
            this.gm.uboatUpgrade = false;
        }

        let timePassedText = "1 month has passed in fitting out the new boat.";
        if (injury) {
            timePassedText = `${this.gm.sub.monthsNeededForRefit} months have passed as you recovered from your serious wounds.`;
        }

        //Allow player to pick new U-boat if he/she is using a VII type and VIIDs are available.
        //Allows player to avoid being put into VIID, IF upgradeAvail is true.
        if ((this.gm.sub.getType().includes("VII") && this.gm.getYear() >= 1942) && upgradeAvail) {
            this.gm.uboatUpgrade = false; //reset upgrade flag
                    
            //new div to add
            this.element.innerHTML = (`
                <h3 class="HeaderMessage_h3">U-Boat Reassignment</h3>
                <p class="TextMessage_p">You have a choice between the VIIC and the VIID.<br>
                <input type="radio" id="VIIC" name="typepicker" value="VIIC" checked="checked">
                <label for="VIIC">Type VIIC</label>
                <input type="radio" id="VIID" name="typepicker" value="VIID">
                <label for="VIID">Type VIID</label>
                <br><br>
                ${timePassedText}</p>
                <button class="TextMessage_button">Next</button>
            `)

            this.container.appendChild(this.element);
        }
        // For when no upgrade available, or automatic assignment
        else {
            this.newSubType = this.gm.getLatestAvailableUboatType();
            this.newSubID = this.getUboatID(this.newSubType);
            let fullSubID = "U-" + this.newSubID;

            //new div to add
            this.element.innerHTML = (`
                <h3 class="HeaderMessage_h3">U-Boat Reassignment</h3>
                <p class="TextMessage_p">You've been assigned to ${fullSubID}, a type ${this.newSubType}.<br>
                Your crew have transferred with you.<br><br>
                <br><br>
                ${timePassedText}</p>
                <button class="TextMessage_button">Next</button>
            `)

            this.container.appendChild(this.element);
        }

        this.element.querySelector("button").addEventListener("click", ()=> {
            //close popup
            this.done();
        })
    }

    /**
     * Gets a new U-boat ID based on type. VIIA is excluded since you would always be "upgraded/reassigned" to a VIIB or higher.
     * @param {string} type 
     * @returns {string} Uboat ID
     */
    getUboatID(type){ 
        let id = [];
        if (type == "VIIB") {
            id.push(45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55);
            id.push(73, 74, 75, 76);
            id.push(83, 84, 85, 86, 87);
            id.push(99, 100, 101, 102);
        }
        else if (type == "VIIC") {
            id.push(69, 70, 71, 72, 77, 78, 79, 80, 81, 82);
            id.push(88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98);
            id.push(132, 133, 134, 135, 136);
            id.push(201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212);
            id.push(221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232);
            for (let i = 235; i <= 458; i++){
                id.push(i);
            }
            for (let i = 551; i <= 779; i++){
                id.push(i);
            }
            for (let i = 951; i <= 995; i++){
                id.push(i);
            }
            id.push(997, 998, 999, 1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010);
            id.push(1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020, 1021, 1022, 1023, 1024, 1025);
            id.push(1051, 1052, 1053, 1054, 1055, 1056, 1057, 1058, 1063, 1064, 1065);
            id.push(1101, 1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1110, 1131, 1132);
            id.push(1161, 1162, 1163, 1164, 1165, 1166, 1167, 1168, 1169, 1170, 1171, 1172);
            id.push(1192, 1193, 1194, 1195, 1196, 1197, 1198, 1199, 1200, 1201, 1202, 1203, 1204, 1205, 1206, 1207, 1208, 1209, 1210);
            id.push(1271, 1272, 1273, 1274, 1275, 1276, 1277, 1278, 1279);
            id.push(1301, 1302, 1303, 1304, 1305, 1306, 1307, 1308);
        }
        else if (type == "VIID") {
            id.push(213, 214, 215, 216, 217, 218);
        }
        else if (type == "IXA") {
            id.push(37, 38, 39, 40, 41, 42, 43, 44);
        }
        else if (type == "IXB") {
            id.push(64, 65, 103, 104, 105, 106, 107, 108, 109, 110, 111);
            id.push(122, 123, 124);
        }
        else if (type == "IXC") {
            id.push(66, 67, 68, 125, 126, 127, 128, 129, 130, 131);
            for (let i = 153; i <= 176; i++){
                id.push(i);
            }
            id.push(183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194);
            for (let i = 501; i <= 550; i++){
                id.push(i);
            }
            id.push(801, 802, 803, 804, 805, 806, 841, 842, 843, 844, 845, 846);
            id.push(853, 854, 855, 856, 857, 858, 865, 866, 867, 868, 869, 870);
            id.push(865, 866, 867, 868, 869, 870, 877, 878, 879, 880, 881, 882, 883, 889);
            for (let i = 1221; i <= 1279; i++){
                id.push(i);
            }
        }

        //roll for random id
        //ensure no previous sub matches 
        let ID_not_unique = true;
        let idNum = 0;
        let idString = "";
        while (ID_not_unique) {
            idNum = id[Math.floor(Math.random() * id.length)]
            idString = idNum.toString();
            if (this.gm.pastSubs.includes(idString)) {
                continue;
            } else {
                ID_not_unique = false;
            }
        }
        return idString;
    }

    remove() {
        this.element.remove();
    }

    done(){
        if (this.gm.sub.getType().includes("VII") && this.gm.getYear() >= 1942) {
            this.newSubType = document.querySelector('input[name="typepicker"]:checked').value;
            this.newSubID = this.getUboatID(this.newSubType);
        }

        //get previous sub objects knights cross level and crew levels
        let previousKC = this.gm.sub.knightsCross;
        let previousCrewLevels = this.gm.sub.crew_levels;

        this.gm.permArcPost = false; //reset permanent arc flag
        this.gm.permMedPost = false; //reset permanent med flag

        let newSub = new Uboat(this.newSubType, this.tv, this.gm, previousCrewLevels, previousKC);
        this.gm.sub = newSub;
        this.gm.id = this.newSubID;
        this.element.remove();
        this.gm.eventResolved = true;
    }
}