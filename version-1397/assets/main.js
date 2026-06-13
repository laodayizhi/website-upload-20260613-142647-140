(function () {
    var hlsLoader = null;

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsLoader) {
            return hlsLoader;
        }
        hlsLoader = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return hlsLoader;
    }

    function setupNavigation() {
        var button = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-filter-search]");
            var category = panel.querySelector("[data-filter-category]");
            var type = panel.querySelector("[data-filter-type]");
            var year = panel.querySelector("[data-filter-year]");
            var targetSelector = panel.getAttribute("data-filter-panel");
            var scope = targetSelector ? document.querySelector(targetSelector) : document;
            if (!scope) {
                scope = document;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

            function matches(card) {
                var query = input ? input.value.trim().toLowerCase() : "";
                var selectedCategory = category ? category.value : "";
                var selectedType = type ? type.value : "";
                var selectedYear = year ? year.value : "";
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-tags") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-genre") || ""
                ].join(" ").toLowerCase();
                if (query && haystack.indexOf(query) === -1) {
                    return false;
                }
                if (selectedCategory && card.getAttribute("data-category") !== selectedCategory) {
                    return false;
                }
                if (selectedType && card.getAttribute("data-type") !== selectedType) {
                    return false;
                }
                if (selectedYear && card.getAttribute("data-year") !== selectedYear) {
                    return false;
                }
                return true;
            }

            function apply() {
                cards.forEach(function (card) {
                    card.classList.toggle("is-hidden-card", !matches(card));
                });
            }

            [input, category, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function attachVideo(video, source) {
        if (!source) {
            return Promise.reject(new Error("empty source"));
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return Promise.resolve();
        }
        return loadHls().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video._hlsInstance = hls;
                return;
            }
            video.src = source;
        }).catch(function () {
            video.src = source;
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play-button]");
            var status = player.querySelector("[data-player-status]");
            var source = player.getAttribute("data-src");
            var initialized = false;

            function setStatus(text) {
                if (status) {
                    status.textContent = text;
                }
            }

            function play() {
                if (!video) {
                    return;
                }
                if (button) {
                    button.classList.add("is-hidden");
                }
                setStatus("正在连接播放源");
                var task = initialized ? Promise.resolve() : attachVideo(video, source);
                initialized = true;
                task.then(function () {
                    return video.play();
                }).then(function () {
                    setStatus("");
                }).catch(function () {
                    setStatus("点击视频控件继续播放");
                });
            }

            if (button) {
                button.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    }
                });
                video.addEventListener("play", function () {
                    if (button) {
                        button.classList.add("is-hidden");
                    }
                    setStatus("");
                });
            }
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
