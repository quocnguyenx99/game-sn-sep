import type { ButtonHTMLAttributes } from 'react';
import { audio } from '../audio/engine';

type Variant = 'gold' | 'blue' | 'orange' | 'teal' | 'white';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'normal' | 'small' | 'icon';
  silent?: boolean;
}

export function Button({ variant = 'gold', size = 'normal', silent, className, onClick, ...rest }: Props) {
  return (
    <button
      type="button"
      {...rest}
      className={`candy-btn ${variant} ${size === 'normal' ? '' : size} ${className ?? ''}`}
      onMouseEnter={() => !rest.disabled && audio.sfx('hover')}
      onClick={(e) => {
        if (!silent) audio.sfx('click');
        onClick?.(e);
      }}
    />
  );
}
