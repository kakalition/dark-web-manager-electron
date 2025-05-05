'use client'

import { SearchIcon, SettingsIcon } from 'lucide-react'

import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton } from './ui/sidebar'
import SettingsDialog from './SettingsDialog'
import { useNavigate } from 'react-router'

export function NavMain() {
  const navigate = useNavigate()
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>

      <SidebarMenuButton
        tooltip="Link Seeker"
        isActive
        onClick={() => {
          navigate('/')
        }}
      >
        <SearchIcon />
        <span>Link Seeker</span>
      </SidebarMenuButton>

      <SidebarMenuButton tooltip="Uncrawled Sites" isActive onClick={() => navigate('/uncrawled')}>
        <SearchIcon />
        <span>Uncrawled Sites</span>
      </SidebarMenuButton>

      {/* <SidebarMenuButton tooltip="Gani" isActive onClick={() => window.location.assign('/gani')}>
        <SearchIcon />
        <span>Gani</span>
      </SidebarMenuButton> */}

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
