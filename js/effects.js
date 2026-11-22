/* =====================================================================
   ПРАЗДНИЧНЫЕ ЭФФЕКТЫ
   ===================================================================== */
const fx = {c:null, ctx:null, parts:[], raf:0, dpr:1};
const FX_COLORS = ['#E0787A','#F2A38A','#F7C9AE','#E3A73B','#6FA584','#8F82BF','#F5B6C8'];
const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function fxResize(){
  fx.dpr = Math.min(window.devicePixelRatio || 1, 2);
  fx.c.width = innerWidth * fx.dpr; fx.c.height = innerHeight * fx.dpr;
  fx.ctx.setTransform(fx.dpr,0,0,fx.dpr,0,0);
}
function burst(x, y, n=46){
  if(reducedMotion) n = Math.round(n/4);
  for(let i=0;i<n;i++){
    const a = Math.random()*Math.PI*2, sp = 3 + Math.random()*7;
    fx.parts.push({
      x, y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp - 5, g:.22 + Math.random()*.1,
      rot:Math.random()*6, vr:(Math.random()-.5)*.3, life:0, max:70 + Math.random()*50,
      s:6 + Math.random()*7, color:FX_COLORS[i % FX_COLORS.length], heart:Math.random() < .45
    });
  }
  if(!fx.raf) fx.raf = requestAnimationFrame(fxLoop);
}
function drawHeart(ctx, s){
  ctx.beginPath();
  ctx.moveTo(0, s*.3);
  ctx.bezierCurveTo(0, 0, -s*.5, 0, -s*.5, s*.3);
  ctx.bezierCurveTo(-s*.5, s*.6, 0, s*.8, 0, s);
  ctx.bezierCurveTo(0, s*.8, s*.5, s*.6, s*.5, s*.3);
  ctx.bezierCurveTo(s*.5, 0, 0, 0, 0, s*.3);
  ctx.fill();
}
function fxLoop(){
  const ctx = fx.ctx;
  ctx.clearRect(0,0,innerWidth,innerHeight);
  fx.parts = fx.parts.filter(p => p.life < p.max && p.y < innerHeight + 30);
  for(const p of fx.parts){
    p.life++; p.vy += p.g; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - p.life/p.max);
    ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color;
    if(p.heart) drawHeart(ctx, p.s*1.6); else ctx.fillRect(-p.s/2, -p.s/4, p.s, p.s/2);
    ctx.restore();
  }
  fx.raf = fx.parts.length ? requestAnimationFrame(fxLoop) : 0;
  if(!fx.raf) ctx.clearRect(0,0,innerWidth,innerHeight);
}
function bigCelebration(){
  const w = innerWidth, h = innerHeight;
  [[.2,.35],[.8,.35],[.5,.25],[.3,.6],[.7,.6]].forEach(([fx_,fy], i) =>
    setTimeout(() => burst(w*fx_, h*fy, 70), i*260));
}

let toastTimer = 0;
const TOASTS = ['Умница! 💛','Ещё одна покорена ✨','Так держать! 🌷','Ты молодец! 💪','Красота! 🌸','Шаг за шагом — и всё получится 💛','Блестяще! ⭐'];
function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}
