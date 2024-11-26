import React from 'react'
import { MagnifyingGlass } from 'react-loader-spinner'

export const LoadingOverlay = ({ isLoading }) => {
  if (!isLoading) return null

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  }

  return (
    <div style={overlayStyle}>
      <MagnifyingGlass
        visible={isLoading}
        height="100"
        width="100"
        ariaLabel="magnifying-glass-loading"
        wrapperStyle={{}}
        wrapperClass="magnifying-glass-wrapper"
        glassColor="#c0efff"
        color="#e15b64"
      />
    </div>
  )
}
