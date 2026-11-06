/**
 * Recordatorio diario sin servidor: un archivo .ics con un evento que se repite cada día.
 * En el iPhone, Safari lo abre directamente en Calendario ("Añadir").
 */
function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function buildIcs(time: string, minutes: number, now = new Date(), url = '') {
  const [h, m] = time.split(':').map(Number);
  const start = new Date(now);
  start.setHours(h, m, 0, 0);
  if (start < now) start.setDate(start.getDate() + 1);
  const end = new Date(start.getTime() + minutes * 60000);
  const local = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Idiomas de Yolanda//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:idiomas-yolanda-${start.getTime()}@local`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${local(start)}`,
    `DTEND:${local(end)}`,
    'RRULE:FREQ=DAILY',
    'SUMMARY:🇬🇧🇮🇹 Mi ratito de idiomas',
    `DESCRIPTION:${minutes} minutos de inglés o italiano. ¡Tú puedes!${url ? `\\n${url}` : ''}`,
    ...(url ? [`URL:${url}`] : []),
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Hora de practicar idiomas',
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

export function downloadReminder(time: string, minutes: number) {
  const url = window.location.href.split('#')[0];
  const ics = buildIcs(time, minutes, new Date(), url);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = 'recordatorio-idiomas.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 5000);
}
