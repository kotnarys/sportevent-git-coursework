// Business rules are independent of the browser and covered by node:test.
export const SPORTS = Object.freeze({
  running: { label: 'Бег 100 м', unit: 'с', precision: 2, order: 'asc', icon: '🏃' },
  swimming: { label: 'Плавание 50 м', unit: 'с', precision: 2, order: 'asc', icon: '🏊' },
  jump: { label: 'Прыжки в длину', unit: 'м', precision: 2, order: 'desc', icon: '🏅' }
});

export function seedData() {
  return {
    version: 1,
    events: [
      { id: 'e1', name: 'Городской спринт — 2026', sport: 'running', date: '2026-11-14', place: 'Стадион «Олимп»' },
      { id: 'e2', name: 'Осенний кубок по плаванию', sport: 'swimming', date: '2026-11-21', place: 'Бассейн «Волна»' },
      { id: 'e3', name: 'Открытый турнир по прыжкам', sport: 'jump', date: '2026-12-05', place: 'Манеж «Старт»' }
    ],
    athletes: [
      { id: 'a1', name: 'Алексей Орлов', team: 'Сокол' },
      { id: 'a2', name: 'Мария Смирнова', team: 'Олимп' },
      { id: 'a3', name: 'Дмитрий Волков', team: 'Факел' },
      { id: 'a4', name: 'Елена Кузнецова', team: 'Олимп' },
      { id: 'a5', name: 'Иван Петров', team: 'Сокол' }
    ],
    registrations: [
      {eventId:'e1',athleteId:'a1'},{eventId:'e1',athleteId:'a2'},{eventId:'e1',athleteId:'a3'},
      {eventId:'e2',athleteId:'a2'},{eventId:'e2',athleteId:'a4'},{eventId:'e2',athleteId:'a5'},
      {eventId:'e3',athleteId:'a1'},{eventId:'e3',athleteId:'a3'},{eventId:'e3',athleteId:'a5'}
    ],
    results: [
      {eventId:'e1',athleteId:'a1',value:12.35},{eventId:'e1',athleteId:'a2',value:12.17},{eventId:'e1',athleteId:'a3',value:12.62},
      {eventId:'e2',athleteId:'a2',value:28.80},{eventId:'e2',athleteId:'a4',value:29.40},
      {eventId:'e3',athleteId:'a1',value:5.63},{eventId:'e3',athleteId:'a3',value:5.82}
    ]
  };
}
export function nextId(items, prefix) { let num = 1; const ids = new Set(items.map(x => x.id)); while(ids.has(prefix+num)) num++; return prefix+num; }
export function validateEvent(data) {
  if (!data || typeof data.name !== 'string' || data.name.trim().length < 4) throw new Error('Название: минимум 4 символа');
  if (!SPORTS[data.sport]) throw new Error('Выберите вид спорта');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(new Date(data.date+'T12:00:00').valueOf())) throw new Error('Укажите корректную дату');
  if (!data.place || data.place.trim().length < 3) throw new Error('Место: минимум 3 символа');
}
export function addEvent(state, values) { validateEvent(values); const data=structuredClone(state); data.events.push({id:nextId(data.events,'e'),name:values.name.trim(),sport:values.sport,date:values.date,place:values.place.trim()}); return data; }
export function addAthlete(state, values) {
  if (!values?.name || values.name.trim().length < 3) throw new Error('ФИО: минимум 3 символа');
  if (!values.team || values.team.trim().length < 2) throw new Error('Команда: минимум 2 символа');
  const data=structuredClone(state); const name=values.name.trim();
  if(data.athletes.some(x=>x.name.toLocaleLowerCase('ru')===name.toLocaleLowerCase('ru'))) throw new Error('Участник с таким именем уже существует');
  data.athletes.push({id:nextId(data.athletes,'a'),name,team:values.team.trim()});return data;
}
export function registerAthlete(state,eventId,athleteId) {
  if(!state.events.some(x=>x.id===eventId)) throw new Error('Соревнование не найдено');
  if(!state.athletes.some(x=>x.id===athleteId)) throw new Error('Участник не найден');
  if(state.registrations.some(x=>x.eventId===eventId&&x.athleteId===athleteId)) throw new Error('Участник уже зарегистрирован');
  const data=structuredClone(state);data.registrations.push({eventId,athleteId});return data;
}
export function setResult(state,eventId,athleteId,rawValue) {
  const event=state.events.find(x=>x.id===eventId);
  if(!event) throw new Error('Соревнование не найдено');
  if(!state.registrations.some(x=>x.eventId===eventId&&x.athleteId===athleteId)) throw new Error('Сначала зарегистрируйте участника');
  const value=Number(rawValue);
  if(rawValue === ''||rawValue === null||!Number.isFinite(value)||value<=0||value>10000) throw new Error('Результат должен быть положительным числом');
  const data=structuredClone(state);const old=data.results.find(x=>x.eventId===eventId&&x.athleteId===athleteId);
  if(old)old.value=value;else data.results.push({eventId,athleteId,value});return data;
}
export function getStandings(state,eventId) {
  const event=state.events.find(x=>x.id===eventId);if(!event) return [];
  const order=SPORTS[event.sport].order;
  const rows=state.registrations.filter(x=>x.eventId===eventId).map(x=>({
    athlete:state.athletes.find(a=>a.id===x.athleteId),athleteId:x.athleteId,
    result:state.results.find(r=>r.eventId===eventId&&r.athleteId===x.athleteId)?.value??null
  })).filter(x=>x.athlete);
  rows.sort((a,b)=>a.result===null?1:b.result===null?-1:(order==='asc'?a.result-b.result:b.result-a.result)||a.athlete.name.localeCompare(b.athlete.name,'ru'));
  let prev=null,rank=0;for(let i=0;i<rows.length;i++) {const row=rows[i]; if(row.result===null){row.rank=null;continue;}if(prev===null||row.result!==prev)rank=i+1;row.rank=rank;prev=row.result;}
  return rows;
}
export function formatResult(value,sport) { if(value===null||value===undefined)return '—';return `${Number(value).toFixed(SPORTS[sport].precision)} ${SPORTS[sport].unit}`; }
export function statistics(state) {return { events:state.events.length, athletes:state.athletes.length, registrations:state.registrations.length, results:state.results.length }; }
export function escapeHtml(value) {return String(value).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));}
export function resultsCsv(state,eventId) {
  const ev=state.events.find(x=>x.id===eventId);if(!ev)throw new Error('Соревнование не найдено');
  const rows=[['Место','Участник','Команда',`Результат (${SPORTS[ev.sport].unit})`],...getStandings(state,eventId).map(x=>[x.rank??'',x.athlete.name,x.athlete.team,x.result??''])];
  return '\uFEFF'+rows.map(cols=>cols.map(c=>'"'+String(c).replaceAll('"','""')+'"').join(';')).join('\r\n');
}
