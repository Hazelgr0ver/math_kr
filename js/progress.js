/* =====================================================================
   ПРОГРЕСС
   ===================================================================== */
const CHEERS = [
  [0,   'Первая задача — самая важная. Поехали! 🌱'],
  [1,   'Отличное начало! 🌷'],
  [25,  'Четверть пути позади ✨'],
  [50,  'Уже половина — ты супер! 💪'],
  [75,  'Финишная прямая! 🔥'],
  [100, 'Всё решено — ты готова! 🍀']
];
/* Открытка открывается, когда решён ЦЕЛИКОМ любой вариант и GOAL_TRAINER задач тренажёра (см. config.js).
   Прогресс до открытки = лучший вариант (до 7) + тренажёр (до GOAL_TRAINER). */
function goalState(){
  const v1 = countSolved(VARIANT1), v2 = countSolved(VARIANT2), tr = countSolved(TRAINER);
  const bestN = v1 >= v2 ? 1 : 2, best = Math.max(v1, v2);
  const vLen = bestN === 1 ? VARIANT1.length : VARIANT2.length;
  const trNeed = Math.min(GOAL_TRAINER, TRAINER.length);
  const variantDone = v1 === VARIANT1.length || v2 === VARIANT2.length;
  const trainerDone = tr >= trNeed;
  const points = Math.min(best, vLen) + Math.min(tr, trNeed);
  const goal = vLen + trNeed;
  return {v1, v2, tr, bestN, best, vLen, trNeed, variantDone, trainerDone, points, goal,
          unlocked: variantDone && trainerDone};
}

function updateProgress(){
  const g = goalState();
  const pct = Math.round(g.points / g.goal * 100);
  document.getElementById('hero-bar').style.width = pct + '%';
  document.getElementById('hero-count').textContent = `${g.points} из ${g.goal}`;
  document.getElementById('nav-count').textContent = `💌 ${g.points}/${g.goal}`;
  let cheer = CHEERS[0][1];
  if(g.points > 0) for(const [th, txt] of CHEERS){ if(th > 0 && (th === 1 || pct >= th)) cheer = txt; }
  if(isUnlocked(g)) cheer = 'Конверт открыт — загляни в «Финал» 💌';
  document.getElementById('hero-cheer').textContent = cheer;
  document.getElementById('cnt-v1').textContent = `${g.v1}/${VARIANT1.length}`;
  document.getElementById('cnt-v2').textContent = `${g.v2}/${VARIANT2.length}`;
  document.getElementById('cnt-trainer').textContent = `Решено ${g.tr} из ${TRAINER.length}`;
  renderFinal(g);
  return g;
}

/* Конверт открыт, если выполнены условия ИЛИ наступила дата ENVELOPE_OPEN_DATE (после контрольной). */
function dateReached(){
  if(!ENVELOPE_OPEN_DATE) return false;
  // полная дата со временем и поясом — как есть; просто 'ГГГГ-ММ-ДД' — с начала дня по времени устройства
  const t = new Date(ENVELOPE_OPEN_DATE.includes('T') ? ENVELOPE_OPEN_DATE : ENVELOPE_OPEN_DATE + 'T00:00:00');
  return !Number.isNaN(t.getTime()) && Date.now() >= t.getTime();
}
const isUnlocked = g => g.unlocked || dateReached();

/* ---------- Раздел «Финал» на странице ---------- */
function renderFinal(g){
  const el = document.getElementById('final-card');
  const reset = countSolved(ALL) > 0 ? '<button class="reset-btn" data-act="reset">Сбросить прогресс</button>' : '';
  const openBtn = '<button class="btn-main open-card" data-act="open-card">Открыть открытку 💌</button>';
  if(isUnlocked(g)){
    el.innerHTML = `<div class="big">💌</div>
      <h2>Конверт открыт!</h2>
      <p style="color:var(--ink-2)">Открытка и конверт ждут тебя.</p>
      ${openBtn}<br>${reset}`;
    return;
  }
  const item = (done, text, count) =>
    `<li class="${done ? 'done' : ''}"><span class="tick">${done ? '✓' : ''}</span><span>${text}</span><b>${count}</b></li>`;
  const variantText = g.variantDone ? 'Один вариант целиком' :
    `Один вариант целиком <small>(ближе всего — вариант ${g.bestN})</small>`;
  el.innerHTML = `<div class="final-locked">
    <div class="big">💌</div>
    <h2>Здесь тебя кое-что ждёт</h2>
    <p>Конверт откроется, когда будет выполнено:</p>
    <ul class="goal-list">
      ${item(g.variantDone, variantText, `${g.best}/${g.vLen}`)}
      ${item(g.trainerDone, `${g.trNeed} ${plural(g.trNeed,'задача','задачи','задач')} из тренажёра`, `${Math.min(g.tr, g.trNeed)}/${g.trNeed}`)}
    </ul>
    <div class="bar" style="max-width:340px;margin:18px auto 22px"><i style="width:${Math.round(g.points/g.goal*100)}%"></i></div>
    ${openBtn}<br>${reset}
  </div>`;
}

