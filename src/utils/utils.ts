import type { ClassValue } from 'clsx'
import clsx from 'clsx'
import type { CSSProperties } from 'react'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const getTranslateFromRotation = (
  rotation: number | undefined,
): CSSProperties['translate'] => {
  const normalized = (((rotation ?? 0) % 360) + 360) % 360

  switch (normalized) {
    case 90:
      return '50% 0'
    case 180:
      return '100% 100%'
    case 270:
      return '0 200%'
    default:
      return '0'
  }
}

export const isVertical = (rotation: number): boolean => {
  if (!rotation || rotation % 360 === 0) return false
  return true
}
