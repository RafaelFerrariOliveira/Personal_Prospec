import { SummaryList, SummaryTerm, SummaryValue } from './summaryStep.styles';
import type { ISummaryStepProps } from './summaryStep.types';

const SummaryStep = ({ items }: ISummaryStepProps) => {
   return (
      <SummaryList data-testid="campaign-summary">
         {items.map((item) => (
            <div key={item.label}>
               <SummaryTerm>{item.label}</SummaryTerm>
               <SummaryValue>{item.value}</SummaryValue>
            </div>
         ))}
      </SummaryList>
   );
};

export default SummaryStep;
