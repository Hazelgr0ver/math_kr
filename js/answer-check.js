/* Проверка введённых ответов в карточке.
   Пользователь вводит только числа: скобки, «x =», «y =» и знак ∪ нарисованы в разметке (см. fieldHTML в render.js).
   Здесь значения из окошек собираются обратно в строку формата, который понимает math-parser.js. */

const BAD_MSGS = ['Пока не так — загляни в подсказку 💡','Почти! Проверь ещё раз 🌷','Не сходится — перепроверь вычисления 🔍'];
const ERR_MSG = {
  num:'Не получилось прочитать число. Пример: 3/4, e^2, √2',
  list:'Не получилось прочитать. Пример: 1; -4',
  line:'Не получилось прочитать. Пример: 2x - 3',
  point:'Не получилось прочитать координаты. Пример: 1/5, -2, e^2',
  points:'Не получилось прочитать координаты. Пример: 1/5, -2, ln2',
  intervals:'Не получилось прочитать границы. Пример: 0, 1/5, ∞, -∞'
};

/* -> {value} | {empty:true} | {incomplete:true} */
function readField(row){
  const type = row.dataset.type;
  if(type === 'num' || type === 'list' || type === 'line'){
    const v = row.querySelector('.chk-in').value.trim();
    return v ? {value:v} : {empty:true};
  }
  const pairs = [];
  // лишние скобки, «x =», «y =» и точка с запятой по краям окошка не мешают
  const clean = v => {
    v = v.trim().replace(/^[;\s]+|[;\s]+$/g, '');
    const bal = s => (s.match(/[(\[]/g) || []).length - (s.match(/[)\]]/g) || []).length;
    // скобки снимаем, только если они без пары: «(1» → «1», «0)» → «0», но «e^(-1/3)» не трогаем
    while(/^[(\[]/.test(v) && bal(v) > 0) v = v.slice(1).trim();
    while(/[)\]]$/.test(v) && bal(v) < 0) v = v.slice(0, -1).trim();
    return v.replace(/^[xyхуXYХУ]\s*=\s*/, '').trim();
  };
  for(const pair of row.querySelectorAll('.pair')){
    let [a, b] = [...pair.querySelectorAll('.chk-in')].map(i => i.value.trim());
    // всю пару вписали в одно окошко: «1; 0» или «(1; 0)»
    if(a && !b && /[;]/.test(a)) [a, b] = a.split(';');
    else if(b && !a && /[;]/.test(b)) [a, b] = b.split(';');
    a = clean(a || ''); b = clean(b || '');
    if(!a && !b) continue;                 // пустая пара просто пропускается
    if(!a || !b) return {incomplete:true};
    pairs.push(`(${a};${b})`);
  }
  if(!pairs.length) return {empty:true};
  return {value: pairs.join(type === 'intervals' ? 'U' : ';')};
}

function setRowState(row, state, text){
  const mark = row.querySelector('.chk-mark'), fb = row.querySelector('.chk-fb');
  const inputs = row.querySelectorAll('.chk-in');
  inputs.forEach(i => i.classList.remove('ok','bad'));
  fb.className = 'chk-fb'; fb.textContent = text || ''; mark.textContent = '';
  if(state === 'ok'){
    inputs.forEach(i => { if(i.value.trim()) i.classList.add('ok'); });
    mark.textContent = '✓'; mark.style.color = 'var(--sage)'; fb.classList.add('ok');
  } else if(state === 'bad'){
    inputs.forEach(i => { void i.offsetWidth; if(i.value.trim()) i.classList.add('bad'); });
    mark.textContent = '✗'; mark.style.color = 'var(--rose-d)'; fb.classList.add('bad');
  } else if(state === 'err'){
    mark.textContent = '?'; mark.style.color = 'var(--honey)'; fb.classList.add('err');
  }
}

function runCheck(card, task, btn){
  const specs = CHECKS[task.id];
  const rows = card.querySelectorAll('.chk-row');
  let ok = 0, filled = 0;
  specs.forEach((spec, i) => {
    const row = rows[i];
    const r = readField(row);
    if(r.empty){ setRowState(row, ''); return; }
    filled++;
    if(r.incomplete){ setRowState(row, 'err', 'Заполни оба окошка в скобках 🙂'); return; }
    const res = checkField(spec, r.value);
    if(res === 'ok'){ ok++; setRowState(row, 'ok', 'Верно!'); }
    else if(res === 'bad') setRowState(row, 'bad', BAD_MSGS[Math.floor(Math.random()*BAD_MSGS.length)]);
    else setRowState(row, 'err', ERR_MSG[spec.type]);
  });
  const sum = card.querySelector('.chk-sum');
  const n = specs.length;
  if(ok === n){
    sum.textContent = n > 1 ? 'Всё верно! 🎉' : 'Верно! 🎉';
    sum.style.color = '#2F6B47';
    if(!isSolved(task.id)){
      markSolved(card);
    } else {
      const r = btn.getBoundingClientRect(); burst(r.left + r.width/2, r.top + r.height/2, 30);
    }
  } else if(filled === 0){
    sum.textContent = 'Сначала введи ответ ✍️'; sum.style.color = 'var(--muted)';
  } else {
    sum.textContent = `Верно ${ok} из ${n}` + (filled < n ? ' (не все поля заполнены)' : '') + ' — у тебя получится 💪';
    sum.style.color = 'var(--ink-2)';
  }
}

/* «+ ещё промежуток / точка» и «×» */
function addPair(btn){
  const multi = btn.closest('.chk-field').querySelector('.multi');
  const type = multi.classList.contains('intervals') ? 'intervals' : 'points';
  multi.insertAdjacentHTML('beforeend', pairHTML(type));
  const inp = multi.lastElementChild.querySelector('.chk-in');
  inp.focus();
  clearRow(btn.closest('.chk-row'));
}
function rmPair(btn){
  const pair = btn.closest('.pair'), multi = pair.parentElement;
  const row = btn.closest('.chk-row');
  if(multi.children.length > 1) pair.remove();
  else pair.querySelectorAll('.chk-in').forEach(i => { i.value = ''; });
  clearRow(row);
}
function clearRow(row){ if(row) setRowState(row, ''); }

function insertKey(card, k){
  const inp = (card._lastInput && card.contains(card._lastInput)) ? card._lastInput : card.querySelector('.chk-in');
  if(!inp) return;
  const ins = k === '√' ? '√(' : k;
  const a = inp.selectionStart ?? inp.value.length, b = inp.selectionEnd ?? inp.value.length;
  inp.value = inp.value.slice(0, a) + ins + inp.value.slice(b);
  inp.focus();
  const pos = a + ins.length;
  try{ inp.setSelectionRange(pos, pos); }catch(e){}
  inp.dispatchEvent(new Event('input', {bubbles:true}));
}
