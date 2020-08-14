const fs = require("fs");
const Pokedex = require("pokedex-promise-v2");
const rp = require("request-promise");

/**
 * Command line arguments.
 *
 * -f : force (always download sprites, even if they already exist)
 * -s : download Pokemon sprites (in addition to generating data JSON)
 * -v : verbose (extra logging)
 */
const force = process.argv.indexOf("-f") > -1;
const sprite = process.argv.indexOf("-s") > -1;
const verbose = process.argv.indexOf("-v") > -1;

const convertToMap = (data) => {
  console.log("Converting Pokemon array into Dex-Challenge format map.");
  return data.reduce((result, item) => {
    const name = item.name;
    if (verbose) {
      console.log("Processing " + name + ".");
    }

    result[name] = {
      displayName: englishNameFrom(item.names),
      generation: generationFrom(item.generation),
      order: item.id,
      url: name + ".png",
    };
    return result;
  }, {});
};

const downloadSprite = (name, url) => {
  const path = "src/img/" + name + ".png";
  if (force || !fs.existsSync(path)) {
    console.log("Requesting sprite for " + name + ".");
    rp(url).pipe(fs.createWriteStream("src/img/" + name + ".png"));
    console.log("Downloaded sprite for " + name + ".");
  } else if (verbose) {
    console.log(
      "Skipping downloding sprite for " +
        name +
        " since it is already downloaded."
    );
  }
};

const downloadSprites = (data) => {
  data.forEach((item) => {
    downloadSprite(item.species.name, item.sprites.front_default);
  });
};

const englishNameFrom = (names) => {
  return names
    .filter((name) => name.language.name === "en")
    .map((name) => name.name)
    .join();
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
    default:
      console.error("invalid generation " + generation);
  }
};

const requestPokemon = (name) => {
  return () => {
    if (verbose) {
      console.log("Requesting Pokemon data for " + name + ".");
    }
    return P.getPokemonByName(name);
  };
};

const requestPokemonSpecies = (name) => {
  return () => {
    if (verbose) {
      console.log("Requesting species data for " + name + ".");
    }
    return P.getPokemonSpeciesByName(name);
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

console.log("Requesting data..");
P.getPokemonSpeciesList()
  .then((json) => json.results.map((pokemon) => pokemon.name))
  .then((names) => names.map((name) => requestPokemonSpecies(name)))
  .then((requests) => serial(requests))
  .then((pokemonArray) => convertToMap(pokemonArray))
  .then((pokemonMap) => writeFile("src/data/pokemon.json", pokemonMap));

if (sprite) {
  console.log("Downloading sprites..");
  const numberOfPokemon = 807;
  const interval = {
    limit: numberOfPokemon - 1, //Promise API returns one extra
    offset: 0,
  };
  P.getPokemonsList(interval)
    .then((json) => json.results.map((pokemon) => pokemon.name))
    .then((names) => names.map((name) => requestPokemon(name)))
    .then((requests) => serial(requests))
    .then((pokemonArray) => downloadSprites(pokemonArray));
}
