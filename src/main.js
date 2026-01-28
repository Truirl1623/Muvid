// Muvid — auto music video generator (client-side, $0 stack)

const audioInput = document.getElementById("audio");
const coverInput = document.getElementById("cover");
const lyricsInput = document.getElementById("lyrics");
const previewBtn = document.getElementById("preview");
const exportBtn = document.getElementById("export");
const downloadLink = document.getElementById("download");

let recordedBlob = null;

previewBtn.onclick = async () => {
  if (!audioInput.files[0] || !coverInput.files[0]) {
    alert("Please upload audio and cover image.");
    return;
  }
  alert("Preview uses same logic as export. Ready to render.");
};

exportBtn.onclick = async () => {
  const audioFile = audioInput.files[0];
  const coverFile = coverInput.files[0];

  if (!audioFile || !coverFile) {
    alert("Missing files.");
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");

  const stream = canvas.captureStream(30);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: "video/webm"
  });

  const chunks = [];
  mediaRecorder.ondataavailable = e => chunks.push(e.data);
  mediaRecorder.onstop = () => {
    recordedBlob = new Blob(chunks, { type: "video/webm" });
    downloadLink.href = URL.createObjectURL(recordedBlob);
    downloadLink.download = "muvid.webm";
    downloadLink.style.display = "inline-block";
    downloadLink.textContent = "Download video";
  };

  const img = new Image();
  img.src = URL.createObjectURL(coverFile);
  await img.decode();

  const audio = new Audio(URL.createObjectURL(audioFile));
  audio.crossOrigin = "anonymous";

  mediaRecorder.start();
  audio.play();

  const start = performance.now();

  function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = 1 + Math.sin((performance.now() - start) / 500) * 0.02;
    const w = canvas.width * scale;
    const h = canvas.height * scale;

    ctx.drawImage(
      img,
      (canvas.width - w) / 2,
      (canvas.height - h) / 2,
      w,
      h
    );

    if (!audio.paused) {
      requestAnimationFrame(draw);
    } else {
      mediaRecorder.stop();
    }
  }

  draw();
};
