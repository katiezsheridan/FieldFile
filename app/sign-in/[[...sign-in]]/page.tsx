import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-field-cream flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 bg-field-forest rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">FF</span>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-field-ink">Welcome back</h1>
        <p className="text-sm text-field-earth mt-1">Sign in to your FieldFile account</p>
      </div>
      <SignIn
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
