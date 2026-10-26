import type { PointerEvent } from 'react';

/** ส่งตำแหน่งเมาส์ให้ .liquid-hover ผ่าน --mx / --my — แสงบนกระจกจะไหลตามเมาส์ */
export function trackLiquidHover(event: PointerEvent<HTMLElement>) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${event.clientX - rect.left}px`);
  el.style.setProperty('--my', `${event.clientY - rect.top}px`);
}
