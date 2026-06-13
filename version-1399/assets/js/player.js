(function () {
  function preparePlayer(video) {
    var source = video.getAttribute('data-src');

    if (!source) {
      return Promise.reject(new Error('Missing video source'));
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsInstance) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      }

      return Promise.resolve();
    }

    video.src = source;
    return Promise.resolve();
  }

  function bindPlayer(box) {
    var video = box.querySelector('video[data-src]');
    var button = box.querySelector('.js-play-button');

    if (!video || !button) {
      return;
    }

    button.addEventListener('click', function () {
      preparePlayer(video).then(function () {
        button.classList.add('is-hidden');
        video.play().catch(function () {
          button.classList.remove('is-hidden');
        });
      }).catch(function () {
        button.classList.remove('is-hidden');
      });
    });

    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        button.classList.remove('is-hidden');
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-box')).forEach(bindPlayer);
})();
