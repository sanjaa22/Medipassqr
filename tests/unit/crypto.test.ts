import { test } from "node:test";
import assert from "node:assert/strict";
import * as c from "../../src/lib/crypto.ts"; // env-г дуудлага бүрт уншдаг тул статик import ажиллана

const KEY_A = "a".repeat(64);
const KEY_B = "b".repeat(64);
process.env.ENCRYPTION_KEY = KEY_A;
process.env.AUTH_SECRET = "unit-test-secret-unit-test-secret-1234";

test("encrypt → decrypt буцаан ижил текст өгнө", () => {
  const plain = JSON.stringify({ name: "Бат-Эрдэнэ", allergies: ["Пенициллин"] });
  assert.equal(c.decrypt(c.encrypt(plain)), plain);
});

test("нэг текст бүрт өөр IV ашиглана", () => {
  assert.notEqual(c.encrypt("x"), c.encrypt("x"));
});

test("өөрчилсөн шифртэй өгөгдлийг татгалзана (GCM auth tag)", () => {
  const parts = c.encrypt("secret").split(".");
  parts[3] = Buffer.from("tampered").toString("base64url");
  assert.throws(() => c.decrypt(parts.join(".")));
});

test("түлхүүр солих: ENCRYPTION_KEY_OLD-оор хуучин өгөгдлийг тайлна", () => {
  const old = c.encrypt("хуучин өгөгдөл"); // KEY_A-аар шифрлэв
  process.env.ENCRYPTION_KEY = KEY_B;
  assert.throws(() => c.decrypt(old)); // OLD байхгүй үед тайлагдахгүй
  process.env.ENCRYPTION_KEY_OLD = KEY_A;
  assert.equal(c.decrypt(old), "хуучин өгөгдөл");
  delete process.env.ENCRYPTION_KEY_OLD;
  process.env.ENCRYPTION_KEY = KEY_A;
});

test("буруу түлхүүрийн формат алдаа өгнө", () => {
  process.env.ENCRYPTION_KEY = "short";
  assert.throws(() => c.encrypt("x"), /ENCRYPTION_KEY/);
  process.env.ENCRYPTION_KEY = KEY_A;
});

test("QR токен: 128 бит, давтагдахгүй", () => {
  const t = c.newCardToken();
  assert.equal(Buffer.from(t, "base64url").length, 16);
  assert.notEqual(t, c.newCardToken());
});

test("IP маск: бүтэн хаяг ил гарахгүй", () => {
  assert.equal(c.maskIp("203.0.113.42"), "203.0.*.*");
  assert.ok(!c.maskIp("2001:db8:85a3::1").includes("85a3"));
  assert.equal(c.maskIp("1.2.3.4"), "1.2.*.*");
});

test("hashIp/hashKey тогтмол, бөгөөд түүхий утгыг агуулахгүй", () => {
  assert.equal(c.hashIp("1.2.3.4"), c.hashIp("1.2.3.4"));
  assert.notEqual(c.hashIp("1.2.3.4"), c.hashIp("1.2.3.5"));
  assert.ok(!c.hashKey("a@b.mn").includes("a@b.mn"));
});

test("sha256 / reset токен", () => {
  assert.equal(c.sha256("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  assert.ok(c.newResetToken().length >= 43);
});
