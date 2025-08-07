/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': [
          // 1순위: Pretendard (디자인 시스템 메인 폰트)
          '"Pretendard Variable"',
          'Pretendard',
          
          // 2순위: Noto Sans KR
          '"Noto Sans KR"',
          
          // 시스템 폰트 fallback
          '-apple-system',
          'BlinkMacSystemFont',
          '"Apple SD Gothic Neo"',  // macOS 한글
          '"Malgun Gothic"',        // Windows 한글
          '"Segoe UI"',             // Windows 영문
          'Roboto',                 // Android/Google
          '"Helvetica Neue"',       // macOS 영문
          'Arial',                  // 범용 영문
          
          // 최종 fallback
          'sans-serif',
          
          // 이모지 지원
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"'
        ],
        'mono': [
          '"SF Mono"',              // macOS
          '"Monaco"',               // macOS (구버전)
          '"Inconsolata"',          // 웹폰트
          '"Roboto Mono"',          // Google
          '"Source Code Pro"',      // Adobe
          '"Menlo"',                // macOS
          '"DejaVu Sans Mono"',     // Linux
          '"Courier New"',          // Windows
          'monospace'               // fallback
        ]
      },
      fontWeight: {
        // Pretendard Variable 폰트 Weight 확장
        'thin': '100',
        'extralight': '200', 
        'light': '300',
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
        'extrabold': '800',
        'black': '900',
        
        // 세밀한 Weight 조절 (Variable 폰트 전용)
        '450': '450',  // Regular와 Medium 사이
        '550': '550',  // Medium과 Semibold 사이
        '650': '650',  // Semibold와 Bold 사이
      },
      letterSpacing: {
        // Pretendard 최적화 Letter Spacing
        'tighter': '-0.025em',
        'tight': '-0.02em',
        'normal': '-0.003em',
        'wide': '0.025em',
        'wider': '0.05em',
        'widest': '0.1em',
      },
      lineHeight: {
        // Pretendard 최적화 Line Height
        'none': '1',
        'tight': '1.2',
        'snug': '1.3', 
        'normal': '1.4',
        'relaxed': '1.5',
        'loose': '1.6',
      }
    },
  },
  plugins: [],
};
