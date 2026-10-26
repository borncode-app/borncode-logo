/** แสงฟุ้งสีแบรนด์ลอยอยู่หลังทุกหน้า — ให้แผ่นกระจก (.glass) มีสีอยู่ข้างหลัง
    ซ้อนอยู่ใน layout ครั้งเดียว ไม่ re-render ตอนเปลี่ยนหน้า */
export function LiquidBackground() {
  return (
    <div className="liquid-bg" aria-hidden="true">
      <div className="liquid-blob b1" />
      <div className="liquid-blob b2" />
      <div className="liquid-blob b3" />
      <div className="liquid-blob b4" />
    </div>
  );
}
