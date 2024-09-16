import mario from "./assets/mario.svg";
import enemy from "./assets/enemy.svg";
import "./App.css";
import React from "react";
import GameBoard from "./constants";

class Square extends React.Component {
  render() {
    return (
      <button className="square" onClick={() => this.props.onClick()}>
        {this.props.element && (
          <img
            src={this.props.element}
            style={{ display: this.props.display }}
            alt=""
          />
        )}
      </button>
    );
  }
}

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.totalSquares = this.props.width * this.props.height;
    this.state = {
      squares: GameBoard,
      marioLocation: Math.floor(
        this.totalSquares / 2 - (this.props.width + this.props.height) / 4 - 1
      ),
      gameInitialized: false,
      moves: 0,
      yMoves: 0,
      xMoves: 0,
      lastMove: "+y",
      gameOver: false,
    };
  }

  componentDidUpdate() {
    setTimeout(() => {
      this.checkForEnemies();
    }, 100);
  }

  handleClick(i) {
    if (i === this.state.marioLocation) this.checkForEnemies();
  }

  moveY(direction) {
    if (
      direction === "+" &&
      this.state.marioLocation + 1 - this.props.height > 0
    ) {
      let newSquares = this.state.squares.slice();
      newSquares[this.state.marioLocation] = {
        element: "",
        display: "none",
      };
      newSquares[this.state.marioLocation - this.props.height] = {
        element: mario,
        display: "block",
      };

      this.setState({
        gameInitialized: true,
        marioLocation: this.state.marioLocation - this.props.height,
        squares: newSquares,
        moves: this.state.moves + 1,
        yMoves: this.state.yMoves + 1,
        xMoves: 0,
        lastMove: "+y",
      });
    } else if (
      direction === "-" &&
      this.state.marioLocation + this.props.height < this.totalSquares
    ) {
      let newSquares = this.state.squares.slice();
      newSquares[this.state.marioLocation] = {
        element: "",
        display: "none",
      };
      newSquares[this.state.marioLocation + this.props.height] = {
        element: mario,
        display: "block",
      };
      this.setState({
        gameInitialized: true,
        marioLocation: this.state.marioLocation + this.props.height,
        squares: newSquares,
        moves: this.state.moves + 1,
        yMoves: this.state.yMoves + 1,
        xMoves: 0,
        lastMove: "-y",
      });
    } else {
      this.state.lastMove === "+y"
        ? this.moveY("-")
        : this.state.lastMove === "-y"
        ? this.moveY("+")
        : this.setState({ lastMove: "+y" });
    }
  }

  moveX(direction) {
    if (
      direction === "+" &&
      (this.state.marioLocation + 2) % this.props.width !== 1 &&
      this.state.marioLocation + 1 < this.totalSquares
    ) {
      let newSquares = this.state.squares.slice();
      newSquares[this.state.marioLocation] = {
        element: "",
        display: "none",
      };
      newSquares[this.state.marioLocation + 1] = {
        element: mario,
        display: "block",
      };
      this.setState({
        gameInitialized: true,
        marioLocation: this.state.marioLocation + 1,
        squares: newSquares,
        moves: this.state.moves + 1,
        xMoves: this.state.xMoves + 1,
        yMoves: 0,
        lastMove: "+x",
      });
    } else if (
      direction === "-" &&
      this.state.marioLocation % this.props.width !== 0 &&
      this.state.marioLocation - 1 >= 0
    ) {
      let newSquares = this.state.squares.slice();
      newSquares[this.state.marioLocation] = {
        element: "",
        display: "none",
      };
      newSquares[this.state.marioLocation - 1] = {
        element: mario,
        display: "block",
      };
      this.setState({
        gameInitialized: true,
        marioLocation: this.state.marioLocation - 1,
        squares: newSquares,
        moves: this.state.moves + 1,
        xMoves: this.state.xMoves + 1,
        yMoves: 0,
        lastMove: "-x",
      });
    } else {
      this.state.lastMove === "+x"
        ? this.moveX("-")
        : this.state.lastMove === "-x"
        ? this.moveX("+")
        : this.setState({ lastMove: "+x" });
    }
  }

  getMarioRange() {
    let marioLoc = this.state.marioLocation;
    let marioRange = [];
    for (let i = 0; i < this.props.height; i++) {
      if (
        marioLoc >= i * this.props.width &&
        marioLoc < i * this.props.width + this.props.width
      ) {
        marioRange = [
          i * this.props.width,
          i * this.props.width + this.props.width,
        ];
      }
    }
    return marioRange;
  }

  numberInRange(x, range) {
    return x >= range[0] && x < range[1];
  }

  decideMove(enemyLocations) {
    console.log("Enemy Locations: ", enemyLocations);
    let distance = Math.abs(enemyLocations[0] - this.state.marioLocation);
    let marioRange = this.getMarioRange();
    if (
      distance < this.props.width &&
      enemyLocations[0] < this.state.marioLocation &&
      this.numberInRange(enemyLocations[0], marioRange)
    ) {
      this.moveX("-");
    } else if (
      distance < this.props.width &&
      enemyLocations[0] < this.state.marioLocation &&
      !this.numberInRange(enemyLocations[0], marioRange)
    ) {
      this.moveY("+");
    } else if (
      distance < this.props.width &&
      enemyLocations[0] > this.state.marioLocation &&
      this.numberInRange(enemyLocations[0], marioRange)
    ) {
      this.moveX("+");
    } else if (
      distance < this.props.width &&
      enemyLocations[0] > this.state.marioLocation &&
      !this.numberInRange(enemyLocations[0], marioRange)
    ) {
      this.moveY("-");
    } else if (
      distance >= this.props.width &&
      enemyLocations[0] < this.state.marioLocation
    ) {
      this.moveY("+");
    } else {
      this.moveY("-");
    }
  }

  checkForEnemies() {
    let enemies = this.state.squares.filter((square) => {
      return square.element === enemy;
    });
    if (enemies.length === 0) {
      this.setState({ gameOver: true });
      // alert("Game over. Total moves to kill the enemies: " + this.state.moves);
    } else {
      this.decideMove(enemies.map((enemy) => enemy.value));
    }
  }

  renderSquare(i) {
    return (
      <Square
        key={i}
        value={i}
        element={this.state.squares[i].element}
        displayElement={this.state.squares[i].display}
        onClick={() => this.handleClick(i)}
      />
    );
  }

  renderRows(squares) {
    return <div className="board-row">{squares}</div>;
  }

  renderBoard() {
    let board = [];
    let rows = [];
    for (let i = 0, squareNumber = 0; i < this.props.height; i++) {
      for (let j = 0; j < this.props.width; j++) {
        rows.push(this.renderSquare(squareNumber));
        squareNumber++;
      }
      board.push(this.renderRows(rows));
      rows = [];
    }
    return board;
  }

  render() {
    return (
      <div className="playGame">
        {this.state.gameOver && (
          <div className="game-completed">
            <span>Game Completed!</span>
            <button
              className="restart-btn"
              onClick={() => window.location.reload()}
            >
              Restart
            </button>
          </div>
        )}
        <div className="maze"> {this.renderBoard()}</div>
      </div>
    );
  }
}

class Game extends React.Component {
  render() {
    let width = 10;
    let height = 10;
    return (
      <div className="game">
        <div className="game-board">
          <div className="title">MaZe GaMe</div>
          <Board width={width} height={height} />
          <h2 className="start-game-text">
            Click on Mario to start the game!!
          </h2>
        </div>
      </div>
    );
  }
}

export default Game;
