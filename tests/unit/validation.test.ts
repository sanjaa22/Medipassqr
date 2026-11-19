import { test } from "node:test";
import assert from "node:assert/strict";
import { passwordSchema } from "../../src/lib/validation.ts";

const ok = (v: string) => passwordSchema.safeParse(v).success;

test("хүчинтэй нууц үгийг зөвшөөрнө", () => {
  assert.ok(ok("Medipass2026!"));
  assert.ok(ok("Нууцүг12345"));
});

test("богино / үсэггүй / тоогүй нууц үгийг татгалзана", () => {
  assert.ok(!ok("abc123"));
  assert.ok(!ok("abcdefgh"));
  assert.ok(!ok("12345678"));
});

test("түгээмэл нууц үгийг татгалзана", () => {
  assert.ok(!ok("Password123"));
  assert.ok(!ok("qwerty123"));
  assert.ok(!ok("medipass1"));
});

test("72 тэмдэгтээс урт нууц үгийг татгалзана (bcrypt хязгаар)", () => {
  assert.ok(!ok("a1" + "x".repeat(71)));
});
