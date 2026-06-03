/**
 * nav.js  — v3
 * Pacific Blue Developments — Business Management Application
 * ─────────────────────────────────────────────────────────────
 * Fixed left sidebar navigation with zero-flicker skeleton.
 *
 * Usage in every HTML page (except login.html):
 *
 *   import { initNav } from "./nav.js";
 *
 *   initNav({
 *     pageId:       "lead-entry",
 *     allowedRoles: [],
 *     onReady:      async (user, role) => { ... }
 *   });
 *
 * Required HTML structure:
 *   <div class="app-layout">
 *     <aside id="sidebar"></aside>
 *     <main class="main-content">...</main>
 *   </div>
 */

import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ─────────────────────────────────────────────────────────────
// MODULE TOP-LEVEL — runs the instant this module is evaluated,
// before any function in the page script is called.
// Painting the skeleton here guarantees it appears in the same
// synchronous task as the module load — well under 50 ms.
// ─────────────────────────────────────────────────────────────

// 1. Inject skeleton CSS into <head> immediately.
(function injectSkeletonStyles() {
  if (document.getElementById("pb-skel-css")) return;
  const s = document.createElement("style");
  s.id = "pb-skel-css";
  s.textContent = [
    "@keyframes pb-skel-pulse{",
    "  0%,100%{background-color:#f0eeeb}",
    "  50%    {background-color:#e5e3e0}",
    "}",
    ".pb-skel{",
    "  position:fixed;top:0;left:0;width:240px;height:100vh;",
    "  background:#fff;border-right:1px solid #E5E3E0;",
    "  display:flex;flex-direction:column;z-index:200;overflow:hidden;",
    "}",
    ".pb-skel-logo{",
    "  padding:24px 20px 16px;border-bottom:1px solid #E5E3E0;flex-shrink:0;",
    "}",
    ".pb-skel-nav{",
    "  flex:1;padding:16px 16px 0;display:flex;flex-direction:column;gap:22px;overflow:hidden;",
    "}",
    ".pb-skel-section{display:flex;flex-direction:column;gap:9px;}",
    ".pb-skel-footer{",
    "  padding:14px 16px;border-top:1px solid #E5E3E0;",
    "  background:#F5F4F2;flex-shrink:0;display:flex;flex-direction:column;gap:9px;",
    "}",
    ".pb-skel-bar{",
    "  border-radius:4px;",
    "  animation:pb-skel-pulse 1.4s ease-in-out infinite;",
    "}",
  ].join("\n");
  document.head.appendChild(s);
}());

// 2. Paint the skeleton into <aside id="sidebar"> immediately.
(function paintSkeleton() {
  const el = document.getElementById("sidebar");
  if (!el || el.querySelector(".pb-skel")) return; // already painted

  // Four nav-section placeholders with varied bar widths
  const groups = [
    ["70%","56%","64%"],
    ["62%","70%"],
    ["66%","52%","60%"],
    ["56%","68%"],
  ];

  const sectionsHtml = groups.map(widths =>
    '<div class="pb-skel-section">' +
      '<div class="pb-skel-bar" style="height:9px;width:36%;opacity:.65;margin-bottom:2px"></div>' +
      widths.map(w =>
        '<div class="pb-skel-bar" style="height:13px;width:' + w + ';margin-left:14px"></div>'
      ).join("") +
    "</div>"
  ).join("");

  el.innerHTML =
    '<div class="pb-skel" id="sidebar-skeleton" aria-hidden="true">' +

      // Logo area
      '<div class="pb-skel-logo">' +
        '<div class="pb-skel-bar" style="height:28px;width:158px"></div>' +
        '<div class="pb-skel-bar" style="height:9px;width:112px;margin-top:11px;opacity:.6"></div>' +
      "</div>" +

      // Nav
      '<div class="pb-skel-nav">' + sectionsHtml + "</div>" +

      // Footer
      '<div class="pb-skel-footer">' +
        '<div class="pb-skel-bar" style="height:11px;width:72%"></div>' +
        '<div class="pb-skel-bar" style="height:28px;width:100%;border-radius:6px"></div>' +
      "</div>" +

    "</div>";
}());

