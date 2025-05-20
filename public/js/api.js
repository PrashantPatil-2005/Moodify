/**
 * api.js - Handles all API requests to the backend
 * Manages user authentication, mood logs, songs, and feedback
 */

class MoodMusicAPI {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token') || null;
  }

  /**
   * Helper method to make API requests
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {object} data - Request body data
   * @returns {Promise} - Promise with response data
   */
  async request(endpoint, method = 'GET', data = null) {
    const url = `${this.baseURL}${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    // Add auth token if available
    if (this.token) {
      options.headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Add request body if data is provided
    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      // Handle non-200 responses
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
      }
      
      // Return parsed JSON response
      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  /**
   * User Authentication Methods
   */
  
  // Register a new user
  async register(username, email, password) {
    const data = { username, email, password };
    const response = await this.request('/users/register', 'POST', data);
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('token', this.token);
    }
    
    return response;
  }

  // Login user
  async login(email, password) {
    const data = { email, password };
    const response = await this.request('/users/login', 'POST', data);
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('token', this.token);
    }
    
    return response;
  }

  // Logout user
  logout() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Get current user info
  async getUserInfo() {
    return await this.request('/users/me');
  }

  /**
   * Mood Related Methods
   */
  
  // Get all available moods
  async getMoods() {
    return await this.request('/moods');
  }

  // Log a user's mood
  async logMood(moodId, method = 'manual') {
    const data = { mood_id: moodId, method };
    return await this.request('/moods/log', 'POST', data);
  }

  // Get user's mood history
  async getMoodHistory(limit = 10) {
    return await this.request(`/moods/history?limit=${limit}`);
  }

  /**
   * Song Related Methods
   */
  
  // Get songs by mood
  async getSongsByMood(moodId) {
    return await this.request(`/songs/mood/${moodId}`);
  }

  // Get song details
  async getSong(songId) {
    return await this.request(`/songs/${songId}`);
  }

  // Search songs
  async searchSongs(query) {
    return await this.request(`/songs/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Feedback Methods
   */
  
  // Submit feedback for a song
  async submitFeedback(songId, moodId, rating, comment = '') {
    const data = { 
      song_id: songId,
      mood_id: moodId,
      rating,
      comment
    };
    return await this.request('/feedback', 'POST', data);
  }

  // Get feedback history for a user
  async getFeedbackHistory() {
    return await this.request('/feedback/history');
  }
}

// Export the API class
export default MoodMusicAPI;