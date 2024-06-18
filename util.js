function d6Roll() {
  //rolls a single die (1-6)
    roll = Math.floor(Math.random() * (6 - 1)) + 1;
    return roll;
}

function d6Rollx2() {
  //roles 2 dice and returns result (2-12)
    roll = d6Roll() + d6Roll();
    return roll;
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

async function getDataFromTxt(fullFilePath) {
  //gets a list from a txt file and returns 1 array
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
      toReturn = toReturn.split("\r");
      for (let i = 0; i < toReturn.length; i++){
          toReturn[i] = toReturn[i].replace('\n','');
      }
      return toReturn;
    })
    .catch((error) => {
      toReturn = `Error: ${error.message}`;
    });
}

function onlyUnique(value, index, array) {
  //returns array of only unique values
  return array.indexOf(value) === index;
}