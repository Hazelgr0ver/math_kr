/* =====================================================================
   РЕНДЕРИНГ
   ===================================================================== */
function renderMath(el){
  if(!window.renderMathInElement) return;
  try{
    renderMathInElement(el,{
      delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],
      throwOnError:false
    });
  }catch(e){}
}

function tableHTML(rows){
  const cell = c => c==='+' ? '<span class="pl">+</span>' : (c==='−' ? '<span class="mi">−</span>' : c);
  return '<div class="tbl-wrap"><table class="sign-table">' +
    rows.map(r => '<tr>' + r.map((c,j) => j===0 ? `<th>${c}</th>` : `<td>${cell(c)}</td>`).join('') + '</tr>').join('') +
    '</table></div>';
}

function cardHTML(t){
  return `
  <article class="card reveal${isSolved(t.id)?' solved':''}" data-id="${t.id}">
    <div class="card-head">
      <span class="badge">${t.num}</span>
      <span class="tag">${t.topic}</span>
      <span class="done-mark">решено 💚</span>
    </div>
    <div class="statement">${t.q}</div>
    <div class="actions">
      ${CHECKS[t.id] ? '<button class="btn" data-act="check" aria-pressed="false">✍️ Мой ответ</button>' : ''}
      <button class="btn" data-act="hint" aria-pressed="false">💡 Подсказка</button>
      <button class="btn" data-act="steps" aria-pressed="false">👣 Решение по шагам</button>
      <button class="btn" data-act="answer" aria-pressed="false">🎯 Ответ</button>
      ${t.graph ? '<button class="btn" data-act="graph" aria-pressed="false">📈 График</button>' : ''}
    </div>
    ${CHECKS[t.id] ? '<div class="panel panel-check"></div>' : ''}
    <div class="panel panel-hint"></div>
    <div class="panel panel-steps"></div>
    <div class="panel panel-answer"></div>
    ${t.graph ? '<div class="panel panel-graph"></div>' : ''}
    <div class="card-foot">
      <button class="solve-btn" data-act="solve">${solveLabel(t.id)}</button>
    </div>
  </article>`;
}

function buildVariant(n, list){
  document.querySelector(`#variant-${n} .cards`).innerHTML = list.map(cardHTML).join('');
}
function buildTrainer(){
  const html = TOPICS.map(tp => {
    const items = TRAINER.filter(t => t.topicId === tp.id);
    return `<div class="topic reveal"><span class="ic">${tp.icon}</span><h3>${tp.name}<small>${tp.desc} · ${items.length} задачи</small></h3></div>
            <div class="cards">${items.map(cardHTML).join('')}</div>`;
  }).join('');
  document.getElementById('trainer-list').innerHTML = html;
}

/* ---------- Панели ---------- */
/* ---------- Поля ввода ответа: скобки, «x =», «y =» уже нарисованы, вводятся только числа ---------- */
const IN_ATTRS = 'type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"';

function pairHTML(type){
  const [a, b] = type === 'intervals' ? ['от', 'до'] : ['x', 'y'];
  const rm = type === 'point' ? '' : '<button type="button" class="rm" data-act="rm-pair" aria-label="Убрать">×</button>';
  return `<div class="pair"><span class="br">(</span><input class="chk-in sm" ${IN_ATTRS} placeholder="${a}" aria-label="${a}">` +
         `<span class="br">;</span><input class="chk-in sm" ${IN_ATTRS} placeholder="${b}" aria-label="${b}"><span class="br">)</span>${rm}</div>`;
}

function fieldHTML(type){
  if(type === 'point') return `<div class="chk-field">${pairHTML('point')}</div>`;
  if(type === 'points' || type === 'intervals'){
    const what = type === 'points' ? 'точка' : 'промежуток';
    return `<div class="chk-field"><div class="multi ${type}">${pairHTML(type)}</div>
      <button type="button" class="add-pair" data-act="add-pair">+ ещё ${what}</button></div>`;
  }
  const pre = type === 'list' ? '<span class="pre"><i>x</i> =</span>' : type === 'line' ? '<span class="pre"><i>y</i> =</span>' : '';
  return `<div class="chk-field single">${pre}<input class="chk-in" ${IN_ATTRS} placeholder="${PLACEHOLDERS[type]}"></div>`;
}

function stepHTML(s){
  return `<li><div class="st-title">${s.t}</div>${s.b||''}${s.table?tableHTML(s.table):''}${s.after||''}</li>`;
}

