import { AppSidebar } from './components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from './components/ui/breadcrumb'
import { Separator } from './components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from './components/ui/sidebar'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from './components/ui/alert-dialog'

import { Button } from './components/ui/button'

import { Input } from './components/ui/input'
import { Badge } from './components/ui/badge'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './components/ui/dialog'
import Types from '../../preload/Types'

import alarm from '../../../resources/alarm.wav'
import { Label } from './components/ui/label'
import { generateUUIDv4, readCSVFromFileUpload, sleep } from './lib/utils'

export default function UncrawledPage() {
  const [sites, setSites] = useState([])

  useEffect(() => {
    window.api.getUncrawledSites().then(setSites)

    const interval = setInterval(async () => {
      setSites(await window.api.getSites())
    }, 10000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    console.log(sites)
  }, [sites])

  async function onSidebarItemClick(key) {
    console.log(key)
  }

  return (
    <SidebarProvider>
      <AppSidebar onClick={onSidebarItemClick} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Platform</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Uncrawled Sites</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex overflow-x-scroll items-center flex-col p-4">
          <div className="grid grid-cols-12 gap-4 w-full">
            <div className="col-span-6 flex flex-col justify-center p-4 rounded-xl bg-gray-100">
              <p className="text-xl mb-1">Total Link Uncrawled</p>
              <p className="font-semibold text-3xl">
                {sites?.map((e) => e.statusCounts[0])?.reduce((prev, cur) => prev + cur, 0) ?? 0}
              </p>
            </div>
            <div className="col-span-6 flex flex-col justify-center p-4 rounded-xl bg-gray-100">
              <p className="text-xl mb-1">Total Profile Uncrawled</p>
              <p className="font-semibold text-3xl">
                {sites?.map((e) => e.statusCounts[1])?.reduce((prev, cur) => prev + cur, 0) ?? 0}
              </p>
            </div>

            {sites?.map((e) => {
              return (
                <div key={e.name_site} className="flex flex-col items-center gap-4 col-span-6">
                  <div className="flex flex-row gap-2 w-full items-center"></div>
                  <div className="bg-red-400 flex items-center justify-between py-4 rounded-xl transition px-4 w-full">
                    <p>{e.name_site}</p>
                  </div>
                  <div className="bg-gray-100 flex flex-col py-4 rounded-xl w-full px-4 gap-4 justify-between">
                    <div className="flex flex-row w-full items-center justify-between">
                      <p>Total Link Uncrawled:</p>
                      <p>{e.statusCounts[0]}</p>
                    </div>
                    <div className="flex flex-row w-full items-center justify-between">
                      <p>Total Profile Uncrawled:</p>
                      <p>{e.statusCounts[1]}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  )
}

function truncate(fullStr, strLen, separator) {
  if (!fullStr) {
    return ''
  }

  if (fullStr.length <= strLen) return fullStr

  separator = separator || '...'

  var sepLen = separator.length,
    charsToShow = strLen - sepLen,
    frontChars = Math.ceil(charsToShow / 2),
    backChars = Math.floor(charsToShow / 2)

  return fullStr.substr(0, frontChars) + separator + fullStr.substr(fullStr.length - backChars)
}
