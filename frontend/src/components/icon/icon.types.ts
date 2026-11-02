export type TIconName =
   | 'sparkle'
   | 'home'
   | 'target'
   | 'logout'
   | 'plus'
   | 'arrowRight'
   | 'chevronLeft'
   | 'chevronRight'
   | 'eye'
   | 'mapPin'
   | 'building'
   | 'calendar'
   | 'check'
   | 'activity'
   | 'play'
   | 'pause'
   | 'stop'
   | 'robot';

export type TIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';

export interface IIconProps {
   name: TIconName;
   size?: TIconSize;
}
