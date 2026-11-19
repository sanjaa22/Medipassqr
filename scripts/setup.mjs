// MediPass — нэг удаагийн тохиргоо:  npm run setup
// 1) .env файл үүсгэж, нууц түлхүүрүүдийг автоматаар бөглөнө
// 2) Өгөгдлийн сангийн хүснэгтүүдийг үүсгэнэ (prisma db push)
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";

const ENV = ".env";
const example = readFileSync(".env.example", "utf8");
let env = existsSync(ENV) ? readFileSync(ENV, "utf8") : example;

function setVar(name, value, onlyIfEmpty = true) {
  const re = new RegExp(`^${name}=.*$`, "m");
  const m = env.match(re);
  const cur = m ? m[0].slice(name.length + 1).replace(/^"|"$/g, "") : "";
  if (m && onlyIfEmpty && cur) return false;
  const line = `${name}="${value}"`;
  env = m ? env.replace(re, line) : env + `\n${line}\n`;
  return true;
}

const a = setVar("AUTH_SECRET", randomBytes(48).toString("base64url"));
const k = setVar("ENCRYPTION_KEY", randomBytes(32).toString("hex"));
writeFileSync(ENV, env);
console.log(existsSync(ENV) ? "✔ .env бэлэн" : "");
if (a) console.log("  • AUTH_SECRET автоматаар үүсгэлээ");
if (k) console.log("  • ENCRYPTION_KEY автоматаар үүсгэлээ");

const dbUrl = (env.match(/^DATABASE_URL="?([^"\n]*)"?/m) || [])[1] || "";
if (!dbUrl || dbUrl.includes("USER:PASSWORD")) {
  console.error("✖ .env доторх DATABASE_URL-ээ бөглөнө үү, дараа нь `npm run setup`-ийг дахин ажиллуулна.");
  process.exit(1);
}

console.log("→ Өгөгдлийн сангийн хүснэгтүүдийг үүсгэж байна (prisma db push)…");
const r = spawnSync("npx", ["prisma", "db", "push", "--skip-generate"], { stdio: "inherit", shell: true });
if (r.status !== 0) {
  console.error("\n✖ Өгөгдлийн сантай холбогдож чадсангүй. Шалгах зүйл:");
  console.error("  1) Docker байгаа бол:  docker compose up -d");
  console.error("     Docker байхгүй бол https://neon.tech дээр үнэгүй өгөгдлийн сан үүсгээд холбоосыг .env-д тавина");
  console.error("  2) .env доторх DATABASE_URL зөв эсэх (хэрэглэгч, нууц үг, хост, DB нэр)");
  process.exit(r.status ?? 1);
}
console.log("\n✔ Бэлэн! Одоо:  npm run dev  → http://localhost:3000/register");
