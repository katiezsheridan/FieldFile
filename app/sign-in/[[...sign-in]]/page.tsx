import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-field-cream flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-2">
          <Image
            src="/images/logo/fieldfile-icon-round.png"
            alt="FieldFile"
            width={48}
            height={48}
          />
        </div>
        <h1 className="text-2xl font-semibold text-field-ink">Welcome back</h1>
        <p className="text-sm text-field-earth mt-1">Sign in to your FieldFile account</p>
      </div>
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "shadow-none border border-field-wheat rounded-xl",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            logoBox: "hidden",
          },
        }}
      />
    </div>
  );
}
