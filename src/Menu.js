import React, { PureComponent } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "./Menu.scss";

class Menu extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      generations: [],
    };
  }

  onChange = (checked, generation) => {
    if (checked) {
      this.setState((state) => {
        const generations = state.generations.concat(generation);
        return {
          generations,
        };
      });
    } else {
      this.setState((state) => {
        const generations = state.generations.filter((g) => g !== generation);
        return {
          generations,
        };
      });
    }
  };

  render() {
    return (
      <div className="menu-container p-3 text-center text-light">
        <h1>Dex Challenge</h1>
        <Form className="generation-form">
          <h4>Generation</h4>
          <div className="generation-selection">
            <Form.Group controlId="generation-group-top">
              <Form.Check
                aria-describedby="basic-addon2"
                aria-label="Generation 1"
                checked={this.state.generations.includes("1")}
                id="generation-1-checkbox"
                inline
                label="1"
                onChange={(e) => this.onChange(e.target.checked, "1")}
                type="checkbox"
              />
              <Form.Check
                aria-describedby="basic-addon2"
                aria-label="Generation 2"
                checked={this.state.generations.includes("2")}
                id="generation-1-checkbox"
                inline
                label="2"
                onChange={(e) => this.onChange(e.target.checked, "2")}
                type="checkbox"
              />
              <Form.Check
                aria-describedby="basic-addon2"
                aria-label="Generation 3"
                checked={this.state.generations.includes("3")}
                id="generation-1-checkbox"
                inline
                label="3"
                onChange={(e) => this.onChange(e.target.checked, "3")}
                type="checkbox"
              />
              <Form.Check
                aria-describedby="basic-addon2"
                aria-label="Generation 4"
                checked={this.state.generations.includes("4")}
                id="generation-1-checkbox"
                inline
                label="4"
                onChange={(e) => this.onChange(e.target.checked, "4")}
                type="checkbox"
              />
            </Form.Group>
            <Form.Group controlId="generation-group-bottom">
              <Form.Check
                aria-describedby="basic-addon2"
                aria-label="Generation 5"
                checked={this.state.generations.includes("5")}
                id="generation-1-checkbox"
                inline
                label="5"
                onChange={(e) => this.onChange(e.target.checked, "5")}
                type="checkbox"
              />
              <Form.Check
                aria-describedby="basic-addon2"
                aria-label="Generation 6"
                checked={this.state.generations.includes("6")}
                id="generation-1-checkbox"
                inline
                label="6"
                onChange={(e) => this.onChange(e.target.checked, "6")}
                type="checkbox"
              />
              <Form.Check
                aria-describedby="basic-addon2"
                aria-label="Generation 7"
                checked={this.state.generations.includes("7")}
                id="generation-1-checkbox"
                inline
                label="7"
                onChange={(e) => this.onChange(e.target.checked, "7")}
                type="checkbox"
              />
              <Form.Check
                aria-describedby="basic-addon2"
                aria-label="Generation 8"
                checked={this.state.generations.includes("8")}
                disabled
                id="generation-1-checkbox"
                inline
                label="8"
                onChange={(e) => this.onChange(e.target.checked, "8")}
                type="checkbox"
              />
            </Form.Group>
          </div>
        </Form>
        <Button
          disabled={this.state.generations.length === 0}
          onClick={() => this.props.startGame(this.state.generations)}
          variant="outline-light"
        >
          Start
        </Button>
      </div>
    );
  }
}

export default Menu;
