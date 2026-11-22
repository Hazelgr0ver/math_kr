/* =====================================================================
   СОСТОЯНИЕ
   ===================================================================== */
const ALL = [...VARIANT1, ...VARIANT2, ...TRAINER];
const BY_ID = Object.fromEntries(ALL.map(t => [t.id, t]));
let state = { solved:{}, variant:1, finaleShown:false, envelopeSeen:false };

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const s = JSON.parse(raw);
      if(s && typeof s === 'object'){
        state.solved = (s.solved && typeof s.solved === 'object') ? s.solved : {};
        state.variant = s.variant === 2 ? 2 : 1;
        state.finaleShown = !!s.finaleShown;
        state.envelopeSeen = !!s.envelopeSeen;   // анимацию открытия конверта показываем один раз
      }
    }
  }catch(e){ /* приватный режим или повреждённые данные — просто начинаем с нуля */ }
}
function saveState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){}
}
const isSolved = id => !!state.solved[id];
const countSolved = list => list.filter(t => isSolved(t.id)).length;
