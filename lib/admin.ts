import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

// Call this at the top of every admin page and every admin action
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/fr/login?next=admin");
  if (user.role !== "ADMIN") notFound(); // customers just see a 404
  return user;
}