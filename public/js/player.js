<<<<<<< HEAD
import MusicPlayer from './musicPlayer.js';
import MoodMusicAPI from './api.js';

// Initialize components
const musicPlayer = new MusicPlayer();
const api = new MoodMusicAPI();

// Track update interval
let updateInterval;

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Check login status first
    await api.getUserInfo();
    
    // Get the selected mood from session storage
    const moodId = sessionStorage.getItem('selectedMoodId');
    const moodName = sessionStorage.getItem('selectedMoodName');
    
    if (!moodId) {
      // No mood selected, redirect to mood selection page
      window.location.href = 'mood.html';
      return;
    }
    
    // Update the UI with mood info
    document.getElementById('currentMood').textContent = moodName;
    
    // Load songs for the selected mood
    showLoading('Loading songs for your mood...');
    const playlist = await musicPlayer.loadSongsByMood(parseInt(moodId));
    
    // Update playlist UI
    updatePlaylistUI(playlist);
    
    // Set up player controls
    setupPlayerControls();
    
    // Start song information updates
    startProgressUpdates();
    
  } catch (error) {
    showError(error.message);
    console.error(error);
  } finally {
    hideLoading();
  }
});

// Update the UI with the playlist
function updatePlaylistUI(playlist) {
  const playlistContainer = document.getElementById('playlist');
  
  if (playlistContainer) {
    playlistContainer.innerHTML = '';
    
    playlist.forEach((song, index) => {
      const songElement = document.createElement('div');
      songElement.className = 'playlist-item';
      songElement.dataset.index = index;
      songElement.innerHTML = `
        <span class="song-title">${song.title}</span>
        <span class="song-artist">${song.artist}</span>
        <span class="song-genre">${song.genre || 'N/A'}</span>
      `;
      
      songElement.addEventListener('click', () => {
        // Update current song index and play
        musicPlayer.currentSongIndex = index;
        musicPlayer.play();
        updateNowPlayingUI();
      });
      
      playlistContainer.appendChild(songElement);
    });
  }
}

// Set up player control buttons
function setupPlayerControls() {
  // Play/Pause button
  document.getElementById('playPauseButton')?.addEventListener('click', () => {
    musicPlayer.togglePlayPause();
    updatePlayPauseButtonUI();
  });
  
  // Previous button
  document.getElementById('prevButton')?.addEventListener('click', () => {
    musicPlayer.playPrevious();
    updateNowPlayingUI();
  });
  
  // Next button
  document.getElementById('nextButton')?.addEventListener('click', () => {
    musicPlayer.playNext();
    updateNowPlayingUI();
  });
  
  // Shuffle button
  document.getElementById('shuffleButton')?.addEventListener('click', () => {
    const isShuffleOn = musicPlayer.toggleShuffle();
    document.getElementById('shuffleButton').classList.toggle('active', isShuffleOn);
  });
  
  // Repeat button
  document.getElementById('repeatButton')?.addEventListener('click', () => {
    const isRepeatOn = musicPlayer.toggleRepeat();
    document.getElementById('repeatButton').classList.toggle('active', isRepeatOn);
  });
  
  // Volume slider
  document.getElementById('volumeSlider')?.addEventListener('input', (event) => {
    musicPlayer.setVolume(event.target.value / 100);
  });
  
  // Progress bar
  document.getElementById('progressBar')?.addEventListener('click', (event) => {
    const progressBar = document.getElementById('progressBar');
    const rect = progressBar.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const duration = musicPlayer.getStatus().duration;
    
    musicPlayer.seek(percent * duration);
  });
  
  // Feedback form
  document.getElementById('feedbackForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const comment = document.getElementById('feedbackComment')?.value;
    
    if (!rating) {
      showError('Please select a rating');
      return;
    }
    
    try {
      await musicPlayer.submitFeedback(parseInt(rating), comment);
      showMessage('Thanks for your feedback!');
      document.getElementById('feedbackForm').reset();
    } catch (error) {
      showError(error.message);
    }
  });
}

