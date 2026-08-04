interface ProgressRingProps {
  rate: number;
  done: number;
  total: number;
  size?: number;
}

const TRACK_COLOR = "#e1e0d9";
const PROGRESS_COLOR = "#2a78d6";

export function ProgressRing({ rate, done, total, size = 128 }: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, rate));
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`今日の達成率 ${clamped}%、${done}件中${total === 0 ? 0 : total}件が対象`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={TRACK_COLOR} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={PROGRESS_COLOR}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[#0b0b0b]">{clamped}%</span>
        <span className="text-xs text-[#898781]">
          {done}/{total}件
        </span>
      </div>
    </div>
  );
}
