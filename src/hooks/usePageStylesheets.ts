import { useLayoutEffect } from 'react';
import type { PageStyleBundle } from '../styles/legacy/pageStyles';

export function usePageStylesheets({ css, hrefs }: PageStyleBundle): void {
  useLayoutEffect(() => {
    const styles = css.map((content) => {
      const style = document.createElement('style');
      style.dataset.mc2PageStyles = 'true';
      style.textContent = content;
      document.head.appendChild(style);
      return style;
    });

    const links = hrefs.map((href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.dataset.mc2VendorStylesheet = href;
      document.head.appendChild(link);
      return link;
    });

    return () => {
      styles.forEach((style) => style.remove());
      links.forEach((link) => link.remove());
    };
  }, [css, hrefs]);
}
