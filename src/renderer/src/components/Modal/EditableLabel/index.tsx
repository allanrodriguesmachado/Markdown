import React from 'react'

type LabelProps = {
  text: string
  openModal: () => void
}

export default function EditableLabel({text, openModal}: LabelProps) {
  return (
    <div>
      <button
        type="button"
        className={`focus:outline-none text-white font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2
        bg-gray-800 hover:bg-gray-900`}
        onClick={openModal}
      >
        <h5 className="font-bold text-white">{text}</h5>
      </button>
    </div>
  )
}

