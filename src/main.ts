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

// color picker creation
const colorPicker = document.createElement("input");
colorPicker.type = "color";
colorPicker.id = "colorPicker";
colorPicker.value = "#000000"; // default color is black
app.appendChild(colorPicker);

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

// eraser button creation
const eraserButton = document.createElement("button");
eraserButton.textContent = "Eraser";
eraserButton.id = "eraserButton";
app.appendChild(eraserButton);

// CSS class for selected tool
const selectedClass = "selectedTool";

// get canvas context
const ctx = canvas.getContext("2d");

// markerLine class
class MarkerLine {
    private points: { x: number; y: number }[] = [];
    private thickness: number;
    private color: string;

    constructor(x: number, y: number, thickness: number, color: string) {
        this.points.push({ x, y });
        this.thickness = thickness;
        this.color = color;
    }

    drag(x: number, y: number) {
        this.points.push({ x, y });
    }

    display(ctx: CanvasRenderingContext2D) {
        if (this.points.length === 0) return;

        ctx.beginPath();
        ctx.lineWidth = this.thickness;
        ctx.strokeStyle = this.color;
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
let selectedColor = colorPicker.value; // default color is black
let isErasing = false;
let previousColor = selectedColor; // to remember the last used color

// sets selected tool and updates button styles
function selectTool(thickness: number, button: HTMLButtonElement) {
    lineThickness = thickness;
    [thinButton, thickButton].forEach((btn) =>
        btn.classList.toggle(selectedClass, btn === button)
    );
}

// initial tool selection
selectTool(2, thinButton);

function draw() {
    if (!ctx) return;

    // clear canvas and fill with white
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // display all saved lines
    for (const line of lines) {
        line.display(ctx);
    }

    // display the current line if drawing
    if (isDrawing && currentLine) {
        currentLine.display(ctx);
    }

    // Display all placed stickers
    for (const { emoji, x, y } of placedStickers) {
        drawSticker(emoji, x, y); // draw each sticker
    }
}

// mouse event listeners
canvas.addEventListener("mousedown", (e) => {
    redoStack = [];
    isDrawing = true;

    if (isErasing) {
        selectedColor = "white";
        lineThickness = 10;

        // Check if clicking on a sticker to erase it
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Check if the click was on any sticker
        const stickerIndex = placedStickers.findIndex(
            (sticker) =>
                mouseX >= sticker.x &&
                mouseX <= sticker.x + 48 && // emoji width
                mouseY >= sticker.y &&
                mouseY <= sticker.y + 48 // emoji height
        );

        if (stickerIndex !== -1) {
            placedStickers.splice(stickerIndex, 1); // Remove the sticker
            draw(); // Redraw canvas after erasing sticker
            return; // Exit to prevent drawing a line
        }
    } else {
        selectedColor = colorPicker.value;
    }

    currentLine = new MarkerLine(e.offsetX, e.offsetY, lineThickness, selectedColor);
});

canvas.addEventListener("mousemove", (e) => {
    if (isDrawing && currentLine) {
        currentLine.drag(e.offsetX, e.offsetY);
        draw();
    }
});

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    if (currentLine) {
        lines.push(currentLine);
        currentLine = null;
        draw();
    }
});

canvas.addEventListener("mouseout", () => {
    isDrawing = false;
});

// color picker event listener
colorPicker.addEventListener("input", () => {
    selectedColor = colorPicker.value;
    isErasing = false;
    eraserButton.classList.remove(selectedClass);
});

// clear button event listener
clearButton.addEventListener("click", () => {
    lines = [];
    redoStack = [];
    placedStickers.length = 0; // Clear the placed stickers
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

// eraser button event listener with toggle functionality
eraserButton.addEventListener("click", () => {
    if (isErasing) {
        // if eraser is active, turn it off and restore previous color
        isErasing = false;
        selectedColor = previousColor;
        eraserButton.classList.remove(selectedClass);
    } else {
        // if eraser is not active, activate it and save current color
        isErasing = true;
        previousColor = selectedColor;
        selectedColor = "white";
        lineThickness = 10;
        eraserButton.classList.add(selectedClass);
    }
});

// sticker Implementation
const stickers = ["🎨", "✨", "😊"]; // emoji stickers
const stickerButtonsContainer = document.createElement("div");
app.appendChild(stickerButtonsContainer); // append to app container

let selectedSticker: string | null = null; // variable to store selected sticker
let isPlacingSticker = false; // variable to track if a sticker is being placed

// array to hold the placed stickers
const placedStickers: { emoji: string; x: number; y: number }[] = [];

// create sticker buttons
stickers.forEach((emoji) => {
    const stickerButton = document.createElement("button");
    stickerButton.textContent = emoji; // set button text to emoji
    stickerButton.style.fontSize = "24px";
    stickerButtonsContainer.appendChild(stickerButton);

    // add click event to select sticker
    stickerButton.addEventListener("click", () => {
        selectedSticker = emoji; // set selected sticker
        isPlacingSticker = true; // enable placing mode
    });
});

// draw sticker on canvas func
function drawSticker(emoji: string, x: number, y: number) {
    if (ctx) {
        ctx.font = '48px serif'; // set font size for emoji
        ctx.fillText(emoji, x, y); // draw the emoji at specified coordinates
    }
}

// mouse event listener for placing stickers
canvas.addEventListener("mousedown", (e) => {
    // place selected sticker (coord relative to canvas)
    if (isPlacingSticker && selectedSticker) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // add sticker to the placed stickers array
        placedStickers.push({ emoji: selectedSticker, x: mouseX, y: mouseY });
        isPlacingSticker = false; // reset placing mode
        draw(); // redraw canvas
    }
});

draw();
