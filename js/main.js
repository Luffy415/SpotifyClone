let currentSong = new Audio()
let songs;
let currFolder;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

const getSongs = async (folder) => {
  currFolder = folder
  let res = await fetch(`/${folder}/`)
  let resText = await res.text()
  let div = document.createElement("div")
  div.innerHTML = resText
  let as = div.getElementsByTagName("a")
  songs = []
  for (var i = 0; i < as.length; i++) {
    const elements = as[i]
    if(elements.href.endsWith(".mp3")){
      songs.push(decodeURI(elements.href).split(`/${folder}/`)[1])
    }
  }
  let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
  songUL.innerHTML = ""
  
  for (var song of songs) {
    let li = document.createElement("li");
    li.innerHTML = `<img class="invert" src="img/music.svg" alt="music">
                    <div class="info">
                      <div>${song}</div>
                    </div>
                    <div class="playnow">
                      <img class="invert" src="img/play.svg" alt="play.svg">`
      li.addEventListener("click", () => {
      let SongName = li.querySelector('.info').firstElementChild.textContent;
      playSong(SongName);
    });
      playSong(songs[0], true);
      songUL.appendChild(li);
}
}

const playSong = (track, pause=false) => {
  currentSong.src = currFolder + track
  if(!pause) {
    currentSong.play()
    play.src = "img/pause.svg"
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track)
  document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

const displayAlbums = async() => {
  let res = await fetch(`/songs/`)
  let resText = await res.text()
  let div = document.createElement("div")
  div.innerHTML = resText
  let anchors = div.getElementsByTagName("a")
  let cardContainer = document.querySelector(".cardContainer")
  let array = Array.from(anchors)
  for (var index = 0; index < array.length; index++) {
    let e = array[index]
    if (e.href.includes("/songs")) {
      let folder = (e.href.split("/").slice(-2)[0]);
      let res = await fetch(`/songs/${folder}/info.json`)
      let resJson = await res.json()
      cardContainer.innerHTML = cardContainer.innerHTML + `<div class="card" data-folder = "${folder}">
                  <div class="play">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                          stroke-linejoin="round" />
                    </svg>
                  </div>
                  <img src="/songs/${folder}/cover.jpg"/>
                  <h2>${resJson.title}</h2>
                  <p>${resJson.description}</p>
                </div>`
     }
  }
  Array.from(document.querySelectorAll('.card')).forEach(e => {
      e.addEventListener("click", async item => {
        songs.push(await getSongs(`songs/${e.dataset.folder.trim()}/`))
      });
    });
}

const main = async () => {
    displayAlbums()
    
    currentSong.addEventListener("timeupdate", ()=>{
      document.querySelector('.songtime').innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
      document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration) * 100 + "%"
    })
    document.querySelector(".seekbar").addEventListener("click", (dets)=>{
      let percent = (dets.offsetX/dets.target.getBoundingClientRect().width) * 100
      document.querySelector('.circle').style.left = percent +"%"
      currentSong.currentTime = ((currentSong.duration) * percent)/100
    })
    document.querySelector('.hamburger').addEventListener("click", ()=>{
      document.querySelector(".left").style.left = 0
    })
    document.querySelector(".close").addEventListener("click", ()=>{
      document.querySelector('.left').style.left = "-123%"
    })
     currentSong.addEventListener('play', () => {
      play.src = 'img/pause.svg'
    });
    currentSong.addEventListener('pause', () => {
      play.src = "img/play.svg";
    });

    play.addEventListener("click", () => {
      if (currentSong.paused) {
        currentSong.play();
      } else {
        currentSong.pause();
      }
    });
    previous.addEventListener("click", () => {
      let index = songs.indexOf(currentSong.src.split("/")[5].replaceAll("%20", " "))
      if (index - 1 >= 0) {
        playSong(songs[index - 1])
      }
    })
    next.addEventListener('click', () => {
      let index = songs.indexOf(currentSong.src.split("/")[5].replaceAll("%20", " "))
      if (index + 1 < songs.length + 1) {
        playSong(songs[index + 1])
      }
    })
};

main();
