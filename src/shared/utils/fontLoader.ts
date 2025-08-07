/**
 * 웹폰트 로딩 상태를 관리하는 유틸리티
 */

export class FontLoader {
  private static instance: FontLoader;
  private loadedFonts: Set<string> = new Set();
  private loadingPromises: Map<string, Promise<void>> = new Map();

  static getInstance(): FontLoader {
    if (!FontLoader.instance) {
      FontLoader.instance = new FontLoader();
    }
    return FontLoader.instance;
  }

  /**
   * 폰트가 로드되었는지 확인
   */
  isFontLoaded(fontFamily: string): boolean {
    return this.loadedFonts.has(fontFamily);
  }

  /**
   * 폰트 로딩을 확인하고 Promise 반환
   */
  async loadFont(fontFamily: string, timeout = 3000): Promise<void> {
    if (this.loadedFonts.has(fontFamily)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(fontFamily)) {
      return this.loadingPromises.get(fontFamily)!;
    }

    const loadingPromise = this.checkFontAvailability(fontFamily, timeout);
    this.loadingPromises.set(fontFamily, loadingPromise);

    try {
      await loadingPromise;
      this.loadedFonts.add(fontFamily);
    } catch (error) {
      console.warn(`Font loading failed for ${fontFamily}:`, error);
    } finally {
      this.loadingPromises.delete(fontFamily);
    }
  }

  /**
   * 여러 폰트를 동시에 로드
   */
  async loadFonts(fontFamilies: string[], timeout = 3000): Promise<void> {
    const promises = fontFamilies.map(font => this.loadFont(font, timeout));
    await Promise.allSettled(promises);
  }

  /**
   * FontFace API 또는 DOM 기반으로 폰트 가용성 확인
   */
  private async checkFontAvailability(fontFamily: string, timeout: number): Promise<void> {
    // FontFace API 사용 가능한 경우
    if ('fonts' in document) {
      return this.checkWithFontFaceAPI(fontFamily, timeout);
    }

    // Fallback: DOM 기반 폰트 감지
    return this.checkWithDOMMethod(fontFamily, timeout);
  }

  /**
   * FontFace API를 사용한 폰트 로딩 확인
   */
  private async checkWithFontFaceAPI(fontFamily: string, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Font loading timeout: ${fontFamily}`));
      }, timeout);

      document.fonts.load(`12px "${fontFamily}"`).then(
        (fonts) => {
          clearTimeout(timeoutId);
          if (fonts.length > 0) {
            resolve();
          } else {
            reject(new Error(`Font not found: ${fontFamily}`));
          }
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(error);
        }
      );
    });
  }

  /**
   * DOM 기반 폰트 감지 (Fallback)
   */
  private async checkWithDOMMethod(fontFamily: string, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const testString = 'abcdefghijklmnopqrstuvwxyz0123456789';
      const testSize = '72px';
      const fallbackFonts = ['monospace', 'sans-serif'];
      
      // 기준 크기 측정
      const baselines = fallbackFonts.map(fallback => {
        const span = this.createTestElement(testString, testSize, fallback);
        document.body.appendChild(span);
        const width = span.offsetWidth;
        document.body.removeChild(span);
        return width;
      });

      // 대상 폰트 + fallback으로 크기 측정
      const testElement = this.createTestElement(
        testString, 
        testSize, 
        `"${fontFamily}", ${fallbackFonts[0]}`
      );
      document.body.appendChild(testElement);

      let attempts = 0;
      const maxAttempts = timeout / 50;

      const checkFont = () => {
        const currentWidth = testElement.offsetWidth;
        
        // 크기가 기준과 다르면 폰트가 로드된 것으로 판단
        if (currentWidth !== baselines[0]) {
          document.body.removeChild(testElement);
          resolve();
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          document.body.removeChild(testElement);
          reject(new Error(`Font loading timeout: ${fontFamily}`));
          return;
        }

        setTimeout(checkFont, 50);
      };

      checkFont();
    });
  }

  /**
   * 폰트 테스트용 DOM 요소 생성
   */
  private createTestElement(text: string, fontSize: string, fontFamily: string): HTMLSpanElement {
    const span = document.createElement('span');
    span.style.fontFamily = fontFamily;
    span.style.fontSize = fontSize;
    span.style.position = 'absolute';
    span.style.left = '-9999px';
    span.style.top = '-9999px';
    span.style.visibility = 'hidden';
    span.style.whiteSpace = 'nowrap';
    span.textContent = text;
    return span;
  }
}

/**
 * 전역 폰트 로더 인스턴스
 */
export const fontLoader = FontLoader.getInstance();

/**
 * 폰트 로딩 상태를 확인하는 헬퍼 함수
 */
export const checkFontsLoaded = async (): Promise<boolean> => {
  try {
    await fontLoader.loadFonts([
      'Pretendard Variable',  // 1순위
      'Pretendard',           // 1순위 fallback
      'Noto Sans KR',         // 2순위
      'Apple SD Gothic Neo',  // 시스템 fallback
      'Malgun Gothic'         // 시스템 fallback
    ]);
    return true;
  } catch {
    return false;
  }
};
