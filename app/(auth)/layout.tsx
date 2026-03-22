import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-field-cream flex flex-col">
      {/* Simple header with logo */}
      <header className="py-6 px-8 border-b border-field-wheat/50">
        <div className="max-w-4xl mx-auto">
          <Image
            src="/images/logo/fieldfile-logo.png"
            alt="FieldFile"
            width={160}
            height={40}
            className="h-8 w-auto"
          />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 py-8 px-8">
        <div className="max-w-3xl mx-auto h-full">
          {children}
        </div>
      </main>

      {/* Simple footer */}
      <footer className="py-4 px-8 text-center text-sm text-field-earth">
        Questions? Contact katie@fieldfile.com
      </footer>
    </div>
  );
}
