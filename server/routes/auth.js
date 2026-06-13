const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { supabase } = require('../utils/helpers');
const authMiddleware = require('../middleware/auth');

// @route   POST /api/auth/signup
// @desc    Register a new user & create their estate profile
router.post('/signup', async (req, res) => {
  const { email, password, full_name, date_of_birth } = req.body;

  if (!email || !password || !full_name) {
    return res.status(400).json({ message: 'Email, password, and full name are required' });
  }

  try {
    // 1. Sign up user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return res.status(500).json({ message: 'User registration failed, no ID returned' });
    }

    // 2. Create the estate profile for this user
    const { data: profile, error: profileError } = await supabase
      .from('estate_profiles')
      .insert({
        user_id: userId,
        full_name,
        date_of_birth: date_of_birth || null,
        completion_percentage: 0,
        status: 'active'
      })
      .select()
      .single();

    if (profileError) {
      console.error("[Auth Route] Profile creation failed:", profileError.message);
      return res.status(400).json({ message: `Auth succeeded but estate creation failed: ${profileError.message}` });
    }

    // 3. Generate backend JWT
    const token = jwt.sign(
      { userId, estateId: profile.id, email },
      process.env.JWT_SECRET || 'aftermind_super_secret_jwt_2026',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: userId,
        email,
        full_name,
        estate_id: profile.id
      }
    });

  } catch (err) {
    console.error("[Auth Route] Signup error:", err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & return token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // 1. Log in via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    const userId = authData.user?.id;
    
    // 2. Fetch user's estate profile
    let { data: profile, error: profileError } = await supabase
      .from('estate_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // If for some reason the profile doesn't exist, create it now
    if (profileError || !profile) {
      const { data: newProfile, error: newProfileErr } = await supabase
        .from('estate_profiles')
        .insert({
          user_id: userId,
          full_name: email.split('@')[0],
          completion_percentage: 0,
          status: 'active'
        })
        .select()
        .single();
      
      if (newProfileErr) {
        return res.status(500).json({ message: 'Failed to locate or create estate profile' });
      }
      profile = newProfile;
    }

    // 3. Generate backend JWT
    const token = jwt.sign(
      { userId, estateId: profile.id, email },
      process.env.JWT_SECRET || 'aftermind_super_secret_jwt_2026',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: userId,
        email,
        full_name: profile.full_name,
        estate_id: profile.id
      }
    });

  } catch (err) {
    console.error("[Auth Route] Login error:", err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user details
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { userId, estateId } = req.user;

    // Fetch the profile
    const { data: profile, error } = await supabase
      .from('estate_profiles')
      .select('*')
      .eq('id', estateId)
      .single();

    if (error || !profile) {
      return res.status(404).json({ message: 'Estate profile not found' });
    }

    res.json({
      id: userId,
      email: req.user.email,
      full_name: profile.full_name,
      estate_id: estateId,
      profile
    });
  } catch (err) {
    console.error("[Auth Route] Me query error:", err.message);
    res.status(500).json({ message: 'Server error retrieving current user' });
  }
});

module.exports = router;
