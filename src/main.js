// Muvid — WORKING minimal version (client-side)

const audioInput = document.getElementById("audio");
const coverInput = document.getElementById("cover");
const exportBtn = document.getElementById("export");
const downloadLink = document.getElementById("download");

exportBtn.disabled = false;

exportBtn.onclick = async () => {
  const audioFile = audioInput.files[0];
  const coverFile = coverInput.files[0];

  if (!audioFile || !coverFile) {
    alert("Upload audio and cover image first.");
    return;
  }

  exportBtn.textContent = "Rendering…";
  exportBtn.disabled = true;

  // Create audio
  const audio = new Audio(URL.createObjectURL(audioFile));
  await audio.play();
  audio.pause();
  audio.currentTime = 0;

  // Canvas
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");

  // Image
  const img = new Image();
  img.src = URL.createObjectURL(coverFile);
  await img.decode();

  // Stream
  const stream = canvas.captureStream(30);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: "video/webm; codecs=vp9"
  });

  const chunks = [];
  mediaRecorder.ondataavailable = e => chunks.push(e.data);

  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = "muvid.webm";
    downloadLink.style.display = "inline-block";
    downloadLink.textContent = "Download video";
    exportBtn.textContent = "Export WebM";
    exportBtn.disabled = false;
  };

  // Start recording
  mediaRecorder.start();
  audio.play();

  function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (!audio.ended) {
      requestAnimationFrame(draw);
    } else {
      mediaRecorder.stop();
    }
  }

  draw();
};
