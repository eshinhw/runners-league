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
    case "HEADPHONES":
      return (
        <svg {...common}>
          <path d="M4 14v-1a8 8 0 0 1 16 0v1" />
          <rect x={2.5} y={13} width={4} height={7} rx={2} />
          <rect x={17.5} y={13} width={4} height={7} rx={2} />
        </svg>
      );
    case "RUNNING_BELT":
      return (
        <svg {...common}>
          <path d="M2 12h5M17 12h5" />
          <rect x={7} y={9} width={10} height={6} rx={1.5} />
          <line x1={12} y1={9} x2={12} y2={15} />
        </svg>
      );
    case "HYDRATION_VEST":
      return (
        <svg {...common}>
          <path d="M9 4 6 6.5V20a1 1 0 0 0 1 1h3V9M15 4l3 2.5V20a1 1 0 0 1-1 1h-3V9" />
          <path d="M9 4h6l-.5 3a2.5 2.5 0 0 1-5 0Z" />
        </svg>
      );
    case "SUNGLASSES":
      return (
        <svg {...common}>
          <circle cx={7} cy={13} r={3} />
          <circle cx={17} cy={13} r={3} />
          <path d="M10 13h4" />
          <path d="M4 11 5.5 8h2" />
          <path d="M20 11 18.5 8h-2" />
        </svg>
      );
    case "HEADLAMP":
      return (
        <svg {...common}>
          <path d="M4.5 11a7.5 6 0 0 1 15 0" />
          <circle cx={12} cy={11} r={2.2} />
          <line x1={12} y1={5} x2={12} y2={6.5} />
        </svg>
      );
    case "GLOVES":
      return (
        <svg {...common}>
          <rect x={7} y={9} width={9} height={11} rx={4} />
          <path d="M7 13a3 3 0 0 0-3 3v1a3 3 0 0 0 3 3" />
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
