"use client";

import { useState } from "react";

const songs = [
  {
    title: "Tabahi Wala New Nagpuri DJ Song 2026",
    artist: "Aryan Kelvin & Viral Boy",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600"
  },
  {
    title: "KhatraDJ New Nagpuri Song 2026",
    artist: "KhatraDJ",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600"
  },
  {
    title: "New Nagpuri DJ Remix 2026",
    artist: "DJ Remix",
    image: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600"
  }
];

export default function Home() {
  const [downloads, setDownloads] = useState({});

  function downloadSong(title) {
    setDownloads((old) => ({
      ...old,
      [title]: (old[title] || 0) + 1
    }));

    alert("Download link abhi add karna hai.");
  }

  return (
    <main>
      <header className="header">
        <h1>🎵 KhatraDJ</h1>
        <p>New Nagpuri DJ Songs 2026</p>
      </header>

      <section className="hero">
        <h2>🔥 Latest DJ Songs</h2>
        <p>New Nagpuri songs download karein</p>
      </section>

      <section className="download-section">
        <h2>🎧 DJ Song Download</h2>

        {songs.map((song) => (
          <div className="song-card" key={song.title}>
            <img src={song.image} alt={song.title} />

            <div className="song-info">
              <h3>{song.title}</h3>
              <p>{song.artist}</p>

              <div className="song-actions">
                <button className="play-btn">
                  ▶ Play
                </button>

                <button
                  className="download-btn"
                  onClick={() => downloadSong(song.title)}
                >
                  ⬇ Download
                </button>
              </div>

              <div className="download-count">
                📥 {downloads[song.title] || 0} Downloads
              </div>
            </div>
          </div>
        ))}
      </section>

      <footer>
        <p>© 2026 KhatraDJ • All Rights Reserved</p>
      </footer>
    </main>
  );
}
