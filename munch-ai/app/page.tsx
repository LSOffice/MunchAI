import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import HomeClient from "./components/HomeClient";

export default async function Home() {
  const session = await getServerSession();

  if (session) {
    redirect("/dashboard");
  }

  return <HomeClient />;
}
