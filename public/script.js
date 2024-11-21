const socket = io();  // Initialize socket.io

const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');
const colorPicker = document.getElementById('colorPicker');
const sizeSlider = document.getElementById('sizeSlider');
const eraserBtn = document.getElementById('eraserBtn');

// Set the canvas size
canvas.width = window.innerWidth - 40;
canvas.height = window.innerHeight - 100;

// Default drawing settings
let drawing = false;
let current = { x: 0, y: 0 };
let color = colorPicker.value;
let size = sizeSlider.value;
let isErasing = false; // To toggle eraser mode

// Listen for mouse events to draw
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Emit drawing data to the server
function startDrawing(event) {
    drawing = true;
    current.x = event.clientX - canvas.offsetLeft;
    current.y = event.clientY - canvas.offsetTop;
}

function draw(event) {
    if (!drawing) return;

    const newX = event.clientX - canvas.offsetLeft;
    const newY = event.clientY - canvas.offsetTop;

    // Check if the user is erasing or drawing
    if (isErasing) {
        color = "#FFFFFF"; // Set color to white for erasing
    } else {
        color = colorPicker.value; // Get selected color
    }

    // Emit the drawing data to the server
    socket.emit('draw', { 
        x: newX, 
        y: newY, 
        prevX: current.x, 
        prevY: current.y, 
        color: color, 
        size: size 
    });

    // Draw on the canvas
    ctx.beginPath();
    ctx.moveTo(current.x, current.y);
    ctx.lineTo(newX, newY);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.closePath();

    current.x = newX;
    current.y = newY;
}

function stopDrawing() {
    drawing = false;
}

// Listen for drawing data from other users and update the canvas
socket.on('draw', (data) => {
    ctx.beginPath();
    ctx.moveTo(data.prevX, data.prevY);
    ctx.lineTo(data.x, data.y);
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.size;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.closePath();
});

// Clear the canvas when the "Clear" button is clicked
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('draw', { x: 0, y: 0, prevX: 0, prevY: 0, color: "#FFFFFF", size: size });  // Optional: Notify other users
});

// Change the color of the brush when the user picks a new color
colorPicker.addEventListener('input', (event) => {
    color = event.target.value;
});

// Change the brush size when the user adjusts the size slider
sizeSlider.addEventListener('input', (event) => {
    size = event.target.value;
});

// Toggle eraser mode when the eraser button is clicked
eraserBtn.addEventListener('click', () => {
    isErasing = !isErasing;
    eraserBtn.textContent = isErasing ? "Drawing" : "Eraser";  // Toggle button text
});
