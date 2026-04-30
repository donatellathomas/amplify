(function () {
  var shell = document.querySelector(".repair-detail__video-shell");
  var video = document.getElementById("repair-detail-video");
  var btn = document.getElementById("repair-detail-play-btn");
  if (!shell || !video || !btn) return;

  function syncPlayingState() {
    shell.classList.toggle("is-playing", !video.paused);
  }

  btn.addEventListener("click", function () {
    video.focus({ preventScroll: true });
    var p = video.play();
    if (p && typeof p.catch === "function") {
      p.catch(function () {});
    }
  });

  video.addEventListener("play", syncPlayingState);
  video.addEventListener("pause", syncPlayingState);
  video.addEventListener("ended", syncPlayingState);
  syncPlayingState();
})();
