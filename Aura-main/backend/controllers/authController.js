const authService = require('../services/authService');
const { success } = require('../utils/apiResponse');

async function getStatus(req, res, next) {
  try {
    const statusData = {
      status: 'UP',
      version: '1.0.4-mongotemplate-query',
      timestamp: new Date().toISOString()
    };
    res.json(success(statusData, 'AURA API is online'));
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const response = await authService.register(req.body);
    res.status(201).json(success(response, 'Account created successfully'));
  } catch (err) {
    next(err);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const response = await authService.verifyOtp(req.body);
    res.json(success(response, 'Email verified and signed in successfully'));
  } catch (err) {
    next(err);
  }
}

async function resendOtp(req, res, next) {
  try {
    await authService.resendOtp(req.body);
    res.json(success(null, 'A new verification code has been dispatched to your email'));
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const response = await authService.login(req.body);
    res.json(success(response, 'Signed in successfully'));
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    await authService.forgotPassword(req.body);
    res.json(success(null, 'If an account exists with this email, password reset instructions have been sent.'));
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    await authService.resetPassword(req.body);
    res.json(success(null, 'Password has been reset successfully. You may now sign in.'));
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    await authService.changePassword(req.user._id, req.body);
    res.json(success(null, 'Password changed successfully'));
  } catch (err) {
    next(err);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user._id);
    res.json(success(user));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStatus,
  register,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  getCurrentUser
};
