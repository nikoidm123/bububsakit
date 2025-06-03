const messages = [
  "❤️ Aku sayang kamu banget, cepet sembuh yaaaa 😚💕",
  "🌟 Jangan sedih ya, aku selalu di sini buat kamu!",
  "🧸 Peluk virtual buat yang sakit biar sembuh!",
  "💖 Kamu kuat banget, semangat terus ya cinta!"
];

const songData = [
    { src: 'nina1.mp3', photo: 'foto1.jpg', title: 'Nina - Lagu Kesayangan' },
    { src: 'littlebaby.mp3', photo: 'foto2.jpg', title: 'Melodi Bahagia - Artis B' },
    { src: 'nina1.mp3', photo: 'foto3.jpg', title: 'Cinta Abadi - Artis C' },
    { src: 'nina1.mp3', photo: 'foto4.jpg', title: 'Senyum Manismu - Artis D' },
    { src: 'nina1.mp3', photo: 'foto5.jpg', title: 'Harapanku - Artis E' }
];
let currentSongIndex = 0;

const musicPlayerModal = document.getElementById("musicPlayerModal");
const modalAlbumArt = document.getElementById("modalAlbumArt");
const modalSongTitle = document.getElementById("modalSongTitle");
const modalPlayPauseBtn = document.getElementById("modalPlayPauseBtn");
const modalPrevSongBtn = document.getElementById("modalPrevSongBtn");
const modalNextSongBtn = document.getElementById("modalNextSongBtn");
const modalCurrentTimeEl = document.getElementById("modalCurrentTime");
const modalTotalDurationEl = document.getElementById("modalTotalDuration");
const modalProgressBarContainerEl = document.getElementById("modalProgressBarContainer");
const modalProgressBarEl = document.getElementById("modalProgressBar");

const dynamicMusicPlayer = document.getElementById("dynamicMusicPlayer");

function showMessage() {
  const msg = document.getElementById("surpriseMsg");
  const randomMsg = messages[Math.floor(Math.random() * messages.length)];
  if (msg) msg.innerText = randomMsg;

  const gallery = document.getElementById("photoGallery");
  if (!gallery) return;
  gallery.classList.add("show");
  gallery.innerHTML = ""; 

  const allImages = gallery.querySelectorAll('img');
  allImages.forEach(img => img.classList.remove('photo-clicked'));

  songData.forEach((song, index) => {
    const img = document.createElement("img");
    img.src = song.photo;
    img.alt = song.title;
    img.dataset.songIndex = index; 
    img.classList.add('playable-photo');
    img.addEventListener("click", () => openMusicModal(index)); 
    gallery.appendChild(img);
  });

  createFloatingHeart();
  showHugPopup();
}

let isPlaying = false;
let wasPlayingBeforePopup = false; 

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function playSong(index) {
    const bgMusic = document.getElementById("bgMusic");
    if (bgMusic && !bgMusic.paused) {
        bgMusic.pause();
        bgMusic.volume = 0; 
    }

    document.querySelectorAll('.playable-photo.active').forEach(img => img.classList.remove('active'));

    if (!songData[index]) {
        console.error("Data lagu tidak ditemukan untuk indeks:", index);
        return;
    }
    currentSongIndex = index;
    const songToPlay = songData[currentSongIndex];
    
    if (dynamicMusicPlayer) dynamicMusicPlayer.src = songToPlay.src;
    
    if (musicPlayerModal && !musicPlayerModal.classList.contains("hidden")) {
        if (modalAlbumArt) modalAlbumArt.src = songToPlay.photo;
        if (modalSongTitle) modalSongTitle.innerText = songToPlay.title;
    }
    
    if (modalProgressBarEl) modalProgressBarEl.style.width = '0%';
    if (modalCurrentTimeEl) modalCurrentTimeEl.innerText = formatTime(0);

    if (dynamicMusicPlayer) {
        dynamicMusicPlayer.play()
            .then(() => {
                isPlaying = true;
                if (modalPlayPauseBtn) modalPlayPauseBtn.innerText = '⏸️';
                
                const activePhoto = document.querySelector(`.playable-photo[data-song-index="${currentSongIndex}"]`);
                if (activePhoto) {
                    activePhoto.classList.add('active');
                }
                console.log(`🎵 Memutar: ${songToPlay.title}`);
            })
            .catch(error => {
                console.error("Error memutar lagu:", error);
                isPlaying = false; 
                if (modalPlayPauseBtn) modalPlayPauseBtn.innerText = '▶️';
            });
    }
}

