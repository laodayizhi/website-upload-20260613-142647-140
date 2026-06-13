
function initHlsPlayer(videoId, streamUrl, coverId) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var hlsInstance = null;
  var ready = false;

  function load() {
    if (!video || ready) {
      return;
    }
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function start() {
    load();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', start);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
    video.addEventListener('emptied', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
      ready = false;
    });
  }
}
