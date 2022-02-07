import React, { PureComponent } from "react";
import DexChallenge from "./DexChallenge";
import Menu from "./Menu";
import "./App.scss";
import Pokemon from "./data/pokemon.json";

class App extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      generations: JSON.parse(localStorage.getItem("generations")) || [],
      inGame: JSON.parse(localStorage.getItem("inGame")) || false,
    };
  }

  parseGenerations = () => {
    const generations = this.state.generations;
    const numberOfGenerations = generations.length;
    if (numberOfGenerations === 1) {
      return generations[0];
    }

    const sortedGenerations = generations.sort((a, b) => a - b);
    return (
      sortedGenerations.slice(0, numberOfGenerations - 1).join(", ") +
      " and " +
      sortedGenerations[numberOfGenerations - 1]
    );
  };

  reset = () => {
    localStorage.removeItem("generations");
    localStorage.setItem("inGame", JSON.stringify(false));

    this.setState({
      generations: [],
      inGame: false,
    });
  };

  startGame = (generations) => {
    localStorage.setItem("generations", JSON.stringify(generations));
    localStorage.setItem("inGame", JSON.stringify(true));

    this.setState({
      generations: generations,
      inGame: true,
    });
  };

  render() {
    return this.state.inGame ? (
      <DexChallenge
        generations={this.parseGenerations()}
        pokemon={Object.fromEntries(
          Object.entries(Pokemon).filter(([name, data]) =>
            this.state.generations.includes(String(data.generation))
          )
        )}
        reset={this.reset}
      />
    ) : (
      <Menu startGame={this.startGame} />
    );
  }
}

export default App;
