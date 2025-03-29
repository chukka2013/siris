// Sample song data
const songs = [
    {
        title: 'Naatu Naatu',
        artist: 'RRR',
        image: 'https://source.unsplash.com/random/300x300/?singer',
        audio: 'path/to/naatu-naatu.mp3'
    },
    {
        title: 'Oo Antava',
        artist: 'Pushpa',
        image: 'https://source.unsplash.com/random/300x300/?concert',
        audio: 'path/to/oo-antava.mp3'
    },
    {
        title: 'Ra Ra Rakkamma',
        artist: 'Vikrant Rona',
        image: 'https://source.unsplash.com/random/300x300/?band',
        audio: 'path/to/ra-ra-rakkamma.mp3'
    },
    {
        title: 'Kesariya',
        artist: 'Brahmastra',
        image: 'https://source.unsplash.com/random/300x300/?music',
        audio: 'path/to/kesariya.mp3'
    }
];

class MusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.isPlaying = false;
        this.currentSongIndex = 0;
        
        // DOM Elements
        this.playBtn = document.querySelector('.play-btn');
        this.progressBar = document.querySelector('.progress-bar');
        this.songTitle = document.querySelector('.song-details h6');
        this.artistName = document.querySelector('.song-details p');
        this.nowPlayingImg = document.querySelector('.now-playing img');
        
        this.initializePlayer();
        this.setupEventListeners();
    }

    initializePlayer() {
        this.loadSong(this.currentSongIndex);
        this.updatePlayerUI();
    }

    setupEventListeners() {
        // Play/Pause button
        this.playBtn.addEventListener('click', () => this.togglePlay());
        
        // Progress bar update
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        
        // Song ended
        this.audio.addEventListener('ended', () => this.playNext());
        
        // Song card play buttons
        document.querySelectorAll('.song-card .btn-outline-primary').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.currentSongIndex = index;
                this.loadSong(index);
                this.play();
            });
        });
    }

    loadSong(index) {
        const song = songs[index];
        this.audio.src = song.audio;
        this.songTitle.textContent = song.title;
        this.artistName.textContent = song.artist;
        this.nowPlayingImg.src = song.image;
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.audio.play();
        this.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        this.isPlaying = true;
    }

    pause() {
        this.audio.pause();
        this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.isPlaying = false;
    }

    playNext() {
        this.currentSongIndex = (this.currentSongIndex + 1) % songs.length;
        this.loadSong(this.currentSongIndex);
        this.play();
    }

    playPrevious() {
        this.currentSongIndex = (this.currentSongIndex - 1 + songs.length) % songs.length;
        this.loadSong(this.currentSongIndex);
        this.play();
    }

    updateProgress() {
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressBar.style.width = `${progress}%`;
    }

    updatePlayerUI() {
        const song = songs[this.currentSongIndex];
        this.songTitle.textContent = song.title;
        this.artistName.textContent = song.artist;
        this.nowPlayingImg.src = song.image;
    }
}

// Initialize the music player when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const player = new MusicPlayer();
});

// Add smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
}); 