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
      count: JSON.parse(localStorage.getItem("count")) || 0,
      entered: JSON.parse(localStorage.getItem("entered")) || [],
      input: "",
      remaining:
        JSON.parse(localStorage.getItem("remaining")) || this.props.pokemon,
      valid: null,
      suggestion: "",
      total: Object.keys(this.props.pokemon).length,
    };
  }

  /**
   * Parse inputted name into the format expected by props.pokemon.
   *
   * @return the inputted name, trimmed (leading/trialing spaces removed), all lower case,
   *         with spaces replaced by hyphens, and non alphabetical characters used
   *         transformed where applicable
   */
  static noramliseName = (name) => {
    return (
      name
        //Remove leading and trialing spaces.
        .trim()
        //All lowwer case (effectively making input case insensitive).
        .toLowerCase()
        //Replace spaces with hyphens. For Pokemon that have spaces in their display names this
        //makes the version with a space also valid input (e.g. "Nidoran F" for "nidoran-f").
        .replace(" ", "-")
        //Three Pokemon have a period in their display name: Mime Jr, Mr. Mime and Mr. Rime. For
        //these three Pokemon specifically the period is removed to allow the input to be the
        //display name (as the expected format contains no periods in names).
        .replace("mime-jr.", "mime-jr")
        .replace("mr.-m", "mr-m")
        .replace("mr.-r", "mr-r")
        //Two Pokemon have a custom gender symbol in their display name: Nidoran♀ and Nidoran ♂.
        //For these two Pomemon specifically the gender symbol is replaced by a hyphen and a letter
        //as per the expected format.
        .replace("nidoran♀", "nidoran-f")
        .replace("nidoran♂", "nidoran-m")
        //Two Pokemon have apostrophes in their display names: Farfetch'd and Sirfetch'd. For these
        //two Pokemon specifically the apostrophe is removed to allow the input to be the display name
        //(as the expected format contains no apostrophes in names).
        .replace("farfetch'", "farfetch")
        .replace("sirfetch'", "sirfetch")
        //One Pokemon has a diacritic in its display name: Flabébé. For this Pokemon specifically the
        //diacritics are replaced by the base letter as per the expected format.
        .replace("flabébé", "flabebe")
        .replace("flabé", "flabe")
        //One Pokemon has a colon in its display name: Type: Null. For this Pokemon specifically the
        //colon is removed to allow the input to be the display name (as the expected format contains
        //no colons in names)
        .replace("type:", "type")
    );
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
   * Parses the user input to find a unique suggestion if one exists.
   *
   * This method will return a suggestion if the user input is at least four characters in
   * length and current input is a prefix for a single Pokemon in the remaining list (i.e.
   * a suggestion will only be returned if it is unique based on the current prefix).
   */
  getSuggestion = (input) => {
    if (input.length < 4) {
      return "";
    }
    const suggestions = Object.entries(
      this.state.remaining
    ).filter(([name, data]) => name.startsWith(input));
    if (suggestions.length === 1) {
      return suggestions[0][1].displayName;
    }
    return "";
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

      localStorage.setItem("count", JSON.stringify(count));
      localStorage.setItem("entered", JSON.stringify(entered));
      localStorage.setItem("remaining", JSON.stringify(remaining));

      return {
        count: count,
        entered: entered,
        lastValidId: entry.order,
        input: "",
        remaining: remaining,
        suggestion: "",
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
    const suggestion = this.getSuggestion(
      DexChallenge.noramliseName(target.value)
    );
    this.setState((state) => ({
      input: target.value,
      suggestion: suggestion,
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

    const input = DexChallenge.noramliseName(this.state.input);
    const suggestion = DexChallenge.noramliseName(this.state.suggestion);
    const name = input.length >= suggestion.length ? input : suggestion;

    if (this.isValidEntry(name)) {
      this.handleValidEntry(name);
    } else {
      this.handleInvalidEntry();
    }
  };

  reset = () => {
    localStorage.removeItem("count");
    localStorage.removeItem("entered");
    localStorage.removeItem("remaining");

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
              <div className="suggestion" onClick={this.onSubmit}>
                {this.state.suggestion}
              </div>
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
