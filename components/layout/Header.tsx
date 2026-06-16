"use client";

import { UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-field-wheat/50 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <Image
          src="/images/logo/fieldfile-icon-round.png"
          alt="FieldFile"
          width={32}
          height={32}
        />
        <span className="text-xl font-semibold text-field-ink">
          FieldFile
        </span>
      </div>

      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "w-9 h-9",
          },
        }}
      />
    </header>
  );
}
