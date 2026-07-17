// 도토리 마크 — 지출 1건 = 도토리 1개. 바구니·달력에서 함께 쓴다
export default function Acorn({
  size = 20,
  label,
}: {
  size?: number;
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {label && <title>{label}</title>}
      <path
        d="M12 21.6c-3.4-2.3-5.2-5-5.2-8.1h10.4c0 3.1-1.8 5.8-5.2 8.1z"
        fill="#ffa9b8"
      />
      <rect x="11.1" y="4.4" width="1.8" height="2.8" rx="0.9" fill="#ff385c" />
      <path d="M6 13.5a6 6 0 0 1 12 0z" fill="#ff385c" />
    </svg>
  );
}

// 토리 도토리 캐릭터 "동글이" — 시안 1번. 일러스트라 고유 갈색을 유지한다
export function AcornCharacter({ size = 56 }: { size?: number }) {
  return (
    <svg
      viewBox="58 82 144 186"
      width={size}
      height={Math.round((size * 186) / 144)}
      aria-hidden="true"
    >
      <circle
        cx="130"
        cy="200"
        r="62"
        fill="#C98F5F"
        stroke="#8A5A33"
        strokeWidth="1.5"
      />
      <path d="M 126 106 Q 122 96 132 92 Q 140 98 134 108 Z" fill="#6E4426" />
      <path
        d="M 66 176 A 66 62 0 0 1 194 176 Q 162 190 130 184 Q 98 190 66 176 Z"
        fill="#7A4E2D"
        stroke="#5E3A20"
        strokeWidth="1.5"
      />
      <circle cx="108" cy="210" r="4.5" fill="#3B2A1E" />
      <circle cx="152" cy="210" r="4.5" fill="#3B2A1E" />
      <circle cx="109.5" cy="208.5" r="1.5" fill="#FFFFFF" />
      <circle cx="153.5" cy="208.5" r="1.5" fill="#FFFFFF" />
      <ellipse cx="94" cy="226" rx="10" ry="5.5" fill="#F0A088" opacity="0.85" />
      <ellipse
        cx="166"
        cy="226"
        rx="10"
        ry="5.5"
        fill="#F0A088"
        opacity="0.85"
      />
      <path
        d="M 121 224 Q 130 232 139 224"
        fill="none"
        stroke="#3B2A1E"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
