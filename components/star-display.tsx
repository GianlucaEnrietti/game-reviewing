type Props = {
  value: number;
  className?: string;
};

export default function StarDisplay({ value, className }: Props) {
  const safeValue = Math.max(0, Math.min(5, value || 0));

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${className ?? ""}`}
      aria-label={`${safeValue} de 5 estrellas`}
      title={`${safeValue}/5`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.max(0, Math.min(1, safeValue - (star - 1)));

        return (
          <span key={star} className="relative inline-block leading-none">
            <span className="text-slate-600">★</span>
            <span
              className="absolute inset-0 overflow-hidden text-amber-400"
              style={{ width: `${fill * 100}%` }}
            >
              ★
            </span>
          </span>
        );
      })}
    </div>
  );
}
