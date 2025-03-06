/**
 * Rolls 1 6-sided die
 * @returns 1-6
 */
function d6Roll() {
  //rolls a single die (1-6)
    roll = Math.floor(Math.random() * (6 - 1)) + 1;
    return roll;
}

/**
 * rolls 2 6-sided dice
 * @returns 2-12
 */
function d6Rollx2() {
    roll = d6Roll() + d6Roll();
    return roll;
}

function d3Roll() {
  //rolls a single die (1-3)
    roll = Math.floor(Math.random() * (3 - 1)) + 1;
    return roll;
}

/**
 * Generates number between two ints
 * @param {int} min 
 * @param {int} max 
 * @returns Number between min and max, inclusive
 */
function randomNum(min, max) {
  num = Math.floor(Math.random() * (max - min)) + 1;
  return num;
}

function until(conditionFunction) {
  // part of async function to wait until action is taken
    const poll = resolve => {
      if(conditionFunction()) resolve();
      else setTimeout(_ => poll(resolve), 400);
    }
    return new Promise(poll);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//gets a list from a txt file and returns 1 array
function getDataFromTxt(fullFilePath) {
  const myRequest = new Request(fullFilePath);
  var toReturn;

  return fetch(myRequest)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error, status = ${response.status}`);
      }
      return response.text();
    })
    .then((text) => {
      toReturn = text;
      toReturn = toReturn.split("\n");
      for (let i = 0; i < toReturn.length; i++){
          toReturn[i] = toReturn[i].replace('\n','');
      }
      return toReturn;
    })
    .catch((error) => {
      console.log("CATCH");
      toReturn = `Error: ${error.message}`;
    });
}

function onlyUnique(value, index, array) {
  //returns array of only unique values
  return array.indexOf(value) === index;
}