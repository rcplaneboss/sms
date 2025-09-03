import { auth } from "@/auth";
import TabsClient from "@/components/TabsClient";

export default async function TabsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const session = await auth();
  const initialUserId = session?.user?.id ?? null;
  const initialIsAccountRegSucc = Boolean((await searchParams)?.registered);

  return (
    <TabsClient
      initialUserId={initialUserId}
      initialIsAccountRegSucc={initialIsAccountRegSucc}
    />
  );
}
