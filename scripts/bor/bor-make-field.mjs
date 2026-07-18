#!/usr/bin/env node
import { runBorMakeField } from "@benjaminor-dev/quasar-app-extension-form-builder/scaffold";

await runBorMakeField({
  argv: process.argv,
  cwd: process.cwd(),
});
