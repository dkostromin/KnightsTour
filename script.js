const sizeInputLabel = document.createElement("label");
sizeInputLabel.textContent = "Chessboard Size";
document.body.appendChild(sizeInputLabel);

const sizeInput = document.createElement("input");
sizeInput.type = "range";
sizeInput.min = 5;
sizeInput.max = 10;
sizeInput.value = 5;
sizeInput.placeholder = "Chessboard Size";
sizeInput.className = "chessboard-size-input"; // Add a class
sizeInput.placeholder = "Chessboard Size"; // Set the placeholder text
document.body.appendChild(sizeInput);

/* const knightIterations = document.createElement("label");
        knightIterations.textContent = "Knight Iterations";
        document.body.appendChild(knightIterations);

        const totalMovesCounterDisplay = document.createElement("span");
        totalMovesCounterDisplay.className = "total-moves-counter-display";
        document.body.appendChild(totalMovesCounterDisplay); */

class ChessboardRenderer {
  /**
   * For faster processing chessboard with 5x5 dementions
   * are more than enough for this practice.
   */
  static CHESSBOARD_SIZE = 5;

  /**
   * Renders the full board
   */
  static render() {
    //trying to add a chessboard size to the page
    sizeInput.value = ChessboardRenderer.CHESSBOARD_SIZE;
    sizeInput.addEventListener("input", this.handleSizeChange);

    //end of trying to add a chessboard size to the page
    const chessboardElement = document.getElementById("chessboard");
    chessboardElement.innerHTML = "";

    // create and attach column letters row on top of the chessboard
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
      // create and attach row number on the left side of the chessboard
      const numberLabelCellLeft = document.createElement("td");
      numberLabelCellLeft.className = "row-label";
      numberLabelCellLeft.textContent = ChessboardRenderer.CHESSBOARD_SIZE - y;
      row.appendChild(numberLabelCellLeft);
      for (let x = 0; x < ChessboardRenderer.CHESSBOARD_SIZE; x++) {
        // create and attach cell element
        const cell = document.createElement("td");
        cell.id = `${String.fromCharCode(65 + x)}${
          ChessboardRenderer.CHESSBOARD_SIZE - y
        }`;
        cell.className = (y + x) % 2 === 0 ? "light" : "dark";
        cell.addEventListener("click", () => this.onCellClick(x, y));
        row.appendChild(cell);
      }
      // create and attach row number on the right side of the chessboard
      const numberLabelCellRight = document.createElement("td");
      numberLabelCellRight.className = "row-label";
      numberLabelCellRight.textContent = ChessboardRenderer.CHESSBOARD_SIZE - y;
      row.appendChild(numberLabelCellRight);
      // append generated cells row
      chessboardElement.appendChild(row);
    }
    // create and attach column letters row at the bottom of the chessboard
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
    const newSize = parseInt(this.value);
    ChessboardRenderer.CHESSBOARD_SIZE = newSize;
    ChessboardRenderer.render();
  }

  /**
   * Handles on cell click even to start Knight's Tour calculation
   */
  static onCellClick(x, y) {
    ChessboardRenderer.render();
    const chessboard = new Chessboard(ChessboardRenderer.CHESSBOARD_SIZE);
    const knightTour = new KnightTour(chessboard);
    new Promise((resolve, reject) => {
      const result = knightTour.solveKnightTour(x, y);
      return result ? resolve(result) : reject();
    })
      .then((result) => {
        const chessboardElement = document.getElementById("chessboard");
        if (result instanceof Array) {
          result.forEach((key, idx) => {
            const cellElement = document.getElementById(key);
            if (cellElement) {
              const keyTextElement = document.createElement("span");
              keyTextElement.textContent = idx + 1;
              cellElement.appendChild(keyTextElement);
            }
          });
        }
        const row = document.createElement("tr");
        const resultElement = document.createElement("td");
        resultElement.colSpan = ChessboardRenderer.CHESSBOARD_SIZE + 2;
        resultElement.textContent =
          result instanceof Array
            ? result.map((key, idx) => `${idx + 1}. ${key}`).join("; ")
            : result;
        row.appendChild(resultElement);
        chessboardElement.appendChild(row);
      })
      .catch(() => {
        const chessboardElement = document.getElementById("chessboard");
        const row = document.createElement("tr");
        const resultElement = document.createElement("td");
        resultElement.colSpan = ChessboardRenderer.CHESSBOARD_SIZE + 2;
        resultElement.textContent = `Not completed`;
        row.appendChild(resultElement);
        chessboardElement.appendChild(row);
      });
  }
}

// This class is responsible to do the knight's tour calculation
class KnightTour {
  constructor(chessboard) {
    this.chessboard = chessboard;
  }

  solveKnightTour(x, y) {
    const failedMoves = new Set(); // Track failed moves across our recursive calls
    const result = getCoords(x, y, [], 0, failedMoves);
    if (result) {
      console.log("Tour completed successfully.");
      return result.map(([x, y]) =>
        chessboardCoordinates(x, y, ChessboardRenderer.CHESSBOARD_SIZE)
      );
    } else {
      console.log("Tour could not be completed.");
      return false;
    }
  }
}

