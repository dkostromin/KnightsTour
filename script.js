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
            numberLabelCellLeft.textContent =
              ChessboardRenderer.CHESSBOARD_SIZE - y;
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
            numberLabelCellRight.textContent =
              ChessboardRenderer.CHESSBOARD_SIZE - y;
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
                  // find by cell key and attach step number following the result
                  const cellElement = document.getElementById(key);
                  if (cellElement) {
                    // crete element with step to display
                    const keyTextElement = document.createElement("span");
                    keyTextElement.textContent = idx + 1;
                    cellElement.appendChild(keyTextElement);
                  }
                });
              }
              // create and attach result output at the bottom of chessboard
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
              // create and attach result output at the bottom of chessboard
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
          const result = getCoords(x, y, []);

          if (result) {
            console.log('Going through',result.map(([x, y]) =>
                chessboardCoordinates(x, y, ChessboardRenderer.CHESSBOARD_SIZE)));
            console.log('Initial point is', chessboardCoordinates(x, y, ChessboardRenderer.CHESSBOARD_SIZE));
            return result.map(([x, y]) =>
              chessboardCoordinates(x, y, ChessboardRenderer.CHESSBOARD_SIZE)
              
            );
          } else {
            return false;
          }
        }
      }

      let completedMoves = []; //array storing completed moves
      let totalMovesCounter = 0;
      let iterationCounter = 0;

      function getCoords(x, y, completedMoves, iterationCounter = 0) {
        //hardcoded possible moves for the knight
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
        let currentState = [x, y];
        //store current state in the completed moves array so you cannot go back to it
        completedMoves.push(currentState);

        //hard stop if all moves are completed
        if (completedMoves.length === ChessboardRenderer.CHESSBOARD_SIZE * ChessboardRenderer.CHESSBOARD_SIZE) {
          console.log("Total attempted moves: ", totalMovesCounter);
          console.log("Total iterations: ", iterationCounter);
          KnightTour.totalMovesCounter = totalMovesCounter;
          return completedMoves;
        }
        
        for (let move of knightMoves) {
            totalMovesCounter++;
            let newXposition = currentState[0] + move[0];
            let newYposition = currentState[1] + move[1];

            //validation in order to be on the board as well as not complete the same step twice.
            if (onTheBoard([newXposition, newYposition]) && !completedMoves.some(completed => newXposition === completed[0] && newYposition === completed[1])) {
                iterationCounter++;
                const result = getCoords(newXposition, newYposition, [...completedMoves]);
                if (result) {
                  return result;
                }
              }
            }
          
            return false;
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
