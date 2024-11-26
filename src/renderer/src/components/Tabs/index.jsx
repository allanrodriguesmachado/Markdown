import React, { useState } from 'react'

const Tabs = ({ children, ariaLabel, variant }) => {
  const [activeTab, setActiveTab] = useState(0)

  const handleTabClick = (index) => {
    setActiveTab(index)
  }

  const tabHeaders = React.Children.map(children, (child, index) => {
    if (child.type.displayName === 'TabHeader') {
      return React.cloneElement(child, {
        isActive: index === activeTab,
        onClick: () => handleTabClick(index)
      })
    }
    return null
  })

  const tabContents = React.Children.map(children, (child, index) => {
    if (child.type.displayName === 'TabContent') {
      return index === activeTab ? child : null
    }
    return null
  })

  return (
    <div aria-label={ariaLabel} className={`tabs-container ${variant}`}>
      <div className="tabs-headers">{tabHeaders}</div>
      <div className="tabs-contents">{tabContents}</div>
    </div>
  )
}

const TabHeader = ({ isActive, onClick, title, icon: Icon }) => {
  return (
    <button className={`tab-header ${isActive ? 'active' : ''}`} onClick={onClick}>
      {Icon && <Icon className="tab-icon" />}
      {title}
    </button>
  )
}

TabHeader.displayName = 'TabHeader'

const TabContent = ({ children }) => {
  return <div className="tab-content">{children}</div>
}

TabContent.displayName = 'TabContent'

export { Tabs, TabHeader, TabContent }
