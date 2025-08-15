// ====== Music & Volume ======
const bgMusic = document.getElementById("bg-music");
const volumeSlider = document.getElementById("volume");
const catchSound = new Audio("assests/catch.mp3");

// تشغيل الموسيقى عند أول تفاعل
function playMenuMusic() {
  bgMusic.play().catch(err => console.log("Autoplay blocked:", err));
  bgMusic.onended = () => {
    bgMusic.currentTime = 0;
    bgMusic.play();
  };
}

window.addEventListener("click", function startMusicOnce() {
  playMenuMusic();
  window.removeEventListener("click", startMusicOnce);
});

// التحكم في الصوت
volumeSlider.addEventListener("input", () => {
  bgMusic.volume = volumeSlider.value;
  catchSound.volume = volumeSlider.value;
});

// ====== Menu Elements ======
const mainMenu = document.getElementById("main-menu");
const creditsMenu = document.getElementById("credits-menu");
const optionsMenu = document.getElementById("options-menu");
const scoresMenu = document.getElementById("scores-menu");
const backToMenuFromOptions = document.getElementById("back-to-menu-from-options");
const backToMenuFromScores = document.getElementById("back-to-menu-from-scores");
const resetScoresBtn = document.getElementById("reset-scores");

// ====== Game Elements ======
const gameArea = document.getElementById("game-area");
const basketImage = document.getElementById("basket-image");

let basketX = window.innerWidth / 2 - 60; // منتصف الشاشة
let speed = 15;
let fallingObjects = [];
let gameInterval;
let spawnInterval;
let score = 0;
let timeSurvived = 0;
let playerName = "";

// عداد النقاط
const scoreDisplay = document.createElement("div");
scoreDisplay.style.position = "absolute";
scoreDisplay.style.color = "#00d2ff";
scoreDisplay.style.fontSize = "24px";
scoreDisplay.style.fontWeight = "bold";
scoreDisplay.style.top = "-40px";
scoreDisplay.style.left = "50%";
scoreDisplay.style.transform = "translateX(-50%)";
basketImage.appendChild(scoreDisplay);

// ====== Buttons ======
document.getElementById("new-game").addEventListener("click", () => {
  playerName = prompt("Enter your name:", "Player") || "Player";
  mainMenu.classList.add("hidden");
  gameArea.classList.remove("hidden");
  basketImage.classList.remove("hidden");
  gameArea.style.backgroundImage = "url('assests/white background.jpg')";
  gameArea.style.backgroundSize = "cover";

  score = 0;
  timeSurvived = 0;
  fallingObjects = [];

  basketX = window.innerWidth / 2 - 60;
  basketImage.style.left = basketX + "px";
  basketImage.style.bottom = "20px";
  updateScoreDisplay();

  gameInterval = requestAnimationFrame(updateGame);
  spawnInterval = setInterval(spawnObject, 1000);
});

// Preview Last Scores
document.getElementById("preview-score").addEventListener("click", () => {
  mainMenu.classList.add("hidden");
  scoresMenu.classList.remove("hidden");
  updateScoresTable();
});

// Reset Scores
resetScoresBtn.addEventListener("click", () => {
  localStorage.removeItem("fallingObjectScores");
  updateScoresTable();
});

// Options Menu
document.getElementById("options").addEventListener("click", () => {
  mainMenu.classList.add("hidden");
  optionsMenu.classList.remove("hidden");
});

// Credits Menu
document.getElementById("credits").addEventListener("click", () => {
  mainMenu.classList.add("hidden");
  creditsMenu.classList.remove("hidden");
});

// Back Buttons
document.getElementById("back-to-menu").addEventListener("click", () => {
  creditsMenu.classList.add("hidden");
  mainMenu.classList.remove("hidden");
});

backToMenuFromOptions.addEventListener("click", () => {
  optionsMenu.classList.add("hidden");
  mainMenu.classList.remove("hidden");
});

backToMenuFromScores.addEventListener("click", () => {
  scoresMenu.classList.add("hidden");
  mainMenu.classList.remove("hidden");
});

// ====== Basket Movement ======
document.addEventListener("keydown", (e) => {
  if(e.key === "ArrowLeft" || e.key === "a") {
    basketX = Math.max(0, basketX - speed);
  } else if(e.key === "ArrowRight" || e.key === "d") {
    basketX = Math.min(window.innerWidth - 120, basketX + speed);
  }
  basketImage.style.left = basketX + "px";
});