// ─────────────────────────────────────────────────────────────
// NAVIGATION STRUCTURE
// built: true  = link is active
// built: false = shows "Soon" badge, not clickable
// directors:true = section hidden for non-director roles
// ─────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    key:   "sales",
    label: "Sales",
    icon:  "📋",
    items: [
      { id: "lead-entry",          label: "New Lead",            href: "lead-entry.html",          built: true  },
      { id: "lead-list",           label: "Lead List",           href: "lead-list.html",           built: true  },
      { id: "project-list",        label: "Pipeline",            href: "project-list.html",        built: true  },
      { id: "sales-meeting-notes", label: "Sales Meeting Notes", href: "sales-meeting-notes.html", built: true  },
    ],
  },
  {
    key:   "construction",
    label: "Construction",
    icon:  "🏗️",
    items: [
      { id: "gantt-board",   label: "Gantt Board",   href: "gantt-board.html",   built: true  },
      { id: "meeting-notes", label: "Meeting Notes", href: "meeting-notes.html", built: true  },
    ],
  },
  {
    key:   "finance",
    label: "Finance",
    icon:  "💰",
    items: [
      { id: "revenue-forecast", label: "Revenue Forecast", href: "revenue-forecast.html", built: false },
      { id: "gp-tracking",      label: "GP Tracking",      href: "gp-tracking.html",      built: false },
      { id: "claims",           label: "Claims",           href: "claims.html",           built: false },
    ],
  },
  {
    key:   "reports",
    label: "Reports",
    icon:  "📊",
    items: [
      { id: "dashboard",        label: "Dashboard",        href: "dashboard.html",        built: false },
      { id: "revenue-report",   label: "Revenue Report",   href: "revenue-report.html",   built: false },
      { id: "marketing-report", label: "Marketing Report", href: "marketing-report.html", built: false },
    ],
  },
  {
    key:   "database",
    label: "Database",
    icon:  "🗄️",
    items: [
      { id: "all-projects",     label: "All Projects",     href: "all-projects.html",     built: true },
      { id: "operations-board", label: "Operations Board", href: "operations-board.html", built: true },
    ],
  },
  {
    key:       "admin",
    label:     "Admin",
    icon:      "⚙️",
    directors: true,
    items: [
      { id: "settings",    label: "Settings",   href: "settings.html",    built: true },
      { id: "admin-setup", label: "Team Setup", href: "admin-setup.html", built: true },
    ],
  },
];

// Pages that only directors may access
const DIRECTOR_ONLY_PAGES = ["settings", "admin-setup"];

// localStorage key for collapsed state
const LS_COLLAPSED = "pb_sidebar_collapsed";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;");
}

// ─────────────────────────────────────────────────────────────
// BUILD REAL SIDEBAR HTML
// ─────────────────────────────────────────────────────────────
function buildSidebarHTML(role, pageId) {
  const sections = NAV_SECTIONS
    .filter(s => !s.directors || role === "director")
    .map(s => {
      const sectionActive = s.items.some(item => item.id === pageId);

      const items = s.items.map(item => {
        if (!item.built) {
          return (
            '<span class="nav-item coming-soon">' +
              escHtml(item.label) +
              '<span class="soon-badge">Soon</span>' +
            "</span>"
          );
        }
        return (
          '<a class="nav-item' + (item.id === pageId ? " active" : "") + '"' +
          ' href="' + item.href + '">' + escHtml(item.label) + "</a>"
        );
      }).join("");

      return (
        '<div class="nav-section' + (sectionActive ? " active" : "") + '" data-section="' + s.key + '">' +
          '<button class="nav-section-header" aria-expanded="' + (sectionActive ? "true" : "false") + '">' +
            '<span class="nav-section-icon" title="' + escHtml(s.label) + '">' + s.icon + "</span>" +
            '<span class="section-label">' + escHtml(s.label) + "</span>" +
            '<span class="nav-chevron">›</span>' +
          "</button>" +
          '<div class="nav-items">' + items + "</div>" +
        "</div>"
      );
    }).join("");

  return (
    '<nav class="sidebar-fixed" id="sidebar-inner" role="navigation" aria-label="Main navigation">' +

      '<div class="sidebar-logo">' +
        '<img src="./png_logo.png" alt="Pacific Blue Developments" />' +
        '<div class="sidebar-tagline">Business Management</div>' +
      "</div>" +

      '<div class="sidebar-nav">' + sections + "</div>" +

      '<div class="sidebar-footer">' +
        '<div class="sidebar-footer-info">' +
          '<div class="sidebar-user-email" id="sidebar-email">—</div>' +
          '<span class="sidebar-role-badge" id="sidebar-role">' + escHtml(role || "—") + "</span>" +
        "</div>" +
        '<div class="sidebar-footer-actions">' +
          '<button class="btn-signout" id="sidebar-signout">' +
            '<span class="signout-label">Sign Out</span>' +
          "</button>" +
        "</div>" +
      "</div>" +

      '<button class="sidebar-collapse-btn" id="sidebar-collapse-btn" aria-label="Collapse sidebar">' +
        '<span class="collapse-label">Collapse</span>' +
        '<span class="collapse-chevron">‹</span>' +
      "</button>" +

    "</nav>"
  );
}

