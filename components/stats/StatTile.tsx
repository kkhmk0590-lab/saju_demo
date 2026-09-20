/** dataviz 스킬 stat tile 스펙: label + 큰 값(48px, proportional figures). */
export function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-base text-[var(--color-text-secondary)]">{label}</span>
      <span className="text-5xl font-semibold leading-none">{value}</span>
    </div>
  );
}
