import React from 'react'

type HeaderProps = {
  h1: string
  mark: string
}

export function Header({ h1, mark }: HeaderProps) {
  return (
    <>
      <div className="mb-2 md:flex-1">
        <h1
          className="
            md:text-3xl lg:text-3xl text-2xl md:text-wrap
            font-extrabold leading-none tracking-tight
            text-gray-900  dark:text-white"
        >
          {h1}{' '}
          <mark className="px-2 text-white bg-orange-500 rounded dark:bg-orange-500">{mark}</mark>
        </h1>
      </div>
    </>
  )
}
