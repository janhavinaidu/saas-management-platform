/**
 * This is a special layout for all authentication-related pages (login, register, etc.).
 * It creates a simple, clean container that centers its content on the screen,
 * providing a focused experience for the user. It does not include the main
 * application's sidebar or navbar.
 */
export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      // These Tailwind CSS classes create a full-height flex container
      // that centers its children both vertically and horizontally.
      <main className="flex items-center justify-center min-h-screen bg-gray-50">
        {children}
      </main>
    );
  }
  