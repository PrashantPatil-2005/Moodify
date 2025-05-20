import MoodMusicAPI from './api.js';
import MoodDetector from './moodDetector.js';

// Initialize API
const api = new MoodMusicAPI();

// Check if user is logged in
async function checkLoginStatus() {
  try {
    const userInfo = await api.getUserInfo();
    // User is logged in, update UI
    document.getElementById('welcomeMessage').textContent = `Welcome back, ${userInfo.username}!`;
  } catch (error) {
    // Not logged in, show login/register form
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('welcomeSection').style.display = 'none';
  }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  checkLoginStatus();
  
  // Add event listeners for login/register forms
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
  document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
});

// Handle login form submission
async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    await api.login(email, password);
    window.location.href = 'mood.html'; // Redirect to mood selection page
  } catch (error) {
    document.getElementById('loginError').textContent = error.message;
  }
}

// Handle register form submission
async function handleRegister(event) {
  event.preventDefault();
  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  
  try {
    await api.register(username, email, password);
    window.location.href = 'mood.html'; // Redirect to mood selection page
  } catch (error) {
    document.getElementById('registerError').textContent = error.message;
  }
}