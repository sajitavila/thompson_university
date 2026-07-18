#!/usr/bin/env node
import { runBorMakeTable } from "@benjaminor-dev/quasar-app-extension-table-builder/scaffold";

runBorMakeTable({
  argv: process.argv,
  cwd: process.cwd(),
});
