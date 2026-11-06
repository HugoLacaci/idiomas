/**
 * Copia de seguridad del progreso: un archivo JSON que se descarga o se comparte
 * (AirDrop, WhatsApp…) con la Web Share API, y que se puede recuperar después.
 */
import { db, TABLES, type YolandaDB } from './db';

export const BACKUP_KIND = 'yolanda-backup';

export interface BackupFile {
  kind: typeof BACKUP_KIND;
  version: 1;
  createdAt: string;
  tables: Record<string, unknown[]>;
}

export async function exportBackup(database: YolandaDB = db): Promise<BackupFile> {
  const tables: Record<string, unknown[]> = {};
  for (const t of TABLES) tables[t] = await database.table(t).toArray();
  return { kind: BACKUP_KIND, version: 1, createdAt: new Date().toISOString(), tables };
}

export function validateBackup(data: unknown): data is BackupFile {
  if (!data || typeof data !== 'object') return false;
  const d = data as Partial<BackupFile>;
  if (d.kind !== BACKUP_KIND || d.version !== 1 || !d.tables || typeof d.tables !== 'object') return false;
  return Object.entries(d.tables).every(([k, v]) => (TABLES as readonly string[]).includes(k) && Array.isArray(v));
}

/** Sustituye todo el progreso por el de la copia. */
export async function importBackup(data: unknown, database: YolandaDB = db) {
  if (!validateBackup(data)) throw new Error('Este archivo no es una copia de la app.');
  await database.transaction('rw', TABLES.map((t) => database.table(t)), async () => {
    for (const t of TABLES) {
      await database.table(t).clear();
      const rows = data.tables[t] ?? [];
      if (rows.length) await database.table(t).bulkPut(rows);
    }
  });
}

export function backupFileName(d = new Date()) {
  return `progreso-idiomas-${d.toISOString().slice(0, 10)}.json`;
}

/** Comparte (iPhone: AirDrop/WhatsApp/Archivos) o, si no se puede, descarga. */
export async function shareOrDownloadBackup(): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const data = await exportBackup();
  const json = JSON.stringify(data);
  const name = backupFileName();
  const file = new File([json], name, { type: 'application/json' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: 'Copia de mi progreso' });
      return 'shared';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelled';
    }
  }
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return 'downloaded';
}

export async function readBackupFile(file: File) {
  const text = await file.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('No se ha podido leer el archivo.');
  }
  await importBackup(data);
}
