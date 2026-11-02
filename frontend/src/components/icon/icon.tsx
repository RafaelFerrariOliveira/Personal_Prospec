import type { ReactElement } from 'react';
import { Svg } from './icon.styles';
import type { IIconProps, TIconName } from './icon.types';

// Desenhos copiados do protótipo oficial (Main.dc.html), viewBox 24x24 com traço na cor do texto.
const PATHS: Record<TIconName, ReactElement> = {
   sparkle: (
      <>
         <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z" />
         <path d="M19 15v4" />
         <path d="M17 17h4" />
      </>
   ),
   home: (
      <>
         <path d="M3 10.5 12 3l9 7.5" />
         <path d="M5 9v12h14V9" />
         <path d="M10 21v-6h4v6" />
      </>
   ),
   target: (
      <>
         <circle cx="12" cy="12" r="9" />
         <circle cx="12" cy="12" r="5" />
         <circle cx="12" cy="12" r="1" />
      </>
   ),
   logout: (
      <>
         <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
         <path d="m16 17 5-5-5-5" />
         <path d="M21 12H9" />
      </>
   ),
   plus: <path d="M12 5v14M5 12h14" />,
   arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
   chevronLeft: <path d="m15 18-6-6 6-6" />,
   chevronRight: <path d="m9 18 6-6-6-6" />,
   eye: (
      <>
         <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
         <circle cx="12" cy="12" r="3" />
      </>
   ),
   mapPin: (
      <>
         <path d="M19 10c0 5.5-7 11-7 11s-7-5.5-7-11a7 7 0 0 1 14 0Z" />
         <circle cx="12" cy="10" r="2.5" />
      </>
   ),
   building: (
      <>
         <rect x="4" y="3" width="16" height="18" rx="2" />
         <path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1" />
         <path d="M10 21v-3h4v3" />
      </>
   ),
   calendar: (
      <>
         <rect x="3" y="5" width="18" height="16" rx="2" />
         <path d="M16 3v4M8 3v4M3 10h18" />
      </>
   ),
   check: <path d="M20 6 9 17l-5-5" />,
   activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
   play: <path d="M7 4.5v15l12-7.5-12-7.5Z" />,
   pause: (
      <>
         <rect x="6" y="5" width="4" height="14" rx="1" />
         <rect x="14" y="5" width="4" height="14" rx="1" />
      </>
   ),
   stop: <rect x="6" y="6" width="12" height="12" rx="2" />,
   robot: (
      <>
         <rect x="4" y="8" width="16" height="12" rx="3" />
         <path d="M12 8V4" />
         <circle cx="12" cy="3.5" r="1" />
         <path d="M9 13v1M15 13v1" />
      </>
   ),
};

const Icon = ({ name, size = 'md' }: IIconProps) => {
   return (
      <Svg
         $size={size}
         viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         strokeWidth={1.8}
         strokeLinecap="round"
         strokeLinejoin="round"
         aria-hidden="true"
         focusable="false"
         data-icon={name}
      >
         {PATHS[name]}
      </Svg>
   );
};

export default Icon;
