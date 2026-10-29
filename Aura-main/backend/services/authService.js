const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const emailService = require('./emailService');
const notificationService = require('./notificationService');
const { BadRequestError, ConflictError, NotFoundError } = require('../middleware/errorHandler');

const JWT_SECRET = process.env.JWT_SECRET || '9a4f2c8d3b7a1e6f5c8b2d4e7a9c1f3b5e7d9a1c3e5b7d9a1c3e5b7d9a1c3e5b';
const baseUrl = process.env.APP_BASE_URL || 'http://localhost:5173';

function buildUserSummary(user) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt ? user.createdAt.toISOString() : null,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null
  };
}

function generateToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

async function register(request) {
  if (request.password !== request.confirmPassword) {
    throw new BadRequestError('Passwords do not match');
  }

  const email = (request.email || '').trim().toLowerCase();
  const fullName = (request.fullName || '').trim();

  if (!fullName || fullName.length < 2 || fullName.length > 100) {
    throw new BadRequestError('Full name must be between 2 and 100 characters');
  }

  if (!request.password || request.password.length < 6) {
    throw new BadRequestError('Password must be at least 6 characters');
  }

  const existingUser = await User.findOne({ email });
  let user;

  if (existingUser) {
    if (existingUser.emailVerified) {
      throw new ConflictError('An account with this email address already exists');
    }
    existingUser.fullName = fullName;
    existingUser.password = await bcrypt.hash(request.password, 10);
    existingUser.emailVerified = true;
    existingUser.verificationOtp = null;
    existingUser.verificationOtpExpiresAt = null;
    existingUser.lastLoginAt = new Date();
    existingUser.updatedAt = new Date();
    user = await existingUser.save();
  } else {
    const hashedPassword = await bcrypt.hash(request.password, 10);
    user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: 'ROLE_USER',
      status: 'ACTIVE',
      emailVerified: true,
      verificationOtp: null,
      verificationOtpExpiresAt: null,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  await notificationService.createNotification(
    user._id.toString(),
    'Welcome to AURA Finance',
    'Your account has been established and your private financial ledger is active.',
    'SYSTEM'
  );

  const token = generateToken(user);
  return {
    token,
    type: 'Bearer',
    user: buildUserSummary(user),
    requiresVerification: false
  };
}

async function verifyOtp(request) {
  const email = (request.email || '').trim().toLowerCase();
  const user = await User.findOne({ email });
  if (!user) {
    throw new BadRequestError('No registration found for this email address');
  }

  if (user.emailVerified) {
    const token = generateToken(user);
    return {
      token,
      type: 'Bearer',
      user: buildUserSummary(user),
      requiresVerification: false
    };
  }

  const otp = (request.otp || '').trim();
  if (!user.verificationOtp || user.verificationOtp !== otp) {
    throw new BadRequestError('Invalid 6-digit verification code');
  }

  if (!user.verificationOtpExpiresAt || user.verificationOtpExpiresAt < new Date()) {
    throw new BadRequestError('Verification code has expired. Please request a new code.');
  }

  user.emailVerified = true;
  user.verificationOtp = null;
  user.verificationOtpExpiresAt = null;
  user.lastLoginAt = new Date();
  user.updatedAt = new Date();
  await user.save();

  await notificationService.createNotification(
    user._id.toString(),
    'Welcome to AURA Finance',
    'Your email has been verified and your private financial ledger is active.',
    'SYSTEM'
  );

  const token = generateToken(user);
  return {
    token,
    type: 'Bearer',
    user: buildUserSummary(user),
    requiresVerification: false
  };
}

async function resendOtp(request) {
  const email = (request.email || '').trim().toLowerCase();
  const user = await User.findOne({ email });
  if (!user) {
    throw new BadRequestError('No account found with this email address');
  }

  if (user.emailVerified) {
    throw new BadRequestError('Your email address is already verified. Please sign in.');
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  user.verificationOtp = otp;
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);
  user.verificationOtpExpiresAt = expiresAt;
  user.updatedAt = new Date();
  await user.save();

  console.log(`>>> RESENT 6-DIGIT OTP FOR ${user.email}: ${otp} <<<`);
  emailService.sendRegistrationOtpEmail(user.email, user.fullName, otp);
}

async function login(request) {
  const email = (request.email || '').trim().toLowerCase();
  const user = await User.findOne({ email });
  if (!user) {
    throw new BadRequestError('Invalid email or password');
  }

  const match = await bcrypt.compare(request.password || '', user.password);
  if (!match) {
    throw new BadRequestError('Invalid email or password');
  }

  if (user.status === 'SUSPENDED') {
    throw new BadRequestError('Your account is currently suspended. Please contact administrator support.');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken(user);
  return {
    token,
    type: 'Bearer',
    user: buildUserSummary(user),
    requiresVerification: false
  };
}

async function forgotPassword(request) {
  const email = (request.email || '').trim().toLowerCase();
  const user = await User.findOne({ email });
  if (user) {
    const token = uuidv4();
    user.resetPasswordToken = token;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    user.resetPasswordExpiresAt = expiresAt;
    await user.save();

    const resetLink = `${baseUrl}/reset-password?token=${token}`;
    emailService.sendPasswordResetEmail(user.email, user.fullName, resetLink);

    await notificationService.createNotification(
      user._id.toString(),
      'Password Reset Requested',
      'A password reset request was initiated for your account. If this was not you, please secure your account.',
      'SYSTEM'
    );
  }
}

async function resetPassword(request) {
  if (request.newPassword !== request.confirmPassword) {
    throw new BadRequestError('Passwords do not match');
  }

  if (!request.newPassword || request.newPassword.length < 6) {
    throw new BadRequestError('Password must be at least 6 characters');
  }

  const user = await User.findOne({ resetPasswordToken: request.token });
  if (!user) {
    throw new BadRequestError('Invalid or expired password reset token');
  }

  if (!user.resetPasswordExpiresAt || user.resetPasswordExpiresAt < new Date()) {
    throw new BadRequestError('Password reset token has expired. Please request a new one.');
  }

  user.password = await bcrypt.hash(request.newPassword, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpiresAt = null;
  user.updatedAt = new Date();
  await user.save();

  await notificationService.createNotification(
    user._id.toString(),
    'Password Successfully Updated',
    'Your account password was updated successfully. You can now use your new password to sign in.',
    'SYSTEM'
  );
}

async function changePassword(userId, request) {
  if (request.newPassword !== request.confirmPassword) {
    throw new BadRequestError('New passwords do not match');
  }

  if (!request.newPassword || request.newPassword.length < 6) {
    throw new BadRequestError('Password must be at least 6 characters');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError(`User not found with id: ${userId}`);
  }

  const match = await bcrypt.compare(request.currentPassword || '', user.password);
  if (!match) {
    throw new BadRequestError('Current password does not match');
  }

  user.password = await bcrypt.hash(request.newPassword, 10);
  user.updatedAt = new Date();
  await user.save();

  await notificationService.createNotification(
    user._id.toString(),
    'Password Changed',
    'Your account password was updated successfully via Account Settings.',
    'SYSTEM'
  );
}

async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError(`User not found with id: ${userId}`);
  }
  return buildUserSummary(user);
}

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  getCurrentUser,
  buildUserSummary
};
