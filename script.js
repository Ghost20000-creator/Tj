(() => {
  "use strict";

  const questionCard = document.querySelector("#question-card");
  const yesButton = document.querySelector("#yes-button");
  const noButton = document.querySelector("#no-button");
  const gentleMessage = document.querySelector("#gentle-message");
  const apology = document.querySelector("#apology");
  const lines = [...document.querySelectorAll("[data-reveal]")];
  const backButton = document.querySelector("#back-button");
  const audio = document.querySelector("#song");
  const playToggle = document.querySelector("#play-toggle");
  const replayButton = document.querySelector("#replay-button");
  const heartButton = document.querySelector("#from-heart-button");
  const seek = document.querySelector("#audio-seek");
  const elapsedTime = document.querySelector("#elapsed-time");
  const totalTime = document.querySelector("#total-time");
  const audioNote = document.querySelector("#audio-note");
  const liveStatus = document.querySelector("#live-status");
  const finalMessage = document.querySelector("#final-message");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Keep the apology independent from audio availability and playback permissions.
  audio.loop = false;

  const gentleMessages = [
    "لا تعاندين اسمعي كلام دادي 🙄❤️",
    "لا تعاندين دادي 🙄❤️",
    "هااا تهجد، بعدج زعلانة؟ 🥺",
    "تره اعتذرتلج 😞❤️",
    "يلا سامحيني بقى 😼❤️"
  ];
  let messageIndex = -1;
  let returnTimer;
  let messageTimer;
  let revealTimers = [];
  let acceptanceTimer;

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainder}`;
  };

  function makeFloatingHeart() {
    if (reducedMotion.matches || document.hidden) return;
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.setAttribute("aria-hidden", "true");
    heart.textContent = Math.random() > 0.55 ? "♥" : "♡";
    heart.style.setProperty("--left", `${Math.random() * 100}%`);
    heart.style.setProperty("--size", `${12 + Math.random() * 15}px`);
    heart.style.setProperty("--duration", `${5.5 + Math.random() * 4}s`);
    heart.style.setProperty("--drift", `${Math.round(Math.random() * 70 - 35)}px`);
    heart.style.setProperty("--heart-color", ["#d77d97", "#f0b7c5", "#a95372"][Math.floor(Math.random() * 3)]);
    document.body.append(heart);
    window.setTimeout(() => heart.remove(), 10500);
  }

  function burstHearts(origin = heartButton) {
    if (reducedMotion.matches) return;
    const rect = origin.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const hearts = ["♥", "♡", "♥", "♡", "♥", "♥", "♡", "♥", "♡", "♥", "♥", "♡"];
    hearts.forEach((symbol, index) => {
      const heart = document.createElement("span");
      const angle = (Math.PI * 2 * index) / hearts.length;
      const distance = 55 + Math.random() * 85;
      heart.className = "heart-burst";
      heart.setAttribute("aria-hidden", "true");
      heart.textContent = symbol;
      heart.style.setProperty("--x", `${x}px`);
      heart.style.setProperty("--y", `${y}px`);
      heart.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
      heart.style.setProperty("--dy", `${Math.sin(angle) * distance - 20}px`);
      heart.style.setProperty("--delay", `${index * 22}ms`);
      heart.style.setProperty("--size", `${15 + Math.random() * 13}px`);
      document.body.append(heart);
      window.setTimeout(() => heart.remove(), 1600);
    });
  }

  function revealApology() {
    clearTimeout(returnTimer);
    clearTimeout(messageTimer);
    questionCard.hidden = true;
    apology.classList.add("is-visible");
    apology.setAttribute("aria-hidden", "false");
    liveStatus.textContent = "رسالة الاعتذار";
    lines.forEach((line) => line.classList.remove("is-revealed"));
    revealTimers.forEach(clearTimeout);
    revealTimers = [];
    lines.forEach((line, index) => {
      const timer = window.setTimeout(() => line.classList.add("is-revealed"), 170 + index * 430);
      revealTimers.push(timer);
    });
    window.setTimeout(() => apology.querySelector(".apology-heading").focus?.(), 0);
    apology.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
  }

  yesButton.addEventListener("click", () => {
    if (questionCard.classList.contains("is-leaving")) return;
    // play() is intentionally called directly in this user gesture. Errors never block the apology.
    const playAttempt = audio.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(() => {
        audioNote.textContent = "الأغنية مو متوفرة هسه، بس رسالتي إلكِ ❤️";
        liveStatus.textContent = "الأغنية غير متاحة، لكن رسالة الاعتذار جاهزة";
      });
    }
    questionCard.classList.add("is-leaving");
    questionCard.inert = true;
    acceptanceTimer = window.setTimeout(() => {
      revealApology();
      acceptanceTimer = undefined;
    }, 420);
  });

  noButton.addEventListener("click", () => {
    window.clearTimeout(returnTimer);
    window.clearTimeout(messageTimer);
    messageIndex = (messageIndex + 1) % gentleMessages.length;
    gentleMessage.textContent = gentleMessages[messageIndex];
    gentleMessage.classList.add("is-visible");
    questionCard.classList.remove("is-shaking");
    void questionCard.offsetWidth;
    questionCard.classList.add("is-shaking");
    burstHearts(noButton);
    liveStatus.textContent = gentleMessages[messageIndex];
    makeFloatingHeart();
    returnTimer = window.setTimeout(() => {
      gentleMessage.classList.remove("is-visible");
      messageTimer = window.setTimeout(() => {
        gentleMessage.textContent = "";
      }, 300);
    }, 1500);
  });

  backButton.addEventListener("click", () => {
    clearTimeout(acceptanceTimer);
    acceptanceTimer = undefined;
    revealTimers.forEach(clearTimeout);
    revealTimers = [];
    apology.classList.remove("is-visible");
    apology.setAttribute("aria-hidden", "true");
    questionCard.hidden = false;
    questionCard.inert = false;
    questionCard.classList.remove("is-leaving");
    questionCard.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "center" });
    yesButton.focus();
    liveStatus.textContent = "رجعنا للسؤال";
  });

  function syncPlayButton() {
    const isPlaying = !audio.paused && !audio.ended;
    playToggle.textContent = isPlaying ? "Ⅱ" : "▶";
    playToggle.setAttribute("aria-label", isPlaying ? "إيقاف الأغنية مؤقتاً" : "تشغيل الأغنية");
    playToggle.setAttribute("aria-pressed", String(isPlaying));
  }

  async function startAudio() {
    try {
      await audio.play();
      audioNote.textContent = "تشتغل لج بكل حب ❤️";
      liveStatus.textContent = "الأغنية تعمل";
    } catch {
      audioNote.textContent = "حطي song.mp3 جنب صفحة الموقع حتى تشتغل الأغنية";
      liveStatus.textContent = "الأغنية غير متوفرة حالياً";
    }
    syncPlayButton();
  }

  playToggle.addEventListener("click", () => {
    if (audio.paused) startAudio();
    else audio.pause();
  });

  replayButton.addEventListener("click", () => {
    audio.currentTime = 0;
    startAudio();
  });

  heartButton.addEventListener("click", () => {
    burstHearts();
    finalMessage.textContent = "هذا كله من گلبي إلكِ ❤️";
    finalMessage.classList.add("is-visible");
    liveStatus.textContent = "هذا كله من گلبي إلكِ ❤️";
  });

  audio.addEventListener("timeupdate", () => {
    elapsedTime.textContent = formatTime(audio.currentTime);
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      seek.value = String((audio.currentTime / audio.duration) * 100);
    }
  });
  audio.addEventListener("loadedmetadata", () => {
    totalTime.textContent = formatTime(audio.duration);
    seek.disabled = false;
  });
  audio.addEventListener("durationchange", () => {
    if (Number.isFinite(audio.duration)) totalTime.textContent = formatTime(audio.duration);
  });
  audio.addEventListener("play", syncPlayButton);
  audio.addEventListener("pause", syncPlayButton);
  audio.addEventListener("ended", syncPlayButton);
  audio.addEventListener("error", () => {
    audioNote.textContent = "الأغنية مو متوفرة هسه — أضيفي song.mp3 للمجلد";
    seek.disabled = true;
    syncPlayButton();
  });
  seek.disabled = true;
  seek.addEventListener("input", () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = (Number(seek.value) / 100) * audio.duration;
    }
  });

  window.setInterval(makeFloatingHeart, 2400);
})();
