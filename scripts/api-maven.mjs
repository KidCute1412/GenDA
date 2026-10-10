import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const cwd = fileURLToPath(new URL("../apps/api/", import.meta.url));
const windows = process.platform === "win32";
const command = windows ? "mvnw.cmd" : "sh";
const args = windows ? process.argv.slice(2) : ["mvnw", ...process.argv.slice(2)];
const result = spawnSync(command, args, { cwd, stdio: "inherit", shell: windows });
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
