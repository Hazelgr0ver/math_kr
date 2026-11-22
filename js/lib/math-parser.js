/* Разбор и сравнение математических ответов (без DOM). */

/* ---------- Разбор математических выражений ---------- */
const FUNCS = {sqrt:Math.sqrt, cbrt:Math.cbrt, atan:Math.atan, exp:Math.exp, log:Math.log, ln:Math.log,
               lg:Math.log10, tan:Math.tan, sin:Math.sin, cos:Math.cos};
const CONSTS = {pi:Math.PI, e:Math.E, inf:Infinity};
const NAMES = ['sqrt','cbrt','atan','exp','log','tan','sin','cos','ln','lg','pi','inf','e','x'];

function normMath(s){
  return String(s).toLowerCase()
    .replace(/[−–—]/g,'-').replace(/[·×∙⋅]/g,'*').replace(/[÷:]/g,'/')
    .replace(/π|пи/g,'pi').replace(/∞|бесконечн[а-я]*/g,'inf').replace(/корень/g,'sqrt')
    .replace(/е/g,'e').replace(/х/g,'x').replace(/лн/g,'ln').replace(/тг/g,'tg')
    .replace(/√/g,'sqrt').replace(/∛/g,'cbrt').replace(/²/g,'^2').replace(/³/g,'^3')
    .replace(/arctg|arctan/g,'atan').replace(/tg/g,'tan')
    .replace(/\s+/g,'');
}

function tokenize(s){
  const out = []; let i = 0;
  while(i < s.length){
    const ch = s[i];
    const num = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
    if(num){ out.push({t:'n', v:parseFloat(num[1])}); i += num[1].length; continue; }
    if(/[a-z]/.test(ch)){
      const name = NAMES.find(n => s.startsWith(n, i));
      if(!name) throw new Error('name');
      out.push({t:'id', v:name}); i += name.length; continue;
    }
    if('+-*/^()'.includes(ch)){ out.push({t:ch}); i++; continue; }
    throw new Error('char');
  }
  return out;
}

/* Возвращает {fn(x), usesX}. Поддерживает неявное умножение: 3ln2, 2x, x ln2, 2(x+1). */
function compileExpr(str){
  const toks = tokenize(str); let p = 0; let usesX = false;
  const peek = () => toks[p], take = () => toks[p++];
  const startsPrimary = t => t && (t.t === 'n' || t.t === 'id' || t.t === '(');
  function expr(){
    let a = term();
    while(peek() && (peek().t === '+' || peek().t === '-')){
      const op = take().t, l = a, r = term();
      a = op === '+' ? x => l(x) + r(x) : x => l(x) - r(x);
    }
    return a;
  }
  function term(){
    let a = unary();
    for(;;){
      const t = peek();
      if(t && (t.t === '*' || t.t === '/')){
        take(); const l = a, r = unary();
        a = t.t === '*' ? x => l(x) * r(x) : x => l(x) / r(x);
      } else if(startsPrimary(t)){
        const l = a, r = power(); a = x => l(x) * r(x);
      } else break;
    }
    return a;
  }
  function unary(){
    const t = peek();
    if(t && t.t === '-'){ take(); const a = unary(); return x => -a(x); }
    if(t && t.t === '+'){ take(); return unary(); }
    return power();
  }
  function power(){
    const b = primary();
    if(peek() && peek().t === '^'){
      take();
      // Мягкость: «e^-1/2» и «x^2/5» понимаем как e^(-1/2) и x^(2/5) — так их обычно и имеют в виду.
      const t0 = toks[p], signed = t0 && (t0.t === '-' || t0.t === '+'), q = p + (signed ? 1 : 0);
      if(toks[q] && toks[q].t === 'n' && toks[q+1] && toks[q+1].t === '/' && toks[q+2] && toks[q+2].t === 'n'
         && !(toks[q+3] && toks[q+3].t === '^')){
        const v = (signed && t0.t === '-' ? -1 : 1) * toks[q].v / toks[q+2].v;
        p = q + 3;
        return x => Math.pow(b(x), v);
      }
      const e = unary(); return x => Math.pow(b(x), e(x));
    }
    return b;
  }
  function primary(){
    const t = take();
    if(!t) throw new Error('eof');
    if(t.t === 'n'){ const v = t.v; return () => v; }
    if(t.t === '('){ const a = expr(); if(!peek() || take().t !== ')') throw new Error('paren'); return a; }
    if(t.t === 'id'){
      if(t.v === 'x'){ usesX = true; return x => x; }
      if(t.v in CONSTS){ const v = CONSTS[t.v]; return () => v; }
      const f = FUNCS[t.v], arg = power();
      return x => f(arg(x));
    }
    throw new Error('unexpected');
  }
  const fn = expr();
  if(p !== toks.length) throw new Error('tail');
  return {fn, usesX};
}

/* Каждое число — {v, d}: значение и сколько знаков после запятой ввёл пользователь.
   d > 0 — приближённый ответ (см. numEq). */
function decCount(s){ return Math.max(0, ...(s.match(/\.(\d+)/g) || []).map(m => m.length - 1)); }

function evalConst(s){
  s = normMath(s);
  if(!s) throw new Error('empty');
  const {fn, usesX} = compileExpr(s);
  if(usesX) throw new Error('x');
  const v = fn(0);
  if(Number.isNaN(v)) throw new Error('nan');
  return {v, d:decCount(s)};
}

