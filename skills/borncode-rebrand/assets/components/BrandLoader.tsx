'use client';

import { useEffect, useRef, useState } from 'react';
import BrandMark from './BrandMark';
import styles from './brand-loader.module.css';

interface Props {
  /** true = แสดงหน้าโหลด · false = ค้างไว้ให้ครบ minDuration แล้วเบลอหายไป */
  show: boolean;
  label?: string;
  sublabel?: string;
  /** อยู่บนจออย่างน้อยกี่ ms — พอให้โลโก้ประกอบเสร็จ ไม่กะพริบวาบเดียวแล้วหาย */
  minDuration?: number;
}

const EXIT_MS = 600;

/** หน้าโหลดเต็มจอ: โลโก้ 6 ชั้นหล่นลงมาประกอบทีละชั้น → ลอยเบา ๆ → แถบแสงวิ่ง → เบลอหายไปตอนเสร็จ */
export default function BrandLoader({
  show,
  label = 'กำลังโหลด...',
  sublabel = 'BornCode',
  minDuration = 1100,
}: Props) {
  const [mounted, setMounted] = useState(show);
  const [leaving, setLeaving] = useState(false);
  const shownAt = useRef(show ? Date.now() : 0);

  useEffect(() => {
    if (show) {
      shownAt.current = Date.now();
      setMounted(true);
      setLeaving(false);
      return;
    }
    if (!mounted) return;
    const wait = Math.max(0, minDuration - (Date.now() - shownAt.current));
    const t1 = setTimeout(() => setLeaving(true), wait);
    const t2 = setTimeout(() => {
      setMounted(false);
      setLeaving(false);
    }, wait + EXIT_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mounted ถูกอ่านตอนปิดเท่านั้น
  }, [show, minDuration]);

  if (!mounted) return null;

  return (
    <div
      className={leaving ? `${styles.overlay} ${styles.leaving}` : styles.overlay}
      role="status"
      aria-live="polite"
      aria-busy={!leaving}
    >
      <div className={styles.stage}>
        <div className={styles.halo} aria-hidden="true" />
        <BrandMark animated className={`${styles.mark} float`} />
      </div>
      <div className={styles.wordmark}>BornCode</div>
      <div className={styles.sub}>{sublabel}</div>
      <div className={styles.bar} aria-hidden="true">
        <div className={styles.barFill} />
      </div>
      <p className={styles.label}>{label}</p>
    </div>
  );
}