// Update the now playing information
function updateNowPlayingUI() {
  const status = musicPlayer.getStatus();
  const currentSong = status.currentSong;
  
  if (!currentSong) return;
  
  // Update song info
  document.getElementById('songTitle').textContent = currentSong.title;
  document.getElementById('songArtist').textContent = currentSong.artist;
  
  // Update play/pause button
  updatePlayPauseButtonUI();
  
  // Highlight current song in playlist
  const playlistItems = document.querySelectorAll('.playlist-item');
  playlistItems.forEach(item => {
    item.classList.toggle('active', parseInt(item.dataset.index) === musicPlayer.currentSongIndex);
  });
}

// Update the play/pause button based on player state
function updatePlayPauseButtonUI() {
  const playPauseButton = document.getElementById('playPauseButton');
  
  if (playPauseButton) {
    if (musicPlayer.isPlaying) {
      playPauseButton.innerHTML = '❚❚'; // Pause symbol
      playPauseButton.ariaLabel = 'Pause';
    } else {
      playPauseButton.innerHTML = '▶'; // Play symbol
      playPauseButton.ariaLabel = 'Play';
    }
  }
}

// Start regular updates of song progress
function startProgressUpdates() {
  // Clear any existing interval
  if (updateInterval) {
    clearInterval(updateInterval);
  }
  
  // Update every 500ms
  updateInterval = setInterval(() => {
    const status = musicPlayer.getStatus();
    
    // Update progress bar
    const progressBar = document.getElementById('progressFill');
    const timeDisplay = document.getElementById('timeDisplay');
    
    if (progressBar && status.duration > 0) {
      const percent = (status.currentTime / status.duration) * 100;
      progressBar.style.width = `${percent}%`;
    }
    
    if (timeDisplay) {
      const currentMinutes = Math.floor(status.currentTime / 60);
      const currentSeconds = Math.floor(status.currentTime % 60);
      const totalMinutes = Math.floor(status.duration / 60);
      const totalSeconds = Math.floor(status.duration % 60);
      
      timeDisplay.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')} / ${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
    }
  }, 500);
}

// Helper functions for UI
function showError(message) {
  const errorElement = document.getElementById('errorMessage');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  }
}

function showMessage(message) {
  const messageElement = document.getElementById('successMessage');
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 3000);
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
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
=======
import MusicPlayer from './musicPlayer.js';
import MoodMusicAPI from './api.js';

// Initialize components
const musicPlayer = new MusicPlayer();
const api = new MoodMusicAPI();

// Track update interval
let updateInterval;

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Check login status first
    await api.getUserInfo();
    
    // Get the selected mood from session storage
    const moodId = sessionStorage.getItem('selectedMoodId');
    const moodName = sessionStorage.getItem('selectedMoodName');
    
    if (!moodId) {
      // No mood selected, redirect to mood selection page
      window.location.href = 'mood.html';
      return;
    }
    
    // Update the UI with mood info
    document.getElementById('currentMood').textContent = moodName;
    
    // Load songs for the selected mood
    showLoading('Loading songs for your mood...');
    const playlist = await musicPlayer.loadSongsByMood(parseInt(moodId));
    
    // Update playlist UI
    updatePlaylistUI(playlist);
    
    // Set up player controls
    setupPlayerControls();
    
    // Start song information updates
    startProgressUpdates();
    
  } catch (error) {
    showError(error.message);
    console.error(error);
  } finally {
    hideLoading();
  }
});

// Update the UI with the playlist
function updatePlaylistUI(playlist) {
  const playlistContainer = document.getElementById('playlist');
  
  if (playlistContainer) {
    playlistContainer.innerHTML = '';
    
    playlist.forEach((song, index) => {
      const songElement = document.createElement('div');
      songElement.className = 'playlist-item';
      songElement.dataset.index = index;
      songElement.innerHTML = `
        <span class="song-title">${song.title}</span>
        <span class="song-artist">${song.artist}</span>
        <span class="song-genre">${song.genre || 'N/A'}</span>
      `;
      
      songElement.addEventListener('click', () => {
        // Update current song index and play
        musicPlayer.currentSongIndex = index;
        musicPlayer.play();
        updateNowPlayingUI();
      });
      
      playlistContainer.appendChild(songElement);
    });
  }
}

