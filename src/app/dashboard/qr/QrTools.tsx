"use client";
import { useState } from "react";
import { IconCopy, IconCheck, IconDownload, IconImage } from "@/components/Icons";

type Summary = { name: string; age: string; bloodType: string; allergies: string; conditions: string; contact: string };

function download(href: string, name: string) {
  const a = document.createElement("a");
  a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(" "); const lines: string[] = []; let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

export default function QrTools({ png, svg, url, summary, active }: { png: string; svg: string; url: string; summary: Summary; active: boolean }) {
  const [copied, setCopied] = useState(false);
  const [wall, setWall] = useState<string | null>(null);

  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  }

  async function makeWallpaper() {
    const W = 1170, H = 2532;
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0f172a"); g.addColorStop(1, "#4c0519");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const img = new Image(); img.src = png; await img.decode();
    const boxY = 1050, box = 760, bx = (W - box) / 2;
    ctx.fillStyle = "#e11d48"; roundRect(ctx, bx - 30, boxY - 190, box + 60, box + 520, 56); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.textAlign = "center";
    ctx.font = "800 52px Inter, system-ui, sans-serif"; ctx.fillText("ЯАРАЛТАЙ ҮЕД УНШУУЛНА УУ", W / 2, boxY - 100);
    ctx.font = "600 34px Inter, system-ui, sans-serif"; ctx.globalAlpha = .85; ctx.fillText("IN CASE OF EMERGENCY — SCAN ME", W / 2, boxY - 45); ctx.globalAlpha = 1;
    ctx.fillStyle = "#fff"; roundRect(ctx, bx, boxY, box, box, 36); ctx.fill();
    ctx.drawImage(img, bx + 30, boxY + 30, box - 60, box - 60);
    let y = boxY + box + 90;
    ctx.fillStyle = "#fff";
    if (summary.name) { ctx.font = "800 58px Inter, system-ui, sans-serif"; ctx.fillText(summary.name, W / 2, y); y += 75; }
    const line2 = [summary.bloodType && `Цус: ${summary.bloodType}`, summary.age].filter(Boolean).join("  ·  ");
    if (line2) { ctx.font = "700 44px Inter, system-ui, sans-serif"; ctx.fillText(line2, W / 2, y); y += 65; }
    if (summary.allergies) { ctx.font = "600 38px Inter, system-ui, sans-serif"; for (const l of wrap(ctx, `⚠ Харшил: ${summary.allergies}`, box)) { ctx.fillText(l, W / 2, y); y += 50; } }
    ctx.font = "700 46px Inter, system-ui, sans-serif"; ctx.fillStyle = "#fecdd3"; ctx.fillText("Түргэн тусламж 103", W / 2, H - 260);
    if (summary.contact) { ctx.font = "600 38px Inter, system-ui, sans-serif"; ctx.fillStyle = "#fff"; ctx.fillText(summary.contact, W / 2, H - 200); }
    setWall(c.toDataURL("image/png"));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card p-6">
        {!active && <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">Карт идэвхгүй байгаа тул QR уншуулахад мэдээлэл харагдахгүй.</p>}
        <div className="mx-auto max-w-xs rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={png} alt="QR код" className="w-full" />
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-100 p-2 pl-3 text-xs dark:bg-slate-800">
          <span className="flex-1 truncate font-mono">{url}</span>
          <button onClick={copy} className="btn-secondary !px-3 !py-1.5 text-xs">{copied ? <><IconCheck className="h-4 w-4" />Хуулсан</> : <><IconCopy className="h-4 w-4" />Хуулах</>}</button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="btn-secondary" onClick={() => download(png, "medipass-qr.png")}><IconDownload className="h-4 w-4" /> PNG татах</button>
          <button className="btn-secondary" onClick={() => download(URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })), "medipass-qr.svg")}><IconDownload className="h-4 w-4" /> SVG татах</button>
        </div>
        <p className="hint mt-3">QR код нь алдаа засах “H” түвшинтэй (30% гэмтсэн ч уншигдана).</p>
      </div>

      <div className="card p-6">
        <h2 className="h-section">Түгжээний дэлгэцийн зураг</h2>
        <p className="mt-1 text-sm text-slate-500">Утас түгжээтэй байхад ч тусламж үзүүлэгч таны QR-ийг харна. Зөвхөн <b>“Нээлттэй”</b> мэдээлэл зурагт орно.</p>
        {wall ? (
          <div className="mt-4 flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={wall} alt="Ханын зураг" className="h-96 rounded-2xl shadow-lg" />
            <div className="flex gap-2">
              <button className="btn-primary" onClick={() => download(wall, "medipass-lockscreen.png")}><IconDownload className="h-4 w-4" /> Татах</button>
              <button className="btn-secondary" onClick={makeWallpaper}>Дахин үүсгэх</button>
            </div>
            <p className="hint text-center">iPhone: Тохиргоо → Ханын зураг · Android: Тохиргоо → Дэлгэц → Ханын зураг</p>
          </div>
        ) : (
          <button className="btn-primary mt-6 w-full" onClick={makeWallpaper}><IconImage className="h-4 w-4" /> Ханын зураг үүсгэх</button>
        )}
      </div>
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
