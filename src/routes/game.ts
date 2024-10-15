import { Router } from 'express';
import { authenticateToken } from '../middleware/auth'; // To protect routes
import pool from '../db';

const router = Router();

// Create a new game
router.post('/create', authenticateToken, async (req, res): Promise<void> => {
  const { userId } = (req as any).user;
  try {
    const newGame = await pool.query(
      'INSERT INTO games (owner_id, state) VALUES ($1, $2) RETURNING id',
      [userId, {}]
    );
    res.status(201).json({ gameId: newGame.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join an existing game
router.post('/join', authenticateToken, async (req, res): Promise<void> => {
  const { gameId } = req.body;
  const { userId } = (req as any).user;
  try {
    const existingGame = await pool.query('SELECT * FROM games WHERE id = $1', [gameId]);
    if (existingGame.rows.length === 0) {
      res.status(404).json({ message: 'Game not found' });
      return; // Ensure the function returns after sending a response
    }

    // Add the user to the game
    await pool.query('UPDATE games SET players = array_append(players, $1) WHERE id = $2', [userId, gameId]);
    res.status(200).json({ message: 'Joined game' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Roll the dice
router.post('/roll', authenticateToken, async (req, res): Promise<void> => {
  const { gameId } = req.body;
  const diceRoll1 = Math.floor(Math.random() * 6) + 1; // First dice
  const diceRoll2 = Math.floor(Math.random() * 6) + 1; // Second dice
  const totalRoll = diceRoll1 + diceRoll2;

  try {
    // Update game state with the dice roll logic
    await pool.query('UPDATE games SET state = state || $1 WHERE id = $2', [{ diceRoll1, diceRoll2 }, gameId]);
    res.status(200).json({ diceRoll1, diceRoll2, totalRoll });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Buy a property
router.post('/buy', authenticateToken, async (req, res): Promise<void> => {
  const { gameId, propertyId } = req.body;
  const { userId } = (req as any).user;

  try {
    // Logic to buy a property
    // Check if the property is available, deduct money, update ownership, etc.
    res.status(200).json({ message: 'Property bought successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Pay rent
router.post('/pay-rent', authenticateToken, async (req, res): Promise<void> => {
  const { gameId, propertyId } = req.body;
  const { userId } = (req as any).user;

  try {
    // Logic to pay rent
    // Deduct money from the player, add to the property owner, etc.
    res.status(200).json({ message: 'Rent paid successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;