(() => {
    let userToken: string | null = null;
    let botCount = 1;
    let currentPlayer: string = '';
    let currentPlayerIndex: number = 0;
    let playerOrder: string[] = [];
    const gameState: any = {
      players: {},
      properties: {},
      gameOver: false,
    };

    // Setup WebSocket connection
    const gameSocket = new WebSocket('ws://localhost:3000');

    gameSocket.onopen = () => {
      console.log('WebSocket connection established');
    };

    // Token Selection Logic
    document.querySelectorAll('.token-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            // Log button clicked for debugging
            console.log('Token button clicked:', btn.getAttribute('data-token'));

            // Remove 'selected' class from all token buttons and show them
            document.querySelectorAll('.token-btn').forEach((b) => {
                b.classList.remove('bg-blue-500', 'text-white'); // Reset styles
                b.classList.remove('hidden'); // Show all tokens
            });

            // Add 'selected' class to the clicked token button
            btn.classList.add('bg-blue-500', 'text-white');

            const token = btn.getAttribute('data-token');
            if (token !== null) {
                userToken = token; // Store selected token
                console.log('Selected token:', userToken);
            }

            // Hide other tokens
            document.querySelectorAll('.token-btn').forEach(b => {
                if (b !== btn) {
                    b.classList.add('hidden'); // Hide unselected tokens
                }
            });
        });
    });

    // Bot Selection Logic
    document.querySelectorAll('.bot-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            // Log button clicked for debugging
            console.log('Bot button clicked:', btn.getAttribute('data-bot'));

            // Remove 'selected' class from all bot buttons and show them
            document.querySelectorAll('.bot-btn').forEach((b) => {
                b.classList.remove('bg-blue-500', 'text-white'); // Reset styles
                b.classList.remove('hidden'); // Show all bot buttons
            });

            // Add 'selected' class to the clicked bot button
            btn.classList.add('bg-blue-500', 'text-white');

            const botCountValue = btn.getAttribute('data-bot');
            if (botCountValue !== null) {
                botCount = parseInt(botCountValue, 10); // Store selected bot count
                console.log('Selected bot count:', botCount);
            }

            // Hide other bot buttons
            document.querySelectorAll('.bot-btn').forEach(b => {
                if (b !== btn) {
                    b.classList.add('hidden'); // Hide unselected bots
                }
            });
        });
    });

    // Start Game Button Logic
    document.getElementById('start-game-btn')!.addEventListener('click', () => {
        if (!userToken) {
            alert('Please choose a token');
            return;
        }

        // Show loading screen while the game starts
        document.getElementById('loading-screen')!.classList.remove('hidden');

        // Send game setup to server
        startGame();
    });

    function startGame() {
        const botTokens: string[] = ['Race Car', 'Scottie Dog', 'Cat', 'Penguin', 'Rubber Ducky', 'T-Rex', 'Wheelbarrow'];
        const botAssignments: string[] = [];

        for (let i = 0; i < botCount; i++) {
            const randomIndex = Math.floor(Math.random() * botTokens.length);
            botAssignments.push(botTokens.splice(randomIndex, 1)[0]);
        }

        playerOrder = ['player1', ...botAssignments]; // Example: player1 is the user, rest are bots
        currentPlayer = playerOrder[currentPlayerIndex];

        // Send game setup to server
        gameSocket.send(JSON.stringify({
            type: 'gameStart',
            playerToken: userToken,
            bots: botAssignments
        }));

        // Hide setup screen and show game screen after 2s delay to simulate loading
        setTimeout(() => {
            document.getElementById('setup-screen')!.classList.add('hidden');
            document.getElementById('game-screen')!.classList.remove('hidden');
            document.getElementById('loading-screen')!.classList.add('hidden');
        }, 2000);
    }

    // WebSocket message handler
    gameSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'gameUpdate') {
            updateGame(data.state);
        }
    };

    // Function to update the game state
    function updateGame(state: any) {
        Object.assign(gameState, state); // Update the local game state with the server's state
        drawBoard();

        // Update player properties
        const playerProperties = gameState.players['player1'].properties;
        const propertiesList = document.getElementById('player-properties');
        if (propertiesList) {
            propertiesList.innerHTML = '';

            playerProperties.forEach((property: string) => {
                const listItem = document.createElement('li');
                listItem.textContent = property;
                propertiesList.appendChild(listItem);
            });
        }

        if (gameState.gameOver) {
            alert(`Game Over! ${gameState.winner} wins!`);
        }
    }

    // Move player with animation function
    function movePlayerWithAnimation(playerId: string, position: number) {
        const playerToken = document.getElementById(`player-token-${playerId}`);
        if (!playerToken) return;

        const x = 740 - (position % 10) * 80;
        const y = 780 - Math.floor(position / 10) * 80;

        playerToken.style.transform = `translate(${x}px, ${y}px)`;
        playerToken.classList.add('transition-transform', 'duration-500');
    }

    // Add money to player
    function addMoney(playerId: string, amount: number) {
        gameState.players[playerId].money += amount;
    }

    // Subtract money from player
    function subtractMoney(playerId: string, amount: number) {
        gameState.players[playerId].money -= amount;
    }

    // Add log entry
    function addLogEntry(message: string) {
        const gameLog = document.getElementById('game-log');
        if (!gameLog) return;
        const logItem = document.createElement('div');
        logItem.textContent = message;
        gameLog.appendChild(logItem);
    }

    // Dice roll
    document.getElementById('roll-dice-btn')!.addEventListener('click', () => {
        const diceRoll = rollDice();
        const newPosition = gameState.players[currentPlayer].position + diceRoll;
        movePlayerWithAnimation(currentPlayer, newPosition);
        takeActionOnSpace(currentPlayer, newPosition);

        // Update game state for the player
        updatePlayerPosition(currentPlayer, newPosition);

        // Pass the turn to the next player
        setTimeout(() => {
            currentPlayerIndex = (currentPlayerIndex + 1) % playerOrder.length;
            currentPlayer = playerOrder[currentPlayerIndex];
            addLogEntry(`It's ${currentPlayer}'s turn.`);
        }, 2000);
    });

    // Roll dice and return total
    function rollDice(): number {
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        addLogEntry(`Rolled ${dice1} and ${dice2}`);
        return dice1 + dice2;
    }

    // Update player position
    function updatePlayerPosition(playerId: string, newPosition: number) {
        gameState.players[playerId].position = newPosition;
    }

    // Take action based on space player landed on
    function takeActionOnSpace(playerId: string, position: number) {
        const property = gameState.properties[position];
        if (property.owner === null) {
            offerPropertyToBuy(playerId, property);
        } else if (property.owner !== playerId) {
            payRent(playerId, property);
        }
    }

    // Offer to buy property
    function offerPropertyToBuy(playerId: string, property: any) {
        if (playerId === 'player1') {
            const wantsToBuy = confirm(`Do you want to buy ${property.name} for $${property.price}?`);
            if (wantsToBuy) {
                buyProperty(playerId, property.position);
            }
        } else {
            buyProperty(playerId, property.position); // Bots always buy
        }
    }

    // Buy property
    function buyProperty(playerId: string, position: number) {
        const property = gameState.properties[position];
        gameState.players[playerId].money -= property.price;
        property.owner = playerId;
        addLogEntry(`${playerId} bought ${property.name} for $${property.price}.`);
    }

    // Pay rent
    function payRent(playerId: string, property: any) {
        const rentAmount = property.rent;
        subtractMoney(playerId, rentAmount);
        addMoney(property.owner, rentAmount);
        addLogEntry(`${playerId} paid $${rentAmount} rent to ${property.owner}.`);
    }

    // Pass the turn to the next player
    function passTurn() {
        currentPlayerIndex = (currentPlayerIndex + 1) % playerOrder.length;
        currentPlayer = playerOrder[currentPlayerIndex];

        if (currentPlayer.startsWith('bot')) {
            botMove(); 
        } else {
            addLogEntry(`It's ${currentPlayer}'s turn.`);
        }
    }

    // Handle bankruptcy
    function checkBankruptcy(playerId: string) {
        if (gameState.players[playerId].money <= 0) {
            addLogEntry(`${playerId} is bankrupt and out of the game!`);
            playerOrder = playerOrder.filter(p => p !== playerId);
            
            if (playerOrder.length === 1) {
                gameState.gameOver = true;
                gameState.winner = playerOrder[0];
            }
        }
    }

    // Bot AI: Simple logic for bots
    function botMove() {
        const bot = playerOrder[currentPlayerIndex];
        const diceRoll = rollDice();
        const newPosition = gameState.players[bot].position + diceRoll;
        movePlayerWithAnimation(bot, newPosition);
        takeActionOnSpace(bot, newPosition);

        // Handle buying properties
        if (gameState.properties[newPosition].owner === null && gameState.players[bot].money > gameState.properties[newPosition].price) {
            buyProperty(bot, newPosition);
        }

        // Pass turn to the next player
        setTimeout(() => {
            passTurn();
        }, 2000);
    }

    // Chance and Community Chest Cards
    const chanceCards = [
        { text: 'Advance to GO', action: 'advanceToGo' },
        { text: 'Pay $50', action: 'payMoney', amount: 50 },
        { text: 'Go directly to Jail', action: 'goToJail' }
    ];

    const communityChestCards = [
        { text: 'Receive $200 for services', action: 'receiveMoney', amount: 200 },
        { text: 'Pay hospital fees of $100', action: 'payMoney', amount: 100 },
        { text: 'Go to Jail', action: 'goToJail' },
        { text: 'Get out of Jail Free', action: 'getOutOfJailFree' }
    ];

    // Process drawn card
    function processCard(card: any, playerId: string) {
        switch (card.action) {
            case 'advanceToGo':
                updatePlayerPosition(playerId, 0);
                addLogEntry(`${playerId} drew a card: ${card.text}. Moving to GO.`);
                break;
            case 'payMoney':
                subtractMoney(playerId, card.amount);
                addLogEntry(`${playerId} drew a card: ${card.text}. Paying $${card.amount}.`);
                break;
            case 'receiveMoney':
                addMoney(playerId, card.amount);
                addLogEntry(`${playerId} drew a card: ${card.text}. Receiving $${card.amount}.`);
                break;
            case 'goToJail':
                updatePlayerPosition(playerId, 10); // Move to Jail
                addLogEntry(`${playerId} drew a card: ${card.text}. Going to Jail.`);
                break;
            case 'getOutOfJailFree':
                addLogEntry(`${playerId} drew a card: ${card.text}. Received Get Out of Jail Free card.`);
                break;
        }
    }

    // Board rendering
    function drawBoard() {
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2D context');
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;

        for (let i = 0; i <= 10; i++) {
            ctx.moveTo(i * 80, 0);
            ctx.lineTo(i * 80, canvas.height);
            ctx.moveTo(0, i * 80);
            ctx.lineTo(canvas.width, i * 80);
        }
        ctx.stroke();
    }

    // Start the initial board drawing
    drawBoard();
})();