// Set up player control buttons
function setupPlayerControls() {
  // Play/Pause button
  document.getElementById('playPauseButton')?.addEventListener('click', () => {
    musicPlayer.togglePlayPause();
    updatePlayPauseButtonUI();
  });
  
  // Previous button
  document.getElementById('prevButton')?.addEventListener('click', () => {
    musicPlayer.playPrevious();
    updateNowPlayingUI();
  });
  
  // Next button
  document.getElementById('nextButton')?.addEventListener('click', () => {
    musicPlayer.playNext();
    updateNowPlayingUI();
  });
  
  // Shuffle button
  document.getElementById('shuffleButton')?.addEventListener('click', () => {
    const isShuffleOn = musicPlayer.toggleShuffle();
    document.getElementById('shuffleButton').classList.toggle('active', isShuffleOn);
  });
  
  // Repeat button
  document.getElementById('repeatButton')?.addEventListener('click', () => {
    const isRepeatOn = musicPlayer.toggleRepeat();
    document.getElementById('repeatButton').classList.toggle('active', isRepeatOn);
  });
  
  // Volume slider
  document.getElementById('volumeSlider')?.addEventListener('input', (event) => {
    musicPlayer.setVolume(event.target.value / 100);
  });
  
  // Progress bar
  document.getElementById('progressBar')?.addEventListener('click', (event) => {
    const progressBar = document.getElementById('progressBar');
    const rect = progressBar.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const duration = musicPlayer.getStatus().duration;
    
    musicPlayer.seek(percent * duration);
  });
  
  // Feedback form
  document.getElementById('feedbackForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const comment = document.getElementById('feedbackComment')?.value;
    
    if (!rating) {
      showError('Please select a rating');
      return;
    }
    
    try {
      await musicPlayer.submitFeedback(parseInt(rating), comment);
      showMessage('Thanks for your feedback!');
      document.getElementById('feedbackForm').reset();
    } catch (error) {
      showError(error.message);
    }
  });
}

// Update the now playing information
function updateNowPlayingUI() {
  const status = musicPlayer.getStatus();
  const currentSong = status.currentSong;
  
  if (!currentSong) return;
  
  // Update song info
  document.getElementById('songTitle').textContent = currentSong.title;
  document.getElementById('songArtist').textContent = currentSong.artist;
  
  // Update play/pause button
  updatePlayPauseButtonUI();
  
  // Highlight current song in playlist
  const playlistItems = document.querySelectorAll('.playlist-item');
  playlistItems.forEach(item => {
    item.classList.toggle('active', parseInt(item.dataset.index) === musicPlayer.currentSongIndex);
  });
}

// Update the play/pause button based on player state
function updatePlayPauseButtonUI() {
  const playPauseButton = document.getElementById('playPauseButton');
  
  if (playPauseButton) {
    if (musicPlayer.isPlaying) {
      playPauseButton.innerHTML = '❚❚'; // Pause symbol
      playPauseButton.ariaLabel = 'Pause';
    } else {
      playPauseButton.innerHTML = '▶'; // Play symbol
      playPauseButton.ariaLabel = 'Play';
    }
  }
}

// Start regular updates of song progress
function startProgressUpdates() {
  // Clear any existing interval
  if (updateInterval) {
    clearInterval(updateInterval);
  }
  
  // Update every 500ms
  updateInterval = setInterval(() => {
    const status = musicPlayer.getStatus();
    
    // Update progress bar
    const progressBar = document.getElementById('progressFill');
    const timeDisplay = document.getElementById('timeDisplay');
    
    if (progressBar && status.duration > 0) {
      const percent = (status.currentTime / status.duration) * 100;
      progressBar.style.width = `${percent}%`;
    }
    
    if (timeDisplay) {
      const currentMinutes = Math.floor(status.currentTime / 60);
      const currentSeconds = Math.floor(status.currentTime % 60);
      const totalMinutes = Math.floor(status.duration / 60);
      const totalSeconds = Math.floor(status.duration % 60);
      
      timeDisplay.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')} / ${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
    }
  }, 500);
}

// Helper functions for UI
function showError(message) {
  const errorElement = document.getElementById('errorMessage');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  }
}

function showMessage(message) {
  const messageElement = document.getElementById('successMessage');
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 3000);
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
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
>>>>>>> 219ebc643dd627d49d1adf75bbf60ce0fa090324
});