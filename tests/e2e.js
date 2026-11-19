const { chromium } = require('playwright');
const B = process.env.BASE_URL || 'http://localhost:3000';
const S = process.env.SHOTS_DIR || './screenshots/';
require('fs').mkdirSync(S, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1360, height: 860 } });
  const p = await ctx.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.goto(B); await p.screenshot({ path: S + '01-landing.png' });
  await p.screenshot({ path: S + '01b-landing-full.png', fullPage: true });
  await p.goto(B + '/register'); await p.screenshot({ path: S + '02-register.png' });
  const email = `test${Date.now()}@example.com`;
  await p.fill('#name', 'Бат-Эрдэнэ'); await p.fill('#email', email);
  await p.fill('#password', 'Medipass2026!'); await p.fill('#confirm', 'Medipass2026!');
  await p.check('input[name=agree]'); await p.click('button[type=submit]');
  await p.waitForURL('**/dashboard/profile**');
  await p.fill('input[name=fullName]', 'Ганболдын Бат-Эрдэнэ');
  await p.fill('input[name=birthDate]', '1992-04-15');
  await p.selectOption('select[name=gender]', 'Эрэгтэй');
  await p.selectOption('select[name=bloodType]', 'B(III) Rh+');
  await p.fill('input[name=heightCm]', '176'); await p.fill('input[name=weightKg]', '78');
  await p.click('text=Пенициллин'); await p.click('button:has-text("Самар")');
  await p.click('button:has-text("Чихрийн шижин")');
  await p.fill('textarea[name=medications]', 'Метформин 500мг — өдөрт 2 удаа');
  await p.selectOption('select[name=organDonor]', 'yes');
  await p.fill('input[name=insuranceNo]', 'ЭМД-1234567');
  await p.fill('input[name=registerNo]', 'УБ92041512');
  await p.fill('input[name=c_name]', 'Ганболд Цэцэг'); await p.fill('input[name=c_relation]', 'Ээж'); await p.fill('input[name=c_phone]', '+976 9911 2233');
  await p.fill('input[name=doctorName]', 'Д. Сарантуяа (Улсын 1-р эмнэлэг)');
  await p.fill('textarea[name=notes]', 'Инсулин хэрэглэдэггүй. Цусан дахь сахар унавал чихэртэй ундаа өгнө үү.');
  await p.screenshot({ path: S + '03-profile.png', fullPage: true });
  await p.click('button:has-text("Хадгалах")');
  await p.waitForSelector('text=амжилттай хадгалагдлаа');
  // privacy
  await p.goto(B + '/dashboard/privacy');
  await p.fill('input[name=pin]', '4826'); await p.fill('input[name=pinConfirm]', '4826');
  await p.click('button:has-text("PIN тохируулах")'); await p.waitForSelector('text=PIN код амжилттай');
  await p.reload(); await p.screenshot({ path: S + '04-privacy.png', fullPage: true });
  // weak pin check
  await p.fill('input[name=pin]', '1234'); await p.fill('input[name=pinConfirm]', '1234');
  await p.click('button:has-text("PIN солих")'); await p.waitForSelector('text=Хэт амархан PIN');
  // qr
  await p.goto(B + '/dashboard/qr'); await p.click('text=Ханын зураг үүсгэх'); await p.waitForSelector('img[alt="Ханын зураг"]');
  await p.screenshot({ path: S + '05-qr.png', fullPage: true });
  const wall = await p.getAttribute('img[alt="Ханын зураг"]', 'src');
  require('fs').writeFileSync(S + '06-wallpaper.png', Buffer.from(wall.split(',')[1], 'base64'));
  await p.goto(B + '/dashboard/qr/print'); await p.screenshot({ path: S + '07-print.png' });
  const url = await p.goto(B + '/dashboard').then(() => p.getAttribute('a:has-text("Нийтийн харагдац")', 'href'));
  // public view as anonymous, mobile
  const anon = await browser.newContext({ ...require('playwright').devices['iPhone 13'] });
  const m = await anon.newPage(); m.on('pageerror', e => errors.push(e.message));
  await m.goto(B + url); await m.screenshot({ path: S + '08-public.png', fullPage: true });
  const hasMed = await m.locator('text=Метформин').count();
  await m.fill('input[name=pin]', '0000'); await m.click('button:has-text("Нээх")'); await m.waitForSelector('text=PIN буруу');
  await m.screenshot({ path: S + '09-public-wrongpin.png', fullPage: true });
  await m.fill('input[name=pin]', '4826'); await m.click('button:has-text("Нээх")'); await m.waitForSelector('text=Метформин');
  await m.screenshot({ path: S + '10-public-unlocked.png', fullPage: true });
  const regShown = await m.locator('text=УБ92041512').count();
  await m.goto(B + url + '?lang=en'); await m.screenshot({ path: S + '11-public-en.png', fullPage: true });
  // dashboard after
  await p.goto(B + '/dashboard'); await p.screenshot({ path: S + '12-dashboard.png', fullPage: true });
  await p.goto(B + '/dashboard/logs'); await p.screenshot({ path: S + '13-logs.png', fullPage: true });
  await p.goto(B + '/dashboard/settings'); await p.screenshot({ path: S + '14-settings.png', fullPage: true });
  // dark mode
  await p.goto(B + '/dashboard'); await p.click('[aria-label="Өнгөний горим солих"] >> nth=-1'); await p.screenshot({ path: S + '15-dark.png', fullPage: true });
  // auth protection
  const a2 = await (await browser.newContext()).newPage(); await a2.goto(B + '/dashboard'); const protectedUrl = a2.url();
  await a2.goto(B + '/login'); await a2.screenshot({ path: S + '16-login.png' });
  for (let i = 0; i < 5; i++) { await a2.fill('#email', email); await a2.fill('#password', 'wrongpass1'); await a2.click('button[type=submit]'); await a2.waitForTimeout(700); }
  const lockMsg = await a2.locator('div.rounded-xl[role=alert]').textContent();
  await a2.screenshot({ path: S + '17-lockout.png' });
  // rotate token
  await p.goto(B + '/dashboard/privacy'); p.once('dialog', d => d.accept()); await p.click('button:has-text("Шинэ QR үүсгэх")'); await p.waitForTimeout(1500);
  await m.goto(B + url); const oldDead = await m.locator('text=Карт олдсонгүй').count();
  // export
  const exp = await p.request.get(B + '/api/export'); const ej = await exp.json();
  const notfound = await m.goto(B + '/e/xxxxxxxxxxxxxxxxxxxxxx'); 
  console.log(JSON.stringify({ hasMedBeforePin: hasMed, regShown, protectedUrl, lockMsg, oldDead, exportKeys: Object.keys(ej), errors }, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
