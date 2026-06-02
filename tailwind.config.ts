import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1100px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // 명리공방 Luxury Dark Palette
        ink: "#f2eed8",                  // 기본 텍스트 (warm white)
        canvas: "#060209",               // 배경 (deep royal black)
        "surface-soft": "#0d0817",       // 카드/서피스
        "surface-dark": "#040107",       // 더 어두운 서피스
        charcoal: "#9b96b8",             // 중간 텍스트
        body: "#7a7598",                 // 본문 텍스트
        mute: "#4e4868",                 // 흐린 텍스트
        hairline: "rgba(91,33,182,0.22)",        // 딥바이올렛 테두리
        "hairline-strong": "rgba(91,33,182,0.42)",
        // 로열 퍼플 팔레트 (더 깊고 진한)
        "purple-deep": "#1e0533",        // 가장 진한 — 미드나잇 바이올렛
        "purple-rich": "#5b21b6",        // 시그니처 — 딥 로열 퍼플
        "purple-mid": "#7c3aed",         // 중간 보라
        "purple-bright": "#9d6fe8",      // 밝은 보라
        "purple-light": "#c4b5fd",       // 연한 보라
        "purple-glow": "rgba(91,33,182,0.35)",  // 글로우용
        // 골드 포인트 (럭셔리 강조)
        "gold": "#c9a84c",               // 시그니처 골드
        "gold-light": "#e8d5a0",         // 밝은 샴페인
        "gold-glow": "rgba(201,168,76,0.35)",
      },
      backgroundImage: {
        "purple-gradient": "linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)",
        "purple-gradient-dark": "linear-gradient(135deg, #1e0533 0%, #4c1d95 100%)",
        "hero-radial": "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(91,33,182,0.28) 0%, transparent 70%)",
        "text-gradient": "linear-gradient(135deg, #ffffff 0%, #ede0c4 45%, #c9a84c 100%)",
        "cta-gradient": "linear-gradient(135deg, rgba(30,5,51,0.7) 0%, rgba(91,33,182,0.45) 50%, rgba(10,3,25,0.85) 100%)",
        "gold-gradient": "linear-gradient(135deg, #c9a84c 0%, #e8d5a0 50%, #c9a84c 100%)",
      },
      boxShadow: {
        "purple-glow": "0 0 28px rgba(91,33,182,0.55), 0 0 8px rgba(139,92,246,0.3)",
        "purple-glow-lg": "0 0 52px rgba(91,33,182,0.4), 0 0 18px rgba(139,92,246,0.22)",
        "card-hover": "0 0 24px rgba(91,33,182,0.18)",
        "gold-glow": "0 0 20px rgba(201,168,76,0.4), 0 0 6px rgba(201,168,76,0.25)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 6px)",
      },
      fontFamily: {
        sans: [
          "SF Pro Rounded",
          "-apple-system",
          "BlinkMacSystemFont",
          "ui-sans-serif",
          "system-ui",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
