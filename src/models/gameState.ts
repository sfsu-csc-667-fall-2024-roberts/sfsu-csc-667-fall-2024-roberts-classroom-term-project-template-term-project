export type Player = {
    id: string;
    money: number;
    properties: string[];
    position: number;
  };
  
  export type GameState = {
    players: { [key: string]: Player };
    log: string[];
  };
  
  // Initialize the game state with two players
  export function initializeGame(): GameState {
    return {
      players: {
        player1: { id: 'player1', money: 1500, properties: [], position: 0 },
        player2: { id: 'player2', money: 1500, properties: [], position: 0 },
      },
      log: []
    };
  }
  
  // Update player position
  export function updatePlayerPosition(gameState: GameState, playerId: string, newPosition: number) {
    gameState.players[playerId].position = newPosition;
  }
  
  // Add log entry
  export function addLogEntry(gameState: GameState, message: string) {
    gameState.log.push(message);
  }