import "./style.css";

const APP_NAME = "Artistic Playground";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

const title = document.createElement("h1");
title.textContent = APP_NAME;
app.appendChild(title);

// canvas element creation
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.id = "PlaygroundCanvas";
app.appendChild(canvas);

// clear button creation
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.id = "clearButton";
app.appendChild(clearButton);

// undo button creation
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.id = "undoButton";
app.appendChild(undoButton);

// redo button creation
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.id = "redoButton";
app.appendChild(redoButton);

// get canvas context
const ctx = canvas.getContext("2d");

// markerLine class
class MarkerLine {
    private points: { x: number; y: number }[] = [];

    constructor(x: number, y: number) {
        this.points.push({ x, y });
    }

    drag(x: number, y: number) {
        this.points.push({ x, y });
    }

    display(ctx: CanvasRenderingContext2D) {
        if (this.points.length === 0) return;

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);

        for (const point of this.points) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }
}

// drawing state variables
let isDrawing = false;
let currentLine: MarkerLine | null = null;
let lines: MarkerLine[] = [];
let redoStack: MarkerLine[] = [];

// handles drawing on canvas
function draw() {
    if (!ctx) return;

    // clear canvas and fill with white
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // set drawing style
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // display all saved lines
    for (const line of lines) {
        line.display(ctx);
    }

    // display current line if drawing
    if (isDrawing && currentLine) {
        currentLine.display(ctx);
    }
}

// dispatches "drawing-changed" event
function dispatchDrawingChanged() {
    const event = new CustomEvent("drawing-changed");
    canvas.dispatchEvent(event); // Dispatch the event
}

// mouse event listeners
canvas.addEventListener("mousedown", (e) => {
    redoStack = []; // clear redo stack on new line
    isDrawing = true;
    currentLine = new MarkerLine(e.offsetX, e.offsetY); // create new line with initial position
});

canvas.addEventListener("mousemove", (e) => {
    if (isDrawing && currentLine) {
        currentLine.drag(e.offsetX, e.offsetY); // add new point to current line
        draw();
    }
});

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    if (currentLine) {
        lines.push(currentLine); // finalize the current line
        dispatchDrawingChanged(); // dispatch event
        currentLine = null; // reset current line
        draw();
    }
});

canvas.addEventListener("mouseout", () => {
    isDrawing = false; // stop drawing if mouse leaves canvas
});

// clear button event listener
clearButton.addEventListener("click", () => {
    lines = []; // clear stored lines
    redoStack = []; // clear redo stack
    draw();
});

// undo button event listener
undoButton.addEventListener("click", () => {
    if (lines.length > 0) {
        const lastLine = lines.pop(); // remove last line from lines
        if (lastLine) redoStack.push(lastLine); // add to redo stack
        draw();
    }
});

// redo button event listener
redoButton.addEventListener("click", () => {
    if (redoStack.length > 0) {
        const lineToRedo = redoStack.pop(); // pop from redo stack
        if (lineToRedo) lines.push(lineToRedo); // add back to lines
        draw();
    }
});

// Event listener for "drawing-changed"
canvas.addEventListener("drawing-changed", () => {
    draw(); // redraw all lines when drawing-changed event is triggered
});

// call draw initially to start with clear canvas
draw();
