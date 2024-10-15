var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
(function () {
    var userToken = null;
    var botCount = 1;
    var currentPlayer = '';
    var currentPlayerIndex = 0;
    var playerOrder = [];
    var gameState = {
        players: {},
        properties: {},
        gameOver: false,
    };
    // Setup WebSocket connection
    var gameSocket = new WebSocket('ws://localhost:3000');
    gameSocket.onopen = function () {
        console.log('WebSocket connection established');
    };
    // Token Selection Logic
    document.querySelectorAll('.token-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.token-btn').forEach(function (b) { return b.classList.remove('selected'); });
            btn.classList.add('selected');
            var token = btn.getAttribute('data-token');
            if (token !== null) {
                userToken = token;
            }
        });
    });
    // Start Game Button Logic
    document.getElementById('start-game-btn').addEventListener('click', function () {
        var botCountElement = document.getElementById('bot-count');
        if (botCountElement) {
            botCount = parseInt(botCountElement.value || '1', 10);
        }
        else {
            botCount = 1;
        }
        if (!userToken) {
            alert('Please choose a token');
            return;
        }
        // Show loading screen while the game starts
        document.getElementById('loading-screen').classList.remove('hidden');
        // Send game setup to server
        startGame();
    });
    function startGame() {
        var botTokens = ['Race Car', 'Scottie Dog', 'Cat', 'Penguin', 'Rubber Ducky', 'T-Rex', 'Wheelbarrow'];
        var botAssignments = [];
        for (var i = 0; i < botCount; i++) {
            var randomIndex = Math.floor(Math.random() * botTokens.length);
            botAssignments.push(botTokens.splice(randomIndex, 1)[0]);
        }
        playerOrder = __spreadArray(['player1'], botAssignments, true); // Example: player1 is the user, rest are bots
        currentPlayer = playerOrder[currentPlayerIndex];
        // Send game setup to server
        gameSocket.send(JSON.stringify({
            type: 'gameStart',
            playerToken: userToken,
            bots: botAssignments
        }));
        // Hide setup screen and show game screen after 2s delay to simulate loading
        setTimeout(function () {
            document.getElementById('setup-screen').classList.add('hidden');
            document.getElementById('game-screen').classList.remove('hidden');
            document.getElementById('loading-screen').classList.add('hidden');
        }, 2000);
    }
    // WebSocket message handler
    gameSocket.onmessage = function (event) {
        var data = JSON.parse(event.data);
        if (data.type === 'gameUpdate') {
            updateGame(data.state);
        }
    };
    // Function to update the game state
    function updateGame(state) {
        Object.assign(gameState, state); // Update the local game state with the server's state
        drawBoard();
        // Update player properties
        var playerProperties = gameState.players['player1'].properties;
        var propertiesList = document.getElementById('player-properties');
        if (propertiesList) {
            propertiesList.innerHTML = '';
            playerProperties.forEach(function (property) {
                var listItem = document.createElement('li');
                listItem.textContent = property;
                propertiesList.appendChild(listItem);
            });
        }
        if (gameState.gameOver) {
            alert("Game Over! ".concat(gameState.winner, " wins!"));
        }
    }
    // Move player with animation function
    function movePlayerWithAnimation(playerId, position) {
        var playerToken = document.getElementById("player-token-".concat(playerId));
        if (!playerToken)
            return;
        var x = 740 - (position % 10) * 80;
        var y = 780 - Math.floor(position / 10) * 80;
        playerToken.style.transform = "translate(".concat(x, "px, ").concat(y, "px)");
        playerToken.classList.add('transition-transform', 'duration-500');
    }
    // Add money to player
    function addMoney(playerId, amount) {
        gameState.players[playerId].money += amount;
    }
    // Subtract money from player
    function subtractMoney(playerId, amount) {
        gameState.players[playerId].money -= amount;
    }
    // Add log entry
    function addLogEntry(message) {
        var gameLog = document.getElementById('game-log');
        if (!gameLog)
            return;
        var logItem = document.createElement('div');
        logItem.textContent = message;
        gameLog.appendChild(logItem);
    }
    // Dice roll
    document.getElementById('roll-dice-btn').addEventListener('click', function () {
        var diceRoll = rollDice();
        var newPosition = gameState.players[currentPlayer].position + diceRoll;
        movePlayerWithAnimation(currentPlayer, newPosition);
        takeActionOnSpace(currentPlayer, newPosition);
        // Update game state for the player
        updatePlayerPosition(currentPlayer, newPosition);
        // Pass the turn to the next player
        setTimeout(function () {
            currentPlayerIndex = (currentPlayerIndex + 1) % playerOrder.length;
            currentPlayer = playerOrder[currentPlayerIndex];
            addLogEntry("It's ".concat(currentPlayer, "'s turn."));
        }, 2000);
    });
    // Roll dice and return total
    function rollDice() {
        var dice1 = Math.floor(Math.random() * 6) + 1;
        var dice2 = Math.floor(Math.random() * 6) + 1;
        addLogEntry("Rolled ".concat(dice1, " and ").concat(dice2));
        return dice1 + dice2;
    }
    // Update player position
    function updatePlayerPosition(playerId, newPosition) {
        gameState.players[playerId].position = newPosition;
    }
    // Take action based on space player landed on
    function takeActionOnSpace(playerId, position) {
        var property = gameState.properties[position];
        if (property.owner === null) {
            offerPropertyToBuy(playerId, property);
        }
        else if (property.owner !== playerId) {
            payRent(playerId, property);
        }
    }
    // Offer to buy property
    function offerPropertyToBuy(playerId, property) {
        if (playerId === 'player1') {
            var wantsToBuy = confirm("Do you want to buy ".concat(property.name, " for $").concat(property.price, "?"));
            if (wantsToBuy) {
                buyProperty(playerId, property.position);
            }
        }
        else {
            buyProperty(playerId, property.position); // Bots always buy
        }
    }
    // Buy property
    function buyProperty(playerId, position) {
        var property = gameState.properties[position];
        gameState.players[playerId].money -= property.price;
        property.owner = playerId;
        addLogEntry("".concat(playerId, " bought ").concat(property.name, " for $").concat(property.price, "."));
    }
    // Pay rent
    function payRent(playerId, property) {
        var rentAmount = property.rent;
        subtractMoney(playerId, rentAmount);
        addMoney(property.owner, rentAmount);
        addLogEntry("".concat(playerId, " paid $").concat(rentAmount, " rent to ").concat(property.owner, "."));
    }
    // Pass the turn to the next player
    function passTurn() {
        currentPlayerIndex = (currentPlayerIndex + 1) % playerOrder.length;
        currentPlayer = playerOrder[currentPlayerIndex];
        if (currentPlayer.startsWith('bot')) {
            botMove();
        }
        else {
            addLogEntry("It's ".concat(currentPlayer, "'s turn."));
        }
    }
    // Handle bankruptcy
    function checkBankruptcy(playerId) {
        if (gameState.players[playerId].money <= 0) {
            addLogEntry("".concat(playerId, " is bankrupt and out of the game!"));
            playerOrder = playerOrder.filter(function (p) { return p !== playerId; });
            if (playerOrder.length === 1) {
                gameState.gameOver = true;
                gameState.winner = playerOrder[0];
            }
        }
    }
    // Bot AI: Simple logic for bots
    function botMove() {
        var bot = playerOrder[currentPlayerIndex];
        var diceRoll = rollDice();
        var newPosition = gameState.players[bot].position + diceRoll;
        movePlayerWithAnimation(bot, newPosition);
        takeActionOnSpace(bot, newPosition);
        // Handle buying properties
        if (gameState.properties[newPosition].owner === null && gameState.players[bot].money > gameState.properties[newPosition].price) {
            buyProperty(bot, newPosition);
        }
        // Pass turn to the next player
        setTimeout(function () {
            passTurn();
        }, 2000);
    }
    // Chance and Community Chest Cards
    var chanceCards = [
        { text: 'Advance to GO', action: 'advanceToGo' },
        { text: 'Pay $50', action: 'payMoney', amount: 50 },
        { text: 'Go directly to Jail', action: 'goToJail' }
        // Add more Chance cards
    ];
    var communityChestCards = [
        { text: 'Receive $200 for services', action: 'receiveMoney', amount: 200 },
        { text: 'Pay hospital fees of $100', action: 'payMoney', amount: 100 },
        { text: 'Go to Jail', action: 'goToJail' },
        { text: 'Get out of Jail Free', action: 'getOutOfJailFree' }
        // Add more Community Chest cards
    ];
    // Process drawn card
    function processCard(card, playerId) {
        switch (card.action) {
            case 'advanceToGo':
                updatePlayerPosition(playerId, 0);
                addLogEntry("".concat(playerId, " drew a card: ").concat(card.text, ". Moving to GO."));
                break;
            case 'payMoney':
                subtractMoney(playerId, card.amount);
                addLogEntry("".concat(playerId, " drew a card: ").concat(card.text, ". Paying $").concat(card.amount, "."));
                break;
            case 'receiveMoney':
                addMoney(playerId, card.amount);
                addLogEntry("".concat(playerId, " drew a card: ").concat(card.text, ". Receiving $").concat(card.amount, "."));
                break;
            case 'goToJail':
                updatePlayerPosition(playerId, 10); // Move to Jail
                addLogEntry("".concat(playerId, " drew a card: ").concat(card.text, ". Going to Jail."));
                break;
            case 'getOutOfJailFree':
                addLogEntry("".concat(playerId, " drew a card: ").concat(card.text, ". Received Get Out of Jail Free card."));
                break;
        }
    }
    // Board rendering
    function drawBoard() {
        var canvas = document.getElementById('gameCanvas');
        var ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2D context');
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        for (var i = 0; i <= 10; i++) {
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
