import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getUserPosts } from "@/app/actions/getUserPosts";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }
  const posts = await getUserPosts(session.user.id);
  return <DashboardClient session={session} posts={posts} />;
}
