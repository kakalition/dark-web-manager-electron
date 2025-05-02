import React from 'react'
import { SidebarProvider } from './components/ui/sidebar'
import { AppSidebar } from './components/app-sidebar'

function Gani() {
  async function onSidebarItemClick(key) {
    console.log(key)
  }

  return (
    <SidebarProvider>
      <AppSidebar onClick={onSidebarItemClick} />
    </SidebarProvider>
  )
}

export default Gani
