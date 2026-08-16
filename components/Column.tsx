/** The 500px measure every page shares. Fluid with gutters below 640px. */
export function Column({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-column px-6 pt-15 pb-32 sm:px-0">
      {children}
    </div>
  );
}
