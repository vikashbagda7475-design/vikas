// =====================================================
// This file controls all of the interactive behaviour of the portfolio:
// the loading screen, the floating background particles, sticky/mobile
// navigation, scroll-triggered reveal animations, animated skill bars,
// the back-to-top button, and the contact form.
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  initLoadingScreen();
  initBackgroundParticles();
  initHeaderScroll();
  initMobileNav();
  initSmoothNavLinks();
  initScrollReveal();
  initBackToTop();
  initContactForm();
  document.getElementById("footer-year").textContent = new Date().getFullYear();
});

// -----------------------------------------------------
// LOADING SCREEN
// Shows the welcome message and a filling progress bar, then fades the
// screen out and reveals the homepage.
// -----------------------------------------------------
function initLoadingScreen() {
  const screen = document.getElementById("loading-screen");
  const fill = screen.querySelector(".loader-bar-fill");

  // Animate the bar filling up shortly after load
  requestAnimationFrame(() => {
    setTimeout(() => { fill.style.width = "100%"; }, 150);
  });

  // Hide the loading screen once the bar has had time to finish
  window.addEventListener("load", () => {
    setTimeout(() => {
      screen.classList.add("hidden");
    }, 1400);
  });
}

// -----------------------------------------------------
// ANIMATED BACKGROUND PARTICLES
// Draws small, slow-moving glowing dots on a full-screen canvas behind
// all content, for the "premium / futuristic" background effect.
// -----------------------------------------------------
function initBackgroundParticles() {
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");
  let particles = [];
  let width, height;

  // Respect users who have asked for reduced motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticles() {
    const count = Math.min(70, Math.floor((width * height) / 22000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + 0.6,
      speedX: (Math.random() - 0.5) * 0.15,
      speedY: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.5 + 0.15,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap particles around the edges of the screen
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(160, 200, 255, ${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  window.addEventListener("resize", () => {
    resize();
    createParticles();
  });

  if (!prefersReducedMotion) {
    requestAnimationFrame(draw);
  } else {
    draw(); // draw once, statically, and stop
  }
}

// -----------------------------------------------------
// HEADER SCROLL STATE
// Adds a background/blur to the header once the page has scrolled down,
// and keeps the active nav link in sync with the visible section.
// -----------------------------------------------------
function initHeaderScroll() {
  const header = document.getElementById("site-header");
  const sections = document.querySelectorAll("main .section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 40);

    // Work out which section is currently most in view
    let currentId = sections[0]?.id;
    const scrollPos = window.scrollY + window.innerHeight * 0.35;

    sections.forEach((section) => {
      if (scrollPos >= section.offsetTop) {
        currentId = section.id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// -----------------------------------------------------
// MOBILE NAVIGATION (hamburger menu)
// -----------------------------------------------------
function initMobileNav() {
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("main-nav");

  hamburger.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
  });

  // Close the mobile menu whenever a nav link is tapped
  nav.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });
}

// -----------------------------------------------------
// SMOOTH SCROLL FOR IN-PAGE NAV LINKS
// (CSS `scroll-behavior: smooth` already handles most of this; this adds
// an offset so sections aren't hidden behind the fixed header.)
// -----------------------------------------------------
function initSmoothNavLinks() {
  const header = document.getElementById("site-header");

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const headerHeight = header.offsetHeight;
      const targetY = target.getBoundingClientRect().top + window.scrollY - headerHeight + 1;
      window.scrollTo({ top: targetY, behavior: "smooth" });
    });
  });
}

// -----------------------------------------------------
// SCROLL-TRIGGERED REVEAL ANIMATIONS
// Elements with the .reveal class fade and rise into place the first
// time they enter the viewport. Skill bars fill in once their card
// becomes visible.
// -----------------------------------------------------
function initScrollReveal() {
  const revealEls = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");

          // If this revealed element is a skill card, animate its bar too
          const bar = entry.target.querySelector(".skill-bar-fill");
          if (bar) {
            const targetWidth = bar.getAttribute("data-width");
            requestAnimationFrame(() => {
              bar.style.width = `${targetWidth}%`;
            });
          }

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => observer.observe(el));
}

// -----------------------------------------------------
// BACK TO TOP BUTTON
// Appears after the user scrolls past the hero, scrolls to top on click.
// -----------------------------------------------------
function initBackToTop() {
  const button = document.getElementById("back-to-top");

  window.addEventListener(
    "scroll",
    () => {
      button.classList.toggle("visible", window.scrollY > window.innerHeight * 0.8);
    },
    { passive: true }
  );

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// -----------------------------------------------------
// CONTACT FORM
// This is a front-end-only placeholder: it validates the fields and shows
// a confirmation message. EDIT HERE if you want to connect this to a real
// backend, form service (e.g. Formspree), or email API.
// -----------------------------------------------------
function initContactForm() {
  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // EDIT HERE: replace this block with a real fetch() call to your
    // form backend of choice once you have one set up.
    note.textContent = "Thanks for reaching out! I'll get back to you soon.";
    form.reset();
  });
}