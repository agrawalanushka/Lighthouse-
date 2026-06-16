export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 min-h-screen">
      {children}
    </div>
  );
}
