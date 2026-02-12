const canvas = document.getElementById("puzzleCanvas");
const ctx = canvas.getContext("2d");

const grid = 3;
let pieceSize = 0;
const pieces = [];
let draggedPiece = null;
let offsetX = 0;
let offsetY = 0;
let completed = 0;

const img = new Image();
img.crossOrigin = "anonymous";
img.src = "heart.jpg";

img.onload = () => {
    // Canvas делаем размером под картинку
    canvas.width = img.width;
    canvas.height = img.height;

    pieceSize = canvas.width / grid;

    initPuzzle();
    drawPuzzle();
};

function initPuzzle() {
    let id = 0;

    for (let y = 0; y < grid; y++) {
        for (let x = 0; x < grid; x++) {
            pieces.push({
                id: id++,
                correctX: x * pieceSize,
                correctY: y * pieceSize,
                x: Math.random() * (canvas.width - pieceSize),
                y: Math.random() * (canvas.height - pieceSize),
                fixed: false
            });
        }
    }
}

function drawPuzzle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach(p => {
        ctx.save();
        ctx.beginPath();
        ctx.rect(p.x, p.y, pieceSize, pieceSize);
        ctx.clip();

        ctx.drawImage(
            img,
            p.correctX, p.correctY,
            pieceSize, pieceSize,
            p.x, p.y,
            pieceSize, pieceSize
        );

        ctx.restore();
    });

    requestAnimationFrame(drawPuzzle);
}

function getPieceAt(x, y) {
    for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i];
        if (
            !p.fixed &&
            x >= p.x &&
            x <= p.x + pieceSize &&
            y >= p.y &&
            y <= p.y + pieceSize
        ) {
            return p;
        }
    }
    return null;
}

function pointerDown(e) {
    const rect = canvas.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const cy = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    const p = getPieceAt(cx, cy);
    if (p) {
        draggedPiece = p;
        offsetX = cx - p.x;
        offsetY = cy - p.y;

        // ставим элемент на верхний слой
        pieces.splice(pieces.indexOf(p), 1);
        pieces.push(p);
    }
}

function pointerMove(e) {
    if (!draggedPiece) return;
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const cy = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    draggedPiece.x = cx - offsetX;
    draggedPiece.y = cy - offsetY;
}

function pointerUp() {
    if (!draggedPiece) return;

    const snapDist = pieceSize * 0.3;

    const dist = Math.hypot(
        draggedPiece.x - draggedPiece.correctX,
        draggedPiece.y - draggedPiece.correctY
    );

    if (dist < snapDist) {
        draggedPiece.x = draggedPiece.correctX;
        draggedPiece.y = draggedPiece.correctY;
        draggedPiece.fixed = true;

        completed++;
        if (completed === grid * grid) {
            setTimeout(showSecondScreen, 700);
        }
    }

    draggedPiece = null;
}

canvas.addEventListener("mousedown", pointerDown);
canvas.addEventListener("mousemove", pointerMove);
canvas.addEventListener("mouseup", pointerUp);

canvas.addEventListener("touchstart", pointerDown, { passive: false });
canvas.addEventListener("touchmove", pointerMove, { passive: false });
canvas.addEventListener("touchend", pointerUp, { passive: false });

function showSecondScreen() {
    document.getElementById("secondScreen").classList.add("show");
}
