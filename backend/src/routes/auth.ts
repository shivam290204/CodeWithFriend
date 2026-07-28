import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { PasswordResetToken } from '../models/PasswordResetToken';
import { EmailVerificationToken } from '../models/EmailVerificationToken';
import { AuthEvent } from '../models/AuthEvent';
import { JWT_SECRET } from '../config/env';
import { requireAuth } from '../middleware/auth';
import { generateAccessToken, generateRefreshToken, hashToken } from '../utils/tokens';
import { sendEmail } from '../utils/sendEmail';
import crypto from 'crypto';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const blocklist = [
  "password", "password123", "12345678", "qwerty", "qwerty123", "123456789"
];

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

const setAuthCookies = (res: any, accessToken: string, refreshTokenRaw: string) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, { httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshTokenRaw, { httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 30 * 24 * 60 * 60 * 1000 });
};

const clearAuthCookies = (res: any) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};

router.post('/signup', authLimiter, async (req, res) => {
  try {
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0].message });
    }
    const { name, email, password } = parseResult.data;

    if (blocklist.includes(password.toLowerCase())) {
      return res.status(400).json({ error: 'Please choose a stronger password.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Verify Email
    const verifyRaw = crypto.randomBytes(32).toString('hex');
    const verifyHash = hashToken(verifyRaw);
    await new EmailVerificationToken({
      userId: user._id as any,
      tokenHash: verifyHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }).save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    sendEmail({
      to: email,
      subject: 'Verify your PeerPod email',
      html: `<a href="${frontendUrl}/api/auth/verify-email?token=${verifyRaw}">Click here to verify your email</a>`
    }).catch(err => console.error('Failed to send verification email:', err));

    // Tokens
    const accessToken = generateAccessToken({ id: user.id, name: user.name, email: user.email });
    const { raw: refreshRaw, hash: refreshHash } = generateRefreshToken();
    
    await new RefreshToken({
      userId: user._id as any,
      tokenHash: refreshHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    }).save();

    setAuthCookies(res, accessToken, refreshRaw);
    
    await new AuthEvent({
      userId: user._id as any,
      email: user.email,
      eventType: 'signup',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    }).save();

    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, emailVerified: user.emailVerified } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0].message });
    }
    const { email, password } = parseResult.data;

    const user = await User.findOne({ email });
    if (user && user.lockUntil && user.lockUntil > new Date()) {
      const waitMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      return res.status(423).json({ error: `Account temporarily locked due to repeated failed attempts. Try again in ${waitMinutes} minutes.` });
    }

    if (!user) {
      await new AuthEvent({ email, eventType: 'login_failed', ipAddress: req.ip, userAgent: req.headers['user-agent'] }).save();
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        user.failedLoginAttempts = 0;
      }
      await user.save();
      await new AuthEvent({ userId: user._id as any, email, eventType: 'login_failed', ipAddress: req.ip, userAgent: req.headers['user-agent'] }).save();
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    const accessToken = generateAccessToken({ id: user.id, name: user.name, email: user.email });
    const { raw: refreshRaw, hash: refreshHash } = generateRefreshToken();
    
    await new RefreshToken({
      userId: user._id as any,
      tokenHash: refreshHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    }).save();

    setAuthCookies(res, accessToken, refreshRaw);

    await new AuthEvent({ userId: user._id as any, email, eventType: 'login_success', ipAddress: req.ip, userAgent: req.headers['user-agent'] }).save();

    res.status(200).json({ user: { id: user.id, name: user.name, email: user.email, emailVerified: user.emailVerified } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/refresh', async (req, res) => {
  const refreshTokenRaw = req.cookies.refreshToken;
  if (!refreshTokenRaw) {
    return res.status(401).json({ error: 'No refresh token' });
  }

  try {
    const hashed = hashToken(refreshTokenRaw);
    const tokenDoc = await RefreshToken.findOne({ tokenHash: hashed }).populate('userId');

    if (!tokenDoc || tokenDoc.revoked || tokenDoc.expiresAt < new Date()) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Revoke old token
    tokenDoc.revoked = true;
    await tokenDoc.save();

    const user: any = tokenDoc.userId;
    const accessToken = generateAccessToken({ id: user.id, name: user.name, email: user.email });
    const { raw: newRefreshRaw, hash: newRefreshHash } = generateRefreshToken();

    await new RefreshToken({
      userId: user._id,
      tokenHash: newRefreshHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    }).save();

    setAuthCookies(res, accessToken, newRefreshRaw);

    await new AuthEvent({ userId: user._id, email: user.email, eventType: 'refresh_token_rotated', ipAddress: req.ip, userAgent: req.headers['user-agent'] }).save();

    res.status(200).json({ user: { id: user.id, name: user.name, email: user.email, emailVerified: user.emailVerified } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', async (req, res) => {
  const refreshTokenRaw = req.cookies.refreshToken;
  if (refreshTokenRaw) {
    const hashed = hashToken(refreshTokenRaw);
    await RefreshToken.updateOne({ tokenHash: hashed }, { revoked: true });
  }
  clearAuthCookies(res);
  await new AuthEvent({ eventType: 'logout', ipAddress: req.ip, userAgent: req.headers['user-agent'] }).save();
  res.status(200).json({ message: 'Logged out successfully' });
});

router.post('/logout-all', requireAuth, async (req: any, res) => {
  await RefreshToken.updateMany({ userId: req.user.id }, { revoked: true });
  clearAuthCookies(res);
  await new AuthEvent({ userId: req.user.id, email: req.user.email, eventType: 'logout_all', ipAddress: req.ip, userAgent: req.headers['user-agent'] }).save();
  res.status(200).json({ message: 'Logged out of all sessions' });
});

router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await User.findOne({ email });
    if (user) {
      const raw = crypto.randomBytes(32).toString('hex');
      const hash = hashToken(raw);

      await new PasswordResetToken({
        userId: user._id as any,
        tokenHash: hash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      }).save();

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      sendEmail({
        to: email,
        subject: 'Reset your PeerPod password',
        html: `<a href="${frontendUrl}/reset-password?token=${raw}">Click here to reset your password</a>`
      }).catch(err => console.error('Failed to send reset email:', err));

      await new AuthEvent({ userId: user._id as any, email, eventType: 'password_reset_requested', ipAddress: req.ip, userAgent: req.headers['user-agent'] }).save();
    }
    
    // Always return success
    res.status(200).json({ message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
});

router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const parseResult = resetPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0].message });
    }
    const { token, newPassword } = parseResult.data;

    const hash = hashToken(token);
    const resetDoc = await PasswordResetToken.findOne({ tokenHash: hash, used: false, expiresAt: { $gt: new Date() } });

    if (!resetDoc) {
      return res.status(400).json({ error: 'Invalid or expired reset link.' });
    }

    const user = await User.findById(resetDoc.userId);
    if (!user) return res.status(400).json({ error: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    resetDoc.used = true;
    await resetDoc.save();

    // Revoke all refresh tokens
    await RefreshToken.updateMany({ userId: user._id }, { revoked: true });

    await new AuthEvent({ userId: user._id as any, email: user.email, eventType: 'password_reset_completed', ipAddress: req.ip, userAgent: req.headers['user-agent'] }).save();
    await new AuthEvent({ userId: user._id as any, email: user.email, eventType: 'password_changed', ipAddress: req.ip, userAgent: req.headers['user-agent'] }).save();

    res.status(200).json({ message: 'Password reset successfully. Please log in.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/verify-email', async (req, res) => {
  try {
    const token = req.query.token as string;
    if (!token) return res.status(400).json({ error: 'Token required' });

    const hash = hashToken(token);
    const verifyDoc = await EmailVerificationToken.findOne({ tokenHash: hash, used: false, expiresAt: { $gt: new Date() } });

    if (!verifyDoc) {
      return res.status(400).json({ error: 'Invalid or expired verification link.' });
    }

    const user = await User.findById(verifyDoc.userId);
    if (user) {
      user.emailVerified = true;
      await user.save();
      await new AuthEvent({ userId: user._id as any, email: user.email, eventType: 'email_verified', ipAddress: req.ip, userAgent: req.headers['user-agent'] }).save();
    }
    
    verifyDoc.used = true;
    await verifyDoc.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/dashboard?verified=true`);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', requireAuth, async (req: any, res: any) => {
  res.status(200).json({ user: req.user });
});

router.get('/ws-token', async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ error: 'Unauthorized: No session cookie' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const wsToken = jwt.sign(
      { id: decoded.id, name: decoded.name, email: decoded.email }, 
      JWT_SECRET, 
      { expiresIn: '5m' }
    );
    res.status(200).json({ wsToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid session' });
  }
});

export default router;
