/* =====================================================================
   ПРОВЕРКА ОТВЕТОВ
   Типы полей:
     num       — одно число/выражение:          0, 1/5, e^(-1/2)
     list      — набор чисел (порядок не важен): -2; 2   (x= можно писать)
     point     — точка:                          (3/2; 1/9)
     points    — несколько точек:                (-1; 0); (1; 0)
     intervals — объединение промежутков:        (-inf;0)U(1;inf)
     line      — прямая y = kx + b:              -3ln2*x,  x+1,  0
   Правильные ответы записаны в том же формате, что вводит пользователь,
   и проверяются тем же разборщиком.
   ===================================================================== */
const PLACEHOLDERS = {
  num:'например: 3/4,  e^2,  √2',
  list:'например: 1; -4',
  point:'например: (2; -1/4)',
  points:'например: (0; 1); (2; 3)',
  intervals:'например: (-∞; 1) ∪ (4; +∞)',
  line:'например: 2x - 3'
};

const CHECKS = {
  'v1-3-1':[
    {type:'list', label:R`Вертикальные асимптоты`, ans:'0'},
    {type:'line', label:R`Горизонтальная асимптота`, ans:'1'},
    {type:'intervals', label:'Промежутки возрастания', ans:'(-inf;0)U(1;inf)'},
    {type:'point', label:'Точка минимума', ans:'(1;0)'},
    {type:'point', label:'Точка перегиба', ans:'(3/2;1/9)'}],
  'v1-3-2':[
    {type:'list', label:R`Вертикальные асимптоты`, ans:'-2;2'},
    {type:'line', label:R`Горизонтальная асимптота`, ans:'0'},
    {type:'intervals', label:'Где график выпуклый вниз (∪)', ans:'(-2;0)U(2;inf)'},
    {type:'point', label:'Точка перегиба', ans:'(0;0)'}],
  'v1-7':[
    {type:'intervals', label:'Выпуклый вниз (∪) на', ans:'(-inf;-3)U(2;inf)'},
    {type:'intervals', label:'Выпуклый вверх (∩) на', ans:'(-3;2)'},
    {type:'point', label:'Точка перегиба', ans:'(2;0)'}],
  'v1-8':[
    {type:'list', label:R`Вертикальные асимптоты`, ans:'3'},
    {type:'line', label:R`Асимптота при $x\to-\infty$`, ans:'-3ln2*x'},
    {type:'line', label:R`Асимптота при $x\to+\infty$`, ans:'0'}],
  'v1-9':[
    {type:'intervals', label:'Промежутки возрастания', ans:'(0;1/5)'},
    {type:'num', label:R`Точка минимума: $x_{\min}=$`, ans:'0'},
    {type:'num', label:R`Точка максимума: $x_{\max}=$`, ans:'1/5'},
    {type:'num', label:R`Значение максимума: $y_{\max}=$`, ans:'(1/5)^(2/5)*e^(-2/5)'}],
  'v1-10-1':[{type:'num', label:'Значение предела', ans:'0'}],
  'v1-10-2':[{type:'num', label:'Значение предела', ans:'1'}],

  'v2-3-1':[
    {type:'list', label:R`Вертикальные асимптоты`, ans:'0'},
    {type:'line', label:R`Горизонтальная асимптота (при $x\to+\infty$)`, ans:'0'},
    {type:'intervals', label:'Промежутки возрастания', ans:'(-inf;-1)'},
    {type:'point', label:'Точка максимума', ans:'(-1;-e)'},
    {type:'intervals', label:'Где график выпуклый вниз (∪)', ans:'(0;inf)'}],
  'v2-3-2':[
    {type:'list', label:R`Вертикальные асимптоты`, ans:'0;2'},
    {type:'line', label:R`Горизонтальная асимптота`, ans:'0'},
    {type:'intervals', label:'Где график выпуклый вниз (∪)', ans:'(0;1)U(2;inf)'},
    {type:'point', label:'Точка перегиба', ans:'(1;0)'}],
  'v2-7':[
    {type:'intervals', label:'Выпуклый вниз (∪) на', ans:'(-inf;-5)U(1;inf)'},
    {type:'intervals', label:'Выпуклый вверх (∩) на', ans:'(-5;1)'},
    {type:'point', label:'Точка перегиба', ans:'(-5;1/72)'}],
  'v2-8':[
    {type:'list', label:R`Вертикальные асимптоты`, ans:'0;1'},
    {type:'line', label:R`Асимптота при $x\to-\infty$`, ans:'-ln2'},
    {type:'line', label:R`Асимптота при $x\to+\infty$`, ans:'x*ln2'}],
  'v2-9':[
    {type:'intervals', label:'Промежутки возрастания', ans:'(-inf;1)'},
    {type:'point', label:'Точка максимума', ans:'(1;e^(-1/3))'}],
  'v2-10-1':[{type:'num', label:'Значение предела', ans:'2'}],
  'v2-10-2':[{type:'num', label:'Значение предела', ans:'e'}],

  't1':[
    {type:'list', label:R`Вертикальные асимптоты`, ans:'1'},
    {type:'line', label:R`Наклонная асимптота`, ans:'x+1'},
    {type:'point', label:'Точка максимума', ans:'(0;0)'},
    {type:'point', label:'Точка минимума', ans:'(2;4)'}],
  't2':[
    {type:'line', label:R`Асимптота при $x\to+\infty$`, ans:'0'},
    {type:'point', label:'Точка максимума', ans:'(1;1/e)'},
    {type:'point', label:'Точка перегиба', ans:'(2;2/e^2)'}],
  't3':[
    {type:'intervals', label:'Выпуклый вверх (∩) на', ans:'(-1;1)'},
    {type:'points', label:'Точки перегиба (все)', ans:'(-1;0);(1;0)'}],
  't4':[
    {type:'intervals', label:'Выпуклый вниз (∪) на', ans:'(-1;1)'},
    {type:'points', label:'Точки перегиба (все)', ans:'(-1;ln2);(1;ln2)'}],
  't5':[
    {type:'intervals', label:'Выпуклый вниз (∪) на', ans:'(-2;inf)'},
    {type:'point', label:'Точка перегиба', ans:'(-2;-2/e^2)'}],
  't6':[
    {type:'line', label:R`Асимптота при $x\to+\infty$`, ans:'x+pi/2'},
    {type:'line', label:R`Асимптота при $x\to-\infty$`, ans:'x-pi/2'}],
  't7':[
    {type:'line', label:R`Асимптота при $x\to-\infty$`, ans:'0'},
    {type:'line', label:R`Асимптота при $x\to+\infty$`, ans:'2ln2*x'}],
  't8':[
    {type:'list', label:R`Вертикальные асимптоты`, ans:'-1'},
    {type:'line', label:R`Горизонтальная асимптота`, ans:'1'}],
  't9':[
    {type:'num', label:R`Точка максимума: $x_{\max}=$`, ans:'0'},
    {type:'point', label:'Точка минимума', ans:'(2;-3cbrt(4))'}],
  't10':[
    {type:'num', label:R`Точка минимума: $x_{\min}=$`, ans:'0'},
    {type:'point', label:'Точка максимума', ans:'(2;4/e^2)'}],
  't11':[
    {type:'intervals', label:'Промежутки возрастания', ans:'(0;e)'},
    {type:'point', label:'Точка максимума', ans:'(e;1/e)'}],
  't12':[{type:'num', label:'Значение предела', ans:'0'}],
  't13':[{type:'num', label:'Значение предела', ans:'1'}],
  't14':[{type:'num', label:'Значение предела', ans:'e^(-1/2)'}],
  't15':[{type:'num', label:'Значение предела', ans:'1'}]
};
