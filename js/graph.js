/* =====================================================================
   ГРАФИКИ (Plotly, грузится по требованию)
   ===================================================================== */
const PLOTLY_URLS = ['https://cdn.plot.ly/plotly-basic-2.35.2.min.js','https://cdn.plot.ly/plotly-2.35.2.min.js'];
let plotlyPromise = null;
function loadScript(src){
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.async = true; s.onload = res; s.onerror = () => { s.remove(); rej(new Error(src)); };
    document.head.appendChild(s);
  });
}
function loadPlotly(){
  if(window.Plotly) return Promise.resolve();
  if(!plotlyPromise){
    plotlyPromise = loadScript(PLOTLY_URLS[0]).catch(() => loadScript(PLOTLY_URLS[1]))
      .catch(e => { plotlyPromise = null; throw e; });
  }
  return plotlyPromise;
}

function sampleFn(f, x0, x1, breaks, n){
  const xs = [], ys = [];
  const dx = (x1 - x0) / n;
  let prev = -Infinity;
  for(let i = 0; i <= n; i++){
    const x = x0 + i*dx;
    // разрыв на вертикальной асимптоте — не соединяем ветви
    for(const b of breaks){ if(prev < b && x >= b){ xs.push(b); ys.push(null); } }
    let y;
    try{ y = f(x); }catch(e){ y = NaN; }
    if(!Number.isFinite(y) || Math.abs(y) > 1e6) y = null;
    xs.push(x); ys.push(y);
    prev = x;
  }
  return {xs, ys};
}

const PT_STYLE = {
  max:  {name:'максимум',         color:'#E0745F', symbol:'circle'},
  min:  {name:'минимум',          color:'#4F9A6E', symbol:'circle'},
  infl: {name:'перегиб',          color:'#E3A73B', symbol:'diamond'},
  hole: {name:'выколотая точка',  color:'#D96C6C', symbol:'circle-open'},
  pt:   {name:'точка',            color:'#8F82BF', symbol:'circle'}
};

async function drawGraph(el, g){
  try{
    await loadPlotly();
  }catch(e){
    el.innerHTML = '<div class="plot-loading">Не получилось загрузить график 😔 Проверь интернет и открой ещё раз.</div>';
    el.closest('.panel').dataset.drawn = '';
    return;
  }
  el.innerHTML = '';
  const [x0,x1] = g.x, [y0,y1] = g.y;
  const traces = [];
  const asym = {color:'#8F82BF', width:1.8, dash:'dash'};
  let firstAsym = true;
  const addAsym = (xs, ys) => {
    traces.push({x:xs, y:ys, mode:'lines', line:asym, hoverinfo:'skip', name:'асимптота', legendgroup:'a', showlegend:firstAsym});
    firstAsym = false;
  };
  (g.v||[]).forEach(a => addAsym([a,a],[y0,y1]));
  (g.h||[]).forEach(h => addAsym([h.from ?? x0, h.to ?? x1],[h.y,h.y]));
  (g.s||[]).forEach(s => { const a = s.from ?? x0, b = s.to ?? x1; addAsym([a,b],[s.k*a+s.b, s.k*b+s.b]); });

  const {xs, ys} = sampleFn(g.f, x0, x1, g.v||[], g.n||900);
  traces.push({x:xs, y:ys, mode:'lines', line:{color:'#D96C6C', width:3}, connectgaps:false, hoverinfo:'skip', showlegend:false});

  const groups = {};
  (g.pts||[]).forEach(p => (groups[p.type] = groups[p.type] || []).push(p));
  Object.entries(groups).forEach(([type, pts]) => {
    const st = PT_STYLE[type];
    const open = type === 'hole';
    traces.push({
      x:pts.map(p=>p.x), y:pts.map(p=>p.y), mode:'markers+text', name:st.name,
      text:pts.map(p=>p.label||''), textposition:pts.map(p=>p.pos||'top center'),
      textfont:{size:12, color:'#5E4E52', family:'Nunito, sans-serif'},
      marker:{size:open?11:12, color:open?'#FFFFFF':st.color, symbol:open?'circle':st.symbol,
              line:{width:open?2.5:2, color:open?st.color:'#FFFFFF'}},
      hovertemplate:'(%{x:.3~f}; %{y:.3~f})<extra>'+st.name+'</extra>'
    });
  });

  const axis = {zeroline:true, zerolinecolor:'#C9B6AD', zerolinewidth:1.4, gridcolor:'#F3E6DE', fixedrange:true, linecolor:'#E6D3C9', tickfont:{size:11}};
  const layout = {
    margin:{l:42, r:14, t:10, b:30},
    paper_bgcolor:'rgba(0,0,0,0)', plot_bgcolor:'#FFFDFB',
    xaxis:{...axis, range:[x0,x1]}, yaxis:{...axis, range:[y0,y1]},
    showlegend:true, legend:{orientation:'h', x:0, y:-0.12, yanchor:'top', font:{size:12}},
    font:{family:'Nunito, sans-serif', color:'#5E4E52'},
    hovermode:'closest', dragmode:false
  };
  try{
    Plotly.newPlot(el, traces, layout, {displayModeBar:false, responsive:true, scrollZoom:false});
  }catch(e){
    el.innerHTML = '<div class="plot-loading">Не получилось нарисовать график 😔</div>';
  }
}
