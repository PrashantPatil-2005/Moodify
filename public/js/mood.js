<<<<<<< HEAD
import MoodDetector from './moodDetector.js';
import MoodMusicAPI from './api.js';

// Initialize components
const moodDetector = new MoodDetector();
const api = new MoodMusicAPI();

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Check login status first
    await api.getUserInfo();
    
    // Initialize mood detector
    const moods = await moodDetector.initialize();
    
    // Populate mood selection options
    const moodContainer = document.getElementById('moodSelectionContainer');
    if (moodContainer) {
      moods.forEach(mood => {
        const moodButton = document.createElement('button');
        moodButton.className = 'mood-button';
        moodButton.dataset.moodId = mood.mood_id;
        moodButton.textContent = mood.mood_name;
        moodButton.addEventListener('click', () => handleMoodSelection(mood.mood_id));
        moodContainer.appendChild(moodButton);
      });
    }
    
    // Add event listeners for mood detection methods
    document.getElementById('textAnalysisForm')?.addEventListener('submit', handleTextAnalysis);
    document.getElementById('faceDetectionButton')?.addEventListener('click', handleFaceDetection);
    
  } catch (error) {
    // Not logged in, redirect to login page
    window.location.href = 'index.html';
  }
});

// Handle manual mood selection
async function handleMoodSelection(moodId) {
  try {
    const selectedMood = await moodDetector.setMoodManually(moodId);
    displayMoodResult(selectedMood);
  } catch (error) {
    showError(error.message);
  }
}

// Handle text-based mood analysis
async function handleTextAnalysis(event) {
  event.preventDefault();
  
  const textInput = document.getElementById('moodTextInput').value;
  
  if (!textInput.trim()) {
    showError('Please enter text to analyze your mood');
    return;
  }
  
  try {
    showLoading('Analyzing your text...');
    const detectedMood = await moodDetector.detectMoodFromText(textInput);
    displayMoodResult(detectedMood);
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

// Handle facial expression detection
async function handleFaceDetection() {
  try {
    showLoading('Analyzing your facial expression...');
    const detectedMood = await moodDetector.detectMoodFromFace();
    displayMoodResult(detectedMood);
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

// Display detected mood and offer to play music
function displayMoodResult(mood) {
  const resultContainer = document.getElementById('moodResultContainer');
  
  if (resultContainer) {
    resultContainer.innerHTML = `
      <h2>Your Current Mood: ${mood.mood_name}</h2>
      <p>${mood.description}</p>
      <button id="playMusicButton" class="primary-button">Play Music for this Mood</button>
    `;
    
    document.getElementById('playMusicButton').addEventListener('click', () => {
      // Store mood selection in session and redirect to player
      sessionStorage.setItem('selectedMoodId', mood.mood_id);
      sessionStorage.setItem('selectedMoodName', mood.mood_name);
      window.location.href = 'player.html';
    });
  }
}

// Helper functions for UI
function showError(message) {
  const errorElement = document.getElementById('errorMessage');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

function showLoading(message) {
  const loadingElement = document.getElementById('loadingMessage');
  if (loadingElement) {
    loadingElement.textContent = message || 'Loading...';
    loadingElement.style.display = 'block';
  }
}

function hideLoading() {
  const loadingElement = document.getElementById('loadingMessage');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
=======
import MoodDetector from './moodDetector.js';
import MoodMusicAPI from './api.js';

// Initialize components
const moodDetector = new MoodDetector();
const api = new MoodMusicAPI();

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Check login status first
    await api.getUserInfo();
    
    // Initialize mood detector
    const moods = await moodDetector.initialize();
    
    // Populate mood selection options
    const moodContainer = document.getElementById('moodSelectionContainer');
    if (moodContainer) {
      moods.forEach(mood => {
        const moodButton = document.createElement('button');
        moodButton.className = 'mood-button';
        moodButton.dataset.moodId = mood.mood_id;
        moodButton.textContent = mood.mood_name;
        moodButton.addEventListener('click', () => handleMoodSelection(mood.mood_id));
        moodContainer.appendChild(moodButton);
      });
    }
    
    // Add event listeners for mood detection methods
    document.getElementById('textAnalysisForm')?.addEventListener('submit', handleTextAnalysis);
    document.getElementById('faceDetectionButton')?.addEventListener('click', handleFaceDetection);
    
  } catch (error) {
    // Not logged in, redirect to login page
    window.location.href = 'index.html';
  }
});

// Handle manual mood selection
async function handleMoodSelection(moodId) {
  try {
    const selectedMood = await moodDetector.setMoodManually(moodId);
    displayMoodResult(selectedMood);
  } catch (error) {
    showError(error.message);
  }
}

// Handle text-based mood analysis
async function handleTextAnalysis(event) {
  event.preventDefault();
  
  const textInput = document.getElementById('moodTextInput').value;
  
  if (!textInput.trim()) {
    showError('Please enter text to analyze your mood');
    return;
  }
  
  try {
    showLoading('Analyzing your text...');
    const detectedMood = await moodDetector.detectMoodFromText(textInput);
    displayMoodResult(detectedMood);
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

// Handle facial expression detection
async function handleFaceDetection() {
  try {
    showLoading('Analyzing your facial expression...');
    const detectedMood = await moodDetector.detectMoodFromFace();
    displayMoodResult(detectedMood);
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

// Display detected mood and offer to play music
function displayMoodResult(mood) {
  const resultContainer = document.getElementById('moodResultContainer');
  
  if (resultContainer) {
    resultContainer.innerHTML = `
      <h2>Your Current Mood: ${mood.mood_name}</h2>
      <p>${mood.description}</p>
      <button id="playMusicButton" class="primary-button">Play Music for this Mood</button>
    `;
    
    document.getElementById('playMusicButton').addEventListener('click', () => {
      // Store mood selection in session and redirect to player
      sessionStorage.setItem('selectedMoodId', mood.mood_id);
      sessionStorage.setItem('selectedMoodName', mood.mood_name);
      window.location.href = 'player.html';
    });
  }
}

// Helper functions for UI
function showError(message) {
  const errorElement = document.getElementById('errorMessage');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

function showLoading(message) {
  const loadingElement = document.getElementById('loadingMessage');
  if (loadingElement) {
    loadingElement.textContent = message || 'Loading...';
    loadingElement.style.display = 'block';
  }
}

function hideLoading() {
  const loadingElement = document.getElementById('loadingMessage');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
>>>>>>> 219ebc643dd627d49d1adf75bbf60ce0fa090324
}