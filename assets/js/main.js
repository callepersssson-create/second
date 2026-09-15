(function(){
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var header = document.querySelector('.site-header');
  var onScrollHeader = function(){
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  var navToggle = document.getElementById('nav-toggle');
  var mainNav = document.getElementById('main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function(){
      var isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    mainNav.querySelectorAll('a').forEach(function(link){
      link.addEventListener('click', function(){
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }

  function spawnSparkles(container, count) {
    if (!container) return;
    for (var i = 0; i < count; i++) {
      var s = document.createElement('span');
      s.className = 'sparkle';
      var size = 2 + Math.random() * 3;
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = 30 + Math.random() * 65 + '%';
      var duration = 4 + Math.random() * 5;
      s.style.animationDuration = duration + 's';
      s.style.animationDelay = (Math.random() * duration) + 's';
      container.appendChild(s);
    }
  }
  spawnSparkles(document.getElementById('hero-sparkles'), 46);
  spawnSparkles(document.getElementById('cta-sparkles'), 26);

  document.querySelectorAll('.faq-question').forEach(function(btn){
    btn.addEventListener('click', function(){
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var answer = btn.nextElementSibling;
      document.querySelectorAll('.faq-question').forEach(function(other){
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          other.nextElementSibling.style.maxHeight = null;
        }
      });
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      answer.style.maxHeight = expanded ? null : (answer.scrollHeight + 'px') ;
    });
  });

  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.nav-link');
  if ('IntersectionObserver' in window && sections.length) {
    var navIo = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function(link){
            link.classList.toggle('is-current', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.5 });
    sections.forEach(function(sec){ navIo.observe(sec); });
  }

  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('contact-name').value.trim();
      var email = document.getElementById('contact-email').value.trim();
      var message = document.getElementById('contact-message').value.trim();
      var subject = encodeURIComponent('Meddelande från ' + name);
      var body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
      window.location.href = 'mailto:hej@pbuf.se?subject=' + subject + '&body=' + body;
    });
  }
})();