function togglePlayPause() {
    if (!dynamicMusicPlayer) return;

    if (!dynamicMusicPlayer.src || dynamicMusicPlayer.src === window.location.href ) { 
        if (songData.length > 0) {
            playSong(currentSongIndex); 
        } else {
            console.log("Tidak ada lagu untuk diputar.");
            return;
        }
    } else if (isPlaying) {
        dynamicMusicPlayer.pause();
        if (modalPlayPauseBtn) modalPlayPauseBtn.innerText = '▶️';
        isPlaying = false;
        console.log("⏸️ Lagu dijeda.");
    } else {
        dynamicMusicPlayer.play()
            .then(() => {
                if (modalPlayPauseBtn) modalPlayPauseBtn.innerText = '⏸️';
                isPlaying = true;
                console.log("▶️ Lagu dilanjutkan.");
            })
            .catch(error => {
                console.error("Error melanjutkan lagu:", error);
            });
    }
}

function playNextSong() {
    if (songData.length === 0) return;
    currentSongIndex = (currentSongIndex + 1) % songData.length;
    playSong(currentSongIndex);
}

function playPrevSong() {
    if (songData.length === 0) return;
    currentSongIndex = (currentSongIndex - 1 + songData.length) % songData.length;
    playSong(currentSongIndex);
}

function openMusicModal(songIndex) {
    if (!musicPlayerModal || !songData[songIndex]) return; 

    if (modalAlbumArt) modalAlbumArt.src = songData[songIndex].photo;
    if (modalSongTitle) modalSongTitle.innerText = songData[songIndex].title;
    
    if (modalProgressBarEl) modalProgressBarEl.style.width = '0%';
    if (modalCurrentTimeEl) modalCurrentTimeEl.innerText = formatTime(0);
    if (dynamicMusicPlayer && dynamicMusicPlayer.duration && isFinite(dynamicMusicPlayer.duration) && modalTotalDurationEl) {
        modalTotalDurationEl.innerText = formatTime(dynamicMusicPlayer.duration);
    } else if (modalTotalDurationEl) {
        modalTotalDurationEl.innerText = formatTime(0); 
    }
    
    playSong(songIndex); 

    musicPlayerModal.classList.remove("hidden");
    document.body.classList.add("blurred");
}

function closeMusicModal() {
    if (!musicPlayerModal) return;
    musicPlayerModal.classList.add("hidden");
    document.body.classList.remove("blurred");
}

document.addEventListener('DOMContentLoaded', () => {
    if(dynamicMusicPlayer) dynamicMusicPlayer.addEventListener('ended', playNextSong);

    if (modalPlayPauseBtn) modalPlayPauseBtn.addEventListener('click', togglePlayPause); 
    if (modalPrevSongBtn) modalPrevSongBtn.addEventListener('click', playPrevSong);   
    if (modalNextSongBtn) modalNextSongBtn.addEventListener('click', playNextSong);   

    if (dynamicMusicPlayer) {
        dynamicMusicPlayer.addEventListener('loadedmetadata', () => {
            if (modalTotalDurationEl && isFinite(dynamicMusicPlayer.duration)) {
                 modalTotalDurationEl.innerText = formatTime(dynamicMusicPlayer.duration);
            }
        });

        dynamicMusicPlayer.addEventListener('timeupdate', () => {
            if (dynamicMusicPlayer.duration && isFinite(dynamicMusicPlayer.duration) && modalProgressBarEl && modalCurrentTimeEl) {
                const progressPercent = (dynamicMusicPlayer.currentTime / dynamicMusicPlayer.duration) * 100;
                modalProgressBarEl.style.width = `${progressPercent}%`;
                modalCurrentTimeEl.innerText = formatTime(dynamicMusicPlayer.currentTime);
            } else if (modalProgressBarEl && modalCurrentTimeEl) { 
                modalProgressBarEl.style.width = '0%';
                modalCurrentTimeEl.innerText = formatTime(0);
            }
        });
    }

    if (modalProgressBarContainerEl && dynamicMusicPlayer) {
        modalProgressBarContainerEl.addEventListener('click', (e) => {
            if (!dynamicMusicPlayer.duration || !isFinite(dynamicMusicPlayer.duration)) return; 

            const progressBarRect = modalProgressBarContainerEl.getBoundingClientRect();
            const clickX = e.offsetX; 
            const newTime = (clickX / progressBarRect.width) * dynamicMusicPlayer.duration;
            
            if (isFinite(newTime)) { 
                 dynamicMusicPlayer.currentTime = newTime;
            }
        });
    }
    
    const memoryGamePopup = document.getElementById("memoryGamePopup");
    const loveLetterPopup = document.getElementById("loveLetterPopup");
    
    if (musicPlayerModal) musicPlayerModal.classList.add("hidden");
    if (memoryGamePopup) memoryGamePopup.classList.add("hidden");
    if (loveLetterPopup) loveLetterPopup.classList.add("hidden");
    document.body.classList.remove("blurred");
    console.log("Semua popup (termasuk modal musik) disembunyikan saat DOMContentLoaded.");

    const showMemoryGameBtn = document.getElementById("showMemoryGameButton"); 
    const closeGameBtn = document.getElementById("closeGameButton"); 
    const restartGameBtn = document.getElementById("restartGameButton");

    if (showMemoryGameBtn) showMemoryGameBtn.addEventListener('click', showMemoryGame);
    if (closeGameBtn) closeGameBtn.addEventListener('click', closeMemoryGame);
    if (restartGameBtn) restartGameBtn.addEventListener('click', restartMemoryGame);
});

