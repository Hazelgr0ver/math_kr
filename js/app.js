/* =====================================================================
   ДЕЙСТВИЯ
   ===================================================================== */
/* Задача засчитывается ТОЛЬКО за верно введённый ответ (см. answer-check.js),
   отметить её вручную нельзя — иначе можно «прокликать» всё и сразу открыть послание. */
const solveLabel = id => isSolved(id) ? 'Решено 💚' : '✍️ Ввести ответ';

function markSolved(card){
  const id = card.dataset.id;
  if(isSolved(id)) return;
  const wasUnlocked = isUnlocked(goalState());
  state.solved[id] = true;
  card.classList.add('solved');
  const btn = card.querySelector('.solve-btn');
  btn.textContent = solveLabel(id);
  btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop');
  const g = updateProgress();
  const r = btn.getBoundingClientRect();
  burst(r.left + r.width/2, r.top + r.height/2);
  if(isUnlocked(g) && !wasUnlocked){
    // конверт открылся именно сейчас — показываем открытку с анимацией конверта
    state.finaleShown = true;          // уведомление уйдёт из openCard, когда она увидит конверт
    setTimeout(openCard, 500);
  } else if(!isUnlocked(g) && g.variantDone && !g.trainerDone && card.closest('.variant')){
    toast(`Вариант решён! Осталось ${g.trNeed - g.tr} из тренажёра 💌`);
  } else {
    toast('Всё верно — задача засчитана! 🎉');
  }
  saveState();
}

/* Нижняя кнопка карточки: открывает поля ввода ответа (если задача ещё не решена). */
function openCheck(card, task){
  if(isSolved(task.id)) return;
  const btn = card.querySelector('[data-act="check"]');
  const panel = card.querySelector('.panel-check');
  if(!panel.classList.contains('open')) togglePanel(card, task, 'check', btn);
  panel.scrollIntoView({behavior:'smooth', block:'nearest'});
  const inp = panel.querySelector('.chk-in');
  if(inp) inp.focus({preventScroll:true});
}

let resetArmed = 0;
function handleReset(btn){
  if(!resetArmed){
    btn.classList.add('armed'); btn.textContent = 'Точно сбросить? Нажми ещё раз';
    resetArmed = setTimeout(() => { resetArmed = 0; updateProgress(); }, 3000);
    return;
  }
  clearTimeout(resetArmed); resetArmed = 0;
  state.solved = {}; state.finaleShown = false; state.envelopeSeen = false; saveState();
  document.querySelectorAll('.card.solved').forEach(c => {
    c.classList.remove('solved');
    c.querySelector('.solve-btn').textContent = solveLabel(c.dataset.id);
  });
  updateProgress();
  toast('Начинаем с чистого листа 🌱');
}

function applyVariant(n){
  state.variant = n;
  document.getElementById('switch').classList.toggle('v2', n === 2);
  document.querySelectorAll('#switch button').forEach(b => {
    const on = +b.dataset.variant === n;
    b.classList.toggle('active', on); b.setAttribute('aria-selected', String(on));
  });
  document.getElementById('variant-1').classList.toggle('show', n === 1);
  document.getElementById('variant-2').classList.toggle('show', n === 2);
  // карточки нового варианта сразу видимы
  document.querySelectorAll(`#variant-${n} .reveal`).forEach(e => e.classList.add('in'));
}

function onClick(e){
  const btn = e.target.closest('[data-act], [data-variant]');
  if(!btn) return;
  if(btn.dataset.variant){ applyVariant(+btn.dataset.variant); saveState(); return; }
  const act = btn.dataset.act;
  if(act === 'reset'){ handleReset(btn); return; }
  if(act === 'close-final'){ closeOverlay(); return; }
  if(act === 'open-card'){ requestCard(); return; }
  if(act === 'tease-yes'){ teaseYes(); return; }
  if(act === 'tease-no'){
    closeOverlay(); toast('Вот это настрой! 💪');
    document.getElementById('tasks').scrollIntoView({behavior:'smooth'});
    return;
  }
  const card = btn.closest('.card'); if(!card) return;
  const task = BY_ID[card.dataset.id];
  switch(act){
    case 'check': case 'hint': case 'steps': case 'answer': case 'graph': togglePanel(card, task, act, btn); break;
    case 'do-check': runCheck(card, task, btn); break;
    case 'ins': insertKey(card, btn.dataset.k); break;
    case 'add-pair': addPair(btn); break;
    case 'rm-pair': rmPair(btn); break;
    case 'next': nextStep(card, task); break;
    case 'allsteps': while(card._shown < task.steps.length) nextStep(card, task, false); break;
    case 'restart': card.querySelector('.steps').innerHTML = ''; card._shown = 0; nextStep(card, task, false); break;
    case 'solve': openCheck(card, task); break;
  }
}

function setupReveal(){
  const els = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window) || reducedMotion){ els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  }, {rootMargin:'0px 0px -40px 0px', threshold:.05});
  els.forEach(e => io.observe(e));
}
function setupNavHighlight(){
  if(!('IntersectionObserver' in window)) return;
  const links = [...document.querySelectorAll('.nav a')];
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if(en.isIntersecting){
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
      }
    });
  }, {rootMargin:'-45% 0px -50% 0px'});
  ['tasks','cheat','trainer','final'].forEach(id => io.observe(document.getElementById(id)));
}

/* =====================================================================
   СТАРТ
   ===================================================================== */
function init(){
  identifyVisitor();   // ключ из личной ссылки (?k=...) — до всего остального
  loadState();
  document.getElementById('hero-name').textContent = NAME;
  buildVariant(1, VARIANT1);
  buildVariant(2, VARIANT2);
  buildTrainer();
  renderMath(document.body);
  applyVariant(state.variant);
  updateProgress();

  fx.c = document.getElementById('fx'); fx.ctx = fx.c.getContext('2d');
  fxResize(); addEventListener('resize', fxResize);

  document.addEventListener('click', onClick);
  document.getElementById('start-btn').addEventListener('click', () =>
    document.getElementById('tasks').scrollIntoView({behavior:'smooth'}));
  document.getElementById('overlay').addEventListener('click', e => {
    if(e.target.id === 'overlay') closeOverlay();
  });
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape') closeOverlay();
    if(e.key === 'Enter' && e.target.matches && e.target.matches('.chk-in')){
      e.preventDefault();
      const card = e.target.closest('.card');
      runCheck(card, BY_ID[card.dataset.id], card.querySelector('.btn-check'));
    }
  });
  document.addEventListener('focusin', e => {
    if(e.target.matches && e.target.matches('.chk-in')) e.target.closest('.card')._lastInput = e.target;
  });
  document.addEventListener('input', e => {
    if(e.target.matches && e.target.matches('.chk-in')) clearRow(e.target.closest('.chk-row'));
  });

  setupReveal();
  setupNavHighlight();
  notifyVisit();

  // Если сайт открыт в момент ENVELOPE_OPEN_DATE — открываем конверт без перезагрузки
  if(!isUnlocked(goalState())){
    const timer = setInterval(() => {
      if(dateReached()){
        clearInterval(timer);
        updateProgress();
        toast('Контрольная позади — конверт открылся 💌 Загляни в «Финал»');
      }
    }, 60000);
  }
}
document.addEventListener('DOMContentLoaded', init);
