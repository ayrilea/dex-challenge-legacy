const fs = require("fs");
const rp = require("request-promise");

let count = 0;

//TODO only downloads 150 at a time (random order), probably rate limited and/or node struggling
const downloadSprite = (url) => {
  rp(url)
    .then(body => {
      console.log("Requesting sprite for " + body.name + ".");
      rp(body.sprites.front_default).pipe(fs.createWriteStream("src/img/" + body.name + ".png"));
      console.log("Downloaded sprite for " + body.name + ".");
      count = count + 1;
      console.log("count: " +  count);
    });
}

/**
 * Format the data downloaded from PokeAPI into the name format needed by DexChallenge,
 * and optionally downloads sprites if '-s' flag is set.
 *
 * [{ "name":"bulbasaur", "url": "..." }, { ... }] -> { "bulbasaur": {}, ... }
 *
 * @param {Object} data The data to format, as an array of objects with name and url keys.
 * @return The formatted data, as an object where each key is a name (and the value an empty object).
 */
const processData = data => {
  console.log("Processing data..");
  return data.reduce((result, item) => {
    if (process.argv.indexOf('-s') > -1) {
      downloadSprite(item.url);
    }

    const urlParts = item.url.split("/");
    result[item.name] = { 
      order: urlParts[urlParts.length - 2], //URLs ends in /{order}/, so the second last part is the order
      url: item.name + ".png"
    };
    return result;
  }, {});
};

const writeFile = (location, data) => {
  console.log("Writing data file..");
  fs.writeFile(location, JSON.stringify(data), "utf8", function(err) {
    if (err) {
      console.log("An error occured while writing data to file.");
      return console.log(err);
    }

    console.log("Data file created.");
  });
};

console.log("Requesting data..");
const options = {
  uri: "https://pokeapi.co/api/v2/pokemon?limit=151",
  json: "true"
}
rp(options)
  .then(body => {
    writeFile("src/data.json", processData(body.results));
  });