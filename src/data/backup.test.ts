import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { YolandaDB } from './db';
import { exportBackup, importBackup, validateBackup } from './backup';
import { buildIcs } from './reminder';
import { streakFrom } from './db';

describe('copia de seguridad', () => {
  it('exporta e importa todo el progreso de los dos idiomas', async () => {
    const a = new YolandaDB('test-a');
    await a.lessons.put({ lang: 'en', id: 'en-a1-u01-l1', unit: 'en-a1-u01', done: true, stars: 3, best: 95, count: 1, completedAt: 1 });
    await a.lessons.put({ lang: 'it', id: 'it-a0-u00-l1', unit: 'it-a0-u00', done: true, stars: 2, best: 80, count: 1, completedAt: 2 });
    await a.favorites.put({ lang: 'it', ref: 'il-nonno', at: 3 });
    await a.kv.put({ key: 'profile', value: { name: 'Yolanda' } });
    const data = JSON.parse(JSON.stringify(await exportBackup(a)));
    expect(validateBackup(data)).toBe(true);

    const b = new YolandaDB('test-b');
    await b.lessons.put({ lang: 'en', id: 'otra', unit: 'x', done: false, stars: 0, best: 0, count: 0, completedAt: 0 });
    await importBackup(data, b);
    expect(await b.lessons.count()).toBe(2);
    expect(await b.lessons.get(['en', 'otra'])).toBeUndefined();
    expect((await b.favorites.get(['it', 'il-nonno']))?.at).toBe(3);
    expect((await b.kv.get('profile'))?.value).toEqual({ name: 'Yolanda' });
  });

  it('rechaza archivos que no son copias', async () => {
    expect(validateBackup({ hola: 1 })).toBe(false);
    expect(validateBackup({ kind: 'yolanda-backup', version: 1, tables: { malicious: [] } })).toBe(false);
    await expect(importBackup({ kind: 'otro' }, new YolandaDB('test-c'))).rejects.toThrow();
  });
});

describe('recordatorio diario (.ics)', () => {
  it('crea un evento diario con aviso a la hora elegida', () => {
    const ics = buildIcs('19:30', 10, new Date(2026, 10, 6, 12, 0));
    expect(ics).toContain('RRULE:FREQ=DAILY');
    expect(ics).toContain('DTSTART:20261106T193000');
    expect(ics).toContain('DTEND:20261106T194000');
    expect(ics).toContain('BEGIN:VALARM');
  });
  it('si la hora ya ha pasado, empieza mañana', () => {
    expect(buildIcs('08:00', 5, new Date(2026, 10, 6, 12, 0))).toContain('DTSTART:20261107T080000');
  });
});

describe('racha', () => {
  it('cuenta días seguidos aunque hoy aún no haya practicado', () => {
    const today = new Date(2026, 10, 6);
    expect(streakFrom(['2026-11-05', '2026-11-04', '2026-11-02'], today)).toBe(2);
    expect(streakFrom(['2026-11-06', '2026-11-05'], today)).toBe(2);
    expect(streakFrom([], today)).toBe(0);
  });
});
