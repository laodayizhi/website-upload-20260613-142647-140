(function () {
  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById('movie-player');
    var overlay = document.querySelector('.play-overlay');
    var hlsInstance = null;
    var started = false;

    if (!video || !overlay || !streamUrl) {
      return;
    }

    function bindStream() {
      if (started) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function startPlay() {
      bindStream();
      overlay.classList.add('is-hidden');
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {});
      }
    }

    overlay.addEventListener('click', startPlay);
    video.addEventListener('click', function () {
      if (!started) {
        startPlay();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
