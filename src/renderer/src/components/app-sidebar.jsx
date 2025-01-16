import * as React from 'react'
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal
} from 'lucide-react'

import { NavMain } from './nav-main'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from './ui/sidebar'

// This is sample data.
const data = {
  user: {
    name: localStorage.getItem('name') ?? 'No Name',
    email: localStorage.getItem('email') ?? 'No Email',
    avatar: '/avatars/shadcn.jpg'
  },
  teams: [
    {
      name: 'Intek',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise'
    }
  ],
  navMain: [
    {
      title: 'Link Seeker',
      url: '#',
      key: 'LINK_SEEKER',
      icon: SquareTerminal,
      isActive: true
    },
    {
      title: 'Configuration',
      url: '#',
      key: 'CONFIGURATION',
      icon: SquareTerminal,
      isActive: true
    }
  ]
}

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