/* Деление по разделителю на верхнем уровне скобок. ';' главнее; ',' — разделитель, только если ';' нет. */
function splitTop(s){
  const sep = s.includes(';') ? ';' : ',';
  const parts = []; let depth = 0, cur = '';
  for(const ch of s){
    if('(['.includes(ch)) depth++;
    if(')]'.includes(ch)) depth--;
    if(ch === sep && depth === 0){ parts.push(cur); cur = ''; } else cur += ch;
  }
  parts.push(cur);
  return {parts: parts.map(x => x.trim()).filter(x => x !== ''), sep};
}
const decComma = (s, sep) => sep === ';' ? s.replace(/,/g,'.') : s;

/* Группы верхнего уровня в скобках: "(a;b)∪[c;d)" -> [{open,body,close}, ...] */
function topGroups(s){
  const groups = []; let depth = 0, start = -1;
  for(let i = 0; i < s.length; i++){
    const ch = s[i];
    if('(['.includes(ch)){ if(depth === 0) start = i; depth++; }
    else if(')]'.includes(ch)){
      depth--;
      if(depth < 0) throw new Error('paren');
      if(depth === 0) groups.push({open:s[start], body:s.slice(start+1, i), close:ch});
    } else if(depth === 0 && !/[\s∪uUиИ;,|]/.test(ch)) throw new Error('junk');
  }
  if(depth !== 0) throw new Error('paren');
  return groups;
}

const isNone = s => /^(нет|не\s*существует|∅|-|—)$/i.test(s.trim());

function parsePair(body){
  const {parts, sep} = splitTop(body);
  if(parts.length !== 2) throw new Error('pair');
  return parts.map(x => evalConst(decComma(x, sep)));
}

const PARSERS = {
  // «x = 1/5», «y_max = 0,35», «lim = 2» — всё до знака «=» отбрасываем
  num: s => evalConst(s.replace(/^[^=]*=/, '').replace(/,/g,'.')),
  list: s => {
    if(isNone(s)) return [];
    let cleaned = s.replace(/[xхXХ]\s*=/g,'').replace(/\s+и\s+/gi, ';').trim();
    // «-2 2» (через пробел) — делим по пробелам, только если каждый кусок сам по себе число
    if(!/[;,]/.test(cleaned) && /\S\s+\S/.test(cleaned)){
      const pieces = cleaned.split(/\s+/);
      const ok = pieces.every(x => { if(/^[*/^+]|[*/^+-]$/.test(x)) return false; try{ evalConst(x.replace(/^(±|\+-)/,'')); return true; }catch(e){ return false; } });
      if(ok) cleaned = pieces.join(';');
    }
    const {parts, sep} = splitTop(cleaned);
    const out = [];
    parts.forEach(it => {
      it = decComma(it, sep).trim();
      if(/^(±|\+-|\+\/-)/.test(it)){ const n = evalConst(it.replace(/^(±|\+-|\+\/-)/,'')); out.push(n, {v:-n.v, d:n.d}); }
      else out.push(evalConst(it));
    });
    return out.sort(byV);
  },
  point: s => {
    s = s.trim();
    if(!/^[(\[]/.test(s)) return parsePair(s);   // «1; e^(-1/3)» без внешних скобок
    const g = topGroups(s);
    if(g.length > 1) throw new Error('many');
    return parsePair(g.length ? g[0].body : s);
  },
  points: s => {
    if(isNone(s)) return [];
    const g = topGroups(s.trim());
    if(!g.length) throw new Error('none');
    return g.map(x => parsePair(x.body)).sort((a,b) => byV(a[0],b[0]) || byV(a[1],b[1]));
  },
  intervals: s => {
    if(isNone(s)) return [];
    const g = topGroups(s.trim());
    if(!g.length) throw new Error('none');
    return g.map(x => parsePair(x.body)).sort((a,b) => byV(a[0],b[0]));
  },
  line: s => {
    const t = normMath(s.replace(/,/g,'.')).replace(/^[yу]=/,'');
    if(!t) throw new Error('empty');
    const {fn} = compileExpr(t), d = decCount(t);
    const vals = [1,2,3].map(fn);
    if(vals.some(v => !Number.isFinite(v))) throw new Error('nan');
    return vals.map(v => ({v, d}));
  }
};

function byV(a, b){
  if(a.v === b.v) return 0;          // в т.ч. два одинаковых ±∞
  return a.v < b.v ? -1 : 1;
}
/* got — ввод пользователя, exp — эталон */
function numEq(got, exp){
  if(!Number.isFinite(exp.v) || !Number.isFinite(got.v)) return got.v === exp.v;
  // Приближённый ответ: допускаем ошибку в одну единицу последнего введённого знака
  // (засчитывается и округление, и простое обрезание: 0,7165 → «0,72» и «0,71»).
  const tol = got.d > 0 ? Math.pow(10, -got.d) + 1e-12 : 1e-7 * Math.max(1, Math.abs(exp.v));
  return Math.abs(got.v - exp.v) <= tol;
}
function compareAns(type, exp, got){
  if(type === 'num') return numEq(got, exp);
  if(type === 'list' || type === 'line') return exp.length === got.length && exp.every((v,i) => numEq(got[i], v));
  if(type === 'point') return numEq(got[0], exp[0]) && numEq(got[1], exp[1]);
  // points / intervals — списки пар
  return exp.length === got.length && exp.every((pr,i) => numEq(got[i][0], pr[0]) && numEq(got[i][1], pr[1]));
}

/* -> 'ok' | 'bad' | 'err' */
function checkField(spec, input){
  const exp = PARSERS[spec.type](spec.ans);
  let got;
  try{ got = PARSERS[spec.type](input); }catch(e){ return 'err'; }
  return compareAns(spec.type, exp, got) ? 'ok' : 'bad';
}
