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