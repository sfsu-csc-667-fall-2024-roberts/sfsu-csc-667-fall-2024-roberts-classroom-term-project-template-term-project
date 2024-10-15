import express from 'express';
import { WebSocketServer } from 'ws';
import path from 'path';

const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// WebSocket setup
const wss = new WebSocketServer({ port: 3001 });

wss.on('connection', (ws) => {
  console.log('New connection established');

  ws.on('message', (message) => {
    const data = JSON.parse(message.toString());
    console.log(`Received: ${data}`);
    ws.send('Hello from server');
  });

  ws.on('close', () => {
    console.log('Connection closed');
  });
});

// Serve index.html on the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Express server is running on http://localhost:${PORT}`);
});