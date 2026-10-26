/** พื้นหลังไล่สีฟ้าเรียบอยู่หลังทุกหน้า — ให้แผ่นกระจกมีสีอยู่ข้างหลัง (วางครั้งเดียวใน layout) */
export function LiquidBackground() {
  return (
    <div className="liquid-bg" aria-hidden="true">
      <div className="liquid-sheen" />
    </div>
  )
}
