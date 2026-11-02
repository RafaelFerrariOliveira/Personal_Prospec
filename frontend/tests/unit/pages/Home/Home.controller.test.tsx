import { renderHook } from '@testing-library/react';
import type { NavigateFunction } from 'react-router-dom';
import { describe, expect, it, vi, type Mock } from 'vitest';
import UseHomeController from '@pages/Home/Home.controller';
import type { IHomeControllerDeps } from '@pages/Home/Home.types';
import { RoutePaths } from '@routes/routePaths';

// NavigateFunction é sobrecarregada; o mock é convertido só na fronteira das deps.
const toDeps = (navigate: Mock): IHomeControllerDeps => ({
   navigate: navigate as unknown as NavigateFunction,
   canShowCampaigns: true,
});

describe('UseHomeController', () => {
   it('expõe os textos prontos para a view', () => {
      // Arrange
      const navigate = vi.fn();

      // Act
      const { result } = renderHook(() => UseHomeController(toDeps(navigate)));

      // Assert
      expect(result.current.title).toBe('PersonalProspec');
      expect(result.current.description).toBe('[A DEFINIR] objetivo do produto.');
      expect(result.current.actionLabel).toBe('Início');
   });

   it('navega para a rota inicial ao acionar a ação', () => {
      // Arrange
      const navigate = vi.fn();
      const { result } = renderHook(() => UseHomeController(toDeps(navigate)));

      // Act
      result.current.onAction();

      // Assert
      expect(navigate).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith(RoutePaths.home);
   });

   it('navega para a lista de campanhas e expõe o rótulo', () => {
      // Arrange
      const navigate = vi.fn();
      const { result } = renderHook(() => UseHomeController(toDeps(navigate)));

      // Act
      result.current.onOpenCampaigns();

      // Assert
      expect(result.current.campaignsLabel).toBe('Campanhas');
      expect(result.current.canShowCampaigns).toBe(true);
      expect(navigate).toHaveBeenCalledWith(RoutePaths.campaigns);
   });

   it('mantém o mesmo handler entre renders quando navigate não muda', () => {
      // Arrange
      const deps = toDeps(vi.fn());
      const { result, rerender } = renderHook(() => UseHomeController(deps));
      const firstHandler = result.current.onAction;

      // Act
      rerender();

      // Assert
      expect(result.current.onAction).toBe(firstHandler);
   });
});
