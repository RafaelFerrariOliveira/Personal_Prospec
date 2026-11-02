import { SummaryItem, SummaryList, SummaryTerm, SummaryValue } from './summaryStep.styles';
import type { ISummaryStepProps } from './summaryStep.types';

const SummaryStep = ({ items }: ISummaryStepProps) => {
   return (
      <SummaryList data-testid="campaign-summary">
         {items.map((item) => (
            <SummaryItem key={item.label}>
               <SummaryTerm>{item.label}</SummaryTerm>
               <SummaryValue>{item.value}</SummaryValue>
            </SummaryItem>
         ))}
      </SummaryList>
   );
};

export default SummaryStep;
