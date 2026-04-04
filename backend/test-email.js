import { sendVerificationEmail, sendPasswordResetEmail } from './config/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing email service...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD configured:', !!process.env.EMAIL_PASSWORD);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

// Test verification email
try {
  console.log('\n--- Testing Verification Email ---');
  const result = await sendVerificationEmail('test@sonatech.ac.in', 'test-token-123');
  console.log('✅ Verification email sent successfully:', result);
} catch (error) {
  console.error('❌ Verification email failed:', error.message);
  console.error('Full error:', error);
}

// Test reset email
try {
  console.log('\n--- Testing Password Reset Email ---');
  const result = await sendPasswordResetEmail('test@sonatech.ac.in', 'reset-token-456');
  console.log('✅ Password reset email sent successfully:', result);
} catch (error) {
  console.error('❌ Password reset email failed:', error.message);
  console.error('Full error:', error);
}

console.log('\nEmail service test completed.');
