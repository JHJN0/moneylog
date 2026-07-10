// 데이터 로딩 중 자리표시자 — 크기는 className(w-*, h-*)으로 지정
export default function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-line ${className}`} />;
}
