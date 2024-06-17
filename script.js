const sizeInputLabel = document.createElement("label");
sizeInputLabel.textContent = "Chessboard Size";
document.body.appendChild(sizeInputLabel);

const sizeInput = document.createElement("input");
sizeInput.type = "range";
sizeInput.min = 5;
sizeInput.max = 10;
sizeInput.value = 5;
sizeInput.placeholder = "Chessboard Size";
sizeInput.className = "chessboard-size-input";
sizeInput.placeholder = "Chessboard Size";
document.body.appendChild(sizeInput);

class ChessboardRenderer {
  static CHESSBOARD_SIZE = 5;

  static render() {
    sizeInput.value = ChessboardRenderer.CHESSBOARD_SIZE;
    if (!sizeInput.hasListener) {
      sizeInput.addEventListener("input", ChessboardRenderer.handleSizeChange);
      sizeInput.hasListener = true;
    }

    const chessboardElement = document.getElementById("chessboard");
    chessboardElement.innerHTML = "";

    const colLabelRowTop = document.createElement("tr");
    colLabelRowTop.innerHTML = '<td class="column-label"></td>';
    for (let x = 0; x < ChessboardRenderer.CHESSBOARD_SIZE; x++) {
      const colLabelCell = document.createElement("td");
      colLabelCell.textContent = String.fromCharCode(65 + x);
      colLabelRowTop.appendChild(colLabelCell);
    }
    chessboardElement.appendChild(colLabelRowTop);

    for (let y = 0; y < ChessboardRenderer.CHESSBOARD_SIZE; y++) {
      const row = document.createElement("tr");

      const numberLabelCellLeft = document.createElement("td");
      numberLabelCellLeft.className = "row-label";
      numberLabelCellLeft.textContent = ChessboardRenderer.CHESSBOARD_SIZE - y;
      row.appendChild(numberLabelCellLeft);

      for (let x = 0; x < ChessboardRenderer.CHESSBOARD_SIZE; x++) {
        const cell = document.createElement("td");
        cell.id = `${String.fromCharCode(65 + x)}${ChessboardRenderer.CHESSBOARD_SIZE - y}`;
        cell.className = `${(y + x) % 2 === 0 ? "light" : "dark"} chessboard-cell`;
        cell.addEventListener("click", () => ChessboardRenderer.onCellClick(x, y));
        row.appendChild(cell);
      }

      const numberLabelCellRight = document.createElement("td");
      numberLabelCellRight.className = "row-label";
      numberLabelCellRight.textContent = ChessboardRenderer.CHESSBOARD_SIZE - y;
      row.appendChild(numberLabelCellRight);

      chessboardElement.appendChild(row);
    }

    const colLabelRowBottom = document.createElement("tr");
    colLabelRowBottom.innerHTML = '<td class="column-label"></td>';
    for (let x = 0; x < ChessboardRenderer.CHESSBOARD_SIZE; x++) {
      const colLabelCell = document.createElement("td");
      colLabelCell.textContent = String.fromCharCode(65 + x);
      colLabelRowBottom.appendChild(colLabelCell);
    }
    chessboardElement.appendChild(colLabelRowBottom);
  }

  static handleSizeChange(event) {
    const newSize = parseInt(event.target.value);
    ChessboardRenderer.CHESSBOARD_SIZE = newSize;
    ChessboardRenderer.render();
  }

  static async onCellClick(x, y) {
    ChessboardRenderer.render();
    const chessboard = new Chessboard(ChessboardRenderer.CHESSBOARD_SIZE);
    const knightTour = new KnightTour(chessboard);

    try {
      await knightTour.solveKnightTour(x, y);
      ChessboardRenderer.showFinalResult(knightTour.completedMoves);
    } catch {
      ChessboardRenderer.showIncompleteMessage();
    }
  }

