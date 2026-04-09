import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-screen bg-field-cream flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 bg-field-forest rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">FF</span>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-field-ink">Create your account</h1>
        <p className="text-sm text-field-earth mt-1">Start managing your wildlife exemption</p>
      </div>
      <SignUp
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "shadow-none border border-field-wheat rounded-xl",
          },
        }}
      />
    </div>
  );
}
