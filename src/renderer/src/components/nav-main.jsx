'use client'

import { SearchIcon, SettingsIcon } from 'lucide-react'

import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton } from './ui/sidebar'
import SettingsDialog from './SettingsDialog'

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenuButton tooltip="Link Seeker" isActive>
        <SearchIcon />
        <span>Link Seeker</span>
      </SidebarMenuButton>
      <SidebarMenu>
        <SettingsDialog>
          <SidebarMenuButton tooltip="Configuration">
            <SettingsIcon />
            <span>Configuration</span>
          </SidebarMenuButton>
        </SettingsDialog>
      </SidebarMenu>
    </SidebarGroup>
  )
}
