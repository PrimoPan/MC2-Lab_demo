import { useEffect } from 'react';
import type { RefObject } from 'react';

export function useWorkshopSpeakerCards(pageRef: RefObject<HTMLElement>): void {
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;

    const speakerCards = Array.from(page.querySelectorAll<HTMLElement>('.speaker-card-news'));
    if (!speakerCards.length) return undefined;

    const collapsedHintLabels = new Map<HTMLElement, string>();
    const expandedHintLabels = new Map<HTMLElement, string>();

    speakerCards.forEach((card) => {
      const hint = card.querySelector<HTMLElement>('.speaker-card-news__hint');
      const collapsedLabel = hint?.textContent?.trim() || 'Click to view bio';
      collapsedHintLabels.set(card, collapsedLabel);
      expandedHintLabels.set(card, collapsedLabel === '点击查看简介' ? '收起简介' : 'Hide bio');
    });

    const setCardState = (card: HTMLElement, shouldOpen: boolean) => {
      const details = card.querySelector<HTMLElement>('.speaker-card-news__details');
      const hint = card.querySelector<HTMLElement>('.speaker-card-news__hint');

      card.classList.toggle('is-open', shouldOpen);
      card.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');

      if (hint) {
        hint.textContent = shouldOpen
          ? expandedHintLabels.get(card) || 'Hide bio'
          : collapsedHintLabels.get(card) || 'Click to view bio';
      }

      if (details) {
        details.style.maxHeight = shouldOpen ? details.scrollHeight + 'px' : '0px';
      }
    };

    const scrollCardIntoView = (card: HTMLElement) => {
      const scrollContainer = page.querySelector<HTMLElement>('.news-section');
      if (!scrollContainer) return;

      const topOffset = 108;
      const containerTop = scrollContainer.getBoundingClientRect().top;
      const cardTop = card.getBoundingClientRect().top - containerTop + scrollContainer.scrollTop - topOffset;
      scrollContainer.scrollTo({
        top: Math.max(0, cardTop),
        behavior: 'smooth'
      });
    };

    const clickHandlers = new Map<HTMLElement, EventListener>();
    const keydownHandlers = new Map<HTMLElement, EventListener>();

    speakerCards.forEach((card) => {
      setCardState(card, false);

      const clickHandler = () => {
        const shouldOpen = !card.classList.contains('is-open');
        speakerCards.forEach((otherCard) => {
          setCardState(otherCard, otherCard === card ? shouldOpen : false);
        });
      };

      const keydownHandler = (event: Event) => {
        const keyboardEvent = event as KeyboardEvent;
        if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
          keyboardEvent.preventDefault();
          card.click();
        }
      };

      clickHandlers.set(card, clickHandler);
      keydownHandlers.set(card, keydownHandler);
      card.addEventListener('click', clickHandler);
      card.addEventListener('keydown', keydownHandler);
    });

    const openCardByHash = () => {
      if (!window.location.hash) return;

      const targetCard = page.querySelector<HTMLElement>(window.location.hash + '.speaker-card-news');
      if (!targetCard) return;

      speakerCards.forEach((card) => {
        setCardState(card, card === targetCard);
      });

      requestAnimationFrame(() => {
        targetCard.focus({ preventScroll: true });
        scrollCardIntoView(targetCard);

        window.setTimeout(() => {
          scrollCardIntoView(targetCard);
        }, 240);
      });
    };

    const resizeHandler = () => {
      speakerCards.forEach((card) => {
        if (!card.classList.contains('is-open')) return;
        const details = card.querySelector<HTMLElement>('.speaker-card-news__details');
        if (details) {
          details.style.maxHeight = details.scrollHeight + 'px';
        }
      });
    };

    window.addEventListener('resize', resizeHandler);
    window.addEventListener('hashchange', openCardByHash);
    openCardByHash();

    return () => {
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('hashchange', openCardByHash);
      speakerCards.forEach((card) => {
        const clickHandler = clickHandlers.get(card);
        const keydownHandler = keydownHandlers.get(card);
        if (clickHandler) card.removeEventListener('click', clickHandler);
        if (keydownHandler) card.removeEventListener('keydown', keydownHandler);
      });
    };
  }, [pageRef]);
}
