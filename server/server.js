const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static("public"));

// Dummy playlists based on mood
const playlists = {
    happy: ["Happy - Pharrell Williams", "Can't Stop the Feeling - Justin Timberlake"],
    sad: ["Someone Like You - Adele", "Fix You - Coldplay"],
    relaxed: ["Weightless - Marconi Union", "Sunset Lover - Petit Biscuit"],
    energetic: ["Eye of the Tiger - Survivor", "Stronger - Kanye West"]
};

// API to get playlist based on mood
app.get("/api/getPlaylist", (req, res) => {
    const mood = req.query.mood;
    res.json({ songs: playlists[mood] || [] });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
