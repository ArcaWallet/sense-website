"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import { APP_STORE_URL } from "@/lib/constants";
import { Barcode } from "@/components/Barcode";
import { Grain } from "@/components/Grain";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}

const rings = [
  { size: 1500, color: "border-flame/16", delay: ".2s" },
  { size: 1080, color: "border-sage/11", delay: ".4s" },
  { size: 700, color: "border-flame/9", delay: ".6s" },
];

const headlineWords = [
  { text: "Your", flame: false },
  { text: "wallet's", flame: false },
  { text: "missing", flame: true },
  { text: "half.", flame: false },
];

function starPath(cx: number, cy: number, outer: number, inner: number) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? inner : outer;
    return `${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`;
  });
  return `M${points.join("L")}Z`;
}

const punchSlots = [70, 103].flatMap((y) => [34, 77, 120, 163, 206].map((x) => ({ x, y })));
const punchedCount = 7;
// The first seven slots are cut out of the card, so whatever is behind it shows through.
const punchMask = `url('data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="150"><path fill="white" fill-rule="evenodd" d="M0 0H240V150H0Z${punchSlots
    .slice(0, punchedCount)
    .map((s) => starPath(s.x, s.y, 6.5, 2.8))
    .join("")}"/></svg>`
)}')`;

// Golf ball dimples on a hex grid, squashed toward the edge so the ball reads as a sphere.
const dimples = Array.from({ length: 15 }, (_, r) => r - 7).flatMap((row) =>
  Array.from({ length: 15 }, (_, c) => c - 7).flatMap((col) => {
    const x = col * 10 + (row % 2 ? 5 : 0);
    const y = row * 8.7;
    const distance = Math.hypot(x, y);
    if (distance > 51) return [];
    const squash = Math.sqrt(1 - (distance / 55) ** 2);
    return [{
      cx: +(55 + x).toFixed(1),
      cy: +(55 + y).toFixed(1),
      rx: +(3.1 * squash).toFixed(2),
      angle: Math.round((Math.atan2(y, x) * 180) / Math.PI),
      opacity: +(0.09 + 0.1 * (1 - squash) + (x + y > 0 ? 0.05 : 0)).toFixed(3),
    }];
  })
);

// Every card is lit from the screen's top-left, so offsets are counter-rotated by the card's resting tilt.
function screenOffset(rotate: number, dx: number, dy: number) {
  const t = (-rotate * Math.PI) / 180;
  return `${(dx * Math.cos(t) - dy * Math.sin(t)).toFixed(1)}px ${(dx * Math.sin(t) + dy * Math.cos(t)).toFixed(1)}px`;
}

const embossed = { textShadow: "0 -0.5px 0 rgba(255,255,255,.35), 0 1px 0.5px rgba(0,0,0,.65)" };

const spring: Transition = { type: "spring", stiffness: 120, damping: 16, mass: 0.9 };

const fanVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.05 } },
};

const headlineContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 1.45 } },
};

const wordVariants = {
  hidden: { opacity: 0, y: 34 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } },
};

function cardVariants(
  hidden: { x: number; y: number; rotate: number },
  visible: { x: number; y: number; rotate: number }
) {
  return {
    hidden: { ...hidden, opacity: 0 },
    visible: { ...visible, opacity: 1, transition: spring },
  };
}

function Brushed({ angle, opacity }: { angle: number; opacity: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background: `repeating-linear-gradient(${angle}deg, rgba(255,255,255,.035) 0 1px, transparent 1px 3px, rgba(0,0,0,.04) 3px 4px, transparent 4px 5px)`,
        opacity,
      }}
    />
  );
}

