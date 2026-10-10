import { execFileSync } from "node:child_process";

// Test fixtures only: this script targets the isolated compose.auth-test.yaml project.
const api = "http://localhost:3002";
const password = "Password@1";
const accounts = [
  { name: "Test Contributor", email: "letuanloc.2203@hcmus.edu.vn", role: "CONTRIBUTOR" },
  { name: "Test Company", email: "contact@coffeelab.vn", role: "SME", taxCode: "0316789012" },
  { name: "Test Admin", email: "admin@genda.vn", role: "CONTRIBUTOR" }
];

for (const account of accounts) {
  const csrf = await fetch(`${api}/api/v1/auth/csrf`);
  if (!csrf.ok) throw new Error(`CSRF bootstrap failed: ${csrf.status}`);
  const { token } = await csrf.json();
  const cookie = csrf.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
  const headers = { "Content-Type": "application/json", "X-CSRF-Token": token, Cookie: cookie };
  const registration = await fetch(`${api}/api/v1/auth/register`, { method: "POST", headers, body: JSON.stringify({ ...account, password }) });
  if (!registration.ok) throw new Error(`Fixture registration failed: ${registration.status}; use a fresh isolated test database`);
}

const dockerArgs = process.env.E2E_DOCKER_HOST ? ["-H", process.env.E2E_DOCKER_HOST] : [];
execFileSync("docker", [...dockerArgs, "compose", "-f", "compose.auth-test.yaml", "exec", "-T", "database",
  "psql", "-U", "auth_test", "-d", "auth_test", "-v", "ON_ERROR_STOP=1", "-c",
  "UPDATE app_users SET role = 'ADMIN' WHERE email = 'admin@genda.vn' AND account_state = 'ACTIVE'"], { stdio: "inherit" });
console.log("Auth E2E fixtures registered without email verification.");
