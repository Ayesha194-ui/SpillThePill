import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userStore } from '../models/User';

const router = express.Router();

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Extend Express Request interface
interface AuthenticatedRequest extends express.Request {
  user?: {
    userId: string;
    email: string;
  };
}

// Middleware to verify JWT token
export const authenticateToken = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Signup endpoint
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Email, password, and name are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await userStore.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await userStore.createUser(email, hashedPassword, name);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user
    const user = await userStore.findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const user = await userStore.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Save medicine
router.post('/save-medicine', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { medicineName } = req.body;
    
    if (!medicineName) {
      return res.status(400).json({ error: 'Medicine name is required' });
    }

    await userStore.saveMedicine(req.user!.userId, medicineName);
    res.json({ message: 'Medicine saved successfully' });
  } catch (error) {
    console.error('Save medicine error:', error);
    res.status(500).json({ error: 'Failed to save medicine' });
  }
});

// Get saved medicines
router.get('/saved-medicines', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const user = await userStore.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ savedMedicines: user.savedMedicines });
  } catch (error) {
    console.error('Get saved medicines error:', error);
    res.status(500).json({ error: 'Failed to get saved medicines' });
  }
});

// Remove saved medicine
router.delete('/saved-medicines/:medicineName', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { medicineName } = req.params;
    
    await userStore.removeSavedMedicine(req.user!.userId, medicineName);
    res.json({ message: 'Medicine removed successfully' });
  } catch (error) {
    console.error('Remove saved medicine error:', error);
    res.status(500).json({ error: 'Failed to remove medicine' });
  }
});

export default router; 