import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useIntersectionObserver } from '@hooks/useIntersectionObserver';

type TObserverCallback = (entries: { isIntersecting: boolean }[]) => void;

const Sentinel = ({ onIntersect, enabled }: { onIntersect: () => void; enabled: boolean }) => {
   const ref = useIntersectionObserver({ onIntersect, enabled });
   return <div ref={ref} data-testid="sentinel" />;
};

describe('useIntersectionObserver', () => {
   let callback: TObserverCallback = () => undefined;
   const disconnect = vi.fn();
   let constructedSpy = vi.fn();

   beforeEach(() => {
      disconnect.mockClear();
      const constructed = vi.fn();
      class FakeObserver {
         constructor(handler: TObserverCallback) {
            constructed();
            callback = handler;
         }
         observe = vi.fn();
         disconnect = disconnect;
      }
      vi.stubGlobal('IntersectionObserver', FakeObserver);
      constructedSpy = constructed;
   });

   afterEach(() => {
      vi.unstubAllGlobals();
   });

   it('chama onIntersect quando o sentinel aparece', () => {
      // Arrange
      const onIntersect = vi.fn();
      render(<Sentinel onIntersect={onIntersect} enabled />);

      // Act
      callback([{ isIntersecting: true }]);

      // Assert
      expect(onIntersect).toHaveBeenCalledTimes(1);
   });

   it('ignora entrada fora da área visível', () => {
      // Arrange
      const onIntersect = vi.fn();
      render(<Sentinel onIntersect={onIntersect} enabled />);

      // Act
      callback([{ isIntersecting: false }]);

      // Assert
      expect(onIntersect).not.toHaveBeenCalled();
   });

   it('não observa quando desabilitado e desconecta ao desmontar', () => {
      // Arrange
      const disabled = render(<Sentinel onIntersect={vi.fn()} enabled={false} />);
      expect(constructedSpy).not.toHaveBeenCalled();
      disabled.unmount();
      const enabled = render(<Sentinel onIntersect={vi.fn()} enabled />);

      // Act
      enabled.unmount();

      // Assert
      expect(disconnect).toHaveBeenCalled();
   });
});
