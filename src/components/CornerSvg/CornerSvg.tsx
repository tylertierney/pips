import type { ComponentProps } from 'react'

export const TopRightCorner = ({ className, style }: ComponentProps<'svg'>) => {
  return (
    <svg
      id='uuid-c1837959-4d3f-4310-8149-c63c43c2f01f'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 100 100'
      className={className}
      style={style}
    >
      <path
        style={{ fill: 'var(--bg-cell)' }}
        d='M100,0v14c-1-14-14-14-14-14'
      />
    </svg>
  )
}

export const TopLeftCorner = ({ className, style }: ComponentProps<'svg'>) => {
  return (
    <svg
      id='uuid-9ca1f528-307b-4a91-a29c-1dabfe9dd2bb'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 100 100'
      className={className}
      style={style}
    >
      <path style={{ fill: 'var(--bg-cell)' }} d='M0,0h14C0,1,0,14,0,14' />
    </svg>
  )
}

export const BottomRightCorner = ({
  className,
  style,
}: ComponentProps<'svg'>) => {
  return (
    <svg
      id='uuid-2183d52f-a755-4335-b9f0-2228bdd682f4'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 100 100'
      className={className}
      style={style}
    >
      <path
        style={{ fill: 'var(--bg-cell)' }}
        d='M100,100h-14c14-1,14-14,14-14'
      />
    </svg>
  )
}

export const BottomLeftCorner = ({
  className,
  style,
}: ComponentProps<'svg'>) => {
  return (
    <svg
      id='uuid-2183d52f-a755-4335-b9f0-2228bdd682f4'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 100 100'
      className={className}
      style={style}
    >
      <path
        style={{ fill: 'var(--bg-cell)' }}
        d='M0,100v-14c1,14,14,14,14,14'
      />
    </svg>
  )
}
