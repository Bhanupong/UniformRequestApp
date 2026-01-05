# Uniform Request App

แอปพลิเคชันสำหรับเบิกชุดยูนิฟอร์มและบัตรพนักงาน สร้างด้วย **Vite + React + Tailwind CSS** โดยเน้นดีไซน์ที่พรีเมียมและรองรับการใช้งานบนมือถือ (Mobile-First)

## Features

- **Mobile-First Design**: ออกแบบมาสำหรับการใช้งานบนสมาร์ทโฟนเป็นหลัก
- **Premium Aesthetics**: UI แบบ Glassmorphism และโทนสีที่หรูหรา
- **Google Sheets Integration**: เชื่อมต่อข้อมูลสาขาและไซส์เสื้อผ่าน Google Apps Script
- **Smart Validation**: ระบบตรวจสอบความถูกต้องก่อนส่งข้อมูล
- **Multiple Requesters**: รองรับการเพิ่มรายการผู้เบิกได้หลายคนในครั้งเดียว

## Tech Stack

- **Framework**: [Vite](https://vitejs.dev/) + [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Font**: Kanit (Google Fonts)

## Getting Started

### Installation

```bash
# ติดตั้ง dependencies
npm install
```

### Development

```bash
# รันในโหมด development
npm run dev
```

### Production Build

```bash
# สร้างไฟล์สำหรับ production
npm run build

# ทดลองรันไฟล์ที่ build แล้ว
npm run preview
```

## Deployment

แอปนี้สามารถ Deploy บน **Vercel** หรือ **Netlify** ได้อย่างง่ายดาย:

1. Push โค้ดขึ้น GitHub
2. เชื่อมต่อโปรเจกต์กับ Vercel/Netlify
3. ตั้งค่า Build Command: `npm run build` และ Output Directory: `dist`

---

Developed by Antigravity (Senior React Developer Assistant)
