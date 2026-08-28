document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("site-header");
  const navToggle = document.getElementById("nav-toggle");
  const mainNav = document.getElementById("main-nav");
  const navLinks = document.querySelectorAll(".nav-link");
  const backToTop = document.getElementById("back-to-top");
  const menuTabs = document.querySelectorAll(".menu-tab");
  const menuItems = document.querySelectorAll(".menu-item");
  const yearEl = document.getElementById("year");
  const orderOnlineBtn = document.getElementById("order-online-btn");

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Sticky header shadow + back-to-top visibility
  const onScroll = () => {
    const scrolled = window.scrollY > 20;
    header.classList.toggle("scrolled", scrolled);
    backToTop.classList.toggle("visible", window.scrollY > 500);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile nav toggle
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  // Highlight nav link for section in view
  const sections = document.querySelectorAll("main section[id]");
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
          });
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach((section) => navObserver.observe(section));

  // Back to top
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Menu category filter
  menuTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const category = tab.dataset.category;
      menuTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      menuItems.forEach((item) => {
        item.classList.toggle("hidden", item.dataset.category !== category);
      });
    });
  });

  // Reveal-on-scroll animation
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  // Order Online CTA (no ordering backend wired up yet)
  if (orderOnlineBtn) {
    orderOnlineBtn.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
    });
  }
});