  static showFinalResult(moves) {
    const chessboardElement = document.getElementById("chessboard");
    const row = document.createElement("tr");
    const resultElement = document.createElement("td");
    resultElement.colSpan = ChessboardRenderer.CHESSBOARD_SIZE + 2;
    resultElement.textContent = moves.map((move, idx) => `${idx + 1}. ${chessboardCoordinates(move[0], move[1], ChessboardRenderer.CHESSBOARD_SIZE)}`).join("; ");
    row.appendChild(resultElement);
    chessboardElement.appendChild(row);
  }

  static showIncompleteMessage() {
    const chessboardElement = document.getElementById("chessboard");
    const row = document.createElement("tr");
    const resultElement = document.createElement("td");
    resultElement.colSpan = ChessboardRenderer.CHESSBOARD_SIZE + 2;
    resultElement.textContent = `Not completed`;
    row.appendChild(resultElement);
    chessboardElement.appendChild(row);
  }
}

class KnightTour {
  constructor(chessboard) {
    this.chessboard = chessboard;
    this.completedMoves = [];
  }

  async solveKnightTour(x, y) {
    const result = await this.getCoords(x, y, []);
    this.completedMoves = result;
    return result;
  }

  async getCoords(x, y, completedMoves, iterationCounter = 0) {
    let currentState = [x, y];
    completedMoves.push(currentState);
  
    // Update the board with the current move
    await this.updateBoardWithResult(currentState, completedMoves.length);
    await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
  
    if (
      completedMoves.length ===
      ChessboardRenderer.CHESSBOARD_SIZE * ChessboardRenderer.CHESSBOARD_SIZE
    ) {
      return completedMoves;
    }
  
    let sortedMoves = knightMoves
      .map(move => {
        let newX = x + move[0];
        let newY = y + move[1];
        return {
          move,
          count: countOnwardMoves(newX, newY, completedMoves)
        };
      })
      .filter(({ move }) => onTheBoard([x + move[0], y + move[1]]) &&
        !completedMoves.some(completed => (x + move[0]) === completed[0] && (y + move[1]) === completed[1])
      )
      .sort((a, b) => a.count - b.count);
  
    for (let { move } of sortedMoves) {
      let newXposition = currentState[0] + move[0];
      let newYposition = currentState[1] + move[1];
  
      iterationCounter++;
      if (iterationCounter >= 1000) {
        return false;
      }
  
      const result = await this.getCoords(
        newXposition,
        newYposition,
        [...completedMoves],
        iterationCounter
      );
  
      if (result) {
        return result;
      }
    }
  
    return false;
  }
  

  async updateBoardWithResult(currentMove, stepNumber) {
    const key = chessboardCoordinates(currentMove[0], currentMove[1], ChessboardRenderer.CHESSBOARD_SIZE);
    const cellElement = document.getElementById(key);
    if (cellElement) {
      const keyTextElement = document.createElement("span");
      keyTextElement.textContent = stepNumber;
      cellElement.appendChild(keyTextElement);
    }
  }
  
}

let totalMovesCounter = 0;
const knightMoves = [
  [-2, 1], [2, -1], [-1, 2], [1, -2],
  [2, 1], [-1, -2], [-2, -1], [1, 2]
];

function countOnwardMoves(x, y, completedMoves) {
  let count = 0;
  for (let move of knightMoves) {
    let newX = x + move[0];
    let newY = y + move[1];
    if (
      onTheBoard([newX, newY]) &&
      !completedMoves.some(
        (completed) => newX === completed[0] && newY === completed[1]
      )
    ) {
      count++;
    }
  }
  return count;
}

function onTheBoard(x) {
  return (
    x[0] < ChessboardRenderer.CHESSBOARD_SIZE &&
    x[0] >= 0 &&
    x[1] < ChessboardRenderer.CHESSBOARD_SIZE &&
    x[1] >= 0
  );
}

function chessboardCoordinates(x, y, chessboardSize) {
  const columns = String.fromCharCode("A".charCodeAt(0) + x);
  const row = chessboardSize - y;
  return `${columns}${row}`;
}

class Chessboard {
  constructor(size) {
    this.size = size;
  }
}

ChessboardRenderer.render();
