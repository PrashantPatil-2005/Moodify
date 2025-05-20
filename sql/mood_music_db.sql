CREATE DATABASE IF NOT EXISTS mood_music_db;
USE mood_music_db;
-- Drop tables if exist (drop in dependency order)
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS mood_logs;
DROP TABLE IF EXISTS songs;
DROP TABLE IF EXISTS moods;
DROP TABLE IF EXISTS users;


-- Create users table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create moods table
CREATE TABLE moods (
    mood_id INT PRIMARY KEY AUTO_INCREMENT,
    mood_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- Create songs table
CREATE TABLE songs (
    song_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    file_path TEXT,
    mood_id INT,
    FOREIGN KEY (mood_id) REFERENCES moods(mood_id),
    UNIQUE KEY unique_song (title, artist)
);

-- Create mood_logs table
CREATE TABLE mood_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    mood_id INT NOT NULL,
    detected_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (mood_id) REFERENCES moods(mood_id)
);

-- Create feedback table
CREATE TABLE feedback (
    feedback_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    song_id INT NOT NULL,
    mood_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (song_id) REFERENCES songs(song_id),
    FOREIGN KEY (mood_id) REFERENCES moods(mood_id)
);

-- Insert or update moods
INSERT INTO moods (mood_id, mood_name, description)
VALUES
  (1, 'Happy', 'Upbeat and cheerful songs to boost your mood'),
  (2, 'Sad', 'Emotional and reflective songs for when you need to process feelings'),
  (3, 'Energetic', 'High-energy songs to motivate and energize'),
  (4, 'Relaxed', 'Calm and peaceful songs for relaxation and unwinding'),
  (5, 'Focused', 'Songs that help with concentration and productivity')
AS new_moods
ON DUPLICATE KEY UPDATE
  mood_name = new_moods.mood_name,
  description = new_moods.description;

