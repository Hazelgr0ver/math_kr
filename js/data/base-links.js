/* Какие блоки раздела «Повторим базу» пригодятся в каждой задаче.
   Показываются в карточке строкой «📚 Пригодится: …», по нажатию — переход к блоку. */

const BASE_TOPICS = {
  powers:    'Степени и корни',
  frac:      'Дроби и множители',
  intervals: 'Метод интервалов',
  explog:    'Экспонента и логарифм',
  trig:      'Тригонометрия',
  limits:    'Пределы',
  deriv:     'Производные по шагам'
};

const BASE_LINKS = {
  'v1-3-1':  ['frac', 'limits', 'deriv', 'intervals'],
  'v1-3-2':  ['frac', 'limits', 'deriv', 'intervals'],
  'v1-7':    ['frac', 'deriv', 'intervals'],
  'v1-8':    ['explog', 'limits'],
  'v1-9':    ['powers', 'explog', 'deriv', 'intervals'],
  'v1-10-1': ['explog', 'limits', 'deriv'],
  'v1-10-2': ['trig', 'explog', 'limits'],

  'v2-3-1':  ['explog', 'limits', 'deriv', 'intervals'],
  'v2-3-2':  ['frac', 'limits', 'deriv', 'intervals'],
  'v2-7':    ['frac', 'deriv', 'intervals'],
  'v2-8':    ['explog', 'limits'],
  'v2-9':    ['powers', 'explog', 'deriv', 'intervals'],
  'v2-10-1': ['trig', 'limits'],
  'v2-10-2': ['explog', 'limits'],

  't1':  ['frac', 'limits', 'intervals'],
  't2':  ['explog', 'limits', 'deriv'],
  't3':  ['frac', 'intervals'],
  't4':  ['explog', 'deriv', 'frac'],
  't5':  ['explog', 'deriv'],
  't6':  ['trig', 'limits'],
  't7':  ['explog', 'limits'],
  't8':  ['explog', 'limits'],
  't9':  ['powers', 'deriv', 'intervals'],
  't10': ['explog', 'deriv', 'intervals'],
  't11': ['explog', 'deriv'],
  't12': ['trig', 'frac', 'limits'],
  't13': ['explog', 'limits'],
  't14': ['trig', 'explog', 'limits'],
  't15': ['explog', 'limits']
};
