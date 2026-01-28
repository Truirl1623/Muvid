// Muvid — auto music video generator

const audioInput = document.getElementById("audio");
const coverInput = document.getElementById("cover");
const previewBtn = document.getElementById("preview");
const exportBtn = document.getElementById("export");
const downloadLink = document.getElementById("download");

exportBtn.onclick = async () => {
  const audioFile = audioInput.files[0];
  const coverFile = coverInput.files[0];

  if (!audioFile || !coverFile) {
    alert("Please upload audio and cover.");
    return;
  }

  // Canvas
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");

  // Image
  const img = new Image();
  img.src = URL.createObjectURL(coverFile);
  await img.decode();

  // Audio
  const audio = new Audio(URL.createObjectURL(audioFile));
  audio.crossOrigin = "anonymous";

  // AudioContext & analyser
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaElementSource(audio);
  const analyser = audioCtx.createAnalyser();
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  // Resume audio context (required in Chrome)
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
  };

  // Wait for audio to load metadata
  await new Promise(resolve => {
    audio.onloadedmetadata = resolve;
  });

  // Start
  mediaRecorder.start();
  audio.play();

  const start = performance.now();

  function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Slight zoom
    const scale = 1 + Math.sin((performance.now() - start) / 500) * 0.02;
    const w = canvas.width * scale;
    const h = canvas.height * scale;
    ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);

    // Beat bars
    analyser.getByteFrequencyData(dataArray);
    const barWidth = canvas.width / bufferLength;
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i] / 2;
      ctx.fillStyle = `rgb(${barHeight + 100},50,${255 - barHeight})`;
      ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth, barHeight);
    }

    if (!audio.paused) {
      requestAnimationFrame(draw);
    } else {
      mediaRecorder.stop();
    }
  }

  draw();
};