// ─────────────────────────────────────────────────────────────
// INITIALISE SIDEBAR BEHAVIOUR (called after real HTML is set)
// ─────────────────────────────────────────────────────────────
function initSidebarBehaviour(pageId) {
  const inner       = document.getElementById("sidebar-inner");
  const appLayout   = document.querySelector(".app-layout");
  const hamburger   = document.getElementById("sidebar-hamburger");
  const overlay     = document.getElementById("sidebar-overlay");
  const collapseBtn = document.getElementById("sidebar-collapse-btn");

  if (!inner) return;

  // ── Restore collapsed state ────────────────────────────────
  const isCollapsed = localStorage.getItem(LS_COLLAPSED) === "true";
  if (isCollapsed) {
    inner.classList.add("collapsed");
    appLayout?.classList.add("sidebar-collapsed");
  }

  // ── Collapse / expand toggle ───────────────────────────────
  collapseBtn?.addEventListener("click", () => {
    const collapsed = inner.classList.toggle("collapsed");
    appLayout?.classList.toggle("sidebar-collapsed", collapsed);
    localStorage.setItem(LS_COLLAPSED, collapsed);
  });

  // ── Section expand / collapse ──────────────────────────────
  inner.querySelectorAll(".nav-section").forEach(section => {
    const header = section.querySelector(".nav-section-header");
    if (section.classList.contains("active")) section.classList.add("open");

    header?.addEventListener("click", () => {
      inner.querySelectorAll(".nav-section").forEach(s => {
        if (s !== section) s.classList.remove("open");
      });
      section.classList.toggle("open");
      header.setAttribute("aria-expanded", section.classList.contains("open"));
    });
  });

  // ── Mobile hamburger ───────────────────────────────────────
  function openMobile() {
    inner.classList.add("mobile-open");
    if (overlay) { overlay.classList.add("visible"); overlay.style.display = "block"; }
  }
  function closeMobile() {
    inner.classList.remove("mobile-open");
    overlay?.classList.remove("visible");
    setTimeout(() => { if (overlay) overlay.style.display = ""; }, 250);
  }
  hamburger?.addEventListener("click", openMobile);
  overlay?.addEventListener("click", closeMobile);

  // ── Sign out ───────────────────────────────────────────────
  document.getElementById("sidebar-signout")?.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export function initNav({ pageId = "", allowedRoles = [], onReady = null } = {}) {

  // Ensure hamburger + overlay exist (pages may omit them)
  if (!document.getElementById("sidebar-hamburger")) {
    const ham = document.createElement("button");
    ham.id = "sidebar-hamburger";
    ham.setAttribute("aria-label", "Open menu");
    ham.textContent = "☰";
    document.body.prepend(ham);
  }
  if (!document.getElementById("sidebar-overlay")) {
    const ov = document.createElement("div");
    ov.id = "sidebar-overlay";
    document.body.prepend(ov);
  }

  // Auth check — skeleton is already showing from module top-level.
  // Once auth resolves we swap the skeleton for the real sidebar instantly.
  onAuthStateChanged(auth, async (user) => {

    if (!user) {
      window.location.href = "login.html";
      return;
    }

    // Read role from Firestore
    let role = null;
    try {
      const snap = await getDoc(doc(db, "userroles", user.uid));
      role = snap.exists() ? snap.data().role : null;
    } catch (e) {
      window.location.href = "login.html";
      return;
    }

    if (!role) {
      window.location.href = "login.html";
      return;
    }

    // Page-access guards
    if (DIRECTOR_ONLY_PAGES.includes(pageId) && role !== "director") {
      window.location.href = "login.html?error=unauthorised";
      return;
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      window.location.href = "login.html?error=unauthorised";
      return;
    }

    // Swap skeleton → real sidebar (same fixed position/size → no visual jump)
    const sidebarEl = document.getElementById("sidebar");
    if (sidebarEl) {
      sidebarEl.innerHTML = buildSidebarHTML(role, pageId);
    }

    // Populate email
    const emailEl = document.getElementById("sidebar-email");
    if (emailEl) emailEl.textContent = user.email || "—";

    // Hide page loading overlay if present
    const loadingOverlay = document.getElementById("loading-overlay");
    if (loadingOverlay) {
      loadingOverlay.classList.add("hidden");
      setTimeout(() => { loadingOverlay.style.display = "none"; }, 350);
    }

    // Wire up all sidebar interactive behaviour
    initSidebarBehaviour(pageId);

    // Call page-specific setup
    if (typeof onReady === "function") {
      await onReady(user, role);
    }
  });
}
