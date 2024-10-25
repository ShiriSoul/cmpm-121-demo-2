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

// thin and thick tool buttons
const thinButton = document.createElement("button");
thinButton.textContent = "Thin";
thinButton.id = "thinButton";
app.appendChild(thinButton);

const thickButton = document.createElement("button");
thickButton.textContent = "Thick";
thickButton.id = "thickButton";
app.appendChild(thickButton);

// CSS class for selected tool
const selectedClass = "selectedTool";

// get canvas context
const ctx = canvas.getContext("2d");

// markerLine class
class MarkerLine {
    private points: { x: number; y: number }[] = [];
    private thickness: number;

    constructor(x: number, y: number, thickness: number) {
        this.points.push({ x, y });
        this.thickness = thickness;
    }

    drag(x: number, y: number) {
        this.points.push({ x, y });
    }

    display(ctx: CanvasRenderingContext2D) {
        if (this.points.length === 0) return;

        ctx.beginPath();
        ctx.lineWidth = this.thickness; // set line thickness
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
let lineThickness = 2; // default thickness for thin line

// sets selected tool and updates button styles
function selectTool(thickness: number, button: HTMLButtonElement) {
    lineThickness = thickness; // Set thickness for new lines

    // update button styles
    [thinButton, thickButton].forEach((btn) =>
        btn.classList.toggle(selectedClass, btn === button)
    );
}

// initial tool selection
selectTool(2, thinButton);

// handles drawing on canvas
function draw() {
    if (!ctx) return;

    // clear canvas and fill with white
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // set drawing style
    ctx.strokeStyle = "black";
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // display all saved lines
    for (const line of lines) {
        line.display(ctx);
    }

    // display the current line if drawing
    if (isDrawing && currentLine) {
        currentLine.display(ctx);
    }
}

// mouse event listeners
canvas.addEventListener("mousedown", (e) => {
    redoStack = []; // Clear redo stack on new line
    isDrawing = true;
    currentLine = new MarkerLine(e.offsetX, e.offsetY, lineThickness); // create new line with thickness
});

canvas.addEventListener("mousemove", (e) => {
    if (isDrawing && currentLine) {
        currentLine.drag(e.offsetX, e.offsetY); // add new point to current line
        draw(); // update canvas display
    }
});

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    if (currentLine) {
        lines.push(currentLine); // finalize current line
        currentLine = null; // reset current line
        draw();
    }
});

canvas.addEventListener("mouseout", () => {
    isDrawing = false; // stop drawing if mouse leaves canvas
});

// clear button event listener
clearButton.addEventListener("click", () => {
    lines = [];
    redoStack = [];
    draw();
});

// undo button event listener
undoButton.addEventListener("click", () => {
    if (lines.length > 0) {
        const lastLine = lines.pop();
        if (lastLine) redoStack.push(lastLine);
        draw();
    }
});

// redo button event listener
redoButton.addEventListener("click", () => {
    if (redoStack.length > 0) {
        const lineToRedo = redoStack.pop();
        if (lineToRedo) lines.push(lineToRedo);
        draw();
    }
});

// tool button event listeners
thinButton.addEventListener("click", () => selectTool(2, thinButton));
thickButton.addEventListener("click", () => selectTool(5, thickButton));

// initial draw call to start with a clear canvas
draw();