function createFloatingHeart() {
  const heart = document.createElement("div");
  heart.className = "floating-heart";
  heart.innerHTML = "❤️";
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.animationDuration = 2 + Math.random() * 2 + "s";
  document.body.appendChild(heart);
  setTimeout(() => { heart.remove(); }, 4000);
}

function showHugPopup() {
  const popup = document.createElement("div");
  popup.className = "hug-popup";
  popup.innerText = "🤗 Peluk Virtual!";
  document.body.appendChild(popup);
  setTimeout(() => { popup.remove(); }, 2000);
}

let musicStarted = false;
function playMusicOnce() {
  if (!musicStarted) {
    const audio = document.getElementById("bgMusic");
    if (!audio) return;
    audio.muted = false;
    audio.volume = 0.5; 
    audio.play().then(() => { console.log("🎵 Musik latar diputar!"); })
                 .catch(err => { console.log("🚫 Autoplay musik latar gagal:", err); });
    musicStarted = true;
  }
}

function showLoveLetter() {
  document.body.classList.add("blurred");
  const popup = document.getElementById("loveLetterPopup");
  if(popup) popup.classList.remove("hidden");
  
  wasPlayingBeforePopup = isPlaying; 
  if (isPlaying) { togglePlayPause(); }

  const text = `Hai cintaku... ❤️\nAku tahu kamu lagi sakit dan mungkin merasa lemah sekarang...\nTapi aku cuma mau bilang: kamu itu luar biasa kuat, dan aku bangga banget punya kamu.\nKalau aku bisa, aku pengen peluk kamu sekarang dan bisikin langsung:\n"Aku selalu di sini buat kamu."\nCepet sembuh ya sayangku... aku kangen peluk kamu! 🥺💞`;
  const target = document.getElementById("loveLetterText");
  if (!target) return;
  target.innerHTML = "";
  let i = 0;
  let typingInterval; 
  function typeCharacter() {
    if (i < text.length) {
      target.innerHTML += (text[i] === "\n" ? "<br>" : text[i]);
      i++;
    } else { clearInterval(typingInterval); }
  }
  typingInterval = setInterval(typeCharacter, 40);
}

function closeLoveLetter() {
  document.body.classList.remove("blurred");
  const popup = document.getElementById("loveLetterPopup");
  if(popup) popup.classList.add("hidden");
  if (wasPlayingBeforePopup) { 
     if (!isPlaying && dynamicMusicPlayer && dynamicMusicPlayer.src && dynamicMusicPlayer.src !== window.location.href) {
        togglePlayPause(); 
    }
  }
  wasPlayingBeforePopup = false; 
}

