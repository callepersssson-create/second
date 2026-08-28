export function initMotion({ reducedMotion, heroScene } = {}) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap) return;
  if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  /* ---------------- Nav: hide on scroll down, show on scroll up ------- */
  const nav = document.querySelector('.site-nav');
  if (nav) {
    let lastY = window.scrollY;
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate(self) {
        const y = window.scrollY;
        nav.classList.toggle('is-scrolled', y > 40);
        if (y > 140 && self.direction === 1) nav.classList.add('is-hidden');
        else if (self.direction === -1) nav.classList.remove('is-hidden');
        lastY = y;
      },
    });
  }

  /* ---------------- Word-split helper (no SplitText dependency) -------
     Preserves inline markup (e.g. <em>, <br>) instead of flattening the
     element to textContent, so nested styling (italic accent colour)
     still applies after splitting. */
  function splitWords(el) {
    function wrapTextNode(node) {
      const frag = document.createDocumentFragment();
      const parts = node.textContent.split(/(\s+)/);
      parts.forEach((part) => {
        if (part === '') return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          const outer = document.createElement('span');
          outer.className = 'split-word';
          const inner = document.createElement('span');
          inner.textContent = part;
          outer.appendChild(inner);
          frag.appendChild(outer);
        }
      });
      node.replaceWith(frag);
    }
    function walk(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        wrapTextNode(node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(walk);
      }
    }
    Array.from(el.childNodes).forEach(walk);
    return Array.from(el.querySelectorAll('.split-word > span'));
  }

  /* ---------------- Hero entrance ------------------------------------ */
  const heroEyebrow = document.querySelector('.hero-eyebrow');
  const heroTitle = document.querySelector('.hero-title');
  const heroFoot = document.querySelector('.hero-foot');

  if (heroTitle) {
    const chars = splitWords(heroTitle);
    const tl = gsap.timeline({ delay: reducedMotion ? 0 : 0.3, defaults: { ease: 'power3.out' } });
    if (reducedMotion) {
      gsap.set([heroEyebrow, heroTitle, heroFoot], { opacity: 1, y: 0 });
      gsap.set(chars, { y: 0 });
    } else {
      tl.set([heroEyebrow, heroTitle, heroFoot], { opacity: 1 })
        .from(heroEyebrow, { y: 14, opacity: 0, duration: 0.6 })
        .from(chars, { yPercent: 130, duration: 1.05, stagger: 0.045 }, '-=0.3')
        .from(heroFoot, { y: 18, opacity: 0, duration: 0.7 }, '-=0.5');
    }
  }

  /* ---------------- Hero parallax + scroll-driven scroll uniform ------ */
  const hero = document.querySelector('.hero');
  if (hero) {
    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate(self) {
        heroScene && heroScene.setScroll(self.progress);
      },
    });
    if (!reducedMotion) {
      gsap.to('.hero-inner', {
        yPercent: 18,
        opacity: 0.4,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('.scroll-cue', {
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: '18% top', scrub: true },
      });
    }
  }

  /* ---------------- Generic reveal-on-scroll for headers/text --------- */
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    gsap.set(el, { opacity: 1 });
    if (reducedMotion) { gsap.set(el, { y: 0 }); return; }
    gsap.from(el, {
      y: 28,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    const kids = Array.from(group.children);
    gsap.set(kids, { opacity: 1 });
    if (reducedMotion) return;
    gsap.from(kids, {
      y: 26,
      opacity: 0,
      duration: 0.7,
      stagger: 0.09,
      ease: 'power2.out',
      scrollTrigger: { trigger: group, start: 'top 85%' },
    });
  });

  /* ---------------- Manifesto ----------------------------------------- */
  const manifesto = document.querySelector('.manifesto blockquote');
  if (manifesto) {
    gsap.set(manifesto, { opacity: 1 });
    if (!reducedMotion) {
      gsap.from(manifesto, {
        opacity: 0.15,
        duration: 1,
        ease: 'none',
        scrollTrigger: { trigger: manifesto, start: 'top 90%', end: 'top 40%', scrub: true },
      });
    }
  }

  /* ---------------- Gallery: clip-path reveal + parallax -------------- */
  document.querySelectorAll('.g-item').forEach((item, i) => {
    const frame = item.querySelector('.g-frame');
    const canvas = item.querySelector('canvas');
    if (!frame) return;
    gsap.set(frame, { clipPath: 'inset(6% 6% 6% 6% round 1px)' });
    if (reducedMotion) return;

    gsap.fromTo(frame,
      { clipPath: 'inset(38% 38% 38% 38% round 1px)' },
      {
        clipPath: 'inset(0% 0% 0% 0% round 1px)',
        ease: 'power3.out',
        duration: 1.1,
        scrollTrigger: { trigger: item, start: 'top 92%', end: 'top 55%', scrub: 0.6 },
      }
    );

    if (canvas) {
      gsap.to(canvas, {
        yPercent: (i % 2 === 0 ? -6 : 6),
        ease: 'none',
        scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
      });
    }
  });

  /* ---------------- Services: index-line draw -------------------------- */
  gsap.utils.toArray('.service').forEach((el, i) => {
    gsap.set(el, { opacity: 1 });
    if (reducedMotion) return;
    gsap.from(el, {
      opacity: 0,
      y: 30,
      duration: 0.7,
      delay: i * 0.05,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  /* ---------------- About: image parallax ------------------------------ */
  const aboutMedia = document.querySelector('.about-media canvas');
  if (aboutMedia && !reducedMotion) {
    gsap.to(aboutMedia, {
      yPercent: -10,
      ease: 'none',
      scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: 0.8 },
    });
  }

  /* ---------------- Testimonials: pinned horizontal scrub -------------- */
  const tSection = document.querySelector('.testimonials');
  const tTrack = document.querySelector('.t-track');
  if (tSection && tTrack) {
    mm.add('(min-width: 900px)', () => {
      const distance = () => tTrack.scrollWidth - tTrack.parentElement.clientWidth;
      const trigger = ScrollTrigger.create({
        trigger: tSection,
        start: 'top top',
        end: () => `+=${Math.max(distance(), 1) + window.innerHeight * 0.4}`,
        pin: true,
        scrub: 1,
        onUpdate(self) {
          gsap.set(tTrack, { x: -distance() * self.progress });
        },
      });
      return () => trigger.kill();
    });
  }

  /* ---------------- CTA reveal ------------------------------------------ */
  const ctaForm = document.querySelector('.booking-form');
  if (ctaForm) {
    gsap.set(ctaForm, { opacity: 1 });
    if (!reducedMotion) {
      gsap.from(ctaForm, {
        y: 24, opacity: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: ctaForm, start: 'top 88%' },
      });
    }
  }

  /* ---------------- Smooth-ish anchor scrolling ------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });

  ScrollTrigger.refresh();
}

/* ---------------- Booking form (front-end only) ------------------------ */
export function initBookingForm() {
  const form = document.querySelector('.booking-form form');
  const card = document.querySelector('.booking-form');
  const success = document.querySelector('.form-success');
  if (!form || !card || !success) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('#f-name')?.value?.trim() || 'there';
    success.querySelector('[data-name]').textContent = name;
    card.classList.add('is-sent');
    success.classList.add('is-visible');
  });
}
