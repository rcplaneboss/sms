"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentRegProfileTab } from "@/components/StudentRegProfileTab";
import { StudentRegAccountTab } from "@/components/StudentRegAccountTab";
import { useState } from "react";

export default function TabsDemo() {

  const [isAccountRegSucc, setIsAccountRegSucc] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  return (
    <main className="flex justify-center items-center my-12">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <Tabs
          defaultValue="account-info"
          value={isAccountRegSucc ? "essential-info" : "account-info"}

          className="w-full"
        >
          <TabsList>
            <TabsTrigger
              value="account-info"
              className="font-sans cursor-pointer"
            >
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
            <StudentRegAccountTab setUserId={setUserId} setIsAccountRegSucc={setIsAccountRegSucc} />
          </TabsContent>

          <TabsContent value="essential-info" className="w-full max-w-2xl">
            <StudentRegProfileTab userId={userId} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
