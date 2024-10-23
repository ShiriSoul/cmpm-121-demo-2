import "./style.css";

const APP_NAME = "Artistic Playground";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

const title = document.createElement("h1");
title.textContent = APP_NAME;
app.appendChild(title);

// Canvas element creation
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.id = "PlaygroundCanvas";
app.appendChild(canvas);

// Clear button creation
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.id = "clearButton";
app.appendChild(clearButton);

// Undo button creation
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.id = "undoButton";
app.appendChild(undoButton);

// Redo button creation
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.id = "redoButton";
app.appendChild(redoButton);

// Get canvas context
const ctx = canvas.getContext("2d");

// Drawing state variables
let isDrawing = false;
let currentLine: { x: number; y: number }[] = []; // Stores current line points
let lines: { x: number; y: number }[][] = []; // Stores all lines
let redoStack: { x: number; y: number }[][] = []; // Stack for redo lines

// Handles drawing on canvas
function draw() {
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Refill canvas with white
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Drawing style
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // Draw all previously saved lines
    for (const line of lines) {
        ctx.beginPath();
        ctx.moveTo(line[0].x, line[0].y);
        for (const point of line) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }

    // Draw current line if drawing
    if (isDrawing && currentLine.length > 0) {
        ctx.beginPath();
        ctx.moveTo(currentLine[0].x, currentLine[0].y);
        for (const point of currentLine) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }
}

// Adds new point to current line
function addPoint(x: number, y: number) {
    if (!isDrawing) return;
    currentLine.push({ x, y }); // Add new point to current line
}

// Dispatches the "drawing-changed" event
function dispatchDrawingChanged() {
    const event = new CustomEvent("drawing-changed");
    canvas.dispatchEvent(event); // Dispatch the event
}

// Mouse event listeners
canvas.addEventListener("mousedown", (e) => {
    // Clear the redo stack whenever a new line starts
    redoStack = []; // Clear redo stack on new line

    isDrawing = true;
    currentLine = []; // Start a new line
    addPoint(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", (e) => {
    addPoint(e.offsetX, e.offsetY);
    draw(); // Call draw to show the current line
});

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    if (currentLine.length > 0) {
        lines.push(currentLine); // Finalize the current line
        dispatchDrawingChanged(); // Dispatch the event after adding a new line
        currentLine = []; // Reset current line for the next drawing
        draw(); // Redraw the canvas to include the new line
    }
});

canvas.addEventListener("mouseout", () => {
    isDrawing = false; // Stop drawing if mouse leaves canvas
});

// Clear button event listener
clearButton.addEventListener("click", () => {
    lines = []; // Clears stored lines
    redoStack = []; // Clear redo stack
    draw(); // Reset canvas
});

// Undo button event listener
undoButton.addEventListener("click", () => {
    if (lines.length > 0) {
        const lastLine = lines.pop(); // Remove last line from lines
        if (lastLine) redoStack.push(lastLine); // Push to redo stack
        draw(); // Redraw canvas
    }
});

// Redo button event listener
redoButton.addEventListener("click", () => {
    if (redoStack.length > 0) {
        const lineToRedo = redoStack.pop(); // Pop from redo stack
        if (lineToRedo) lines.push(lineToRedo); // Add to lines
        draw(); // Redraw canvas
    }
});

// Event listener for "drawing-changed"
canvas.addEventListener("drawing-changed", () => {
    draw(); // Redraw all lines when the drawing-changed event is triggered
});

// Call draw initially to start with clear canvas
draw();
