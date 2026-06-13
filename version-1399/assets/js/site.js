function handlePosterError(image) {
  image.style.opacity = '0';
  if (image.parentElement) {
    image.parentElement.classList.add('poster-fallback');
  }
}

(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }
})();

(function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer = null;

  if (!slides.length) {
    return;
  }

  function showSlide(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function startTimer() {
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var next = Number(dot.getAttribute('data-hero-dot')) || 0;
      showSlide(next);
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    });
  });

  startTimer();
})();
