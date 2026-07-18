#!/usr/bin/env node
import { runBorMakeFormlist } from "@benjaminor-dev/quasar-app-extension-form-builder/scaffold";

runBorMakeFormlist({
  argv: process.argv,
  cwd: process.cwd(),
});
