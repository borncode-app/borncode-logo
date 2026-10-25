# BornCode — ชุดโลโก้และแนวทางการใช้

`borncode-logo.svg` คือไฟล์ต้นฉบับ (master) ไฟล์อื่นทั้งหมดสร้างจากไฟล์นี้

## โครงสร้างไฟล์

```
borncode-logo/
├── borncode-logo.svg          ต้นฉบับ (เหมือน svg/borncode-stacked-color.svg)
├── svg/                       ไฟล์เวกเตอร์ ใช้ทำเว็บ งานพิมพ์ ส่งโรงพิมพ์/ดีไซเนอร์
├── png/512 | 1024 | 2048/     PNG พื้นโปร่งใส กว้าง 512 / 1024 / 2048 px
├── web/                       favicon, ไอคอนแอป, site.webmanifest
└── social/                    รูปแชร์ลิงก์ (OG) และรูปโปรไฟล์
```

## รูปแบบโลโก้

| ชื่อไฟล์ | ลักษณะ | ใช้เมื่อ |
|---|---|---|
| `borncode-stacked-*` | สามเหลี่ยมบน ตัวอักษรล่าง | โลโก้หลัก หน้าปก โปสเตอร์ นามบัตร |
| `borncode-horizontal-*` | สามเหลี่ยมซ้าย ตัวอักษรขวา | แถบเมนูเว็บไซต์ หัวกระดาษ อีเมล |
| `borncode-mark-*` | สามเหลี่ยมอย่างเดียว | ไอคอน รูปโปรไฟล์ ลายน้ำ |
| `borncode-wordmark-*` | ตัวอักษรอย่างเดียว | พื้นที่แคบ หรือมีสามเหลี่ยมอยู่แล้วในหน้า |

| สี | ใช้เมื่อ |
|---|---|
| `color` | พื้นขาวหรือพื้นอ่อน (ใช้แบบนี้เป็นหลัก) |
| `mono` | สีเดียว `#2D4799` สำหรับงานพิมพ์สีเดียว ปั๊ม สกรีน |
| `white` | บนพื้นเข้มหรือบนรูปภาพ |
| `black` | เอกสารขาวดำ แฟกซ์ |

แบบสีเดียว (`mono` / `white` / `black`) แยกชั้นของสามเหลี่ยมด้วยร่องบางๆ แทนการไล่สี

## สี

| ส่วน | HEX | RGB |
|---|---|---|
| ตัวอักษร / สีหลักของแบรนด์ | `#2D4799` | 45, 71, 153 |
| สามเหลี่ยม ชั้น 1 (บนสุด) | `#62A5DF` | 98, 165, 223 |
| สามเหลี่ยม ชั้น 2 | `#4F87CE` | 79, 135, 206 |
| สามเหลี่ยม ชั้น 3 | `#4067BA` | 64, 103, 186 |
| สามเหลี่ยม ชั้น 4 | `#314BA3` | 49, 75, 163 |
| สามเหลี่ยม ชั้น 5 | `#2B3681` | 43, 54, 129 |
| สามเหลี่ยม ชั้น 6 (มุมขวาล่าง) | `#24265D` | 36, 38, 93 |

## ฟอนต์

**Comfortaa SemiBold (600)** — [Google Fonts](https://fonts.google.com/specimen/Comfortaa) ใช้ฟรีเชิงพาณิชย์ (SIL Open Font License)

ตัวอักษรในไฟล์โลโก้แปลงเป็นเส้นแล้ว ไม่ต้องติดตั้งฟอนต์ ถ้าจะใช้ Comfortaa กับข้อความบนเว็บ:

```html
<link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&display=swap" rel="stylesheet">
```

## ระยะปลอดภัยและขนาดเล็กสุด

- **ระยะปลอดภัย:** เว้นที่ว่างรอบโลโก้อย่างน้อยเท่าความสูงตัว **B** ห้ามมีข้อความหรือภาพอื่นเข้ามาในระยะนี้
- **ขนาดเล็กสุด (จอ):** stacked กว้าง 120 px · horizontal กว้าง 140 px · mark กว้าง 24 px
- **ขนาดเล็กสุด (พิมพ์):** stacked กว้าง 25 มม. · horizontal กว้าง 30 มม.

## ห้ามทำ

- ยืด บีบ หรือหมุนโลโก้
- เปลี่ยนสีชั้นของสามเหลี่ยม หรือเปลี่ยนฟอนต์
- ใส่เงา ขอบ หรือเอฟเฟกต์
- วางแบบ `color` บนพื้นเข้มหรือพื้นลาย (ให้ใช้ `white`)

## ติดตั้งบนเว็บไซต์

คัดลอกไฟล์ทั้งหมดใน `web/` และ `social/og-image-1200x630.png` ไปไว้ที่ root ของเว็บ แล้วใส่ใน `<head>` (เปลี่ยน `YOUR-DOMAIN` เป็นโดเมนจริง):

```html
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#2D4799">
<meta property="og:image" content="https://YOUR-DOMAIN/og-image-1200x630.png">
```

โลโก้บนแถบเมนู (คัดลอก `svg/borncode-horizontal-color.svg` ไปไว้ที่ root ของเว็บ):

```html
<img src="/borncode-horizontal-color.svg" alt="BornCode" height="40">
```

## โซเชียล

- `social/og-image-1200x630.png` — รูปที่ขึ้นตอนแชร์ลิงก์ (Facebook, LINE, X, LinkedIn)
- `social/profile-stacked-white-1024.png` — รูปโปรไฟล์พื้นขาว สามเหลี่ยม + ชื่อ BornCode
- `social/profile-stacked-blue-1024.png` — รูปโปรไฟล์พื้นน้ำเงิน สามเหลี่ยม + ชื่อ BornCode สีขาว
- `social/profile-white-1024.png` — รูปโปรไฟล์พื้นขาว
- `social/profile-blue-1024.png` — รูปโปรไฟล์พื้นน้ำเงิน `#2D4799` สามเหลี่ยมสีขาว

รูปโปรไฟล์เว้นขอบไว้แล้ว ตัดเป็นวงกลมได้โดยสามเหลี่ยมไม่โดนตัด