/* ---------- Открытка и конверт (в окне) ---------- */
function envelopeHTML(g, animate){
  if(isUnlocked(g)){
    return `<div class="envelope opened${animate ? ' animate' : ''}">
      <div class="env-seal" aria-hidden="true">💌</div>
      <div class="env-letter">
        <p class="env-title">💌 ${escapeHTML(ENVELOPE_TITLE)}</p>
        <p class="env-text">${escapeHTML(ENVELOPE_MESSAGE)}</p>
      </div>
    </div>`;
  }
  const left = Math.max(0, g.goal - g.points);
  return `<div class="envelope locked">
    <div class="env-seal" aria-hidden="true">💌</div>
    <p class="env-title">${escapeHTML(ENVELOPE_LOCKED_TITLE)}</p>
    <p class="env-text">${escapeHTML(ENVELOPE_LOCKED_TEXT)}</p>
    <p class="env-left">Осталось: ${left} ${plural(left,'задача','задачи','задач')}</p>
    <p class="env-small">${escapeHTML(ENVELOPE_LOCKED_SMALL)}</p>
  </div>`;
}
function postcardHTML(g, animate){
  return `<button class="ov-x" data-act="close-final" aria-label="Закрыть">×</button>
    <div class="big">🍀</div>
    <h2 id="ov-title">${escapeHTML(g.unlocked ? CARD_TITLE : CARD_TITLE_EARLY)}</h2>
    <div class="letter">${escapeHTML(g.unlocked ? CARD_MESSAGE : CARD_MESSAGE_EARLY)}</div>
    ${envelopeHTML(g, animate)}
    <button class="btn-main close" data-act="close-final">Спасибо 💛</button>`;
}
function showOverlay(html){
  document.getElementById('overlay-card').innerHTML = html;
  document.getElementById('overlay').classList.add('show');
}
function closeOverlay(){
  clearTimeout(teaseTimer);
  document.getElementById('overlay').classList.remove('show');
}

/* Показать открытку. Конверт открывается с анимацией в первый раз после того, как стал доступен. */
function openCard(){
  const g = goalState();
  const first = isUnlocked(g) && !state.envelopeSeen;
  showOverlay(postcardHTML(g, first));
  notifyCardOpened(isUnlocked(g), first);
  if(first){
    state.envelopeSeen = true; saveState();
    notifyUnlocked();   // она впервые видит открытый конверт (дорешала или открылся по дате)
    setTimeout(() => {
      const env = document.querySelector('#overlay .envelope');
      if(env){ const r = env.getBoundingClientRect(); burst(r.left + r.width/2, r.top + r.height/3, 80); }
      bigCelebration();
    }, 700);
  }
}

/* Кнопка «Открыть открытку»: если условия не выполнены — сначала игривое окно. */
let teaseTimer = 0;
function requestCard(){
  const g = goalState();
  if(isUnlocked(g)){ openCard(); return; }
  const text = TEASE_TEXT.replace('{done}', g.points).replace('{goal}', g.goal);
  showOverlay(`<div class="big">🤨</div>
    <h2 id="ov-title">${escapeHTML(TEASE_TITLE)}</h2>
    <p class="tease-text">${escapeHTML(text)}</p>
    <div class="tease-btns">
      <button class="btn-main" data-act="tease-no">${escapeHTML(TEASE_NO)}</button>
      <button class="btn-soft" data-act="tease-yes">${escapeHTML(TEASE_YES)}</button>
    </div>`);
}
function teaseYes(){
  notifyPeek();
  showOverlay(`<div class="big">😌</div><p class="tease-ok">${escapeHTML(TEASE_OK)}</p>`);
  clearTimeout(teaseTimer);
  teaseTimer = setTimeout(openCard, 2200);
}