-- Insert or update songs for 'Happy' mood (mood_id = 1)
INSERT INTO songs (title, artist, genre, file_path, mood_id)
VALUES 
  ('Good Day', 'Free Music Archive', 'Pop', 'https://freemusicarchive.org/music/download/60fb23f14/', 1),
  ('Sunny Side Up', 'Audionautix', 'Electronic', 'https://audionautix.com/Music/SunnySideUp.mp3', 1),
  ('Happy Walk', 'Bensound', 'Pop', 'https://www.bensound.com/bensound-music/bensound-happyrock.mp3', 1),
  ('Pumpkin Spice', 'Shane Ivers', 'Jazz', 'https://www.silvermansound.com/free-music/pumpkin-spice', 1),
  ('Cute', 'Bensound', 'Pop', 'https://www.bensound.com/bensound-music/bensound-cute.mp3', 1),
  ('Summer Spliffs', 'Broke For Free', 'Electronic', 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/Music_for_Video/Broke_For_Free/Directionless_EP/Broke_For_Free_-_01_-_Summer_Spliffs.mp3', 1),
  ('Something Elated', 'Broke For Free', 'Electronic', 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Broke_For_Free/Something_EP/Broke_For_Free_-_05_-_Something_Elated.mp3', 1),
  ('Sunshine', 'Jeris', 'Electronic', 'https://ccmixter.org/content/jeris/jeris_-_Sunshine.mp3', 1),
  ('Good Times', 'Alex', 'Pop', 'https://soundcloud.com/alexmusicofficial/good-times-free-download', 1),
  ('Happiness', 'Roger Subirana', 'Cinematic', 'https://mp3d.jamendo.com/?trackid=1884959&format=mp31', 1)
AS new_songs
ON DUPLICATE KEY UPDATE
  title = new_songs.title,
  artist = new_songs.artist,
  genre = new_songs.genre,
  file_path = new_songs.file_path,
  mood_id = new_songs.mood_id;

-- Insert or update songs for 'Sad' mood (mood_id = 2)
INSERT INTO songs (title, artist, genre, file_path, mood_id)
VALUES 
  ('Sadness', 'Free Music Archive', 'Piano', 'https://freemusicarchive.org/music/download/08ff4618b/', 2),
  ('The Lonely', 'Audionautix', 'Ambient', 'https://audionautix.com/Music/TheLonely.mp3', 2),
  ('Memories', 'Bensound', 'Classical', 'https://www.bensound.com/bensound-music/bensound-memories.mp3', 2),
  ('Melancholy', 'Scott Buckley', 'Cinematic', 'https://www.scottbuckley.com.au/library/melancholy.mp3', 2),
  ('Sad Day', 'Kevin MacLeod', 'Piano', 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Sad%20Day.mp3', 2)
AS new_songs
ON DUPLICATE KEY UPDATE
  title = new_songs.title,
  artist = new_songs.artist,
  genre = new_songs.genre,
  file_path = new_songs.file_path,
  mood_id = new_songs.mood_id;

-- Insert or update songs for 'Energetic' mood (mood_id = 3)
INSERT INTO songs (title, artist, genre, file_path, mood_id)
VALUES 
  ('Energy', 'Bensound', 'Electronic', 'https://www.bensound.com/bensound-music/bensound-energy.mp3', 3),
  ('Downtown Funk', 'AudionautiX', 'Funk', 'https://audionautix.com/Music/DowntownFunk.mp3', 3),
  ('Powerful Beat', 'Free Music Archive', 'Electronic', 'https://freemusicarchive.org/music/download/e8451ed53/', 3),
  ('Sport Rock', 'AShamaluevMusic', 'Rock', 'https://www.ashamaluevmusic.com/mp3/Sport%20Rock.mp3', 3),
  ('Actionable', 'Kevin MacLeod', 'Rock', 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Actionable.mp3', 3),
  ('Energy Flow', 'Spinningmerkaba', 'Electronic', 'https://ccmixter.org/content/spinningmerkaba/spinningmerkaba_-_Energy_Flow.mp3', 3),
  ('Dance Floor', 'DJ Smith', 'Electronic', 'https://soundcloud.com/djsmith/dance-floor-free-download', 3),
  ('Freedom', 'John Sib', 'Rock', 'https://mp3d.jamendo.com/?trackid=1343550&format=mp31', 3)
AS new_songs
ON DUPLICATE KEY UPDATE
  title = new_songs.title,
  artist = new_songs.artist,
  genre = new_songs.genre,
  file_path = new_songs.file_path,
  mood_id = new_songs.mood_id;

-- Insert or update songs for 'Relaxed' mood (mood_id = 4)
INSERT INTO songs (title, artist, genre, file_path, mood_id)
VALUES 
  ('Relaxing', 'Bensound', 'Ambient', 'https://www.bensound.com/bensound-music/bensound-relaxing.mp3', 4),
  ('Peaceful', 'Audionautix', 'Ambient', 'https://audionautix.com/Music/Peaceful.mp3', 4),
  ('Soft Meditation', 'Free Music Archive', 'Ambient', 'https://freemusicarchive.org/music/download/d6fea7e76/', 4),
  ('Ambient Piano', 'AShamaluevMusic', 'Piano', 'https://www.ashamaluevmusic.com/mp3/Ambient%20Piano.mp3', 4),
  ('Calmness', 'Relaxing Music', 'Ambient', 'https://relaxingcafe.com/wp-content/uploads/2022/04/Calmness-Free-Relaxing-Music.mp3', 4),
  ('Reflections', 'Javolenus', 'Ambient', 'https://ccmixter.org/content/javolenus/javolenus_-_Reflections.mp3', 4)
AS new_songs
ON DUPLICATE KEY UPDATE
  title = new_songs.title,
  artist = new_songs.artist,
  genre = new_songs.genre,
  file_path = new_songs.file_path,
  mood_id = new_songs.mood_id;

-- Insert or update songs for 'Focused' mood (mood_id = 5)
INSERT INTO songs (title, artist, genre, file_path, mood_id)
VALUES 
  ('Deep Focus', 'Bensound', 'Electronic', 'https://www.bensound.com/bensound-music/bensound-deepblue.mp3', 5),
  ('Concentration', 'Audionautix', 'Electronic', 'https://audionautix.com/Music/GettingitDone.mp3', 5),
  ('Study Session', 'Free Music Archive', 'Piano', 'https://freemusicarchive.org/music/download/a9c8a5e29/', 5),
  ('Work Mode', 'AShamaluevMusic', 'Ambient', 'https://www.ashamaluevmusic.com/mp3/Piano%20Moment.mp3', 5),
  ('Focus Time', 'Scott Buckley', 'Ambient', 'https://www.scottbuckley.com.au/library/build.mp3', 5),
  ('Night Owl', 'Broke For Free', 'Electronic', 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Directionless_EP/Broke_For_Free_-_01_-_Night_Owl.mp3', 5),
  ('Thinking', 'Mike', 'Ambient', 'https://soundcloud.com/mikemusic/thinking-free-download', 5),
  ('Open Mind', 'Kaizan', 'Electronic', 'https://ccmixter.org/content/kaizan/kaizan_-_Open_Mind.mp3', 5)
AS new_songs
ON DUPLICATE KEY UPDATE
  title = new_songs.title,
  artist = new_songs.artist,
  genre = new_songs.genre,
  file_path = new_songs.file_path,
  mood_id = new_songs.mood_id;
