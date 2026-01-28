// Muvid — Audio + Cover + Lyrics → Music Video (WebM)

const audioInput = document.getElementById("audio");
const coverInput = document.getElementById("cover");
const lyricsInput = document.getElementById("lyrics");
const previewBtn = document.getElementById("preview");
const exportBtn = document.getElementById("export");
const downloadLink = document.getElementById("download");

previewBtn.onclick = () => {
  alert("Preview uses export logic. Click Export.");
};

exportBtn.onclick = async () => {
  const audioFile = audioInput.files[0];
  const coverFile = coverInput.files[0];
  const lyricsFile = lyricsInput.files[0];

  if (!audioFile || !coverFile) {
    alert("Upload audio and cover image.");
    return;
  }

  exportBtn.disabled = true;
  exportBtn.textContent = "Rendering…";

  // Canvas
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");

  // Load cover
  const img = new Image();
  img.src = URL.createObjectURL(coverFile);
  await img.decode();

  // Load audio properly
  const audio = document.createElement("audio");
  audio.src = URL.createObjectURL(audioFile);
  audio.crossOrigin = "anonymous";
  audio.preload = "auto";

  await new Promise(resolve => {
    audio.onloadedmetadata = resolve;
  });

  // Load lyrics
  let lyrics = [];
  if (lyricsFile) {
    const text = await lyricsFile.text();
    lyrics = text.split("\n").filter(l => l.trim());
  }

  const lineDuration = lyrics.length
    ? audio.duration / lyrics.length
    : Infinity;

  // Capture stream
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, {
    mimeType: "video/webm"
  });

  const chunks = [];
  recorder.ondataavailable = e => chunks.push(e.data);

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = "muvid.webm";
    downloadLink.textContent = "Download video";
    downloadLink.style.display = "block";

    exportBtn.disabled = false;
    exportBtn.textContent = "Export WebM";
  };

  recorder.start();
  await audio.play();

  function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = 1 + Math.sin(performance.now() / 700) * 0.02;
    const w = canvas.width * scale;
    const h = canvas.height * scale;

    ctx.drawImage(
      img,
      (canvas.width - w) / 2,
      (canvas.height - h) / 2,
      w,
      h
    );

    if (lyrics.length) {
      const index = Math.floor(audio.currentTime / lineDuration);
      const line = lyrics[index] || "";

      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, canvas.height - 160, canvas.width, 120);

      ctx.fillStyle = "#fff";
      ctx.font = "bold 36px Arial";
      ctx.textAlign = "center";
      ctx.fillText(line, canvas.width / 2, canvas.height - 90);
    }

    if (!audio.ended) {
      requestAnimationFrame(draw);
    } else {
      recorder.stop();
    }
  }

  draw();
};
