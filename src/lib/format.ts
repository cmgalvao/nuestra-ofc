const fmt = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** "10 de março de 2026" */
export function dataBR(d: Date): string {
  return fmt.format(d);
}

/** "2026-03-10" (para o atributo datetime) */
export function dataISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}
