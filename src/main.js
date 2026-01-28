// Muvid minimal working export test

window.addEventListener("DOMContentLoaded", () => {
  console.log("Muvid JS loaded");

  const audioInput = document.getElementById("audio");
  const coverInput = document.getElementById("cover");
  const exportBtn = document.getElementById("export");
  const download = document.getElementById("download");

  exportBtn.onclick = async () => {
    console.log("Export clicked");

    const audioFile = audioInput.files[0];
    const coverFile = coverInput.files[0];

    if (!audioFile || !coverFile) {
      alert("Upload audio and cover");
      return;
    }

    exportBtn.textContent = "Rendering…";
    exportBtn.disabled = true;

    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = URL.createObjectURL(coverFile);
    await img.decode();

    const audio = new Audio(URL.createObjectURL(audioFile));
    await audio.play();

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    const chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      download.href = URL.createObjectURL(blob);
      download.download = "muvid.webm";
      download.style.display = "block";
      download.textContent = "Download video";

      exportBtn.textContent = "Export WebM";
      exportBtn.disabled = false;
    };

    recorder.start();

    function draw() {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (!audio.ended) {
        requestAnimationFrame(draw);
      } else {
        recorder.stop();
      }
    }

    draw();
  };
});
