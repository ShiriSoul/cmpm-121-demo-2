import "./style.css";

const APP_NAME = "Artistic Playground";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

const title = document.createElement("h1");
title.textContent = APP_NAME;
app.appendChild(title);

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

// color randomizer button creation
const randomColorButton = document.createElement("button");
randomColorButton.textContent = "Random Color";
randomColorButton.id = "randomColorButton";
app.appendChild(randomColorButton);


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
const selectedToolClass = "selectedTool";

// get canvas context
const ctx = canvas.getContext("2d");

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
        btn.classList.toggle(selectedToolClass, btn === button)
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

    // display all placed stickers
    for (const { emoji, x, y } of placedStickers) {
        drawSticker(emoji, x, y); // draw each sticker
    }

    // display sticker preview if a sticker is selected
    if (isPlacingSticker && selectedSticker && mousePosition) {
        drawSticker(selectedSticker, mousePosition.x, mousePosition.y, true); // pass true for preview mode
    }
}

// mouse event listeners
canvas.addEventListener("mousedown", (e) => {
    redoStack = [];
    isDrawing = true;

    if (isErasing) {
        selectedColor = "white";
        lineThickness = 10;

        // checks if clicking on a sticker to erase it
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // checks if click was on any sticker
        const stickerIndex = placedStickers.findIndex(
            (sticker) =>
                mouseX >= sticker.x &&
                mouseX <= sticker.x + 48 && // emoji width
                mouseY >= sticker.y &&
                mouseY <= sticker.y + 48 // emoji height
        );

        if (stickerIndex !== -1) {
            placedStickers.splice(stickerIndex, 1); // remove sticker
            draw();
            return; // exit to prevent drawing a line
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

    if (isPlacingSticker) {
        const rect = canvas.getBoundingClientRect();
        mousePosition = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
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
    eraserButton.classList.remove(selectedToolClass);
});

// color randomizer event listeners
let randomColorEnabled = false; // flags for random color

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

randomColorButton.addEventListener("click", () => {
    randomColorEnabled = !randomColorEnabled; // toggle
    if (randomColorEnabled) {
        randomColorButton.classList.add(selectedToolClass); // highlights button
    } else {
        randomColorButton.classList.remove(selectedToolClass);
    }

    // update color picker to random color if enabled
    if (randomColorEnabled) {
        const randomColor = getRandomColor();
        colorPicker.value = randomColor; // update color picker to random color
    } else {
        colorPicker.value = selectedColor; // reset to last selected color
    }
});

canvas.addEventListener("mousedown", (e) => {
    redoStack = [];
    isDrawing = true;

    if (isErasing) {
        // if is erasing then do nothing, else...
    } else {
        selectedColor = randomColorEnabled ? getRandomColor() : colorPicker.value; // use random color if enabled
        if (randomColorEnabled) {
            colorPicker.value = selectedColor; // update color picker to reflect the random color
        }
    }

    currentLine = new MarkerLine(e.offsetX, e.offsetY, lineThickness, selectedColor);
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
        eraserButton.classList.remove(selectedToolClass);
    } else {
        // if eraser is not active, activate it and save current color
        isErasing = true;
        previousColor = selectedColor;
        selectedColor = "white";
        lineThickness = 10;
        eraserButton.classList.add(selectedToolClass);
    }
});

// sticker implementation
const stickers = [
    { emoji: "❤️", size: 144 }, // size in pixels
    { emoji: "✨", size: 144 },
    { emoji: "😊", size: 144 }
];
const stickerButtonsContainer = document.createElement("div");
app.appendChild(stickerButtonsContainer); // append to app container

let selectedSticker: string | null = null; // variable to store selected sticker
let isPlacingSticker = false; // variable to track if a sticker is being placed
let mousePosition: { x: number; y: number } | null = null; // mouse position for preview

// array to hold the placed stickers
const placedStickers: { emoji: string; x: number; y: number }[] = [];

// create sticker buttons
stickers.forEach(({ emoji }) => {
    const stickerButton = document.createElement("button");
    stickerButton.textContent = emoji; // sets button text to emoji
    stickerButton.style.fontSize = "24px";
    stickerButtonsContainer.appendChild(stickerButton);

    // adds click event to select sticker
    stickerButton.addEventListener("click", () => {
        selectedSticker = emoji;
        isPlacingSticker = true;
        mousePosition = null;
        draw();
    });
});

// adds button for custom stickers
const customStickerButton = document.createElement("button");
customStickerButton.textContent = "Add Custom Sticker";
stickerButtonsContainer.appendChild(customStickerButton);

customStickerButton.addEventListener("click", () => {
    const stickerName = prompt("Enter the sticker name:") || "";
    if (stickerName) {
        const customStickerButton = document.createElement("button");
        customStickerButton.textContent = stickerName;
        customStickerButton.style.fontSize = "24px";
        stickerButtonsContainer.appendChild(customStickerButton);

        // adds click event to select custom sticker
        customStickerButton.addEventListener("click", () => {
            selectedSticker = stickerName;
            isPlacingSticker = true;
            mousePosition = null;
            draw();
        });
    }
});

// draw stickers on canvas
function drawSticker(emoji: string, x: number, y: number, preview: boolean = false) {
    if (!ctx) return;

    ctx.font = "48px sans-serif";
    
    if (preview) {
        ctx.globalAlpha = 0.5; // preview semi-transparent opacity
    } else {
        ctx.globalAlpha = 1.0; // sticker full opcaity
    }

    ctx.fillText(emoji, x, y); // draw sticker

    ctx.globalAlpha = 1.0;
}

// mouse event listener for placing sticker
canvas.addEventListener("click", (e) => {
    if (isPlacingSticker && selectedSticker) {
        // get mouse position relative to canvas
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // place the sticker at mouse position
        placedStickers.push({ emoji: selectedSticker, x, y });
        selectedSticker = null; // reset selected sticker
        isPlacingSticker = false; // exit placing mode
        draw(); // redraw canvas to show placed sticker
    }
});

// export button creation
const exportButton = document.createElement("button");
exportButton.textContent = "Export";
exportButton.id = "exportButton";
app.appendChild(exportButton);

// export button event listener
exportButton.addEventListener("click", () => {
    // creates new canvas with scaled size
    const exportCanvas = document.createElement("canvas");
    const scale = 4; // export scaling factor
    exportCanvas.width = canvas.width * scale;
    exportCanvas.height = canvas.height * scale;
    const exportCtx = exportCanvas.getContext("2d");

    if (!exportCtx) return;

    // clears export canvas
    exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);

    // scales export context
    exportCtx.scale(scale, scale);

    // redraw all lines on export canvas
    for (const line of lines) {
        line.display(exportCtx);
    }

    // redraws all placed stickers on export canvas
    for (const { emoji, x, y } of placedStickers) {
        drawStickerOnExport(emoji, x, y, exportCtx); // use original position without scaling
    }

    // trigger file download
    const link = document.createElement("a");
    link.download = "artistic_playground_export.png";
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
});

// draw stickers on export canvas
function drawStickerOnExport(emoji: string, x: number, y: number, ctx: CanvasRenderingContext2D) {
    ctx.font = "48px sans-serif";
    ctx.fillText(emoji, x, y); // draws stickers/emojis at specified position
}

// draw tool preview
function drawToolPreview(x: number, y: number) {
    if (!ctx) return;

    // clears preview area before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw(); // redraw existing lines and stickers

    // draw the tool preview (circle on mouse pointer)
    ctx.beginPath();
    ctx.arc(x, y, lineThickness, 0, Math.PI * 2); // circle size equal to tool size
    ctx.fillStyle = selectedColor; // set color to selected color
    ctx.fill();
    ctx.closePath();
}

// event listener for mouse move to trigger tool-moved event
canvas.addEventListener("mousemove", (e) => {
    if (isDrawing && currentLine) {
        currentLine.drag(e.offsetX, e.offsetY);
        draw();
    }

    // update mouse position and draw tool preview
    if (isPlacingSticker) {
        const rect = canvas.getBoundingClientRect();
        mousePosition = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        draw();
    } else {
        // draw tool preview
        drawToolPreview(e.offsetX, e.offsetY);
    }
});