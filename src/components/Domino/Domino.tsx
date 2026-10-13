import styles from './Domino.module.scss'
import type { ComponentProps, ReactNode } from 'react'
import type { IDomino } from '../../models/models'
import { cn } from '../../utils/utils'

type DominoProps = {
  id: number
  domino: IDomino
  cellSize: number
  rotation?: number // 0 90 180 270
  selected?: boolean
  idPrefix?: string
}

export const Domino = ({
  id,
  domino,
  rotation,
  cellSize,
  style = {},
  className = '',
  selected = false,
  idPrefix,
  ...rest
}: DominoProps & Omit<ComponentProps<'div'>, 'id'>) => {
  return (
    <div
      id={`${idPrefix ?? ''}-domino-${id}`}
      className={cn(
        styles.domino,
        'flex items-center justify-center p-0.5',
        selected && 'scale-110',
        className,
      )}
      style={{ height: cellSize + 'px', width: cellSize * 2 + 'px', ...style }}
      {...rest}
    >
      <div
        className={cn(
          'h-90/100 w-90/100 outline-2 outline-b-4 outline-gray-400 rounded-md flex bg-white',
          selected && 'backdrop-blur-lg opacity-90 ',
        )}
      >
        <div
          className='w-1/2 h-full border-r-2 border-gray-400 flex flex-col'
          style={{
            padding: `0 ${cellSize / 7.5}px`,
          }}
        >
          <NumberToDots number={domino[0]} cellSize={cellSize} />
        </div>
        <div
          className='w-1/2 h-full flex flex-col'
          style={{
            padding: `0 ${cellSize / 7.5}px`,
          }}
        >
          <NumberToDots number={domino[1]} cellSize={cellSize} />
        </div>
      </div>
    </div>
  )
}

type DominoSideProps = {
  cellSize: number
}

export const Dot = ({ cellSize }: DominoSideProps) => {
  return (
    <div
      //
      style={{
        height: cellSize / 6,
        width: cellSize / 6,
      }}
      className={cn('rounded-full bg-black')}
    />
  )
}

export const One = ({ cellSize = 60 }: DominoSideProps) => (
  <div className='flex flex-col grow items-center justify-center'>
    <Dot cellSize={cellSize} />
  </div>
)

export const Two = ({ cellSize = 60 }: DominoSideProps) => {
  return (
    <>
      <div
        className='flex flex-col grow items-stretch'
        style={{
          padding: `0 ${cellSize / 7.5}px`,
        }}
      >
        <div className='flex h-1/2 items-center w-full'>
          <Dot cellSize={cellSize} />
        </div>
        <div className='flex h-1/2 items-center w-full justify-end'>
          <Dot cellSize={cellSize} />
        </div>
      </div>
    </>
  )
}

export const Three = ({ cellSize = 60 }: DominoSideProps) => {
  return (
    <>
      <div
        className='flex flex-col grow items-stretch'
        style={{
          padding: `${cellSize / 15}px 0`,
        }}
      >
        <div className='flex grow items-center'>
          <Dot cellSize={cellSize} />
        </div>
        <div className='flex grow items-center justify-center '>
          <Dot cellSize={cellSize} />
        </div>
        <div className='flex grow items-center  justify-end'>
          <Dot cellSize={cellSize} />
        </div>
      </div>
    </>
  )
}
export const Four = ({ cellSize = 60 }: DominoSideProps) => {
  return (
    <>
      <div
        className='flex flex-col grow items-stretch'
        style={{
          padding: `0 ${cellSize / 15}px`,
        }}
      >
        <div className='flex grow items-center justify-between'>
          <Dot cellSize={cellSize} />
          <Dot cellSize={cellSize} />
        </div>
        <div className='flex grow items-center justify-between'>
          <Dot cellSize={cellSize} />
          <Dot cellSize={cellSize} />
        </div>
      </div>
    </>
  )
}

export const Five = ({ cellSize = 60 }: DominoSideProps) => {
  return (
    <>
      <div
        className='flex flex-col grow items-stretch'
        style={{
          padding: `${cellSize / 10}px ${cellSize / 30}px`,
        }}
      >
        <div className='flex grow items-center justify-between'>
          <Dot cellSize={cellSize} />
          <Dot cellSize={cellSize} />
        </div>
        <div className='flex grow items-center justify-center'>
          <Dot cellSize={cellSize} />
        </div>
        <div className='flex grow items-center justify-between'>
          <Dot cellSize={cellSize} />
          <Dot cellSize={cellSize} />
        </div>
      </div>
    </>
  )
}

export const Six = ({ cellSize = 60 }: DominoSideProps) => {
  return (
    <>
      <div
        className='flex flex-col grow items-stretch'
        style={{
          padding: `${cellSize / 15}px 0`,
        }}
      >
        <div className='flex grow items-center justify-between'>
          <Dot cellSize={cellSize} />
          <Dot cellSize={cellSize} />
          <Dot cellSize={cellSize} />
        </div>
        <div className='flex grow items-center justify-between'>
          <Dot cellSize={cellSize} />
          <Dot cellSize={cellSize} />
          <Dot cellSize={cellSize} />
        </div>
      </div>
    </>
  )
}

const NumberToDots = ({
  number,
  cellSize,
}: {
  number: number
  cellSize: number
}) => {
  if (number === 1) return <One cellSize={cellSize} />
  if (number === 2) return <Two cellSize={cellSize} />
  if (number === 3) return <Three cellSize={cellSize} />
  if (number === 4) return <Four cellSize={cellSize} />
  if (number === 5) return <Five cellSize={cellSize} />
  if (number === 6) return <Six cellSize={cellSize} />
  return null
}
