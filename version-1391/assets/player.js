(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function bindPlayer(root) {
        var video = root.querySelector("video");
        var cover = root.querySelector(".player-cover");
        var stream = root.getAttribute("data-stream");
        var loaded = false;
        var hls = null;

        function loadStream() {
            if (loaded || !video || !stream) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
            loaded = true;
        }

        function start() {
            loadStream();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (!loaded || video.paused) {
                    start();
                }
            });
        }

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    ready(function () {
        document.querySelectorAll(".player[data-stream]").forEach(bindPlayer);
    });
})();
