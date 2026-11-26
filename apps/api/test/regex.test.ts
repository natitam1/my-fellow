import assert from "node:assert/strict";
import test from "node:test";
import { escapeRegex } from "../src/utils/regex.js";

test("escapeRegex escapes special regular expression characters", () => {
  const metaChars = ".*+?^${}()|[]\\";
  const escaped = escapeRegex(metaChars);
  assert.equal(escaped, "\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\");

  // Verify that new RegExp does not throw syntax errors with special chars
  const regex = new RegExp(escaped);
  assert.ok(regex.test(metaChars));
  assert.ok(!regex.test("other"));
});

test("escapeRegex neutralizes potential ReDoS payloads", () => {
  const payload = "(((((a+)+)+)+)+)$";
  const escaped = escapeRegex(payload);
  const regex = new RegExp(`^${escaped}$`);

  // It should match the exact literal string and not execute the regex grouping/quantifiers
  assert.ok(regex.test(payload));
  assert.ok(!regex.test("aaaaaaaaaaaaaaaaaaaaaaaX"));
});

test("escapeRegex preserves normal alphanumeric strings", () => {
  assert.equal(escapeRegex("fellowship_2026"), "fellowship_2026");
  assert.equal(escapeRegex("User Name 123"), "User Name 123");
  assert.equal(escapeRegex(""), "");
});
