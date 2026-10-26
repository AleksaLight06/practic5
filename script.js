localStorage.clear();
sessionStorage.clear();

const defaultAlbums = [
    {
        id: "1", artist: "Ado", title: "Kyogen", year: 2022, genre: "J-Pop", cover: "ado.jpg",
        tracks: [
            { name: "Rule", duration: "3:45", isFavorite: false, file: "Ado-RuLe.mp3" },
            { name: "Show", duration: "3:09", isFavorite: false, file: "Ado-Show.mp3" },
            { name: "I'm a Controversy", duration: "4:12", isFavorite: false, file: "Ado-Im_a_Controversy.mp3" }
        ]
    },
    {
        id: "2", artist: "IC3PEAK", title: "Kiss of Death", year: 2020, genre: "Experimental", cover: "ic3peak.jpg",
        tracks: [
            { name: "TRRST", duration: "3:10", isFavorite: false, file: "IC3PEAKi-TRRST.mp3" },
            { name: "Целую твой труп", duration: "3:24", isFavorite: false, file: "IC3PEAK-YA_celuyu_tvojj_trup.mp3" },
            { name: "Весело и грустно", duration: "3:33", isFavorite: false, file: "IC3PEAK-Veselo_i_grustno.mp3" }
        ]
    },
    {
        id: "3", artist: "Halsey", title: "Badlands", year: 2015, genre: "Alternative", cover: "halsey.jpg",
        tracks: [
            { name: "Castle", duration: "4:20", isFavorite: false, file: "Halsey-Castle.mp3" },
            { name: "Control", duration: "3:34", isFavorite: false, file: "Halsey-Control.mp3" },
            { name: "Gasoline", duration: "3:18", isFavorite: false, file: "Halsey-Gasoline.mp3" }
        ]
    }
];

let albums = JSON.parse(localStorage.getItem('music_albums'));
if (!albums) {
    albums = defaultAlbums;
    saveToLocalStorage();
}

let tempTracks = [];

const albumsContainer = document.getElementById('albums-section');
const sortSelect = document.getElementById('sort-select');
const albumForm = document.getElementById('album-form');
const tempTracksList = document.getElementById('temp-tracks-list');
const player = document.getElementById('audio-player');
const playerBox = document.getElementById('player-box');
const playerTrackName = document.getElementById('player-track-name');

function saveToLocalStorage() {
    localStorage.setItem('music_albums', JSON.stringify(albums));
}

function renderAlbums() {
    albumsContainer.innerHTML = "";
    let sortedAlbums = [...albums];

    if (sortSelect.value === 'year') {
        sortedAlbums.sort((a, b) => b.year - a.year);
    } else if (sortSelect.value === 'artist') {
        sortedAlbums.sort((a, b) => a.artist.localeCompare(b.artist));
    }

    sortedAlbums.forEach(album => {
        const card = document.createElement('div');
        card.className = "album-card";

        const currentSessionAlbum = sessionStorage.getItem('selected_album');
        if (currentSessionAlbum === album.id) {
            card.classList.add('selected');
        }

        card.innerHTML = `
            <div class="album-header">
                <img src="${album.cover}" class="album-cover" onerror="this.style.display='none'">
                <div class="album-info">
                    <h3>${album.artist} — ${album.title}</h3>
                    <p>${album.year} • ${album.genre}</p>
                </div>
                <button class="delete-album" data-id="${album.id}">Удалить</button>
            </div>
            <div class="tracks-list">
                ${album.tracks.map((track, i) => `
                    <div class="track ${track.isFavorite ? 'fav' : ''}" data-album="${album.id}" data-track="${i}">
                        <span class="track-name">${track.name}</span>
                        <span class="track-dur">${track.duration}</span>
                        <div class="track-actions">
                            <button class="fav-btn" title="В избранное">${track.isFavorite ? '★' : '☆'}</button>
                            ${track.file ? `<button class="play-btn" data-file="${encodeURI(track.file)}" data-name="${track.name}">▶</button>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            sessionStorage.setItem('selected_album', album.id);
            renderAlbums();
        });

        albumsContainer.appendChild(card);
    });
}

document.getElementById('add-track-btn').addEventListener('click', () => {
    const nameInput = document.getElementById('track-name');
    const durInput = document.getElementById('track-duration');

    const name = nameInput.value.trim();
    const duration = durInput.value.trim();
    const durationRegex = /^[0-9]{1,2}:[0-5][0-9]$/;

    if (!name || !durationRegex.test(duration)) {
        return;
    }

    tempTracks.push({ name, duration, isFavorite: false });
    nameInput.value = '';
    durInput.value = '';

    renderTempTracks();
});

function renderTempTracks() {
    tempTracksList.innerHTML = tempTracks.map((t, i) =>
        `<div class="temp-track">${t.name} (${t.duration}) <button type="button" onclick="removeTempTrack(${i})">x</button></div>`
    ).join('');
}

window.removeTempTrack = (index) => {
    tempTracks.splice(index, 1);
    renderTempTracks();
};

albumForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const artist = document.getElementById('artist').value.trim();
    const title = document.getElementById('title').value.trim();
    const year = document.getElementById('year').value;
    const genre = document.getElementById('genre').value.trim();

    const textRegex = /^.{2,100}$/;
    if (!textRegex.test(artist) || !textRegex.test(title) || !textRegex.test(genre)) {
        return;
    }

    const newAlbum = {
        id: Date.now().toString(),
        artist, title, year: parseInt(year), genre,
        cover: `${artist.toLowerCase()}.jpg`,
        tracks: [...tempTracks]
    };

    albums.push(newAlbum);
    saveToLocalStorage();

    albumForm.reset();
    tempTracks = [];
    renderTempTracks();
    renderAlbums();
});

albumsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-album')) {
        if (confirm("Удалить этот альбом?")) {
            const id = e.target.dataset.id;
            albums = albums.filter(a => a.id !== id);
            saveToLocalStorage();
            renderAlbums();
        }
    }

    if (e.target.classList.contains('fav-btn')) {
        const trackEl = e.target.closest('.track');
        const albumId = trackEl.dataset.album;
        const trackIdx = trackEl.dataset.track;

        const album = albums.find(a => a.id === albumId);
        album.tracks[trackIdx].isFavorite = !album.tracks[trackIdx].isFavorite;

        saveToLocalStorage();
        renderAlbums();
    }

    if (e.target.classList.contains('play-btn')) {
        const file = e.target.dataset.file;
        const name = e.target.dataset.name;

        if (player.src.includes(file)) {
            if (player.paused) {
                player.play();
            } else {
                player.pause();
            }
        } else {
            player.src = file;
            player.play();
            playerBox.style.display = 'flex';
            playerTrackName.textContent = name;
        }
    }
});

player.addEventListener('play', () => {
    const playingFile = player.src.split('/').pop();
    document.querySelectorAll('.play-btn').forEach(btn => {
        if (btn.dataset.file === playingFile) {
            btn.textContent = "⏸";
        } else {
            btn.textContent = "▶";
        }
    });
});

player.addEventListener('pause', () => {
    const playingFile = player.src.split('/').pop();
    document.querySelectorAll('.play-btn').forEach(btn => {
        if (btn.dataset.file === playingFile) {
            btn.textContent = "▶";
        }
    });
});

player.addEventListener('ended', () => {
    document.querySelectorAll('.play-btn').forEach(btn => btn.textContent = "▶");
});

sortSelect.addEventListener('change', renderAlbums);

renderAlbums();