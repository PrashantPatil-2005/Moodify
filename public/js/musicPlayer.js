/**
 * musicPlayer.js - Handles music playback based on mood
 * Manages audio playback, queue, controls, and feedback
 */

import MoodMusicAPI from './api.js';

class MusicPlayer {
  constructor() {
    this.api = new MoodMusicAPI();
    this.audioElement = new Audio();
    this.playlist = [];
    this.currentSongIndex = 0;
    this.currentMoodId = null;
    this.isPlaying = false;
    this.isShuffle = false;
    this.isRepeat = false;
    
    // Initialize event listeners for audio element
    this._setupEventListeners();
  }

  /**
   * Setup event listeners for the audio element
   */
  _setupEventListeners() {
    // When current song ends, play next song
    this.audioElement.addEventListener('ended', () => {
      this.playNext();
    });

    // Handle audio errors
    this.audioElement.addEventListener('error', (error) => {
      console.error('Audio playback error:', error);
      // Try to recover by playing next song
      this.playNext();
    });
  }

  /**
   * Load songs for a specific mood
   * @param {number} moodId - ID of the mood to load songs for
   */
  async loadSongsByMood(moodId) {
    try {
      // Fetch songs for the specified mood
      const songs = await this.api.getSongsByMood(moodId);
      
      if (!songs || songs.length === 0) {
        throw new Error(`No songs available for mood ID: ${moodId}`);
      }
      
      this.playlist = songs;
      this.currentMoodId = moodId;
      this.currentSongIndex = 0;
      
      console.log(`Loaded ${songs.length} songs for mood ID ${moodId}`);
      return this.playlist;
    } catch (error) {
      console.error('Failed to load songs by mood:', error);
      throw error;
    }
  }

  /**
   * Start playback of the current song
   */
  play() {
    if (this.playlist.length === 0) {
      throw new Error('No songs loaded in playlist');
    }
    
    try {
      const currentSong = this.playlist[this.currentSongIndex];
      
      // If audio source needs to be set/changed
      if (this.audioElement.src !== currentSong.file_path) {
        this.audioElement.src = currentSong.file_path;
      }
      
      // Start playback
      this.audioElement.play();
      this.isPlaying = true;
      
      console.log('Now playing:', this._getCurrentSongInfo());
      
      // Return info about current song
      return this._getCurrentSongInfo();
    } catch (error) {
      console.error('Failed to play song:', error);
      throw error;
    }
  }

  /**
   * Pause playback of the current song
   */
  pause() {
    try {
      this.audioElement.pause();
      this.isPlaying = false;
      console.log('Playback paused');
    } catch (error) {
      console.error('Failed to pause playback:', error);
      throw error;
    }
  }

  /**
   * Toggle play/pause state
   */
  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  /**
   * Skip to the next song in the playlist
   */
  playNext() {
    if (this.playlist.length === 0) {
      throw new Error('No songs loaded in playlist');
    }
    
    try {
      // If shuffle is on, choose a random song
      if (this.isShuffle) {
        const oldIndex = this.currentSongIndex;
        
        // Make sure we don't play the same song again
        while (this.currentSongIndex === oldIndex && this.playlist.length > 1) {
          this.currentSongIndex = Math.floor(Math.random() * this.playlist.length);
        }
      } else {
        // Increment to next song or loop back to first
        this.currentSongIndex = (this.currentSongIndex + 1) % this.playlist.length;
      }
      
      // If we were already playing, start the new song
      const wasPlaying = this.isPlaying;
      if (wasPlaying) {
        this.play();
      } else {
        // Just update the source
        this.audioElement.src = this.playlist[this.currentSongIndex].file_path;
      }
      
      return this._getCurrentSongInfo();
    } catch (error) {
      console.error('Failed to play next song:', error);
      throw error;
    }
  }

  /**
   * Skip to the previous song in the playlist
   */
  playPrevious() {
    if (this.playlist.length === 0) {
      throw new Error('No songs loaded in playlist');
    }
    
    try {
      // If we're more than 3 seconds into the song, restart current song
      if (this.audioElement.currentTime > 3) {
        this.audioElement.currentTime = 0;
        return this._getCurrentSongInfo();
      }
      
      // Go to previous song or wrap to end of playlist
      this.currentSongIndex--;
      if (this.currentSongIndex < 0) {
        this.currentSongIndex = this.playlist.length - 1;
      }
      
      // If we were already playing, start the new song
      const wasPlaying = this.isPlaying;
      if (wasPlaying) {
        this.play();
      } else {
        // Just update the source
        this.audioElement.src = this.playlist[this.currentSongIndex].file_path;
      }
      
      return this._getCurrentSongInfo();
    } catch (error) {
      console.error('Failed to play previous song:', error);
      throw error;
    }
  }

  /**
   * Toggle shuffle mode on/off
   */
  toggleShuffle() {
    this.isShuffle = !this.isShuffle;
    console.log(`Shuffle mode: ${this.isShuffle ? 'on' : 'off'}`);
    return this.isShuffle;
  }

  /**
   * Toggle repeat mode on/off
   */
  toggleRepeat() {
    this.isRepeat = !this.isRepeat;
    this.audioElement.loop = this.isRepeat;
    console.log(`Repeat mode: ${this.isRepeat ? 'on' : 'off'}`);
    return this.isRepeat;
  }

  /**
   * Seek to a specific position in the current song
   * @param {number} positionSeconds - Position in seconds to seek to
   */
  seek(positionSeconds) {
    if (!this.audioElement.src) {
      throw new Error('No song loaded');
    }
    
    try {
      // Validate position
      if (positionSeconds < 0) {
        positionSeconds = 0;
      } else if (positionSeconds > this.audioElement.duration) {
        positionSeconds = this.audioElement.duration;
      }
      
      this.audioElement.currentTime = positionSeconds;
      return positionSeconds;
    } catch (error) {
      console.error('Failed to seek:', error);
      throw error;
    }
  }

  /**
   * Set volume level
   * @param {number} level - Volume level (0.0 to 1.0)
   */
  setVolume(level) {
    try {
      // Validate and clamp volume level
      level = Math.max(0, Math.min(1, level));
      this.audioElement.volume = level;
      return level;
    } catch (error) {
      console.error('Failed to set volume:', error);
      throw error;
    }
  }

  /**
   * Get the current playback status
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentSong: this._getCurrentSongInfo(),
      currentTime: this.audioElement.currentTime,
      duration: this.audioElement.duration || 0,
      volume: this.audioElement.volume,
      isShuffle: this.isShuffle,
      isRepeat: this.isRepeat
    };
  }

  /**
   * Submit feedback for the current song
   * @param {number} rating - Rating (1-5)
   * @param {string} comment - Optional feedback comment
   */
  async submitFeedback(rating, comment = '') {
    if (!this.currentMoodId || this.playlist.length === 0) {
      throw new Error('No song playing to provide feedback for');
    }
    
    try {
      const currentSong = this.playlist[this.currentSongIndex];
      const response = await this.api.submitFeedback(
        currentSong.song_id,
        this.currentMoodId,
        rating,
        comment
      );
      
      console.log('Feedback submitted:', response);
      return response;
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error;
    }
  }

  /**
   * Helper method to get information about the current song
   */
  _getCurrentSongInfo() {
    if (this.playlist.length === 0) {
      return null;
    }
    
    const song = this.playlist[this.currentSongIndex];
    return {
      id: song.song_id,
      title: song.title,
      artist: song.artist,
      genre: song.genre,
      duration: this.audioElement.duration,
      currentTime: this.audioElement.currentTime
    };
  }
}

// Export the MusicPlayer class
export default MusicPlayer;