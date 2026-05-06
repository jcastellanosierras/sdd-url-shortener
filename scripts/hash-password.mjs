#!/usr/bin/env node

import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { hashPassword } from "better-auth/crypto";

function parsePasswordArg(argv) {
  const flagIndex = argv.findIndex((arg) => arg === "--password" || arg === "-p");
  if (flagIndex !== -1) {
    return argv[flagIndex + 1] ?? "";
  }

  const positional = argv.filter((arg) => !arg.startsWith("-"));
  return positional[0] ?? "";
}

async function readPasswordInteractively() {
  const rl = createInterface({ input, output });
  try {
    return await rl.question("Nueva contraseña: ");
  } finally {
    rl.close();
  }
}

async function main() {
  const argv = process.argv.slice(2);
  let password = parsePasswordArg(argv);

  if (!password) {
    password = await readPasswordInteractively();
  }

  if (!password || password.trim().length === 0) {
    console.error("Error: debes proporcionar una contraseña no vacía.");
    process.exit(1);
  }

  const hash = await hashPassword(password);
  output.write(`${hash}\n`);
}

main().catch((error) => {
  console.error("Error generando hash de contraseña:", error);
  process.exit(1);
});
