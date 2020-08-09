const fs = require("fs");
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

/**
 * 0-indexed array of Pokemon per generation.
 *
 * e.g. to get the number of Pokemon in generation 2: pokemonInGeneration[2-1];
 */
const pokemonInGeneration = [151, 251, 386, 493, 649, 721, 807];

const convertToMap = (data) => {
  console.log("Converting Pokemon array into Dex-Challenge format map.");
  return data.reduce((result, item) => {
    const name = item.species.name;
    if (verbose) {
      console.log("Processing " + name + ".");
    }
    if (sprite) {
      downloadSprite(name, item.sprites.front_default);
    }

    result[name] = {
      generation: generationOf(item.id),
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

const generationOf = (number) => {
  for (const generation of pokemonInGeneration) {
    if (number <= generation) {
      return pokemonInGeneration.indexOf(generation) + 1;
    }
  }
};

const requestPokemon = (name) => {
  return () => {
    if (verbose) {
      console.log("Requesting data for " + name + ".");
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

const Pokedex = require("pokedex-promise-v2");
const options = {
  cacheLimit: 1, //Prevent script from living longer than needed due to keeping cache alive
  timeout: 1000 * 60 * 5, //Extra long timeout to accountt for rate limiting
};
const P = new Pokedex(options);

const interval = {
  limit: pokemonInGeneration[pokemonInGeneration.length - 1] - 1, //promise API returns one extra
  offset: 0,
};
console.log("Requesting data..");
P.getPokemonsList(interval)
  .then((json) => json.results.map((pokemon) => pokemon.name))
  .then((names) => names.map((name) => requestPokemon(name)))
  .then((requests) => serial(requests))
  .then((pokemonArray) => convertToMap(pokemonArray))
  .then((pokemonMap) => writeFile("src/data/pokemon.json", pokemonMap));
