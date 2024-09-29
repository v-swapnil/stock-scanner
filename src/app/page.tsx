"use client";

import { Text } from "@tremor/react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Text>
        Go to{" "}
        <Link href="/dashboard">
          <b>/dashboard</b>
        </Link>{" "}
        for main content
      </Text>
    </main>
  );
}
