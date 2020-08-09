import React, { PureComponent } from "react";
import DexChallenge from "./DexChallenge";
import Menu from "./Menu";
import "./App.scss";
import Pokemon from "./data/pokemon.json";

class App extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      generations: [],
      inGame: false,
    };
  }

  backToMenu = () => {
    this.setState({
      inGame: false,
    });
  };

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

  startGame = (generations) => {
    this.setState({
      generations: generations,
      inGame: true,
    });
  };

  render() {
    return this.state.inGame ? (
      <DexChallenge
        backToMenu={this.backToMenu}
        generations={this.parseGenerations()}
        pokemon={Object.fromEntries(
          Object.entries(Pokemon).filter(([name, data]) =>
            this.state.generations.includes(String(data.generation))
          )
        )}
      />
    ) : (
      <Menu startGame={this.startGame} />
    );
  }
}

export default App;