function HeroCard({
  hidden,
  visible,
  background,
  highlight,
  shade,
  mask,
  draggable = true,
  overlay,
  children,
}: {
  hidden: { x: number; y: number; rotate: number };
  visible: { x: number; y: number; rotate: number };
  background: string;
  highlight: number;
  shade: number;
  mask?: string;
  draggable?: boolean;
  overlay?: React.ReactNode;
  children: React.ReactNode;
}) {
  const lightAngle = 132 - visible.rotate;
  return (
    <motion.div
      variants={cardVariants(hidden, visible)}
      className="absolute top-1/2 left-1/2 -mt-[75px] -ml-[120px] h-[150px] w-[240px]"
    >
      <motion.div
        drag={draggable}
        dragElastic={0.15}
        dragSnapToOrigin
        whileDrag={draggable ? { scale: 1.05, zIndex: 20 } : undefined}
        whileHover={{ scale: 1.02 }}
        className={`relative h-full w-full rounded-[9px] ${
          draggable ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        style={{
          boxShadow: `${screenOffset(visible.rotate, 0, 2)} 3px rgba(0,0,0,.5), ${screenOffset(visible.rotate, 0, 16)} 26px rgba(0,0,0,.42)`,
        }}
      >
        <div
          className="absolute inset-0 overflow-hidden rounded-[9px]"
          style={{
            background,
            maskImage: mask,
            WebkitMaskImage: mask,
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
          }}
        >
          {children}
          <div
            className="pointer-events-none absolute inset-0 rounded-[9px]"
            style={{
              background: `linear-gradient(${lightAngle}deg, rgba(255,255,255,${highlight}) 0%, rgba(255,255,255,0) 46%), linear-gradient(${lightAngle}deg, rgba(0,0,0,0) 54%, rgba(0,0,0,${shade}) 100%)`,
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,.1)",
            }}
          />
          {overlay}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  return (
    <header
      id="top"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink px-[5vw] pt-[92px] pb-[56px] text-bone"
    >
      {rings.map((ring) => (
        <div
          key={ring.size}
          className={`absolute top-1/2 left-1/2 rounded-full border-[30px] ${ring.color} animate-[fadein_1.4s_both]`}
          style={{
            width: ring.size,
            height: ring.size,
            marginTop: -ring.size / 2,
            marginLeft: -ring.size / 2,
            animationDelay: ring.delay,
          }}
        />
      ))}

      <motion.div
        className="relative mb-[10px] h-[190px] w-full max-w-[1100px] md:h-[252px]"
        variants={fanVariants}
        initial={shouldReduceMotion ? "visible" : "hidden"}
        animate="visible"
      >
        {/* Blue Bottle Coffee */}
        <HeroCard
          hidden={isMobile ? { x: -120, y: -260, rotate: -18 } : { x: -330, y: -760, rotate: -38 }}
          visible={isMobile ? { x: -78, y: 6, rotate: -9 } : { x: -268, y: 26, rotate: -19 }}
          draggable={!isMobile}
          background="#f6f3ec"
          highlight={0.55}
          shade={0.1}
        >
          <Grain frequency={0.85} opacity={0.07} />
          <div className="absolute top-[13px] left-[16px] flex items-center gap-[7px]">
            <span className="flex h-[23px] w-[23px] flex-none items-center justify-center rounded-full bg-[#2f5d4f] shadow-[inset_0_1px_1px_rgba(255,255,255,.2)]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e6ede9" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 8h13a2 2 0 0 1 0 4h-.6" />
                <path d="M4 8v7a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3V8" />
                <path d="M8 4c.5 1 .5 2-.5 3M12 4c.5 1 .5 2-.5 3" />
              </svg>
            </span>
            <span className="text-[12px] font-bold tracking-[0.01em] text-[#2f5d4f]">
              Blue Bottle Coffee
            </span>
          </div>
          <div className="absolute top-[50px] left-[16px] text-[8px] font-semibold text-ink/50">
            Gift card
          </div>
          <div className="absolute top-[60px] left-[14.5px] text-[36px] leading-none font-bold tracking-[-0.04em] text-ink">
            $25
          </div>
          <div className="absolute bottom-[13px] left-[16px] text-[7.5px] tracking-[0.1em] text-ink/50 tabular-nums">
            7742 8813 0094
          </div>
          <Barcode value="774288130094" className="absolute right-[15px] bottom-[22px] h-[32px] w-[88px] text-[#151a1c]" />
          <div className="absolute right-[15px] bottom-[12px] w-[88px] text-center text-[6px] tracking-[0.12em] text-ink/55 tabular-nums">
            7742 8813 0094
          </div>
        </HeroCard>

        {/* Target */}
        <HeroCard
          hidden={isMobile ? { x: 0, y: -300, rotate: 10 } : { x: -190, y: -820, rotate: 26 }}
          visible={isMobile ? { x: 0, y: -16, rotate: -3 } : { x: -172, y: -58, rotate: -9.5 }}
          draggable={!isMobile}
          background="radial-gradient(120% 130% at 30% 20%,#ec5a42 0%,#df4a33 55%,#c43c27 100%)"
          highlight={0.24}
          shade={0.2}
          overlay={
            <div
              className="pointer-events-none absolute inset-0 w-[60%] animate-[sheen_3.4s_1.6s_ease-in-out_infinite]"
              style={{
                background: "linear-gradient(90deg,transparent,rgba(255,255,255,.32),transparent)",
              }}
            />
          }
        >
          <Grain frequency={0.9} opacity={0.04} />
          <div
            className="absolute inset-x-0 top-[63px] h-[16px]"
            style={{
              background: "linear-gradient(180deg,#ffffff 0%,#f1ede6 30%,#ffffff 52%,#e4ded4 100%)",
              boxShadow: "0 1px 2px rgba(110,20,8,.35)",
            }}
          />
          <div
            className="absolute inset-y-0 left-[149px] w-[16px]"
            style={{
              background: "linear-gradient(90deg,#ffffff 0%,#f1ede6 30%,#ffffff 52%,#e4ded4 100%)",
              boxShadow: "1px 0 2px rgba(110,20,8,.3)",
            }}
          />
          <svg
            viewBox="0 0 152 122"
            className="absolute top-[41px] left-[119px] h-[61px] w-[76px] drop-shadow-[0_1.5px_1.5px_rgba(110,20,8,.4)]"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bow-satin-a" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset=".55" stopColor="#f2eee7" />
                <stop offset="1" stopColor="#d9d2c6" />
              </linearGradient>
              <linearGradient id="bow-satin-b" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset=".55" stopColor="#efebe3" />
                <stop offset="1" stopColor="#d4ccbf" />
              </linearGradient>
            </defs>
            <path d="M70 62 C 58 92, 44 108, 34 120 L 50 116 L 56 122 C 64 104, 72 84, 76 64 Z" fill="url(#bow-satin-a)" />
            <path d="M82 62 C 92 90, 104 106, 116 120 L 100 117 L 95 122 C 88 104, 80 84, 76 64 Z" fill="url(#bow-satin-b)" />
            <path d="M74 60 C 52 32, 18 22, 10 38 C 4 52, 30 70, 72 66 Z" fill="url(#bow-satin-a)" />
            <path d="M70 60 C 50 44, 28 38, 22 44" fill="none" stroke="#d6cfc2" strokeWidth="2" />
            <path d="M78 60 C 100 32, 134 22, 142 38 C 148 52, 122 70, 80 66 Z" fill="url(#bow-satin-b)" />
            <path d="M82 60 C 102 44, 124 38, 130 44" fill="none" stroke="#d6cfc2" strokeWidth="2" />
            <rect x="64" y="52" width="24" height="20" rx="7" fill="url(#bow-satin-a)" stroke="#d9d2c6" strokeWidth="1.2" />
          </svg>
          <div className="absolute top-[15px] left-[16px] text-[13px] font-bold tracking-[-0.01em] text-white">
            Target
          </div>
          <div className="absolute bottom-[38px] left-[16px] text-[8px] font-semibold text-white/82">
            Gift card
          </div>
          <div className="absolute bottom-[11px] left-[15px] text-[28px] leading-none font-bold tracking-[-0.03em] text-white">
            $50
          </div>
        </HeroCard>

        {/* Equinox */}
        <HeroCard
          hidden={isMobile ? { x: 120, y: -280, rotate: -12 } : { x: -40, y: -880, rotate: -30 }}
          visible={isMobile ? { x: 78, y: 14, rotate: 8 } : { x: -64, y: 52, rotate: 4 }}
          draggable={!isMobile}
          background="radial-gradient(130% 120% at 25% 10%,#2e3e44 0%,#24323a 50%,#182226 100%)"
          highlight={0.16}
          shade={0.32}
        >
          <Brushed angle={115} opacity={1} />
          <div
            className="absolute inset-x-0 top-[22px] h-[26px]"
            style={{
              background: "linear-gradient(180deg,#0c1011,#1b2326)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.07), inset 0 -1px 0 rgba(0,0,0,.4)",
            }}
          />
          <div className="absolute top-[58px] left-[16px] flex items-center gap-[6.5px]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c3d5d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h4l2 6 4-14 2 8h8" />
            </svg>
            <span className="text-[12px] font-bold tracking-[0.24em] text-white">EQUINOX</span>
          </div>
          <div className="absolute top-[81px] left-[16px] text-[8px] font-medium text-sage/72">
            Member since 2019
          </div>
          <div className="absolute bottom-[15px] left-[16px] text-[13.5px] font-semibold tracking-[0.04em] text-[#e9eef0]" style={embossed}>
            J. DOE
          </div>
          <div className="absolute right-[16px] bottom-[16px] text-[10.5px] font-medium tracking-[0.1em] text-[#cfdcd9] tabular-nums" style={embossed}>
            4471 0092
          </div>
        </HeroCard>

        {!isMobile && (
        <>
        {/* Paper Source */}
        <HeroCard
          hidden={{ x: 120, y: -800, rotate: 34 }}
          visible={{ x: 58, y: -40, rotate: -3 }}
          background="#cad8d3"
          highlight={0.32}
          shade={0.12}
          mask={punchMask}
        >
          <Grain frequency={0.5} opacity={0.1} />
          <div className="absolute top-[14px] left-[16px] flex items-center gap-[5px]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#e8503a">
              <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 16.9 5.8 20.3l1.6-6.8-5.2-4.6 6.9-.6z" />
            </svg>
            <span className="text-[11.5px] font-bold tracking-[0.01em] text-[#25383c]">
              Paper Source
            </span>
          </div>
          <div className="absolute top-[33px] left-[16px] text-[8px] font-medium text-[#25383c]/70">
            Buy 9, get the 10th free
          </div>
          <svg viewBox="0 0 240 150" className="absolute inset-0 h-full w-full" aria-hidden="true">
            {punchSlots.map((slot, i) => (
              <circle
                key={`${slot.x}-${slot.y}`}
                cx={slot.x}
                cy={slot.y}
                r={12.5}
                fill="none"
                stroke="#e8503a"
                strokeWidth={1}
                strokeOpacity={i < punchedCount ? 0.9 : 0.55}
                strokeDasharray={i < punchedCount ? undefined : "2 2"}
              />
            ))}
            {punchSlots.slice(0, punchedCount).map((slot) => (
              <path
                key={`edge-${slot.x}-${slot.y}`}
                d={starPath(slot.x, slot.y, 6.8, 3)}
                fill="none"
                stroke="rgba(37,56,60,.45)"
                strokeWidth={0.65}
              />
            ))}
            <text x={206} y={105.5} textAnchor="middle" fontSize={7} fontWeight={700} fill="#e8503a" fillOpacity={0.75}>
              Free
            </text>
          </svg>
          <div className="absolute bottom-[12px] left-[16px] text-[7px] font-medium text-[#25383c]/58">
            Loyalty card. Never expires.
          </div>
        </HeroCard>

        {/* Public Library */}
        <HeroCard
          hidden={{ x: 300, y: -900, rotate: -22 }}
          visible={{ x: 206, y: 58, rotate: 11 }}
          background="#f7f4ed"
          highlight={0.5}
          shade={0.12}
        >
          <Grain frequency={0.7} opacity={0.08} />
          <div
            className="absolute inset-x-0 top-0 flex h-[23px] items-center gap-[5px] pl-[16px]"
            style={{ background: "linear-gradient(180deg,#3a4f56,#28383d)" }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6c-1.5-1-4-1.5-6-1v13c2-.5 4.5 0 6 1 1.5-1 4-1.5 6-1V5c-2-.5-4.5 0-6 1z" />
            </svg>
            <span className="text-[9.5px] font-bold tracking-[0.2em] text-white">PUBLIC LIBRARY</span>
          </div>
          <div className="absolute top-[35px] left-[16px] text-[7.5px] font-semibold text-ink/50">
            Cardholder
          </div>
          <div className="absolute top-[46px] left-[16px] text-[15.5px] font-semibold tracking-[-0.01em] text-ink">
            John Doe
          </div>
          <div className="absolute top-[76px] right-[16px] left-[16px] h-px bg-ink/18" />
          <Barcode value="29000012345678" className="absolute bottom-[24px] left-[16px] h-[29px] w-[208px] text-[#151a1c]" />
          <div className="absolute bottom-[12px] left-[16px] text-[7px] tracking-[0.16em] text-ink/60 tabular-nums">
            2 9000 01234 5678
          </div>
        </HeroCard>

        {/* 1757 Golf Club */}
        <HeroCard
          hidden={{ x: 400, y: -700, rotate: 40 }}
          visible={{ x: 318, y: -52, rotate: 20 }}
          background="radial-gradient(130% 120% at 25% 10%,#5a727c 0%,#445860 50%,#2b3d43 100%)"
          highlight={0.2}
          shade={0.3}
        >
          <Brushed angle={70} opacity={1} />
          <div className="absolute top-[15px] left-[16px] text-[11.5px] font-bold tracking-[0.01em] text-white">
            1757 Golf Club
          </div>
          <div className="absolute top-[35px] left-[16px] text-[8px] font-medium text-sage/78">
            Season pass 26/27
          </div>
          <div
            className="absolute top-[31px] right-[21px] h-[55px] w-[55px] rounded-full"
            style={{
              background: "radial-gradient(circle at 34% 30%,#ffffff 0%,#eef1ef 35%,#d3d9d7 70%,#a4b0ad 100%)",
              boxShadow: `${screenOffset(20, 2.5, 4.5)} 7px rgba(0,0,0,.42), inset -3px -4px 7px rgba(16,19,20,.18)`,
            }}
          >
            <svg viewBox="0 0 110 110" className="absolute inset-0 h-full w-full" aria-hidden="true">
              {dimples.map((d) => (
                <ellipse
                  key={`${d.cx}-${d.cy}`}
                  cx={d.cx}
                  cy={d.cy}
                  rx={d.rx}
                  ry={3.1}
                  transform={`rotate(${d.angle} ${d.cx} ${d.cy})`}
                  fill={`rgba(16,19,20,${d.opacity})`}
                />
              ))}
            </svg>
          </div>
          <div className="absolute bottom-[38px] left-[16px] text-[7.5px] font-medium tracking-[0.06em] text-sage/62 tabular-nums">
            Member 0092-4471
          </div>
          <div className="absolute bottom-[15px] left-[16px] text-[13.5px] font-semibold tracking-[0.04em] text-[#eef2f2]" style={embossed}>
            J. DOE
          </div>
        </HeroCard>
        </>
        )}
      </motion.div>

      <div className="relative max-w-[1000px] text-center">
        <Image
          src="/assets/sense-logo.png"
          alt=""
          width={104}
          height={104}
          priority
          className="mx-auto -mt-[6px] mb-[6px] block animate-[pop_.7s_1.15s_cubic-bezier(.2,.9,.3,1.2)_both]"
        />
        <motion.h1
          className="m-0 flex flex-wrap justify-center gap-x-[.28em] gap-y-0 text-[clamp(48px,8.2vw,116px)] leading-[0.9] font-bold tracking-[-0.05em]"
          variants={headlineContainer}
          initial={shouldReduceMotion ? "visible" : "hidden"}
          animate="visible"
        >
          {headlineWords.map((word) => (
            <motion.span
              key={word.text}
              variants={wordVariants}
              className={word.flame ? "text-flame" : ""}
            >
              {word.text}
            </motion.span>
          ))}
        </motion.h1>
        <p
          className="mx-auto mt-[20px] max-w-[560px] animate-[rise_.8s_cubic-bezier(.16,1,.3,1)_both] text-[19px] leading-[1.5] text-bone/62"
          style={{ animationDelay: "2.05s" }}
        >
          Gift cards, memberships, loyalty, passes. Everything with a barcode - scanned once, organized forever, and one tap away the moment you walk out the door.
        </p>
        <div
          className="mt-[26px] flex animate-[rise_.8s_cubic-bezier(.16,1,.3,1)_both] flex-col items-center justify-center gap-[14px] md:flex-row md:gap-[16px]"
          style={{ animationDelay: "2.2s" }}
        >
          <a
            href={APP_STORE_URL}
            className="rounded-full bg-flame px-[32px] py-[19px] text-[16.5px] font-bold text-white no-underline transition-colors hover:bg-bone hover:text-ink"
          >
            Pre-order coming soon
          </a>
          <span className="text-center font-mono text-[12px] leading-[1.6] tracking-[0.1em] text-bone/40 uppercase md:text-left">
            iOS · free at launch
            <br />
            nothing leaves your phone
          </span>
        </div>
      </div>
    </header>
  );
}
