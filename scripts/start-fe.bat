@echo off
cd /d "%~dp0.."
npx.cmd --yes pnpm@10.15.0 --filter @genda/web dev

