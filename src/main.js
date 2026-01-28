// Muvid — minimal working version with active Export button

const audioInput = document.getElementById("audio");
const coverInput = document.getElementById("cover");
const exportBtn = document.getElementById("export");
const downloadLink = document.getElementById("download");

exportBtn.onclick = async () => {
  const audioFile = audioInput.files[0];
  const coverFile = coverInput.files[0];

  if (!audioFile || !coverFile) {
    alert("Please upload audio and cover.");
    return;
  }

  // Show active feedback
  exportBtn.textContent = "Recording...";
  exportBtn.disabled = true;

  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.src = URL.createObjectURL(coverFile);
  await img.decode();

  const audio = new Audio(URL.createObjectURL(audioFile));
  audio.crossOrigin = "anonymous";

  // Create AudioContext and ensure it's resumed on click
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaElementSource(audio);
  source.connect(audioCtx.destination);
  await audioCtx.resume();

  // MediaRecorder
  const stream = canvas.captureStream(30);
  const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp8" });
  const chunks = [];
  mediaRecorder.ondataavailable = e => chunks.push(e.data);
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = "muvid.webm";
    downloadLink.style.display = "inline-block";
    downloadLink.textContent = "Download video";

    // Reset button
    exportBtn.textContent = "Export WebM";
    exportBtn.disabled = false;
  };

  mediaRecorder.start();
  await audio.play();

  const start = performance.now();

  function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (performance.now() - start < 5000) {
      requestAnimationFrame(draw);
    } else {
      mediaRecorder.stop();
      audio.pause();
    }
  }

  draw();
};
