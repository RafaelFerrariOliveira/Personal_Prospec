import { useEffect, useRef, useState, type RefObject } from 'react';

interface IUseIntersectionObserverParams {
   onIntersect: () => void;
   enabled?: boolean;
   /** Container rolável (ex.: dropdown); sem ele vale o viewport. */
   rootRef?: RefObject<HTMLElement | null>;
}

/** Devolve o ref callback do elemento sentinel; chama onIntersect quando ele aparece (ver infinite-scroll-pagination.md). */
export const useIntersectionObserver = ({
   onIntersect,
   enabled = true,
   rootRef,
}: IUseIntersectionObserverParams): ((element: HTMLElement | null) => void) => {
   const [element, setElement] = useState<HTMLElement | null>(null);
   const onIntersectRef = useRef(onIntersect);

   useEffect(() => {
      onIntersectRef.current = onIntersect;
   });

   useEffect(() => {
      if (!enabled || !element) return undefined;
      const observer = new IntersectionObserver(
         (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) onIntersectRef.current();
         },
         { root: rootRef?.current ?? null },
      );
      observer.observe(element);
      return () => observer.disconnect();
   }, [element, enabled, rootRef]);

   return setElement;
};
