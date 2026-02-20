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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-field-forest rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FF</span>
            </div>
            <span className="text-xl font-semibold text-field-ink">
              FieldFile
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 py-8 px-8">
        <div className="max-w-3xl mx-auto h-full">
          {children}
        </div>
      </main>

      {/* Simple footer */}
      <footer className="py-4 px-8 text-center text-sm text-field-ink/50">
        Questions? Contact support@fieldfile.com
      </footer>
    </div>
  );
}
