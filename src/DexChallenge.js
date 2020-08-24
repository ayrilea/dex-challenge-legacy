import PropTypes from "prop-types";
import React, { PureComponent } from "react";
import Button from "react-bootstrap/Button";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import "./DexChallenge.scss";

class DexChallenge extends PureComponent {
  constructor(props) {
    super(props);

    this.refsArray = [];

    this.state = {
      count: JSON.parse(sessionStorage.getItem("count")) || 0,
      entered: JSON.parse(sessionStorage.getItem("entered")) || [],
      input: "",
      remaining:
        JSON.parse(sessionStorage.getItem("remaining")) || this.props.pokemon,
      valid: null,
      total: Object.keys(this.props.pokemon).length,
    };
  }

  /**
   * Parse inputted name into the format expected by props.pokemon.
   *
   * @return the inputted name, trimmed (leading/trialing spaces removed), all lower case,
   *         and with spaces replaced by hyphens
   */
  static parseName = (name) => {
    return name
      .trim()
      .toLowerCase()
      .replace(" ", "-");
  };

  componentDidUpdate(prevProps, prevState) {
    const lastValidId = this.state.lastValidId;
    if (lastValidId && prevState.lastValidId !== lastValidId) {
      this.refsArray[this.state.lastValidId].scrollIntoView({
        behavior: "auto",
        block: "center",
      });
    }
  }

  /**
   * Handle when entry is submitted and it is invalid.
   *
   * This method sets the invalid styling on the input field.
   */
  handleInvalidEntry = () => {
    this.setState((state) => ({
      valid: false,
    }));
  };

  /**
   * Handle when entry is submitted and it is valid.
   *
   * This method removes the entry from the remaining list, updates the counter, clears
   * the input and sets the valid styling on the input field.
   */
  handleValidEntry = (name) => {
    this.setState((state) => {
      const entry = state.remaining[name];
      const remaining = state.remaining;
      delete remaining[name];

      const count = state.count + 1;
      const entered = [
        ...state.entered,
        {
          displayName: entry.displayName,
          order: entry.order,
          name: name,
          url: entry.url,
        },
      ].sort((a, b) => a.order - b.order);

      sessionStorage.setItem("count", JSON.stringify(count));
      sessionStorage.setItem("entered", JSON.stringify(entered));
      sessionStorage.setItem("remaining", JSON.stringify(remaining));

      return {
        count: count,
        entered: entered,
        lastValidId: entry.order,
        input: "",
        remaining: remaining,
        valid: true,
      };
    });
  };

  /**
   * @return true if the challenge is complete, otherwise false
   */
  isComplete = () => {
    return this.state.total === this.state.count;
  };

  /**
   * Returns whether or not the current input is a valid entry.
   *
   * The current input is what is entered in the input field when submit is invoked.
   * Valid input is when the input matches one of the items in the remaining list.
   *
   * @return true if the current input is valid, otherwise false
   */
  isValidEntry = (name) => {
    return this.state.remaining.hasOwnProperty(name);
  };

  /**
   * When input changes, updates input state and clears valid styling.
   */
  onChange = ({ target }) => {
    this.setState((state) => ({
      input: target.value,
      valid: null,
    }));
  };

  /**
   * When input is submit, refocuses input and applies handling depending on whether or
   * not input is valid.
   */
  onSubmit = (e) => {
    e.preventDefault();
    this.inputNode.focus({ preventScroll: true });

    const name = DexChallenge.parseName(this.state.input);

    if (this.isValidEntry(name)) {
      this.handleValidEntry(name);
    } else {
      this.handleInvalidEntry();
    }
  };

  reset = () => {
    sessionStorage.removeItem("count");
    sessionStorage.removeItem("entered");
    sessionStorage.removeItem("remaining");

    this.props.reset();
  };

  render() {
    const complete = this.isComplete();

    return (
      <div className="game-container text-center text-light">
        <div className="game-header p-3">
          <div className="game-count">
            <Button onClick={this.reset} variant="outline-light">
              Reset
            </Button>
            <h1>{this.state.count}</h1>
          </div>
          <h4>Remaining: {this.state.total - this.state.count}</h4>
          Generation {this.props.generations}
        </div>
        <div className="entered-container p-1">
          {this.state.entered.map((item, i) => (
            <div
              className={
                "pokemon" +
                (item.order === this.state.lastValidId && !this.isComplete()
                  ? " last-valid"
                  : "")
              }
              key={i}
              ref={(ref) => {
                this.refsArray[item.order] = ref;
              }}
            >
              <Image pokemon={item} />
              <span className="pokemon-number">#{item.order}</span>
              <br />
              <span className="pokemon-name">{item.displayName}</span>
            </div>
          ))}
        </div>
        <div className="input-container p-3">
          {complete && <h3>Complete!</h3>}
          {!complete && (
            <form onSubmit={this.onSubmit}>
              <InputGroup>
                <FormControl
                  aria-describedby="basic-addon2"
                  aria-label="Enter a Pokemon"
                  autoComplete="false"
                  autoFocus={true}
                  isInvalid={this.state.valid === false}
                  isValid={this.state.valid}
                  onChange={this.onChange}
                  placeholder="Enter a Pokemon"
                  ref={(ref) => (this.inputNode = ref)}
                  spellCheck={false}
                  value={this.state.input}
                />
                <InputGroup.Append>
                  <Button onClick={this.onSubmit} variant="outline-light">
                    Submit
                  </Button>
                </InputGroup.Append>
              </InputGroup>
            </form>
          )}
        </div>
      </div>
    );
  }
}

DexChallenge.propTypes = {
  generations: PropTypes.string.isRequired,
  pokemon: PropTypes.object.isRequired,
  reset: PropTypes.func.isRequired,
};

class Image extends PureComponent {
  render() {
    return (
      <div className="image">
        <img
          height="72px"
          src={require("./img/" + this.props.pokemon.url)}
          alt={this.props.pokemon.name}
          width="72px"
        />
      </div>
    );
  }
}

Image.propTypes = {
  pokemon: PropTypes.object.isRequired,
};

export default DexChallenge;
