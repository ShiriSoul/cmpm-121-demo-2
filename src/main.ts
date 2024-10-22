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
let lastX = 0;
let lastY = 0;

// handles drawing on canvas
function draw(e: MouseEvent) {
    if (!isDrawing || !ctx) return;
  
    // drawing style
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
  
    // start drawing
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  
    // update last pos
    lastX = e.offsetX;
    lastY = e.offsetY;
  }

  // mouse event listener
canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
  });
  
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", () => (isDrawing = false));
  canvas.addEventListener("mouseout", () => (isDrawing = false));
  
  // clear button event listener
  clearButton.addEventListener("click", () => {
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  });