// Muvid — Audio + Cover + Lyrics → Music Video (WebM)

const audioInput = document.getElementById("audio");
const coverInput = document.getElementById("cover");
const lyricsInput = document.getElementById("lyrics");
const previewBtn = document.getElementById("preview");
const exportBtn = document.getElementById("export");
const downloadLink = document.getElementById("download");

previewBtn.onclick = () => {
  alert("Preview uses export logic. Click Export to render.");
};

exportBtn.onclick = async () => {
  const audioFile = audioInput.files[0];
  const coverFile = coverInput.files[0];
  const lyricsFile = lyricsInput.files[0];

  if (!audioFile || !coverFile) {
    alert("Please upload audio and cover image.");
    return;
  }

  // Canvas
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");

  // Capture video
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
    downloadLink.style.display = "inline-block";
  };

  // Load image
  const img = new Image();
  img.src = URL.createObjectURL(coverFile);
  await img.decode();

  // Load audio
  const audio = new Audio(URL.createObjectURL(audioFile));
  audio.crossOrigin = "anonymous";

  // Load lyrics
  let lyricsLines = [];
  if (lyricsFile) {
    const text = await lyricsFile.text();
    lyricsLines = text.split("\n").filter(l => l.trim() !== "");
  }

  const duration = audio.duration || 180;
  const lineDuration = lyricsLines.length
    ? duration / lyricsLines.length
    : 9999;

  recorder.start();
  audio.play();

  function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // subtle zoom
    const scale = 1 + Math.sin(performance.now() / 800) * 0.02;
    const w = canvas.width * scale;
    const h = canvas.height * scale;

    ctx.drawImage(
      img,
      (canvas.width - w) / 2,
      (canvas.height - h) / 2,
      w,
      h
    );

    // Lyrics
    if (lyricsLines.length) {
      const currentLine = Math.floor(audio.currentTime / lineDuration);
      const text = lyricsLines[currentLine] || "";

      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, canvas.height - 160, canvas.width, 120);

      ctx.fillStyle = "#fff";
      ctx.font = "bold 36px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(text, canvas.width / 2, canvas.height - 90);
    }

    if (!audio.paused) {
      requestAnimationFrame(draw);
    } else {
      recorder.stop();
    }
  }

  draw();
};
