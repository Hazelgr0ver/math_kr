/* Уведомления в Telegram о том, что происходит на сайте.
   Без своего сервера: браузер сам отправляет запрос к Telegram Bot API.
   Кто есть кто — по личной ссылке с ключом (?k=...), см. config.js. */

const WHO_KEY = 'alinka-matan-who';        // 'alinka' | 'owner' | нет
const DEVICE_KEY = 'alinka-matan-device';  // короткий случайный номер устройства
const THROTTLE_KEY = 'alinka-matan-notify-times';

function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }

/* Читаем ключ из ссылки, запоминаем устройство и убираем ключ из адресной строки. */
function identifyVisitor(){
  try{
    const url = new URL(location.href);
    const k = url.searchParams.get('k');
    if(k){
      if(k === ALINKA_KEY) lsSet(WHO_KEY, 'alinka');
      else if(k === OWNER_KEY){ lsSet(WHO_KEY, 'owner'); setTimeout(() => toast('Это устройство помечено как твоё — уведомлений с него не будет 🔕'), 800); }
      url.searchParams.delete('k');
      history.replaceState(null, '', url.pathname + (url.search || '') + url.hash);
    }
  }catch(e){}
  if(!lsGet(DEVICE_KEY)) lsSet(DEVICE_KEY, Math.random().toString(16).slice(2, 6));
}

function deviceLabel(){
  const ua = navigator.userAgent || '';
  const os = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' :
             /Windows/.test(ua) ? 'Windows' : /Mac OS X|Macintosh/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : 'устройство';
  const br = /YaBrowser/.test(ua) ? 'Яндекс Браузер' : /Edg\//.test(ua) ? 'Edge' : /OPR\/|Opera/.test(ua) ? 'Opera' :
             /Telegram/.test(ua) ? 'Telegram' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' :
             /Safari\//.test(ua) ? 'Safari' : 'браузер';
  return `#${lsGet(DEVICE_KEY) || '????'} · ${os} · ${br}`;
}

const isAlinka = () => lsGet(WHO_KEY) === 'alinka';
const isOwner  = () => lsGet(WHO_KEY) === 'owner';
const isLocalRun = () => location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

/* Программы-проверялки ссылок (антивирусы, превью, поисковики) открывают сайт в «невидимом» браузере.
   Отсеиваем явных: управляемые программой браузеры и с пометками робота в описании. */
function isBot(){
  try{ if(navigator.webdriver) return true; }catch(e){}
  return /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|inspect|scan|facebookexternalhit|whatsapp|vkshare|bingpreview|phantom|puppeteer|playwright|selenium/i
    .test(navigator.userAgent || '');
}

function notifyEnabled(){
  if(!TG_BOT_TOKEN || !TG_CHAT_ID) return false;
  if(isOwner()) return false;
  if(isLocalRun() && !NOTIFY_ON_LOCALHOST) return false;
  if(isBot()) return false;
  return true;
}

/* Откуда пришли на сайт (по заголовку Referer). */
function referrerLabel(){
  let host = '';
  try{ host = document.referrer ? new URL(document.referrer).hostname : ''; }catch(e){}
  if(!host || host === location.hostname) return 'открыли напрямую (ссылкой или закладкой)';
  if(/t\.me|telegram/.test(host)) return 'из Telegram';
  if(/vk\.com|vk\.ru/.test(host)) return 'из ВКонтакте';
  if(/github/.test(host)) return 'с GitHub';
  return 'с ' + host;
}

/* Не чаще раза в N минут для данного ключа (на этом устройстве). */
function throttleOk(key, minutes){
  let times = {};
  try{ times = JSON.parse(lsGet(THROTTLE_KEY) || '{}') || {}; }catch(e){}
  const now = Date.now();
  if(times[key] && now - times[key] < minutes * 60000) return false;
  times[key] = now; lsSet(THROTTLE_KEY, JSON.stringify(times));
  return true;
}

function progressLine(){
  const g = goalState();
  return `Прогресс до конверта: ${g.points}/${g.goal} (вариант 1: ${g.v1}/${VARIANT1.length}, вариант 2: ${g.v2}/${VARIANT2.length}, тренажёр: ${g.tr})`;
}

/* text — {alinka: '...', other: '...'}; extra — дополнительная строка. */
function notify(text, extra){
  if(!notifyEnabled()) return;
  const who = isAlinka() ? text.alinka : `${text.other} (не по ссылке Алинки)`;
  const msg = [who, extra, progressLine(), `Устройство: ${deviceLabel()}`].filter(Boolean).join('\n');
  const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`;
  const body = new URLSearchParams({chat_id: TG_CHAT_ID, text: msg, disable_web_page_preview: 'true'});
  // sendBeacon доходит даже если страницу сразу закрыли; запасной вариант — обычный fetch
  try{ if(navigator.sendBeacon && navigator.sendBeacon(url, body)) return; }catch(e){}
  try{ fetch(url, {method:'POST', mode:'no-cors', body}).catch(() => {}); }catch(e){}
}

/* ---------- События ---------- */
/* Заход засчитываем только после действия человека (касание, клик, колёсико, клавиша):
   проверялки ссылок страницу открывают, но не трогают. */
function notifyVisit(){
  if(!NOTIFY_EVENTS.visit || !notifyEnabled()) return;
  const ref = referrerLabel();          // запоминаем сразу, пока страница не менялась
  const EVENTS = ['pointerdown', 'touchstart', 'wheel', 'keydown'];
  const onHuman = () => {
    EVENTS.forEach(ev => removeEventListener(ev, onHuman, true));
    if(!notifyEnabled() || !throttleOk('visit', NOTIFY_VISIT_EVERY_MIN)) return;
    notify({alinka:`👀 ${NAME} зашла на сайт`, other:'👀 На сайт зашёл неизвестный посетитель'}, `Переход: ${ref}`);
  };
  EVENTS.forEach(ev => addEventListener(ev, onHuman, {capture:true, passive:true}));
}
function notifyPeek(){
  if(!NOTIFY_EVENTS.peek) return;
  notify({alinka:`🙈 ${NAME} подглядела открытку раньше времени`, other:'🙈 Неизвестный посетитель подглядел открытку'});
}
function notifyUnlocked(){
  if(!NOTIFY_EVENTS.unlocked) return;
  notify({alinka:`🎉 ${NAME} дорешала до конверта!`, other:'🎉 Неизвестный посетитель дорешал до конверта'},
         'Конверт с приглашением открылся.');
}
function notifyCardOpened(envelopeOpen, firstReveal){
  if(!NOTIFY_EVENTS.cardOpened) return;
  // повторные открытия — не чаще раза в 10 минут; первое открытие конверта — всегда
  if(!firstReveal && !throttleOk('card', 10)) return;
  const extra = firstReveal ? 'Конверт открыт — она прочитала приглашение 💌'
              : envelopeOpen ? 'Конверт уже был открыт.'
              : 'Конверт ещё запечатан.';
  notify({alinka:`💌 ${NAME} открыла открытку`, other:'💌 Неизвестный посетитель открыл открытку'}, extra);
}
