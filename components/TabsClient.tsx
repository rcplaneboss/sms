"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentRegProfileTab } from "@/components/StudentRegProfileTab";
import { StudentRegAccountTab } from "@/components/StudentRegAccountTab";

type Props = {
  initialUserId: string | null;
  initialIsAccountRegSucc: boolean;
};

export default function TabsClient({
  initialUserId,
  initialIsAccountRegSucc,
}: Props) {
  const [userId, setUserId] = useState<string | null>(initialUserId);
  const [isAccountRegSucc, setIsAccountRegSucc] = useState<boolean>(
    initialIsAccountRegSucc
  );
  const [activeTab, setActiveTab] =
    useState<"account-info" | "essential-info">(
      initialIsAccountRegSucc ? "essential-info" : "account-info"
    );

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("registered")) setIsAccountRegSucc(true);
  }, [searchParams]);

  
  useEffect(() => {
    if (isAccountRegSucc) setActiveTab("essential-info");
  }, [isAccountRegSucc]);

  return (
    <main className="flex justify-center items-center my-12">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <Tabs
          value={activeTab}
          onValueChange={(v) =>
            setActiveTab(v as "account-info" | "essential-info")
          }
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="account-info" className="font-sans cursor-pointer">
              Account Info
            </TabsTrigger>
            <TabsTrigger
              value="essential-info"
              className="font-sans cursor-pointer"
              disabled={!isAccountRegSucc}
            >
              Essential Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account-info" className="max-w-sm">
            {/* First tab sets userId + success */}
            <StudentRegAccountTab
              setUserId={setUserId}
              setIsAccountRegSucc={setIsAccountRegSucc}
            />
          </TabsContent>

          <TabsContent value="essential-info" className="w-full max-w-2xl">
            {/* Second tab only consumes userId */}
            <StudentRegProfileTab userId={userId} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
