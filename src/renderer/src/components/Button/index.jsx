export function ButtonSub({ onClickSub, textButton, icon, disabled }) {
  return (
    <div className="flex justify-end">
      <button
        onClick={onClickSub}
        className="bg-orange-400 hover:bg-orange-500 border-none transition-colors text-white inline-flex items-center px-4 py-2 font-medium rounded-md shadow-sm focus:outline-none focus:ring-0 focus:ring-offset-0"
        disabled={disabled}
      >
        {icon} {textButton}
      </button>
    </div>
  )
}