const heartsContainer = document.getElementById("floatingHeartsContainer");
function createBackgroundHeart() {
  if (!heartsContainer) return; 
  const heart = document.createElement("div");
  heart.className = "floating-heart-bg";
  heart.innerHTML = "❤️";
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.animationDuration = (5 + Math.random() * 5) + "s";
  heart.style.animationDelay = (Math.random() * 5) + "s";
  heartsContainer.appendChild(heart);
  setTimeout(() => heart.remove(), 10000);
}
if (heartsContainer) { setInterval(createBackgroundHeart, 400); }

const photoGalleryElement = document.getElementById("photoGallery");
if (photoGalleryElement) {
    photoGalleryElement.addEventListener("click", function (e) {
      if (e.target.tagName === "IMG" && e.target.classList.contains('playable-photo')) { 
        const img = e.target;
        img.classList.remove("photo-clicked"); 
        void img.offsetWidth; 
        img.classList.add("photo-clicked");
        setTimeout(() => { img.classList.remove("photo-clicked"); }, 600);
      }
    });
}

const photoFiles = ["foto1.jpg", "foto2.jpg", "foto3.jpg", "foto4.jpg"];
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let lockBoard = false;

function showMemoryGame() {
    document.body.classList.add("blurred");
    const gamePopup = document.getElementById("memoryGamePopup");
    if(gamePopup) gamePopup.classList.remove("hidden");
    wasPlayingBeforePopup = isPlaying; 
    if (isPlaying) { togglePlayPause(); }
    initializeMemoryGame();
}

function closeMemoryGame() {
    document.body.classList.remove("blurred");
    const gamePopup = document.getElementById("memoryGamePopup");
    if(gamePopup) gamePopup.classList.add("hidden");
    if (wasPlayingBeforePopup) { 
        if (!isPlaying && dynamicMusicPlayer && dynamicMusicPlayer.src && dynamicMusicPlayer.src !== window.location.href) {
            togglePlayPause();
        }
    }
    wasPlayingBeforePopup = false; 
}

function initializeMemoryGame() {
    const gameBoard = document.getElementById("gameBoard");
    if (!gameBoard) return;
    gameBoard.innerHTML = '';
    const gameMessage = document.getElementById("memoryGameMessage");
    if(gameMessage) gameMessage.innerText = "Temukan semua pasangan foto!";
    cards = [...photoFiles, ...photoFiles];
    shuffle(cards);
    flippedCards = [];
    matchedPairs = 0;
    lockBoard = false;
    cards.forEach((photoSrc) => { 
        const cardElement = document.createElement("div");
        cardElement.classList.add("memory-card");
        cardElement.dataset.photo = photoSrc; 
        const frontFace = document.createElement("img");
        frontFace.classList.add("front-face");
        frontFace.src = photoSrc;
        frontFace.alt = "Foto Memori";
        const backFace = document.createElement("div");
        backFace.classList.add("back-face");
        backFace.innerHTML = '❓'; 
        cardElement.appendChild(frontFace);
        cardElement.appendChild(backFace);
        cardElement.addEventListener("click", flipCard);
        gameBoard.appendChild(cardElement);
    });
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function flipCard() {
    if (lockBoard || this.classList.contains('flipped') || this.classList.contains('matched')) return;
    this.classList.add("flipped");
    flippedCards.push(this);
    if (flippedCards.length === 2) {
        lockBoard = true;
        checkForMatch();
    }
}

function checkForMatch() {
    if (flippedCards.length < 2) return;
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.photo === card2.dataset.photo;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    if (flippedCards.length < 2) return;
    flippedCards[0].classList.add("matched");
    flippedCards[1].classList.add("matched");
    matchedPairs++;
    resetBoard();
    const gameMessage = document.getElementById("memoryGameMessage");
    if (matchedPairs === photoFiles.length && gameMessage) {
        gameMessage.innerText = "Selamat! Semua pasangan ditemukan! 🎉";
    }
}

function unflipCards() {
    setTimeout(() => {
        if(flippedCards.length > 0 && flippedCards[0]) flippedCards[0].classList.remove("flipped");
        if(flippedCards.length > 1 && flippedCards[1]) flippedCards[1].classList.remove("flipped");
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [flippedCards, lockBoard] = [[], false];
}

function restartMemoryGame() {
    initializeMemoryGame();
}