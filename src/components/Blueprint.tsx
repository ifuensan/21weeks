import { useEffect, useRef } from "react";

/**
 * Campo generativo "blueprint": subdivisión recursiva de rectángulos con
 * trazos hairline cobalto y rellenos pastel ocasionales. Determinista
 * (semilla fija) para que no cambie entre renders.
 */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FILLS = ["rgba(36,64,216,0.05)", "rgba(36,64,216,0.08)", "rgba(233,124,28,0.05)", "rgba(23,29,54,0.04)"];

export function Blueprint({
  seed = 21,
  className = "",
  style,
}: {
  seed?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const rand = mulberry32(seed);

    interface R {
      x: number;
      y: number;
      w: number;
      h: number;
      d: number;
    }
    const rects: R[] = [{ x: 0, y: 0, w, h, d: 0 }];
    const out: R[] = [];

    while (rects.length) {
      const r = rects.pop()!;
      const minSide = Math.min(r.w, r.h);
      // cortar mientras el lado menor lo permita y con probabilidad decreciente
      if (minSide > 46 && r.d < 6 && rand() > 0.12 + r.d * 0.08) {
        const vertical = r.w > r.h ? true : r.h > r.w ? false : rand() > 0.5;
        const t = 0.3 + rand() * 0.4;
        if (vertical) {
          rects.push({ x: r.x, y: r.y, w: r.w * t, h: r.h, d: r.d + 1 });
          rects.push({ x: r.x + r.w * t, y: r.y, w: r.w * (1 - t), h: r.h, d: r.d + 1 });
        } else {
          rects.push({ x: r.x, y: r.y, w: r.w, h: r.h * t, d: r.d + 1 });
          rects.push({ x: r.x, y: r.y + r.h * t, w: r.w, h: r.h * (1 - t), d: r.d + 1 });
        }
      } else {
        out.push(r);
      }
    }

    for (const r of out) {
      if (rand() > 0.82) {
        ctx.fillStyle = FILLS[Math.floor(rand() * FILLS.length)];
        ctx.fillRect(r.x, r.y, r.w, r.h);
      }
      ctx.strokeStyle = "rgba(36,64,216,0.14)";
      ctx.lineWidth = 1;
      ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
      // puntas tipo plano en algunas esquinas
      if (rand() > 0.9 && r.w > 30 && r.h > 30) {
        ctx.fillStyle = "rgba(36,64,216,0.5)";
        ctx.beginPath();
        ctx.arc(r.x + r.w / 2, r.y + r.h / 2, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [seed]);

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
      aria-hidden
    />
  );
}
