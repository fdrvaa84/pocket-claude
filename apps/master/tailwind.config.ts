import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    // Переопределяем только md: — остальные (sm/lg/xl/2xl) наследуются.
    // md: требует не только ширину, но и высоту ≥ 500px — чтобы в ландшафте
    // телефона (h≈390-430px) оставаться в мобильном layout.
    extend: {},
    screens: {
      sm: '640px',
      md: { raw: '(min-width: 768px) and (min-height: 500px)' },
      lg: { raw: '(min-width: 1024px) and (min-height: 600px)' },
      xl: '1280px',
      '2xl': '1536px',
      // Низкая высота (ландшафт телефона): пакуем UI компактнее.
      short: { raw: '(max-height: 500px)' },
    },
  },
  plugins: [],
} satisfies Config;
