/* ═══════════════════════════════════════════
   app.js — Kashish Roadmap
   Handles: tab nav, checklist persistence,
   dashboard progress calculation
═══════════════════════════════════════════ */

const STORAGE_KEY = 'kashish_roadmap_v1';

/* ── State ── */
let checkState = {};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    checkState = raw ? JSON.parse(raw) : {};
  } catch (e) {
    checkState = {};
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkState));
  } catch (e) {}
}

/* ── Tab Navigation ── */
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabSections = document.querySelectorAll('.tab-section');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabSections.forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      const sec = document.getElementById('tab-' + target);
      if (sec) sec.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

/* ── Fork Tabs ── */
function initFork() {
  const forkBtns = document.querySelectorAll('.fork-btn');
  forkBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      forkBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.fork-content').forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      const fc = document.getElementById('fork-' + btn.dataset.fork);
      if (fc) fc.classList.add('active');
    });
  });
}

/* ── Checkboxes ── */
function initCheckboxes() {
  const boxes = document.querySelectorAll('.task-check');
  boxes.forEach(box => {
    const id = box.dataset.id;
    if (checkState[id]) {
      box.checked = true;
      markParentDone(box);
    }
    box.addEventListener('change', () => {
      checkState[id] = box.checked;
      saveState();
      markParentDone(box);
      updateDashboard();
    });
  });
}

function markParentDone(box) {
  const li = box.closest('li');
  if (!li) return;
  if (box.checked) {
    li.classList.add('done');
  } else {
    li.classList.remove('done');
  }
}

/* ── Progress Calculation ── */
function getGroupProgress(groupId) {
  const boxes = document.querySelectorAll(`[data-group="${groupId}"]`);
  if (!boxes.length) return { done: 0, total: 0, pct: 0 };
  let done = 0;
  boxes.forEach(b => { if (b.checked) done++; });
  return { done, total: boxes.length, pct: Math.round((done / boxes.length) * 100) };
}

/* ── Dashboard Update ── */
function updateDashboard() {
  const groups = ['powerbi', 'fmva', 'acca-bt', 'acca-ma', 'acca-fa', 'acca-fm', 'acca-pm', 'acca-fr', 'phase1', 'phase2', 'phase3', 'phase4', 'phase5', 'dubai-prep'];

  groups.forEach(gid => {
    const prog = getGroupProgress(gid);

    // ring/bar in dashboard
    const ring = document.querySelector(`.dash-ring[data-group="${gid}"]`);
    if (ring) {
      const circle = ring.querySelector('.ring-fill');
      if (circle) {
        const r = parseFloat(circle.getAttribute('r')) || 28;
        const circ = 2 * Math.PI * r;
        const offset = circ - (prog.pct / 100) * circ;
        circle.style.strokeDasharray = circ;
        circle.style.strokeDashoffset = offset;
      }
      const label = ring.querySelector('.ring-pct');
      if (label) label.textContent = prog.pct + '%';
    }

    // bar variant
    const bar = document.querySelector(`.dash-bar[data-group="${gid}"] .db-fill`);
    if (bar) bar.style.width = prog.pct + '%';
    const pctEl = document.querySelector(`.dash-bar[data-group="${gid}"] .db-pct`);
    if (pctEl) pctEl.textContent = prog.pct + '%';
    const countEl = document.querySelector(`.dash-bar[data-group="${gid}"] .db-count`);
    if (countEl) countEl.textContent = `${prog.done}/${prog.total}`;
  });

  // Overall cert progress
  const certGroups = ['powerbi', 'fmva', 'acca-bt', 'acca-ma', 'acca-fa', 'acca-fm', 'acca-pm', 'acca-fr'];
  let certDone = 0, certTotal = 0;
  certGroups.forEach(g => {
    const p = getGroupProgress(g);
    certDone += p.done;
    certTotal += p.total;
  });
  const certPct = certTotal ? Math.round((certDone / certTotal) * 100) : 0;
  updateSummaryCard('cert-summary', certPct, certDone, certTotal);

  // Overall phase progress
  const phaseGroups = ['phase1', 'phase2', 'phase3', 'phase4', 'phase5'];
  let phaseDone = 0, phaseTotal = 0;
  phaseGroups.forEach(g => {
    const p = getGroupProgress(g);
    phaseDone += p.done;
    phaseTotal += p.total;
  });
  const phasePct = phaseTotal ? Math.round((phaseDone / phaseTotal) * 100) : 0;
  updateSummaryCard('phase-summary', phasePct, phaseDone, phaseTotal);

  // Dubai prep
  const dubaiProg = getGroupProgress('dubai-prep');
  updateSummaryCard('dubai-summary', dubaiProg.pct, dubaiProg.done, dubaiProg.total);
}

function updateSummaryCard(id, pct, done, total) {
  const card = document.getElementById(id);
  if (!card) return;
  const fill = card.querySelector('.ring-fill');
  if (fill) {
    const r = parseFloat(fill.getAttribute('r')) || 40;
    const circ = 2 * Math.PI * r;
    fill.style.strokeDasharray = circ;
    fill.style.strokeDashoffset = circ - (pct / 100) * circ;
  }
  const pctEl = card.querySelector('.ring-pct');
  if (pctEl) pctEl.textContent = pct + '%';
  const countEl = card.querySelector('.ring-count');
  if (countEl) countEl.textContent = `${done} of ${total}`;
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  initTabs();
  initFork();
  initCheckboxes();
  updateDashboard();
});
