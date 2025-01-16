'use client'

import { SearchIcon, SettingsIcon } from 'lucide-react'

import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton } from './ui/sidebar'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from './ui/dialog'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useEffect, useState } from 'react'

export function NavMain() {
  const [corePath, setCorePath] = useState()

  useEffect(() => {
    fetchConfiguration()
  }, [])

  async function fetchConfiguration() {
    const configuration = await window.api.getConfiguration()

    setCorePath(configuration.corePath)
  }

  function submitConfiguration() {
    window.localStorage.setItem('CORE_PATH', corePath)

    fetchConfiguration()

    setOpen(false)
  }

  const [open, setOpen] = useState(false)

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenuButton tooltip="Link Seeker" isActive>
        <SearchIcon />
        <span>Link Seeker</span>
      </SidebarMenuButton>
      <SidebarMenu>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <SidebarMenuButton tooltip="Configuration">
              <SettingsIcon />
              <span>Configuration</span>
            </SidebarMenuButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configuration</DialogTitle>
            </DialogHeader>
            <div className="grid w-full items-center gap-1.5">
              <Label>Core Path</Label>
              <Input type="text" value={corePath} onChange={(e) => setCorePath(e.target.value)} />
            </div>
            <DialogFooter>
              <Button onClick={submitConfiguration} type="button">
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarMenu>
    </SidebarGroup>
  )
}
