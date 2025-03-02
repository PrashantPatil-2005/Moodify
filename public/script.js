function setMood(mood) {
    fetch(`/api/getPlaylist?mood=${mood}`)
        .then(response => response.json())
        .then(data => {
            const playlist = document.getElementById("playlist");
            playlist.innerHTML = "";
            data.songs.forEach(song => {
                const li = document.createElement("li");
                li.textContent = song;
                playlist.appendChild(li);
            });
        })
        .catch(error => console.error("Error fetching playlist:", error));
}
