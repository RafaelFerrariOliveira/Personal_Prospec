import { describe, expect, it } from 'vitest';
import { CampaignStateMachine } from '@domain/campaignStateMachine';
import { ECampaignStatus } from '@enums/campaignStatus.enum';

const ALL = Object.values(ECampaignStatus);

describe('CampaignStateMachine', () => {
   it.each([
      ['canStart', [ECampaignStatus.Draft]],
      ['canPause', [ECampaignStatus.Running]],
      ['canResume', [ECampaignStatus.Paused]],
      ['canCancel', [ECampaignStatus.Draft, ECampaignStatus.Running, ECampaignStatus.Paused]],
      ['canEdit', [ECampaignStatus.Draft, ECampaignStatus.Paused]],
   ] as const)('%s vale só nos estados permitidos', (rule, allowed) => {
      // Act
      const result = ALL.filter((status) => CampaignStateMachine[rule](status));

      // Assert
      expect(result).toEqual(allowed);
   });

   it('Completed e Cancelled são finais: nenhuma ação vale', () => {
      // Act
      const anyAction = [ECampaignStatus.Completed, ECampaignStatus.Cancelled].some((status) =>
         Object.values(CampaignStateMachine).some((rule) => rule(status)),
      );

      // Assert
      expect(anyAction).toBe(false);
   });
});
