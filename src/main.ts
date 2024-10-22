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

// get canvas context
const ctx = canvas.getContext("2d");

// drawing state variables
let isDrawing = false;
let points: Array<Array<{ x: number; y: number }>> = [];

// handles drawing on canvas
function draw() {
    if (!ctx) return;
  
    // clears canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // refills canvas with white
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // drawing style
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
  
    // draw lines based on stored points
    for (const line of points) {
      ctx.beginPath();
      ctx.moveTo(line[0].x, line[0].y);
      for (const point of line) {
        ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();
    }
}

// drawing change event listener
canvas.addEventListener("drawing-changed", draw);

// adds new point & dispatches drawing-changed event
function addPoint(x: number, y: number) {
    if (!isDrawing) return;
  
    // add new point to last line in points
    if (points.length === 0 || points[points.length - 1].length >= 1) {
      points.push([{ x, y }]); // starts new line if one doesn't exist already or if last line has at least one point
    } else {
      points[points.length - 1].push({ x, y }); // add to last line
    }
  
    // dispatches drawing-changed event
    const event = new Event("drawing-changed");
    canvas.dispatchEvent(event);
}

// draw directly on canvas when mouse moving
function drawLine(x: number, y: number) {
    if (!ctx) return;
  
    ctx.lineTo(x, y);
    ctx.stroke();
}

// mouse event listener
canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    addPoint(e.offsetX, e.offsetY);
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", (e) => {
    addPoint(e.offsetX, e.offsetY);
    drawLine(e.offsetX, e.offsetY);
});
  
canvas.addEventListener("mouseup", () => (isDrawing = false));
canvas.addEventListener("mouseout", () => (isDrawing = false));

// clear button event listener
clearButton.addEventListener("click", () => {
  points = []; // clears stored points
  draw(); // reset canvas
});