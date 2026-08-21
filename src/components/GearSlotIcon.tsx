import type { GearCategory } from "@/generated/prisma/client";

export function GearSlotIcon({ category, className }: { category: GearCategory; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (category) {
    case "SHOE":
      return (
        <svg {...common}>
          <path d="M3 18h16.5a1.5 1.5 0 0 0 0-3c-1.8-.9-2.8-1-4.3-2.4L11.5 9 7 10l.6 2.4L4 14c-1 .6-1 2.4-1 4Z" />
          <path d="M7 10 6 6" />
        </svg>
      );
    case "WATCH":
      return (
        <svg {...common}>
          <rect x={8} y={7} width={8} height={10} rx={2.2} />
          <rect x={10} y={3} width={4} height={3} rx={1} />
          <rect x={10} y={18} width={4} height={3} rx={1} />
          <path d="M12 10v2l1.4 1" />
        </svg>
      );
    case "APPAREL":
      return (
        <svg {...common}>
          <path d="M8.5 4 4 7l2 3 2-1.2V20h8V8.8L18 10l2-3-4.5-3-1.5 1.5h-4Z" />
        </svg>
      );
    case "HAT":
      return (
        <svg {...common}>
          <path d="M4.5 14a7.5 6 0 0 1 15 0" />
          <line x1={2} y1={14} x2={22} y2={14} />
          <path d="M12 8V6" />
        </svg>
      );
    case "ACCESSORY":
      return (
        <svg {...common}>
          <path d="M4 14v-1a8 8 0 0 1 16 0v1" />
          <rect x={2.5} y={13} width={4} height={7} rx={2} />
          <rect x={17.5} y={13} width={4} height={7} rx={2} />
        </svg>
      );
    case "NUTRITION":
      return (
        <svg {...common}>
          <path d="M7 4h10l1.5 4.5v10a2 2 0 0 1-2 2H7.5a2 2 0 0 1-2-2V8.5Z" />
          <line x1={5.8} y1={9} x2={18.2} y2={9} />
        </svg>
      );
  }
}
