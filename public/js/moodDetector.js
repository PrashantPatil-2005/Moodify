/**
 * moodDetector.js - Analyzes user's mood through different methods
 * Supports text analysis, facial expression detection, and manual selection
 */

import MoodMusicAPI from './api.js';

class MoodDetector {
  constructor() {
    this.api = new MoodMusicAPI();
    this.moods = [];
    this.currentMood = null;
    this.faceDetectionEnabled = false;
    this.textAnalysisEnabled = false;
  }

  /**
   * Initialize the mood detector by loading available moods
   */
  async initialize() {
    try {
      // Fetch all available moods from the API
      this.moods = await this.api.getMoods();
      console.log('Moods loaded:', this.moods);
      return this.moods;
    } catch (error) {
      console.error('Failed to initialize mood detection:', error);
      throw error;
    }
  }

  /**
   * Set user's mood manually
   * @param {number} moodId - ID of the selected mood
   */
  async setMoodManually(moodId) {
    try {
      // Validate mood ID
      const moodExists = this.moods.some(mood => mood.mood_id === moodId);
      if (!moodExists) {
        throw new Error('Invalid mood selection');
      }

      // Log the mood via API
      const response = await this.api.logMood(moodId, 'manual');
      this.currentMood = this.moods.find(mood => mood.mood_id === moodId);
      
      console.log('Mood set manually:', this.currentMood);
      return this.currentMood;
    } catch (error) {
      console.error('Failed to set mood manually:', error);
      throw error;
    }
  }

  /**
   * Detect mood from text input
   * @param {string} text - Text to analyze for mood
   */
  async detectMoodFromText(text) {
    if (!text || text.trim() === '') {
      throw new Error('Empty text input');
    }

    try {
      this.textAnalysisEnabled = true;
      console.log('Analyzing text for mood:', text);
      
      // Simple keyword-based mood detection
      // In a production app, this would use NLP or a sentiment analysis API
      const keywords = {
        happy: ['happy', 'joy', 'good', 'great', 'excited', 'amazing', 'love', 'smile'],
        sad: ['sad', 'down', 'depressed', 'unhappy', 'gloomy', 'miserable', 'cry'],
        energetic: ['energetic', 'active', 'pumped', 'workout', 'exercise', 'energy', 'hyper'],
        relaxed: ['relaxed', 'calm', 'peaceful', 'chill', 'rest', 'tranquil', 'zen'],
        focused: ['focus', 'work', 'study', 'concentrate', 'productive', 'concentration']
      };

      // Convert text to lowercase for matching
      const lowercaseText = text.toLowerCase();
      
      // Count keyword matches for each mood
      const moodScores = {};
      Object.keys(keywords).forEach(mood => {
        moodScores[mood] = keywords[mood].filter(word => lowercaseText.includes(word)).length;
      });

      // Find mood with highest score
      let detectedMoodName = Object.keys(moodScores).reduce((a, b) => 
        moodScores[a] > moodScores[b] ? a : b);
        
      // Default to "relaxed" if no keywords match or tie
      if (Object.values(moodScores).every(score => score === 0)) {
        detectedMoodName = 'relaxed';
      }
      
      // Map the mood name to mood ID
      const moodMap = {
        'happy': 1,
        'sad': 2,
        'energetic': 3,
        'relaxed': 4,
        'focused': 5
      };
      
      const detectedMoodId = moodMap[detectedMoodName];
      
      // Log the detected mood
      await this.api.logMood(detectedMoodId, 'text_analysis');
      this.currentMood = this.moods.find(mood => mood.mood_id === detectedMoodId);
      
      console.log('Mood detected from text:', this.currentMood);
      return this.currentMood;
    } catch (error) {
      console.error('Failed to detect mood from text:', error);
      throw error;
    } finally {
      this.textAnalysisEnabled = false;
    }
  }

  /**
   * Detect mood from facial expressions using webcam
   */
  async detectMoodFromFace() {
    try {
      this.faceDetectionEnabled = true;
      console.log('Starting face detection for mood analysis');
      
      // In a real implementation, this would use a face detection library
      // like face-api.js or an external API service
      // For demo purposes, we'll simulate detection with a random mood
      
      // Show a "detecting" message or spinner in the UI
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing time
      
      // For demo, randomly select a mood (in production, use real face detection)
      const randomMoodId = Math.floor(Math.random() * 5) + 1;
      
      // Log the detected mood
      await this.api.logMood(randomMoodId, 'facial_detection');
      this.currentMood = this.moods.find(mood => mood.mood_id === randomMoodId);
      
      console.log('Mood detected from facial expression:', this.currentMood);
      return this.currentMood;
    } catch (error) {
      console.error('Failed to detect mood from facial expression:', error);
      throw error;
    } finally {
      this.faceDetectionEnabled = false;
    }
  }

  /**
   * Get the current detected mood
   */
  getCurrentMood() {
    return this.currentMood;
  }

  /**
   * Get mood detection history
   * @param {number} limit - Maximum number of records to retrieve
   */
  async getMoodHistory(limit = 10) {
    try {
      const history = await this.api.getMoodHistory(limit);
      console.log('Mood history:', history);
      return history;
    } catch (error) {
      console.error('Failed to get mood history:', error);
      throw error;
    }
  }
}

// Export the MoodDetector class
export default MoodDetector;