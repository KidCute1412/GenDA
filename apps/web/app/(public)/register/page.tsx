import { redirect } from "next/navigation";

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const params = await searchParams;
  const roleQuery = params.role ? `&role=${params.role}` : "";
  redirect(`/login?mode=register${roleQuery}`);
}
