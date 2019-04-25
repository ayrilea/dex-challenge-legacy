import React, { PureComponent } from "react";
import DexChallenge from "./DexChallenge";
import "./App.scss";
import PokemonData from "./data.json";

class App extends PureComponent {
  render() {
    return <DexChallenge pokemon={PokemonData} />;
  }
}

export default App;
