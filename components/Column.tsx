/** The 640px measure every page shares. Fluid with 24px gutters below 688px. */
export function Column({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-column px-6 pt-15 pb-32 column:px-0">
      {children}
    </div>
  );
}
