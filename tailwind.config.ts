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
        // 명리사주 Dark + Purple 팔레트
        ink: "#f0f0f5",                  // 기본 텍스트 (near-white)
        canvas: "#07070e",               // 배경 (near-black)
        "surface-soft": "#0e0e1c",       // 카드/서피스
        "surface-dark": "#050508",       // 더 어두운 서피스
        charcoal: "#9494aa",             // 중간 텍스트
        body: "#7070a0",                 // 본문 텍스트
        mute: "#4a4a6a",                 // 흐린 텍스트
        hairline: "rgba(139,92,246,0.18)",       // 보라빛 테두리
        "hairline-strong": "rgba(139,92,246,0.35)",
        // 보라 포인트 팔레트
        "purple-deep": "#2e1065",        // 가장 진한 보라
        "purple-rich": "#7c3aed",        // 시그니처 보라
        "purple-mid": "#8b5cf6",         // 중간 보라
        "purple-bright": "#a78bfa",      // 밝은 보라
        "purple-light": "#c4b5fd",       // 연한 보라
        "purple-glow": "rgba(124,58,237,0.3)", // 글로우용
      },
      backgroundImage: {
        "purple-gradient": "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
        "purple-gradient-dark": "linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)",
        "hero-radial": "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.22) 0%, transparent 70%)",
        "text-gradient": "linear-gradient(135deg, #ffffff 0%, #d8b4fe 50%, #a78bfa 100%)",
        "cta-gradient": "linear-gradient(135deg, rgba(76,29,149,0.6) 0%, rgba(109,40,217,0.4) 50%, rgba(30,10,80,0.8) 100%)",
      },
      boxShadow: {
        "purple-glow": "0 0 24px rgba(139,92,246,0.45), 0 0 6px rgba(139,92,246,0.3)",
        "purple-glow-lg": "0 0 48px rgba(139,92,246,0.35), 0 0 16px rgba(139,92,246,0.2)",
        "card-hover": "0 0 20px rgba(124,58,237,0.15)",
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