document.addEventListener("mousemove", (e) => {
  basketX = Math.min(Math.max(0, e.clientX - 60), window.innerWidth - 120);
  basketImage.style.left = basketX + "px";
});

// ====== Spawn Falling Objects ======
function spawnObject() {
  const selectedObjects = Array.from(document.querySelectorAll(".fallen-objects-list input[type='checkbox']:checked"))
                              .map(input => input.value);
  if(selectedObjects.length === 0) return;

  const objectImages = {
    "ITI": "ITI.png",
    "NTI": "NTIlogo.png",
    "E-JUST": "E-JUST_logo.png",
    "WEZARA": "WEZARA.png"
  };

  const obj = document.createElement("div");
  obj.classList.add("falling-object");
  obj.style.left = Math.random() * (window.innerWidth - 60) + "px";
  obj.style.top = "-60px";

  const randomObj = selectedObjects[Math.floor(Math.random() * selectedObjects.length)];
  obj.style.backgroundImage = `url('assests/${objectImages[randomObj]}')`;

  obj.speed = 2 + Math.random() * 3;
  gameArea.appendChild(obj);
  fallingObjects.push(obj);
}

// ====== Update Score Display ======
function updateScoreDisplay() {
  scoreDisplay.textContent = `Score: ${score}`;
}

// ====== Update Scores Table ======
function updateScoresTable() {
  const scores = JSON.parse(localStorage.getItem("fallingObjectScores")) || [];
  const scoresTableBody = document.querySelector("#scores-table tbody");
  const noGamesMsg = document.getElementById("no-games-msg");

  scoresTableBody.innerHTML = "";

  if (scores.length === 0) {
    noGamesMsg.style.display = "block";
    document.getElementById("scores-table").style.display = "none";
  } else {
    noGamesMsg.style.display = "none";
    document.getElementById("scores-table").style.display = "table";
    scores.forEach(scoreItem => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${scoreItem.player}</td>
        <td>${scoreItem.score}</td>
        <td>${scoreItem.time}</td>
      `;
      scoresTableBody.appendChild(row);
    });
  }
}

// ====== Update Game ======
function updateGame() {
  timeSurvived += 1/60;

  fallingObjects.forEach((obj, index) => {
    const top = parseFloat(obj.style.top) || 0;
    obj.style.top = top + obj.speed + "px";

    const objRect = obj.getBoundingClientRect();
    const basketRect = basketImage.getBoundingClientRect();

    // إذا الأوبجكتس وقع في الباسكت
    if(
      objRect.bottom >= basketRect.top &&
      objRect.top <= basketRect.bottom &&
      objRect.left <= basketRect.right &&
      objRect.right >= basketRect.left
    ){
      score++;
      catchSound.currentTime = 0;
      catchSound.play();
      updateScoreDisplay();
      obj.remove();
      fallingObjects.splice(index, 1);
    }

    // إذا الأوبجكتس نزل تحت الشاشة
    if(objRect.top > window.innerHeight){
      endGame();
    }
  });

  gameInterval = requestAnimationFrame(updateGame);
}

// ====== Basket Movement for Mobile ======
document.addEventListener("touchmove", (e) => {
  const touch = e.touches[0];
  basketX = Math.min(Math.max(0, touch.clientX - 60), window.innerWidth - 120);
  basketImage.style.left = basketX + "px";
});

// ====== End Game ======
function endGame() {
  cancelAnimationFrame(gameInterval);
  clearInterval(spawnInterval);
  gameArea.classList.add("hidden");
  basketImage.classList.add("hidden");
  mainMenu.classList.remove("hidden");

  const scores = JSON.parse(localStorage.getItem("fallingObjectScores")) || [];
  scores.push({
    player: playerName,
    score: score,
    time: timeSurvived.toFixed(1) + "s"
  });
  localStorage.setItem("fallingObjectScores", JSON.stringify(scores));

  alert(`Game Over! Score: ${score}, Time: ${timeSurvived.toFixed(1)}s`);
}
 

// السماح بالـ scroll للصفحة
document.body.style.overflowY = "auto";

