import express from 'express';
import Group from '../models/Group.js';

const router = express.Router();

// Create a new group
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      location,
      isPublic,
      universityOnly,
      allowedUniversity,
      meetings,
      presidentId
    } = req.body;

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }
    
    const group = await Group.create({
      name,
      description,
      category,
      location,
      isPublic,
      universityOnly,
      allowedUniversity,
      meetings,
      presidentId
    });
    
    res.status(201).json(group);
  } catch (err) {
    console.error('Error creating group:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.findAll();
    res.json(groups);
  } catch (err) {
    console.error('Error fetching groups:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get a specific group by ID
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    res.json(group);
  } catch (err) {
    console.error('Error fetching group:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