function buildPanel(card, task, kind){
  const p = card.querySelector('.panel-'+kind);
  if(p.dataset.built) return p;
  p.dataset.built = '1';
  if(kind === 'hint'){
    p.innerHTML = '<h4>💡 Подсказка</h4>' + task.hint.map(h => `<p>${h}</p>`).join('');
    renderMath(p);
  } else if(kind === 'answer'){
    p.innerHTML = '<h4>🎯 Ответ</h4>' + task.answer;
    renderMath(p);
  } else if(kind === 'steps'){
    p.innerHTML = `<h4>👣 Решение по шагам</h4><ol class="steps"></ol>
      <div class="steps-ctrl">
        <button class="btn-next" data-act="next">Следующий шаг →</button>
        <button class="link-btn" data-act="allsteps">показать все</button>
        <button class="link-btn" data-act="restart" hidden>сначала</button>
      </div>`;
    card._shown = 0;
    nextStep(card, task, false);
  } else if(kind === 'check'){
    const rows = CHECKS[task.id].map((c, i) => `
      <div class="chk-row" data-type="${c.type}">
        <div class="chk-lab"><span>${c.label}</span><span class="chk-mark"></span></div>
        ${fieldHTML(c.type)}
        <div class="chk-fb"></div>
      </div>`).join('');
    const keys = ['∞','−','/','π','e','√','^','(',')',';'];
    p.innerHTML = `<h4>✍️ Твой ответ</h4>${rows}
      <div class="keys">${keys.map(k => `<button type="button" data-act="ins" data-k="${k}">${k}</button>`).join('')}</div>
      <div class="chk-ctrl"><button class="btn-check" data-act="do-check">Проверить</button><span class="chk-sum"></span></div>
      <details class="chk-help"><summary>Как вводить ответ?</summary><ul>
        <li>Скобки, <code>x =</code> и <code>y =</code> уже стоят — вводи только числа</li>
        <li>Дроби: <code>1/5</code>, десятичные можно с запятой: <code>0,35</code></li>
        <li>Степени и корни: <code>e^(-1/3)</code>, <code>√2</code>, <code>cbrt(4)</code> — кубический корень</li>
        <li>Логарифм и π: <code>ln2</code>, <code>ln(1/8)</code>, <code>π/2</code> (или <code>pi/2</code>)</li>
        <li>Бесконечность: кнопка <code>∞</code> или <code>inf</code>, минус бесконечность — <code>-∞</code></li>
        <li>Несколько асимптот — через <code>;</code>, например <code>-2; 2</code> или <code>±2</code></li>
        <li>Если промежутков или точек несколько — нажми «+ ещё»</li>
        <li>Приближённый ответ засчитывается, если он верно округлён (например, <code>0,35</code>)</li>
      </ul></details>`;
    renderMath(p);
  } else if(kind === 'graph'){
    p.innerHTML = `<h4>📈 График</h4><div class="plot"><div class="plot-loading">Рисую график…</div></div>
      <p class="plot-note">Пунктир — асимптоты. Отмечены экстремумы, перегибы и выколотые точки.</p>`;
  }
  return p;
}

function nextStep(card, task, scroll=true){
  const ol = card.querySelector('.steps');
  if(card._shown >= task.steps.length) return;
  const tmp = document.createElement('div');
  tmp.innerHTML = stepHTML(task.steps[card._shown]);
  const li = tmp.firstElementChild;
  ol.appendChild(li);
  renderMath(li);
  card._shown++;
  updateStepCtrl(card, task);
  if(scroll) li.scrollIntoView({behavior:'smooth', block:'nearest'});
}
function updateStepCtrl(card, task){
  const btn = card.querySelector('[data-act="next"]');
  const all = card.querySelector('[data-act="allsteps"]');
  const rs = card.querySelector('[data-act="restart"]');
  const total = task.steps.length;
  if(card._shown >= total){
    btn.textContent = 'Все шаги показаны ✓';
    btn.disabled = true; all.hidden = true; rs.hidden = false;
  } else {
    btn.textContent = `Следующий шаг (${card._shown+1}/${total}) →`;
    btn.disabled = false; all.hidden = false; rs.hidden = card._shown <= 1;
  }
}

function togglePanel(card, task, kind, btn){
  const p = buildPanel(card, task, kind);
  const open = !p.classList.contains('open');
  p.classList.toggle('open', open);
  btn.setAttribute('aria-pressed', String(open));
  if(open && kind === 'graph' && !p.dataset.drawn){
    p.dataset.drawn = '1';
    drawGraph(p.querySelector('.plot'), task.graph);
  }
}
