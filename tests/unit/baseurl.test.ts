import { test } from "node:test";
import assert from "node:assert/strict";
import { stableBaseUrl, emailBaseUrl, originFromHeaders, isLocalUrl } from "../../src/lib/baseurl.ts";

test("production дээр localhost-ийн утгыг үл тооно, Vercel-ийн production домэйныг авна", () => {
  const env = { NODE_ENV: "production", NEXT_PUBLIC_APP_URL: "http://localhost:3000", VERCEL_PROJECT_PRODUCTION_URL: "medipass.vercel.app" };
  assert.equal(stableBaseUrl(env), "https://medipass.vercel.app");
});

test("зөв тохируулсан NEXT_PUBLIC_APP_URL-ийг (төгсгөлийн / болон протоколгүй байсан ч) цэвэрлэнэ", () => {
  assert.equal(stableBaseUrl({ NODE_ENV: "production", NEXT_PUBLIC_APP_URL: "https://my.mn/" }), "https://my.mn");
  assert.equal(stableBaseUrl({ NODE_ENV: "production", NEXT_PUBLIC_APP_URL: "my.mn" }), "https://my.mn");
});

test("хөгжүүлэлтийн горимд localhost хэвээр", () => {
  assert.equal(stableBaseUrl({ NODE_ENV: "development", NEXT_PUBLIC_APP_URL: "http://localhost:3000" }), "http://localhost:3000");
});

test("юу ч тохируулаагүй бол null (хүсэлтийн host руу шилжинэ)", () => {
  assert.equal(stableBaseUrl({ NODE_ENV: "production" }), null);
  assert.equal(stableBaseUrl({ NODE_ENV: "production", NEXT_PUBLIC_APP_URL: "" }), null);
});

test("имэйлийн суурь хаяг: deployment URL-ийг fallback болгоно", () => {
  assert.equal(emailBaseUrl({ NODE_ENV: "production", VERCEL_URL: "medipass-abc.vercel.app" }), "https://medipass-abc.vercel.app");
  assert.equal(emailBaseUrl({}), "http://localhost:3000");
});

test("origin-г толгойноос үүсгэнэ; хортой host-ийг татгалзана", () => {
  assert.equal(originFromHeaders("medipass.vercel.app", "https"), "https://medipass.vercel.app");
  assert.equal(originFromHeaders("192.168.1.5:3000", null), "https://192.168.1.5:3000");
  assert.equal(originFromHeaders("localhost:3000", null), "http://localhost:3000");
  assert.equal(originFromHeaders("evil.com/<script>", "https"), null);
  assert.equal(originFromHeaders(null, null), null);
});

test("isLocalUrl", () => {
  assert.ok(isLocalUrl("http://localhost:3000"));
  assert.ok(isLocalUrl("127.0.0.1:3000"));
  assert.ok(!isLocalUrl("https://localhost.example.com"));
});
