export default function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-medium text-black mb-1.5 block">
      {children}
    </label>
  );
}
