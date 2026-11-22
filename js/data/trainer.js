/* Тренажёр: темы и дополнительные задачи. */

/* ---------- ТРЕНАЖЁР ---------- */
const TOPICS = [
  {id:'study',  icon:'🔍', name:'Полное исследование функции', desc:'Как №3'},
  {id:'convex', icon:'〰️', name:'Выпуклость и перегибы',       desc:'Как №7'},
  {id:'asym',   icon:'↗️', name:'Асимптоты',                    desc:'Как №8'},
  {id:'mono',   icon:'⛰️', name:'Монотонность и экстремумы',    desc:'Как №9'},
  {id:'lim',    icon:'∞',  name:'Правило Лопиталя',             desc:'Как №10'}
];

const TRAINER = [
/* ---- Полное исследование ---- */
{
  id:'t1', topicId:'study', num:'Т1', topic:'Полное исследование',
  q: R`Проведите полное исследование функции: $$y=\frac{x^2}{x-1}$$`,
  hint:[R`Выдели целую часть: $\frac{x^2}{x-1}=x+1+\frac{1}{x-1}$. Из неё сразу видна наклонная асимптота, а производные считаются в одну строку.`],
  steps:[
    {t:'ООФ, нули, знаки', b:R`<p>$x\ne1$; функция общего вида; ноль $(0;0)$. $y > 0$ при $x > 1$, $y < 0$ при $x < 1$, $x\ne0$.</p>`},
    {t:'Асимптоты', b:R`<p>$\lim\limits_{x\to1^+}y=+\infty$, $\lim\limits_{x\to1^-}y=-\infty$, значит, $x=1$ — вертикальная асимптота.</p>
      $$k=\lim_{x\to\pm\infty}\frac{x}{x-1}=1,\qquad b=\lim_{x\to\pm\infty}\left(\frac{x^2}{x-1}-x\right)=\lim_{x\to\pm\infty}\frac{x}{x-1}=1$$
      <p>Наклонная асимптота $y=x+1$.</p>`},
    {t:'Первая производная', b:R`$$y'=1-\frac{1}{(x-1)^2}=\frac{x^2-2x}{(x-1)^2}=\frac{x(x-2)}{(x-1)^2}$$`,
      table:[['$x$','$(-\infty;0)$','$0$','$(0;1)$','$1$','$(1;2)$','$2$','$(2;+\infty)$'],["$y'$",'+','0','−','∄','−','0','+'],['$y$','↗','max','↘','—','↘','min','↗']],
      after:R`<p>Максимум $(0;0)$, минимум $(2;4)$.</p>`},
    {t:'Вторая производная', b:R`$$y''=\left(1-(x-1)^{-2}\right)'=\frac{2}{(x-1)^3}$$
      <p>∩ при $x < 1$, ∪ при $x > 1$. Перегибов нет, так как $x=1\notin D$.</p>`}
  ],
  answer:R`<ul><li>Асимптоты: $x=1$, $y=x+1$.</li><li>Возрастает на $(-\infty;0)$ и $(2;+\infty)$; убывает на $(0;1)$ и $(1;2)$.</li><li>max $(0;0)$, min $(2;4)$.</li><li>∩ при $x < 1$, ∪ при $x > 1$; перегибов нет.</li></ul>`,
  graph:{ f:x=>x*x/(x-1), x:[-5,7], y:[-12,14], v:[1], s:[{k:1,b:1}],
    pts:[{x:0,y:0,type:'max',label:'max (0; 0)',pos:'top left'},{x:2,y:4,type:'min',label:'min (2; 4)',pos:'bottom right'}] }
},
{
  id:'t2', topicId:'study', num:'Т2', topic:'Полное исследование',
  q: R`Проведите полное исследование функции: $$y=x\,e^{-x}$$`,
  hint:[R`Вертикальных асимптот нет: функция непрерывна на $\mathbb{R}$. Для $x\to+\infty$ вспомни, что экспонента растёт быстрее $x$. На $-\infty$ проверь, есть ли наклонная.`],
  steps:[
    {t:'ООФ, нули', b:R`<p>$D=\mathbb{R}$, функция общего вида, ноль $(0;0)$; $y < 0$ при $x < 0$, $y > 0$ при $x > 0$.</p>`},
    {t:'Асимптоты', b:R`<p>Вертикальных нет. При $x\to+\infty$: $\frac{x}{e^x}\to\frac{1}{e^x}\to0$ (Лопиталь), так что $y=0$ — горизонтальная асимптота.</p>
      <p>При $x\to-\infty$: $y\to-\infty$, $k=\lim e^{-x}=+\infty$, поэтому наклонной нет.</p>`},
    {t:'Первая производная', b:R`$$y'=e^{-x}-x\,e^{-x}=e^{-x}(1-x)$$
      <p>Возрастает на $(-\infty;1)$, убывает на $(1;+\infty)$. Максимум $\left(1;\frac1e\right)$.</p>`},
    {t:'Вторая производная', b:R`$$y''=-e^{-x}(1-x)-e^{-x}=e^{-x}(x-2)$$
      <p>∩ при $x < 2$, ∪ при $x > 2$. Перегиб $\left(2;\frac{2}{e^2}\right)$.</p>`}
  ],
  answer:R`<ul><li>Асимптота $y=0$ при $x\to+\infty$; других нет.</li><li>↗ на $(-\infty;1)$, ↘ на $(1;+\infty)$; max $\left(1;\frac1e\right)$.</li><li>∩ при $x < 2$, ∪ при $x > 2$; перегиб $\left(2;\frac{2}{e^2}\right)$.</li></ul>`,
  graph:{ f:x=>x*Math.exp(-x), x:[-1.5,8], y:[-1.5,0.8], h:[{y:0,from:0,to:8}],
    pts:[{x:1,y:1/Math.E,type:'max',label:'max (1; 1/e)',pos:'top center'},{x:2,y:2/Math.E**2,type:'infl',label:'перегиб',pos:'top right'}] }
},
/* ---- Выпуклость ---- */
{
  id:'t3', topicId:'convex', num:'Т3', topic:'Выпуклость',
  q: R`Найдите интервалы выпуклости и точки перегиба: $$y=x^4-6x^2+5$$`,
  hint:[R`Две производные подряд, затем разложи $y''$ на множители.`],
  steps:[
    {t:'Производные', b:R`$$y'=4x^3-12x,\qquad y''=12x^2-12=12(x-1)(x+1)$$`},
    {t:'Знаки', b:'', table:[['$x$','$(-\infty;-1)$','$-1$','$(-1;1)$','$1$','$(1;+\infty)$'],["$y''$",'+','0','−','0','+'],['$y$','∪','перегиб','∩','перегиб','∪']]},
    {t:'Точки перегиба', b:R`<p>$y(\pm1)=1-6+5=0$. Перегибы $(-1;0)$ и $(1;0)$ (функция чётная, всё симметрично).</p>`}
  ],
  answer:R`<p>∪ на $(-\infty;-1)$ и $(1;+\infty)$, ∩ на $(-1;1)$; перегибы $(-1;0)$, $(1;0)$.</p>`,
  graph:{ f:x=>x**4-6*x*x+5, x:[-3,3], y:[-5.5,10],
    pts:[{x:-1,y:0,type:'infl',label:'(−1; 0)',pos:'top left'},{x:1,y:0,type:'infl',label:'(1; 0)',pos:'top right'}] }
},
{
  id:'t4', topicId:'convex', num:'Т4', topic:'Выпуклость',
  q: R`Найдите интервалы выпуклости и точки перегиба: $$y=\ln(1+x^2)$$`,
  hint:[R`$y'=\frac{2x}{1+x^2}$; дальше производная частного. Знаменатель $y''$ всегда положителен.`],
  steps:[
    {t:'ООФ', b:R`<p>$1+x^2 > 0$, значит, $D=\mathbb{R}$.</p>`},
    {t:'Производные', b:R`$$y'=\frac{2x}{1+x^2},\qquad y''=\frac{2(1+x^2)-2x\cdot2x}{(1+x^2)^2}=\frac{2(1-x^2)}{(1+x^2)^2}$$`},
    {t:'Знаки', b:'', table:[['$x$','$(-\infty;-1)$','$-1$','$(-1;1)$','$1$','$(1;+\infty)$'],["$y''$",'−','0','+','0','−'],['$y$','∩','перегиб','∪','перегиб','∩']]},
    {t:'Точки перегиба', b:R`<p>$y(\pm1)=\ln2$. Перегибы $(-1;\ln2)$ и $(1;\ln2)$.</p>`}
  ],
  answer:R`<p>∩ на $(-\infty;-1)$ и $(1;+\infty)$, ∪ на $(-1;1)$; перегибы $(\pm1;\ln2)$.</p>`,
  graph:{ f:x=>Math.log(1+x*x), x:[-4,4], y:[-0.5,3],
    pts:[{x:-1,y:Math.LN2,type:'infl',label:'(−1; ln2)',pos:'top left'},{x:1,y:Math.LN2,type:'infl',label:'(1; ln2)',pos:'top right'}] }
},
{
  id:'t5', topicId:'convex', num:'Т5', topic:'Выпуклость',
  q: R`Найдите интервалы выпуклости и точки перегиба: $$y=x\,e^{x}$$`,
  hint:[R`Каждое дифференцирование произведения $x\,e^x$ просто добавляет к скобке единицу.`],
  steps:[
    {t:'Производные', b:R`$$y'=e^x+x\,e^x=e^x(x+1),\qquad y''=e^x(x+1)+e^x=e^x(x+2)$$`},
    {t:'Знак', b:R`<p>$e^x > 0$, знак $y''$ — как у $x+2$: ∩ при $x < -2$, ∪ при $x > -2$.</p>`},
    {t:'Точка перегиба', b:R`<p>$y(-2)=-2e^{-2}=-\frac{2}{e^2}$. Перегиб $\left(-2;-\frac{2}{e^2}\right)$.</p>`}
  ],
  answer:R`<p>∩ на $(-\infty;-2)$, ∪ на $(-2;+\infty)$; перегиб $\left(-2;-\frac{2}{e^2}\right)$.</p>`,
  graph:{ f:x=>x*Math.exp(x), x:[-7,1.5], y:[-0.8,1.5], h:[{y:0,from:-7,to:0}],
    pts:[{x:-2,y:-2/Math.E**2,type:'infl',label:'перегиб',pos:'bottom left'},{x:-1,y:-1/Math.E,type:'min',label:'min',pos:'bottom right'}] }
},
/* ---- Асимптоты ---- */
{
  id:'t6', topicId:'asym', num:'Т6', topic:'Асимптоты',
  q: R`Найдите асимптоты графика функции: $$y=x+\operatorname{arctg}x$$`,
  hint:[R`Вспомни, к чему стремится $\operatorname{arctg}x$ при $x\to+\infty$ и при $x\to-\infty$. Концы придётся считать отдельно!`],
  steps:[
    {t:'Вертикальные', b:R`<p>$D=\mathbb{R}$, функция непрерывна, вертикальных асимптот нет.</p>`},
    {t:'x → +∞', b:R`$$k=\lim_{x\to+\infty}\left(1+\frac{\operatorname{arctg}x}{x}\right)=1,\qquad b=\lim_{x\to+\infty}\operatorname{arctg}x=\frac\pi2$$
      <p>$y=x+\frac\pi2$.</p>`},
    {t:'x → −∞', b:R`<p>$k=1$, $b=\lim\limits_{x\to-\infty}\operatorname{arctg}x=-\frac\pi2$, так что $y=x-\frac\pi2$.</p>
      <div class="note">Мораль: на $+\infty$ и $-\infty$ асимптоты бывают разными!</div>`}
  ],
  answer:R`<p>Вертикальных нет; наклонные $y=x+\frac\pi2$ (при $x\to+\infty$) и $y=x-\frac\pi2$ (при $x\to-\infty$).</p>`,
  graph:{ f:x=>x+Math.atan(x), x:[-6,6], y:[-8,8], s:[{k:1,b:Math.PI/2,from:0,to:6},{k:1,b:-Math.PI/2,from:-6,to:0}],
    pts:[{x:0,y:0,type:'infl',label:'перегиб',pos:'bottom right'}] }
},
{
  id:'t7', topicId:'asym', num:'Т7', topic:'Асимптоты',
  q: R`Найдите асимптоты графика функции: $$y=\ln\left(4^x+1\right)$$`,
  hint:[R`При $x\to+\infty$ вынеси $4^x$ из-под логарифма: $\ln(4^x+1)=x\ln4+\ln(1+4^{-x})$.`],
  steps:[
    {t:'Вертикальные', b:R`<p>$4^x+1 > 1$, поэтому $D=\mathbb{R}$, функция непрерывна, вертикальных асимптот нет.</p>`},
    {t:'x → −∞', b:R`<p>$4^x\to0$, $y\to\ln1=0$. Горизонтальная асимптота $y=0$.</p>`},
    {t:'x → +∞', b:R`$$k=\lim_{x\to+\infty}\frac{\ln(4^x+1)}{x}\overset{\text{Л}}{=}\lim_{x\to+\infty}\frac{4^x\ln4}{4^x+1}=\ln4$$
      $$b=\lim_{x\to+\infty}\bigl(\ln(4^x+1)-x\ln4\bigr)=\lim_{x\to+\infty}\ln\left(1+4^{-x}\right)=0$$
      <p>Наклонная $y=x\ln4=2\ln2\cdot x$.</p>`}
  ],
  answer:R`<p>$y=0$ при $x\to-\infty$; $y=2\ln2\cdot x$ при $x\to+\infty$; вертикальных нет.</p>`,
  graph:{ f:x=>Math.log(4**x+1), x:[-4,4], y:[-0.6,6], h:[{y:0,from:-4,to:0}], s:[{k:2*Math.LN2,b:0,from:0,to:4}], pts:[] }
},
{
  id:'t8', topicId:'asym', num:'Т8', topic:'Асимптоты',
  q: R`Найдите асимптоты графика функции: $$y=x\ln\left(1+\frac1x\right)$$`,
  hint:[R`ООФ: $\frac{x+1}{x} > 0$. Проверь обе границы ООФ, как в №8 варианта 1. На бесконечности — замена $t=\frac1x$.`],
  steps:[
    {t:'ООФ', b:R`<p>$1+\frac1x=\frac{x+1}{x} > 0$, значит, $x < -1$ или $x > 0$.</p>`},
    {t:'Граница x = 0 (справа)', b:R`<p>$y=x\ln(x+1)-x\ln x\to0-0=0$ (так как $x\ln x\to0$). Асимптоты нет.</p>`},
    {t:'Граница x = −1 (слева)', b:R`<p>$\frac{x+1}{x}\to+0$, логарифм $\to-\infty$, умножаем на $x\to-1$: $y\to+\infty$. Значит, $x=-1$ — вертикальная асимптота.</p>`},
    {t:'x → ±∞', b:R`$$\lim_{x\to\pm\infty}x\ln\left(1+\frac1x\right)=\lim_{t\to0}\frac{\ln(1+t)}{t}=1$$
      <p>Горизонтальная асимптота $y=1$ (на обоих концах).</p>`}
  ],
  answer:R`<p>Вертикальная $x=-1$; горизонтальная $y=1$; в $x=0$ асимптоты нет ($y\to0$).</p>`,
  graph:{ f:x=>{const r=1+1/x;return r>0?x*Math.log(r):NaN}, x:[-6,6], y:[-0.5,4], v:[-1], h:[{y:1}], n:1400,
    pts:[{x:0,y:0,type:'hole',label:'',pos:'top center'}] }
},
/* ---- Монотонность ---- */
{
  id:'t9', topicId:'mono', num:'Т9', topic:'Монотонность',
  q: R`Найдите интервалы монотонности и экстремумы: $$y=x^{2/3}(x-5)$$`,
  hint:[R`Раскрой скобки: $y=x^{5/3}-5x^{2/3}$. Точку, где $y'$ не существует, тоже проверь!`],
  steps:[
    {t:'Производная', b:R`$$y'=\frac53x^{2/3}-\frac{10}{3}x^{-1/3}=\frac53x^{-1/3}(x-2)=\frac{5(x-2)}{3\sqrt[3]{x}}$$`},
    {t:'Знаки', b:'', table:[['$x$','$(-\infty;0)$','$0$','$(0;2)$','$2$','$(2;+\infty)$'],["$y'$",'+','∄','−','0','+'],['$y$','↗','max','↘','min','↗']]},
    {t:'Экстремумы', b:R`<p>Максимум $(0;0)$ — там производная не существует. Минимум при $x=2$: $y=2^{2/3}\cdot(-3)=-3\sqrt[3]{4}\approx-4{,}76$.</p>`}
  ],
  answer:R`<p>↗ на $(-\infty;0)$ и $(2;+\infty)$, ↘ на $(0;2)$; max $(0;0)$, min $\left(2;-3\sqrt[3]{4}\right)$.</p>`,
  graph:{ f:x=>Math.cbrt(x)**2*(x-5), x:[-3,7], y:[-8,6], n:1400,
    pts:[{x:0,y:0,type:'max',label:'max (0; 0)',pos:'top center'},{x:2,y:-3*Math.cbrt(4),type:'min',label:'min',pos:'bottom center'}] }
},
{
  id:'t10', topicId:'mono', num:'Т10', topic:'Монотонность',
  q: R`Найдите интервалы монотонности и экстремумы: $$y=x^2e^{-x}$$`,
  hint:[R`Вынеси $x\,e^{-x}$ за скобку в производной.`],
  steps:[
    {t:'Производная', b:R`$$y'=2x\,e^{-x}-x^2e^{-x}=x(2-x)e^{-x}$$`},
    {t:'Знаки', b:'', table:[['$x$','$(-\infty;0)$','$0$','$(0;2)$','$2$','$(2;+\infty)$'],["$y'$",'−','0','+','0','−'],['$y$','↘','min','↗','max','↘']]},
    {t:'Экстремумы', b:R`<p>Минимум $(0;0)$, максимум $\left(2;\frac{4}{e^2}\right)\approx(2;0{,}54)$.</p>`}
  ],
  answer:R`<p>↘ на $(-\infty;0)$ и $(2;+\infty)$, ↗ на $(0;2)$; min $(0;0)$, max $\left(2;\frac4{e^2}\right)$.</p>`,
  graph:{ f:x=>x*x*Math.exp(-x), x:[-1.5,8], y:[-0.3,1.5], h:[{y:0,from:0,to:8}],
    pts:[{x:0,y:0,type:'min',label:'min (0; 0)',pos:'bottom right'},{x:2,y:4/Math.E**2,type:'max',label:'max (2; 4/e²)',pos:'top right'}] }
},
{
  id:'t11', topicId:'mono', num:'Т11', topic:'Монотонность',
  q: R`Найдите интервалы монотонности и экстремумы: $$y=\frac{\ln x}{x}$$`,
  hint:[R`Не забудь ООФ: $x > 0$. Производная частного.`],
  steps:[
    {t:'ООФ', b:R`<p>$x > 0$.</p>`},
    {t:'Производная', b:R`$$y'=\frac{\frac1x\cdot x-\ln x}{x^2}=\frac{1-\ln x}{x^2}$$
      <p>$y'=0\iff\ln x=1\iff x=e$.</p>`},
    {t:'Знаки и экстремум', b:R`<p>$y' > 0$ на $(0;e)$, $y' < 0$ на $(e;+\infty)$. Максимум $\left(e;\frac1e\right)$.</p>`}
  ],
  answer:R`<p>↗ на $(0;e)$, ↘ на $(e;+\infty)$; max $\left(e;\frac1e\right)$.</p>`,
  graph:{ f:x=>x>0?Math.log(x)/x:NaN, x:[-0.5,10], y:[-3,0.9], v:[0], h:[{y:0,from:1,to:10}], n:1400,
    pts:[{x:Math.E,y:1/Math.E,type:'max',label:'max (e; 1/e)',pos:'top right'}] }
},
/* ---- Лопиталь ---- */
{
  id:'t12', topicId:'lim', num:'Т12', topic:'∞ − ∞',
  q: R`Вычислите предел: $$\lim_{x\to0}\left(\frac1x-\frac{1}{\sin x}\right)$$`,
  hint:[R`Вид $\infty-\infty$. Приведи к общему знаменателю, получится $\frac00$. Лопиталя может понадобиться применить дважды.`],
  steps:[
    {t:'Общий знаменатель', b:R`$$\frac1x-\frac{1}{\sin x}=\frac{\sin x-x}{x\sin x}=\left[\frac00\right]$$`},
    {t:'Лопиталь (1)', b:R`$$\lim_{x\to0}\frac{\cos x-1}{\sin x+x\cos x}=\left[\frac00\right]$$`},
    {t:'Лопиталь (2)', b:R`$$\lim_{x\to0}\frac{-\sin x}{\cos x+\cos x-x\sin x}=\frac{0}{2}=0$$`}
  ],
  answer:R`$$\lim_{x\to0}\left(\frac1x-\frac1{\sin x}\right)=0$$`
},
{
  id:'t13', topicId:'lim', num:'Т13', topic:'0⁰',
  q: R`Вычислите предел: $$\lim_{x\to0^+}x^x$$`,
  hint:[R`Вид $0^0$: логарифмируй. $\ln y=x\ln x$ — это $0\cdot\infty$.`],
  steps:[
    {t:'Логарифмируем', b:R`$$\ln y=x\ln x=\frac{\ln x}{1/x}=\left[\frac{\infty}{\infty}\right]$$`},
    {t:'Лопиталь', b:R`$$\lim_{x\to0^+}\frac{1/x}{-1/x^2}=\lim_{x\to0^+}(-x)=0$$`},
    {t:'Ответ', b:R`$$\lim y=e^0=1$$`}
  ],
  answer:R`$$\lim_{x\to0^+}x^x=1$$`
},
{
  id:'t14', topicId:'lim', num:'Т14', topic:'1^∞',
  q: R`Вычислите предел: $$\lim_{x\to0}(\cos x)^{1/x^2}$$`,
  hint:[R`Вид $1^\infty$. $\ln y=\frac{\ln\cos x}{x^2}$ — это $\frac00$.`],
  steps:[
    {t:'Логарифмируем', b:R`$$\ln y=\frac{\ln\cos x}{x^2}=\left[\frac00\right]$$`},
    {t:'Лопиталь', b:R`$$\lim_{x\to0}\frac{-\frac{\sin x}{\cos x}}{2x}=-\frac12\lim_{x\to0}\frac{\operatorname{tg}x}{x}=-\frac12$$`},
    {t:'Ответ', b:R`$$\lim y=e^{-1/2}=\frac{1}{\sqrt e}$$`}
  ],
  answer:R`$$\lim_{x\to0}(\cos x)^{1/x^2}=e^{-1/2}=\frac{1}{\sqrt{e}}$$`
},
{
  id:'t15', topicId:'lim', num:'Т15', topic:'∞⁰',
  q: R`Вычислите предел: $$\lim_{x\to+\infty}x^{1/x}$$`,
  hint:[R`Вид $\infty^0$. $\ln y=\frac{\ln x}{x}$. Кто растёт быстрее — $\ln x$ или $x$?`],
  steps:[
    {t:'Логарифмируем', b:R`$$\ln y=\frac{\ln x}{x}=\left[\frac\infty\infty\right]$$`},
    {t:'Лопиталь', b:R`$$\lim_{x\to+\infty}\frac{1/x}{1}=0$$`},
    {t:'Ответ', b:R`$$\lim y=e^0=1$$`}
  ],
  answer:R`$$\lim_{x\to+\infty}x^{1/x}=1$$`
}
];
