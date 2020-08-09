import PropTypes from "prop-types";
import React, { PureComponent } from "react";
import Button from "react-bootstrap/Button";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import "./DexChallenge.scss";

class DexChallenge extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      count: 0,
      entered: [],
      input: "",
      remaining: this.props.pokemon,
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
    const entry = this.state.remaining[name];
    delete this.state.remaining[name];

    this.setState((state) => ({
      count: state.count + 1,
      entered: [
        ...state.entered,
        {
          order: entry.order,
          name: name,
          url: entry.url,
        },
      ].sort((a, b) => a.order - b.order),
      input: "",
      valid: true,
    }));
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
    this.inputNode.focus();

    const name = DexChallenge.parseName(this.state.input);

    if (this.isValidEntry(name)) {
      this.handleValidEntry(name);
    } else {
      this.handleInvalidEntry();
    }
  };

  render() {
    const complete = this.isComplete();

    return (
      <div className="game-container p-3 text-center text-light">
        <h1>{this.state.count}</h1>
        <h4>Remaining: {this.state.total - this.state.count}</h4>
        <div className="entered-container mt-4">
          {this.state.entered.map((item, index) => (
            <Image key={item.order} pokemon={item} />
          ))}
        </div>
        <div className="mt-4">
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
  pokemon: PropTypes.object.isRequired,
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
