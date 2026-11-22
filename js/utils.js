/* Общие помощники. Подключается первым. */

// Формулы в данных пишутся через String.raw, чтобы не экранировать обратные слэши LaTeX.
const R = String.raw;

/* ---------- Утилиты ---------- */
function escapeHTML(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function plural(n, one, few, many){
  const m10 = n % 10, m100 = n % 100;
  if(m10 === 1 && m100 !== 11) return one;
  if(m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}
