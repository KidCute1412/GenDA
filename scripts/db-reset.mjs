import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlFile = resolve(__dirname, "reset-and-seed.sql");

if (!existsSync(sqlFile)) {
  console.error("Khong tim thay file reset-and-seed.sql!");
  process.exit(1);
}

const targetUrl = process.env.DATABASE_URL || process.env.SPRING_DATASOURCE_URL;

if (targetUrl) {
  console.log("Dang reset & seed vao database tu URL...");
  try {
    // Neu la jdbc:postgresql://..., chuyen thanh postgresql://
    const pgUrl = targetUrl.replace(/^jdbc:/, "");
    execSync(`psql "${pgUrl}" -f "${sqlFile}"`, { stdio: "inherit" });
    console.log("=> Reset & seed thanh cong!");
  } catch (error) {
    console.error("Loi khi chay qua psql:", error.message);
    process.exit(1);
  }
} else {
  console.log("Khong tim thay DATABASE_URL, dang reset & seed vao Docker local database...");
  try {
    // Doc file .env neu co
    let user = "genda";
    let db = "genda";
    const envPath = resolve(__dirname, "../.env");
    if (existsSync(envPath)) {
      const envContent = readFileSync(envPath, "utf8");
      const userMatch = envContent.match(/POSTGRES_USER=([^\r\n]+)/);
      const dbMatch = envContent.match(/POSTGRES_DB=([^\r\n]+)/);
      if (userMatch) user = userMatch[1].trim();
      if (dbMatch) db = dbMatch[1].trim();
    }

    const sqlContent = readFileSync(sqlFile, "utf8");
    execSync(`docker compose exec -T database psql -U ${user} -d ${db}`, {
      input: sqlContent,
      stdio: ["pipe", "inherit", "inherit"],
      cwd: resolve(__dirname, ".."),
    });
    console.log("=> Reset & seed vao local database thanh cong!");
  } catch (error) {
    console.error("Loi khi reset local database:", error.message);
    process.exit(1);
  }
}
