const fs = require("fs");
const request = require("request");

/**
 * Format the data downloaded from PokeAPI into the format needed by DexChallenge.
 *
 * [{ "name":"bulbasaur", "url": "..." }, { ... }] -> { "bulbasaur": {}, ... }
 *
 * @param {Object} data The data to format, as an array of objects with name and url keys.
 * @return The formatted data, as an object where each key is a name (and the value an empty object).
 */
const formatData = data => {
  return data.reduce((result, item) => {
    result[item.name] = {};
    return result;
  }, {});
};

const requestData = onSuccess => {
  request(
    "https://pokeapi.co/api/v2/pokemon?limit=151",
    { json: true },
    (err, res, body) => {
      if (err) {
        console.log("An error occured while requesting data.");
        return console.log(err);
      }

      onSuccess(body);
    }
  );
};

const writeFile = (location, data) => {
  fs.writeFile(location, JSON.stringify(data), "utf8", function(err) {
    if (err) {
      console.log("An error occured while writing data to file.");
      return console.log(err);
    }

    console.log("Data file created.");
  });
};

requestData(body => {
  writeFile("src/data.json", formatData(body.results));
});
