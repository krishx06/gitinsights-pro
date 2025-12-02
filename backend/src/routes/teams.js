import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

// In-memory storage for teams (replace with database later if needed)
const teams = new Map();

// Apply auth middleware to all routes
router.use(authenticateJWT);

// Get all teams for a user
router.get('/', (req, res) => {
  try {
    const userId = req.user.id; // From JWT token
    const userTeams = Array.from(teams.values()).filter(team => team.userId === userId);
    res.json(userTeams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Create a new team
router.post('/', (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    const team = {
      id: Date.now().toString(),
      userId,
      name: name.trim(),
      members: [],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    teams.set(team.id, team);
    res.status(201).json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Update a team (add/remove members, update name, etc.)
router.put('/:id', (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    const team = teams.get(id);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedTeam = {
      ...team,
      ...updates,
      id: team.id, // Prevent ID change
      userId: team.userId, // Prevent userId change
      updatedAt: new Date().toISOString(),
    };

    teams.set(id, updatedTeam);
    res.json(updatedTeam);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// Delete a team
router.delete('/:id', (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const team = teams.get(id);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    teams.delete(id);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

export default router;
