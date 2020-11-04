const fs = require("fs");
const Pokedex = require("pokedex-promise-v2");
const rp = require("request-promise");

const DATA_FILE = "src/data/pokemon.json";

/**
 * Command line arguments.
 *
 * -f : force (always download sprites, even if they already exist)
 * -n : download Pokemon names and generate data JSON
 * -s : download Pokemon sprites
 * -v : verbose (extra logging)
 */
const force = process.argv.indexOf("-f") > -1;
const names = process.argv.indexOf("-n") > -1;
const sprite = process.argv.indexOf("-s") > -1;
const verbose = process.argv.indexOf("-v") > -1;

let originalData;
if (force) {
  originalData = {};
} else {
  originalData = JSON.parse(fs.readFileSync(DATA_FILE));
}

const convertToMap = (data) => {
  console.log("Converting Pokemon array into Dex-Challenge format map.");
  return data.reduce((result, item) => {
    const name = item.name;
    if (verbose) {
      console.log("Processing " + name + ".");
    }

    result[name] = {
      displayName: englishNameFrom(item.names, item.name),
      generation: generationFrom(item.generation),
      order: item.id,
      url: name + ".png",
    };
    return result;
  }, originalData);
};

const downloadSprite = (name, url) => {
  console.log("Requesting sprite for " + name + ".");
  rp(url).pipe(fs.createWriteStream(pathFor(name)));
  console.log("Downloaded sprite for " + name + ".");
};

const downloadSprites = (data) => {
  data.forEach((item) => {
    downloadSprite(item.species.name, item.sprites.front_default);
  });
};

const englishNameFrom = (names, fallback) => {
  const englishName = names
    .filter((name) => name.language.name === "en")
    .map((name) => name.name)
    .join();
  return englishName ? englishName : fallback;
};

const generationFrom = (generation) => {
  switch (generation.name) {
    case "generation-i":
      return 1;
    case "generation-ii":
      return 2;
    case "generation-iii":
      return 3;
    case "generation-iv":
      return 4;
    case "generation-v":
      return 5;
    case "generation-vi":
      return 6;
    case "generation-vii":
      return 7;
    case "generation-viii":
      return 8;
    default:
      console.error("invalid generation " + generation);
  }
};

const pathFor = (name) => {
  return "src/img/" + name + ".png";
};

const requestPokemonForData = (name) => {
  return () => {
    if (!force && originalData.hasOwnProperty(name)) {
      if (verbose) {
        console.log(
          "Skipping retrieving data for " +
            name +
            " since it is already present."
        );
      }
      return Promise.resolve();
    }
    if (verbose) {
      console.log("Requesting species data for " + name + ".");
    }
    return P.getPokemonSpeciesByName(name);
  };
};

const requestPokemonForSprite = (name) => {
  return () => {
    if (!force && fs.existsSync(pathFor(name))) {
      if (verbose) {
        console.log(
          "Skipping downloding sprite for " +
            name +
            " since it is already downloaded."
        );
      }
      return Promise.resolve();
    }
    if (verbose) {
      console.log("Requesting Pokemon data for " + name + ".");
    }
    return P.getPokemonByName(name);
  };
};

const serial = (funcs) =>
  funcs.reduce(
    (promise, func) =>
      promise.then((result) =>
        func().then(Array.prototype.concat.bind(result))
      ),
    Promise.resolve([])
  );

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

const options = {
  cacheLimit: 1, //Prevent script from living longer than needed due to keeping cache alive
  timeout: 1000 * 60 * 5, //Extra long timeout to accountt for rate limiting
};
const P = new Pokedex(options);

const interval = {
  limit: 10 - 1, //Promise API returns one extra
  offset: 0,
};

if (names) {
  console.log("Requesting names..");
  P.getPokemonSpeciesList()
    .then((json) => json.results.map((pokemon) => pokemon.name))
    .then((names) => names.map((name) => requestPokemonForData(name)))
    .then((requests) => serial(requests))
    .then((pokemonArray) =>
      pokemonArray.filter((pokemon) => pokemon !== undefined)
    )
    .then((pokemonArray) => convertToMap(pokemonArray))
    .then((pokemonMap) => writeFile(DATA_FILE, pokemonMap));
}

if (sprite) {
  console.log("Downloading sprites..");
  P.getPokemonSpeciesList()
    .then((json) => json.results.map((pokemon) => pokemon.name))
    .then((names) => names.map((name) => requestPokemonForSprite(name)))
    .then((requests) => serial(requests))
    .then((pokemonArray) =>
      pokemonArray.filter((pokemon) => pokemon !== undefined)
    )
    .then((pokemonArray) => downloadSprites(pokemonArray));
}
