import Link from "next/link";
import { ForceNavDarkTop } from "@/components/Nav";

const corners = [
  "top-0 left-0 border-t-2 border-l-2",
  "top-0 right-0 border-t-2 border-r-2",
  "bottom-0 left-0 border-b-2 border-l-2",
  "bottom-0 right-0 border-b-2 border-r-2",
];

export function EmptyScan() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-ink px-[5vw] pt-[120px] pb-[80px] text-center text-bone">
      <ForceNavDarkTop />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[1100px] w-[1100px] -translate-x-1/2 -translate-y-[54%] rounded-full border-[26px] border-bone/[.045]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-[54%] rounded-full border-[20px] border-flame/[.09]" />

      <div className="relative flex max-w-[560px] flex-col items-center">
        <div aria-hidden="true" className="relative aspect-[85.6/54] w-[min(340px,78vw)] p-[18px]">
          {corners.map((position) => (
            <span key={position} className={`absolute h-[30px] w-[30px] border-bone ${position}`} />
          ))}
          <div className="flex h-full flex-col items-start justify-end rounded-[14px] border-[1.5px] border-dashed border-bone/28 bg-bone/[.025] px-[22px] pb-[18px]">
            <div
              className="h-[34px] w-[62%] opacity-30"
              style={{
                background:
                  "repeating-linear-gradient(90deg,#f4f3f1 0 2px,transparent 2px 4px,#f4f3f1 4px 5px,transparent 5px 9px,#f4f3f1 9px 12px,transparent 12px 14px)",
              }}
            />
            <div className="mt-[6px] text-[12px] tracking-[0.32em] text-bone/38 tabular-nums">
              000 404 000
            </div>
          </div>
          <span className="absolute inset-x-[6px] top-1/2 h-[2px] animate-[sweep_2.6s_cubic-bezier(.45,0,.55,1)_infinite_alternate] rounded-[2px] bg-flame shadow-[0_0_14px_2px_rgba(232,80,58,.55)]" />
        </div>

        <h1 className="mt-[36px] text-[clamp(36px,6vw,64px)] leading-[0.98] font-bold tracking-[-0.045em] text-balance md:mt-[44px]">
          Nothing to scan here.
        </h1>
        <p className="mt-[18px] max-w-[440px] text-[16.5px] leading-[1.5] text-pretty text-bone/62 md:text-[18px]">
          This page doesn&apos;t exist, or the link has changed. Your cards are safe - this is just a wrong turn.
        </p>
        <div className="mt-[30px] flex flex-wrap items-center justify-center gap-[22px]">
          <Link
            href="/"
            className="rounded-full bg-flame px-[30px] py-[17px] text-[16px] font-bold text-white no-underline transition-colors hover:bg-flame-hover hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bone"
          >
            Back to home
          </Link>
          <Link
            href="/#product"
            className="border-b border-bone/28 pb-[2px] text-[15.5px] font-semibold text-bone/72 no-underline transition-colors hover:border-bone hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bone"
          >
            See how Sense works
          </Link>
        </div>
      </div>
    </main>
  );
}
