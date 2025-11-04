const el = id => document.getElementById(id);
let settings = {
  work: parseInt(el('inputWork').value, 10),
  brk: parseInt(el('inputBreak').value, 10),
  cycles: parseInt(el('inputCycles').value, 10),
  autoStart: el('selAuto').value === 'true'
};
let state = {
  phase: 'work',
  remaining: settings.work * 60,
  running: false,
  currentCycle: 0,
  timerId: null
};
const STORAGE_KEY = 'pomodoro_history_v1';
function fmtTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveHistory(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
function addHistoryItem(item) { const list = loadHistory(); list.unshift(item); saveHistory(list); renderHistory(); }
function clearHistory() { localStorage.removeItem(STORAGE_KEY); renderHistory(); }
function renderTime() {
  el('timeDisplay').textContent = fmtTime(state.remaining);
  el('phaseLabel').textContent = state.phase === 'work' ? 'Trabalho' : 'Pausa';
  el('statusTag').textContent = state.running ? 'Em execução' : 'Parado';
  el('cycleTag').textContent = `Ciclo ${state.currentCycle}/${settings.cycles}`;
}
function renderHistory() {
  const list = loadHistory();
  el('totalCompleted').textContent = list.length;
  const today = new Date();
  const todayCount = list.filter(it => {
    const d = new Date(it.finishedAt);
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  }).length;
  el('todayCompleted').textContent = todayCount;
  const container = el('historyList');
  container.innerHTML = '';
  if (!list.length) { container.innerHTML = '<div class="small" style="color:var(--muted)">Nenhum registro ainda.</div>'; return; }
  list.slice(0, 60).forEach(it => {
    const div = document.createElement('div');
    div.className = 'hist-item';
    div.innerHTML = `
      <div>
        <div style="font-weight:600">${it.phase === 'work' ? 'Trabalho' : 'Pausa'} • ${it.durationMin} min</div>
        <div class="small" style="color:var(--muted)">${new Date(it.finishedAt).toLocaleString()}</div>
      </div>
      <div><div class="tag">${it.note || ''}</div></div>`;
    container.appendChild(div);
  });
}
function tick() {
  if (state.remaining > 0) { state.remaining--; renderTime(); return; }
  addHistoryItem({
    phase: state.phase,
    durationMin: state.phase === 'work' ? settings.work : settings.brk,
    finishedAt: new Date().toISOString(),
    note: `Ciclo ${state.currentCycle}`
  });
  if (state.phase === 'work') {
    state.phase = 'break';
    state.remaining = settings.brk * 60;
  } else {
    state.currentCycle++;
    if (state.currentCycle >= settings.cycles) {
      stopTimer();
      state.phase = 'work';
      state.remaining = settings.work * 60;
      renderTime();
      el('statusTag').textContent = 'Concluído';
      return;
    }
    state.phase = 'work';
    state.remaining = settings.work * 60;
  }
  renderTime();
  if (settings.autoStart) startTimer();
}
function startTimer() {
  if (state.running) return;
  state.running = true;
  el('startBtn').textContent = 'Executando';
  el('startBtn').disabled = true;
  el('pauseBtn').disabled = false;
  clearInterval(state.timerId);
  state.timerId = setInterval(tick, 1000);
  renderTime();
}
function pauseTimer() {
  if (!state.running) return;
  state.running = false;
  clearInterval(state.timerId);
  state.timerId = null;
  el('startBtn').textContent = 'Retomar';
  el('startBtn').disabled = false;
  el('pauseBtn').disabled = true;
  renderTime();
}
function stopTimer() {
  state.running = false;
  clearInterval(state.timerId);
  state.timerId = null;
  el('startBtn').textContent = 'Iniciar';
  el('startBtn').disabled = false;
  el('pauseBtn').disabled = true;
}
function resetTimer() {
  stopTimer();
  state.phase = 'work';
  state.remaining = settings.work * 60;
  state.currentCycle = 0;
  renderTime();
}
let applyLocked = false;
function applySettings() {
  if (applyLocked) return;
  applyLocked = true;
  setTimeout(() => { applyLocked = false; }, 300);
  settings.work = Math.max(1, parseInt(el('inputWork').value, 10) || 25);
  settings.brk = Math.max(1, parseInt(el('inputBreak').value, 10) || 5);
  settings.cycles = Math.max(1, parseInt(el('inputCycles').value, 10) || 4);
  settings.autoStart = el('selAuto').value === 'true';
  if (!state.running) {
    state.remaining = settings.work * 60;
    state.phase = 'work';
    state.currentCycle = 0;
  }
  try { localStorage.setItem('pomodoro_settings_v1', JSON.stringify(settings)); } catch {}
  renderTime();
  renderHistory();
}
function exportJSON() {
  const data = loadHistory();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pomodoro_history.json';
  a.click();
  URL.revokeObjectURL(url);
}
function handleFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (Array.isArray(parsed)) {
        saveHistory(parsed);
        renderHistory();
        alert('Histórico importado com sucesso.');
      } else alert('Arquivo inválido: formato esperado JSON array.');
    } catch (err) { alert('Erro ao ler arquivo: ' + err.message); }
  };
  reader.readAsText(file);
}
el('startBtn').addEventListener('click', startTimer);
el('pauseBtn').addEventListener('click', pauseTimer);
el('resetBtn').addEventListener('click', () => { if (confirm('Resetar timer e ciclos?')) resetTimer(); });
el('applyBtn').addEventListener('click', applySettings);
el('clearHistoryBtn').addEventListener('click', () => { if (confirm('Limpar todo o histórico?')) clearHistory(); });
el('exportBtn').addEventListener('click', exportJSON);
el('importBtn').addEventListener('click', () => el('fileInput').click());
el('fileInput').addEventListener('change', e => {
  if (e.target.files.length) handleFile(e.target.files[0]);
  e.target.value = '';
});
el('pauseBtn').disabled = true;
(function init() {
  try {
    const saved = JSON.parse(localStorage.getItem('pomodoro_settings_v1') || 'null');
    if (saved) {
      settings = Object.assign(settings, saved);
      el('inputWork').value = settings.work;
      el('inputBreak').value = settings.brk;
      el('inputCycles').value = settings.cycles;
      el('selAuto').value = settings.autoStart ? 'true' : 'false';
    }
  } catch {}
  applySettings();
  renderHistory();
  renderTime();
})();
window.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (state.running) pauseTimer(); else startTimer();
  }
});
