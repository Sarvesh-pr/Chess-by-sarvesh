const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const capturedWhiteElement = document.getElementById("capturedWhite");
const capturedBlackElement = document.getElementById("capturedBlack");
const moveSound = document.getElementById("moveSound");

let board = [
  ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
  ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
  ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
];

let selectedCell = null;
let currentPlayer = "white";
let capturedWhite = [];
let capturedBlack = [];
const pieceSymbols = {
  "♔": "king", "♚": "king",
  "♕": "queen", "♛": "queen",
  "♖": "rook", "♜": "rook",
  "♗": "bishop", "♝": "bishop",
  "♘": "knight", "♞": "knight",
  "♙": "pawn", "♟": "pawn"
};

function renderBoard() {
  boardElement.innerHTML = "";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell", (row + col) % 2 === 0 ? "white" : "black");
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.innerText = board[row][col];
      cell.addEventListener("click", () => handleCellClick(row, col));
      boardElement.appendChild(cell);
    }
  }
  updateCapturedPieces();
}

function handleCellClick(row, col) {
  const piece = board[row][col];

  // If a cell with a highlighted legal move is clicked, move the selected piece
  if (selectedCell && (document.querySelector(`[data-row="${row}"][data-col="${col}"]`).classList.contains("highlight-move") ||
      document.querySelector(`[data-row="${row}"][data-col="${col}"]`).classList.contains("highlight-capture"))) {
    movePiece(selectedCell.row, selectedCell.col, row, col);
    selectedCell = null;
    clearHighlights();
    return;
  }

  // If selecting a new piece, highlight its moves
  clearHighlights();
  if (piece && pieceBelongsToCurrentPlayer(piece)) {
    selectedCell = { row, col };
    showMoves(row, col);
    moveSound.currentTime = 0;
    moveSound.play();
  } else {
    selectedCell = null;
    alert("Illegal move!");
  }
}

function pieceBelongsToCurrentPlayer(piece) {
  return (currentPlayer === "white" && piece === piece.toUpperCase()) ||
         (currentPlayer === "black" && piece === piece.toLowerCase());
}

function showMoves(row, col) {
  const piece = board[row][col];
  const pieceType = pieceSymbols[piece];
  let possibleMoves = [];

  if (pieceType === "pawn") possibleMoves = getPawnMoves(row, col, piece);
  else if (pieceType === "rook") possibleMoves = getRookMoves(row, col);
  else if (pieceType === "bishop") possibleMoves = getBishopMoves(row, col);
  else if (pieceType === "queen") possibleMoves = getQueenMoves(row, col);
  else if (pieceType === "king") possibleMoves = getKingMoves(row, col);
  else if (pieceType === "knight") possibleMoves = getKnightMoves(row, col);

  highlightMoves(possibleMoves);
}

function highlightMoves(moves) {
  moves.forEach(([r, c]) => {
    const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    if (board[r][c] === "") {
      cell.classList.add("highlight-move");
    } else {
      cell.classList.add("highlight-capture");
    }
  });
}

function clearHighlights() {
  document.querySelectorAll(".highlight-move, .highlight-capture").forEach(cell => cell.classList.remove("highlight-move", "highlight-capture"));
}

function getPawnMoves(row, col, piece) {
  const moves = [];
  const direction = piece === "♙" ? -1 : 1;

  // Forward move
  if (board[row + direction][col] === "") moves.push([row + direction, col]);

  // Double move from starting position
  if ((row === 6 && piece === "♙") || (row === 1 && piece === "♟")) {
    if (board[row + 2 * direction][col] === "") moves.push([row + 2 * direction, col]);
  }

  // Capturing moves
  [[direction, 1], [direction, -1]].forEach(([dr, dc]) => {
    const r = row + dr, c = col + dc;
    if (c >= 0 && c < 8 && board[r][c] && pieceBelongsToOpponent(board[r][c])) moves.push([r, c]);
  });
  return moves;
}

function getRookMoves(row, col) {
  return getLinearMoves(row, col, [[1, 0], [-1, 0], [0, 1], [0, -1]]);
}

function getBishopMoves(row, col) {
  return getLinearMoves(row, col, [[1, 1], [-1, -1], [1, -1], [-1, 1]]);
}

function getQueenMoves(row, col) {
  return getLinearMoves(row, col, [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]);
}

function getKingMoves(row, col) {
  const moves = [];
  [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].forEach(([dr, dc]) => {
    const r = row + dr, c = col + dc;
    if (r >= 0 && r < 8 && c >= 0 && c < 8 && (board[r][c] === "" || pieceBelongsToOpponent(board[r][c]))) {
      moves.push([r, c]);
    }
  });
  return moves;
}

function getKnightMoves(row, col) {
  const moves = [];
  [[-2, -1], [-2, 1], [2, -1], [2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2]].forEach(([dr, dc]) => {
    const r = row + dr, c = col + dc;
    if (r >= 0 && r < 8 && c >= 0 && c < 8 && (board[r][c] === "" || pieceBelongsToOpponent(board[r][c]))) {
      moves.push([r, c]);
    }
  });
  return moves;
}

function getLinearMoves(row, col, directions) {
  const moves = [];
  directions.forEach(([dr, dc]) => {
    for (let r = row + dr, c = col + dc; r >= 0 && r < 8 && c >= 0 && c < 8; r += dr, c += dc) {
      if (board[r][c] === "") moves.push([r, c]);
      else {
        if (pieceBelongsToOpponent(board[r][c])) moves.push([r, c]);
        break;
      }
    }
  });
  return moves;
}

function pieceBelongsToOpponent(piece) {
  return (currentPlayer === "white" && piece === piece.toLowerCase()) ||
         (currentPlayer === "black" && piece === piece.toUpperCase());
}

function movePiece(fromRow, fromCol, toRow, toCol) {
  if (isValidMove(fromRow, fromCol, toRow, toCol)) {
    if (board[toRow][toCol] !== "") capturePiece(board[toRow][toCol]);

    board[toRow][toCol] = board[fromRow][fromCol];
    board[fromRow][fromCol] = "";
    currentPlayer = currentPlayer === "white" ? "black" : "white";
    renderBoard();
    statusElement.innerText = `${currentPlayer === "white" ? "White's turn" : "Black's turn"}`;
  } else {
    alert("Illegal move!");
  }
}

function capturePiece(piece) {
  if (piece === piece.toUpperCase()) {
    capturedBlack.push(piece);
  } else {
    capturedWhite.push(piece);
  }
}

function updateCapturedPieces() {
  capturedWhiteElement.innerHTML = `<h3>White's Captures</h3>${capturedWhite.join(" ")}`;
  capturedBlackElement.innerHTML = `<h3>Black's Captures</h3>${capturedBlack.join(" ")}`;
}

function isValidMove(fromRow, fromCol, toRow, toCol) {
  return document.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`).classList.contains("highlight-move") ||
         document.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`).classList.contains("highlight-capture");
}

renderBoard();
statusElement.innerText = "White's turn";
