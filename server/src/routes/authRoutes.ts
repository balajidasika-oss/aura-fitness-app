import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { DurableStore, IUserRecord } from '../config/durableStore.js';
import { hashPassword, verifyPassword, generateCoachCode } from '../utils/security.js';

const router = Router();

// Ensure avatars upload directory exists
const avatarsDir = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for avatars'));
    }
  },
});

// Helper to sanitize user object
function sanitizeUser(user: IUserRecord) {
  const { passwordHash, passwordSalt, ...safeUser } = user;
  let coachName;
  if (user.coachId) {
    const coach = DurableStore.findUserById(user.coachId);
    if (coach) coachName = coach.name;
  }
  return { ...safeUser, coachName };
}

// GET /api/auth/coaches - List registered coaches for client pairing
router.get('/coaches', async (req: Request, res: Response) => {
  try {
    const allUsers = DurableStore.getUsers();
    const coaches = allUsers
      .filter((u) => u.role === 'coach')
      .map(sanitizeUser);

    return res.json({
      success: true,
      data: coaches,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/register - Sign up with real credentials & optional avatar upload
router.post('/register', uploadAvatar.single('avatarPhoto'), async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, fitnessGoal, phone, coachCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required to create an account.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = DurableStore.findUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in instead.',
      });
    }

    // Password security hashing
    const { salt, hash } = hashPassword(password);

    // Resolve avatar
    let avatarUrl = req.body.avatarUrl;
    if (req.file) {
      avatarUrl = `/uploads/avatars/${req.file.filename}`;
    }
    if (!avatarUrl) {
      const defaultRole = role === 'coach' ? 'coach' : 'athlete';
      avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=059669`;
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const userRole: 'coach' | 'client' = role === 'coach' ? 'coach' : 'client';

    // If Coach: generate unique invite code
    let generatedCoachCode: string | undefined = undefined;
    if (userRole === 'coach') {
      generatedCoachCode = generateCoachCode(name);
    }

    // If Client: connect to coach if coachCode provided
    let assignedCoachId: string | undefined = undefined;
    if (userRole === 'client' && coachCode) {
      const coach = DurableStore.findCoachByCode(coachCode);
      if (coach) {
        assignedCoachId = coach._id;
      }
    }

    const newUser: IUserRecord = {
      _id: userId,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hash,
      passwordSalt: salt,
      role: userRole,
      avatarUrl,
      phone: phone || '',
      coachId: assignedCoachId,
      coachCode: generatedCoachCode,
      targetDailySteps: 10000,
      fitnessGoal: fitnessGoal || (userRole === 'coach' ? 'Head Performance Coach' : 'Hypertrophy & Conditioning'),
      streak: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    DurableStore.createUser(newUser);

    const token = `aura_auth_${newUser._id}_${Date.now()}`;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: sanitizeUser(newUser),
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
});

// POST /api/auth/login - Real password verification
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your email and password.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = DurableStore.findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email. Please check your spelling or create a new account.',
      });
    }

    // Verify Password
    if (user.passwordHash && user.passwordSalt) {
      const isValid = verifyPassword(password, user.passwordSalt, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password. Please try again.',
        });
      }
    }

    const token = `aura_auth_${user._id}_${Date.now()}`;

    return res.json({
      success: true,
      message: 'Signed in successfully',
      token,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Login failed' });
  }
});

// POST /api/auth/join-coach - Allow an athlete to link or change their coach
router.post('/join-coach', async (req: Request, res: Response) => {
  try {
    const { clientId, coachCode } = req.body;

    if (!clientId || !coachCode) {
      return res.status(400).json({ success: false, message: 'Client ID and Coach Code are required' });
    }

    const coach = DurableStore.findCoachByCode(coachCode);
    if (!coach) {
      return res.status(404).json({
        success: false,
        message: 'Invalid Coach Code. Please verify the code with your trainer.',
      });
    }

    const updatedClient = DurableStore.updateUser(clientId, { coachId: coach._id });
    if (!updatedClient) {
      return res.status(404).json({ success: false, message: 'Athlete not found' });
    }

    return res.json({
      success: true,
      message: `Successfully connected to coach ${coach.name}!`,
      user: sanitizeUser(updatedClient),
      coach: sanitizeUser(coach),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
