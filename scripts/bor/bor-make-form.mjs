#!/usr/bin/env node
import { runBorMakeForm } from "@benjaminor-dev/quasar-app-extension-form-builder/scaffold";

runBorMakeForm({
  argv: process.argv,
  cwd: process.cwd(),
});
