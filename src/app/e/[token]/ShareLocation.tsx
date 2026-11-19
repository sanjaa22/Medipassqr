"use client";
import { useState } from "react";
import { IconMap } from "@/components/Icons";

export default function ShareLocation({ phone, name, en }: { phone?: string; name: string; en: boolean }) {
  const [status, setStatus] = useState<string>("");
  function share() {
    if (!navigator.geolocation) return setStatus(en ? "Location not supported" : "Байршил тодорхойлох боломжгүй");
    setStatus(en ? "Getting location…" : "Байршил тодорхойлж байна…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: la, longitude: lo } = pos.coords;
        const link = `https://maps.google.com/?q=${la.toFixed(6)},${lo.toFixed(6)}`;
        const body = `MediPass: ${name || "Таны ойрын хүн"} яаралтай тусламж авч байна. Байршил: ${link}`;
        if (phone) window.location.href = `sms:${phone.replace(/[^+\d]/g, "")}?&body=${encodeURIComponent(body)}`;
        else if (navigator.share) navigator.share({ text: body }).catch(() => {});
        setStatus(link);
      },
      () => setStatus(en ? "Permission denied" : "Байршлын зөвшөөрөл өгөөгүй"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }
  return (
    <div>
      <button onClick={share} className="btn-secondary w-full py-3"><IconMap /> {en ? "Send location to family" : "Байршлыг ар гэрт илгээх"}</button>
      {status && <p className="mt-1 break-all text-center text-xs text-slate-500">{status}</p>}
    </div>
  );
}