let completedMoves = []; //array storing completed moves
let totalMovesCounter = 0;
let iterationCounter = 0;
const knightMoves = [
  [-2, 1],
  [2, -1],
  [-1, 2],
  [1, -2],
  [2, 1],
  [-1, -2],
  [-2, -1],
  [1, 2],
];

function getCoords(
  x,
  y,
  completedMoves,
  iterationCounter = 0,
  failedMoves = new Set()
) {
  const MAX_ITERATIONS = 1000; // Set a reasonable limit for iterations
  const center = Math.floor(ChessboardRenderer.CHESSBOARD_SIZE / 2); //center coordinates for moves having the same value of next moves
  //debug thing in order to fix some long running iterations
  if (iterationCounter >= MAX_ITERATIONS) {
    console.log("Iteration limit exceeded at start");
    return false;
  }

  let currentState = [x, y];
  completedMoves.push(currentState);
  //explicitly complete if we have all the moves performed
  if (
    completedMoves.length ===
    ChessboardRenderer.CHESSBOARD_SIZE * ChessboardRenderer.CHESSBOARD_SIZE
  ) {
    console.log("Total attempted moves: ", totalMovesCounter);
    console.log("Total iterations: ", iterationCounter);
    KnightTour.totalMovesCounter = totalMovesCounter;
    return completedMoves;
  }

  //trying to find amount of next moves for each possible move
  knightMoves.sort((a, b) => {
    const countA = countOnwardMoves(x + a[0], y + a[1], completedMoves);
    const countB = countOnwardMoves(x + b[0], y + b[1], completedMoves);

    // Had problems with the 5x5 board, so I added this to found a better move when we have the same amount of next moves
    if (countA === countB) {
      const distanceA =
        Math.abs(x + a[0] - center) + Math.abs(y + a[1] - center);
      const distanceB =
        Math.abs(x + b[0] - center) + Math.abs(y + b[1] - center);
      return distanceB - distanceA; // Prefer moves further from the center
    }
    return countA - countB;
  });

  //Our iterations happens here
  for (let move of knightMoves) {
    totalMovesCounter++;
    let newXposition = currentState[0] + move[0];
    let newYposition = currentState[1] + move[1];

    let moveKey = `${newXposition},${newYposition}`;
    //check if our next move is already in the failed moves set
    if (failedMoves.has(moveKey)) {
      console.log(`Skipping failed move: ${moveKey}`);
      continue; // start with the new iteration
    }

    if (
      //basic validation that we are on the board and we have not visited this cell yet
      onTheBoard([newXposition, newYposition]) &&
      !completedMoves.some(
        (completed) =>
          newXposition === completed[0] && newYposition === completed[1]
      )
    ) {
      iterationCounter++;
      //trying to check if we have a dead end or not
      const onwardMovesCount = countOnwardMoves(
        newXposition,
        newYposition,
        completedMoves
      );
      console.log(
        `Trying move to ${chessboardCoordinates(
          newXposition,
          newYposition,
          ChessboardRenderer.CHESSBOARD_SIZE
        )} with ${onwardMovesCount} onward moves, iteration: ${iterationCounter}`
      );
      console.log(
        `Current state: ${chessboardCoordinates(
          x,
          y,
          ChessboardRenderer.CHESSBOARD_SIZE
        )}, move: ${chessboardCoordinates(
          newXposition,
          newYposition,
          ChessboardRenderer.CHESSBOARD_SIZE
        )}`
      );
      console.log(
        `Completed moves: ${completedMoves
          .map(([x, y]) =>
            chessboardCoordinates(x, y, ChessboardRenderer.CHESSBOARD_SIZE)
          )
          .join(", ")}`
      );
      //passing the completed moves copy to avoid mutation
      const result = getCoords(
        newXposition,
        newYposition,
        [...completedMoves],
        iterationCounter,
        failedMoves
      );

      if (result) {
        return result;
      } else {
        console.log(
          `Dead end at ${chessboardCoordinates(
            newXposition,
            newYposition,
            ChessboardRenderer.CHESSBOARD_SIZE
          )}, marking as failed move`
        );
        failedMoves.add(moveKey); // Add to failed moves if it did not result in a solution
      }
    }
  }
  console.log(
    `No valid moves left from ${chessboardCoordinates(
      x,
      y,
      ChessboardRenderer.CHESSBOARD_SIZE
    )}`
  );
  return false;
}

//function to count the available moves from the current position
function countOnwardMoves(x, y, completedMoves) {
  console.log(`countOnwardMoves called for (${x}, ${y})`);
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
  console.log(`Onward moves available from (${x}, ${y}): ${count}`);
  return count;
}

//function to check if the move is on the board
function onTheBoard(x) {
  return (
    x[0] < ChessboardRenderer.CHESSBOARD_SIZE &&
    x[0] >= 0 &&
    x[1] < ChessboardRenderer.CHESSBOARD_SIZE &&
    x[1] >= 0
  );
}
//function to convert the x, y coordinates to chessboard coordinates
function chessboardCoordinates(x, y, chessboardSize) {
  const columns = String.fromCharCode("A".charCodeAt(0) + x);
  const row = ChessboardRenderer.CHESSBOARD_SIZE - y;
  return `${columns}${row}`;
}

class Chessboard {
  constructor(size) {
    this.size = size;
  }
}

ChessboardRenderer.render();
