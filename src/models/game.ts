import { GameState } from './gameState';

// Get the game canvas element
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('Canvas element not found');
}

// Get the 2D drawing context for the canvas
const ctx = canvas.getContext('2d');
if (!ctx) {
  throw new Error('Failed to get 2D context');
}

// Array of property names for Monopoly (as an example, adjust based on your board layout)
const properties = [
  'GO', 'Mediterranean Ave', 'Community Chest', 'Baltic Ave', 'Income Tax', 'Reading Railroad', 
  'Oriental Ave', 'Chance', 'Vermont Ave', 'Connecticut Ave', 'Jail',
  'St. Charles Place', 'Electric Company', 'States Ave', 'Virginia Ave', 'Pennsylvania Railroad', 
  'St. James Place', 'Community Chest', 'Tennessee Ave', 'New York Ave', 'Free Parking',
  'Kentucky Ave', 'Chance', 'Indiana Ave', 'Illinois Ave', 'B&O Railroad', 
  'Atlantic Ave', 'Ventnor Ave', 'Water Works', 'Marvin Gardens', 'Go to Jail',
  'Pacific Ave', 'North Carolina Ave', 'Community Chest', 'Pennsylvania Ave', 'Short Line Railroad',
  'Chance', 'Park Place', 'Luxury Tax', 'Boardwalk'
];

// Draw the Monopoly board on the canvas
function drawBoard() {
  if (!ctx) {
    throw new Error("Failed to get 2D context");
  }

  // Clear the canvas before redrawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;

  // Draw the grid (Monopoly is a 10x10 grid)
  for (let i = 0; i <= 10; i++) {
    ctx.moveTo(i * 80, 0);
    ctx.lineTo(i * 80, 800);
    ctx.moveTo(0, i * 80);
    ctx.lineTo(800, i * 80);
  }
  ctx.stroke();

  // Add property names on the Monopoly board
  properties.forEach((property, index) => {
    const x = 740 - (index % 10) * 80; // x position based on the index
    const y = 780 - Math.floor(index / 10) * 80; // y position based on the index
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.fillText(property, x, y); // Draw the property name on the board
  });
}

// Function to move the player token to a specific board position
function movePlayer(playerId: string, position: number) {
  const playerToken = new Image();
  
  // Load player token image based on player ID
  playerToken.src = `/images/tokens/${playerId}.png`; // Adjust token image path as needed

  // Calculate the player's x and y coordinates based on their position on the board
  let x = 740 - (position % 10) * 80; // Horizontal adjustment for layout
  let y = 780 - Math.floor(position / 10) * 80; // Vertical adjustment for layout

  // Once the image is loaded, draw the player token
  playerToken.onload = function () {
    if (ctx) {
      ctx.drawImage(playerToken, x, y, 40, 40); // Draw the player token at calculated coordinates
    } else {
      throw new Error("Failed to get 2D context");
    }
  };
}

// Update the game state from the server's data
function updateGame(state: GameState) {
  drawBoard(); // First, redraw the board

  // Loop through all players and update their position on the board
  Object.keys(state.players).forEach((playerId) => {
    const player = state.players[playerId];
    movePlayer(playerId, player.position); // Move each player to their position on the board
  });
}

// Initialize the WebSocket connection to the game server
const socket = new WebSocket('ws://your-websocket-url'); // Replace with the actual WebSocket URL

// Handle when the WebSocket connection is opened
socket.addEventListener('open', () => {
  console.log('WebSocket connection established');
});

// Handle WebSocket errors
socket.addEventListener('error', (error) => {
  console.error('WebSocket error:', error);
});

// Handle when the WebSocket connection is closed
socket.addEventListener('close', () => {
  console.log('WebSocket connection closed');
});

// Listen for incoming messages from the server
socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'gameUpdate') {
    updateGame(data.state); // Update the game with the new state received from the server
  }
});

// Draw the initial board when the page loads
drawBoard();