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

export default function Page() {
  const [sites, setSites] = useState([])

  useEffect(() => {
    window.api.getSites().then(setSites)

    window.addEventListener('message', async (event) => {
      if (event.source !== window) {
        return
      }

      if (event.data.type === Types.PROCESS_CRASHED) {
        toast.error('Crawler stopped.')
        setSites(await window.api.getSites())
        return
      }

      if (event.data.type === Types.CAPTCHA_FOUND) {
        toast.error('Captcha detected')
        new Audio(alarm).play()
        return
      }
    })
  }, [])

  useEffect(() => {
    console.log(sites)
  }, [sites])

  const [form, setForm] = useState({
    12938183129319212: {
      url: '',
      site_name: '',
      status: '',
      disabled: true
    }
  })

  function onFormChange(id, key, value) {
    setForm((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value
      }
    }))
  }

  function addRow() {
    const ids = Date.now()

    setForm((prev) => ({
      ...prev,
      [ids]: {
        url: '',
        site_name: '',
        status: '',
        disabled: true
      }
    }))
  }

  async function onUrlChange(id, key, value) {
    onFormChange(id, key, value)

    const site_name = await window.api.getSiteName(value)

    setForm((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        site_name: site_name,
        disabled: site_name != null
      }
    }))
  }

  async function onSubmit(key) {
    const target = form[key]
    console.log('key to be submitted', key, target)

    const result = await window.api.submitSite(target.site_name, target.url)

    if (result.status == 'FAILED') {
      toast.error(result.message)
    } else {
      toast.success(result.message)
    }

    setForm((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        status: result?.status
      }
    }))

    setSites(await window.api.getSites())
  }

  async function executeCrawl(site) {
    window.api.executeSite(site)

    setTimeout(() => {
      window.api.getSites().then(setSites)
    }, 2000)
  }

  async function onKill(site) {
    window.api.killWorker(site)

    window.api.getSites().then(setSites)
  }

  async function onSidebarItemClick(key) {
    console.log(key)
  }

  async function onStopCrawling() {
    await window.api.stopCrawling()
    setSites(await window.api.getSites())
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
                  <BreadcrumbPage>Link Seeker {window.versions.node}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex overflow-x-scroll items-center flex-col p-4">
          <div className="flex flex-row items-center w-full gap-2">
            <AlertDialog className="max-w-[80%]">
              <AlertDialogTrigger asChild>
                <Button className="w-fit self-start mb-4" variant="outline">
                  Add Links
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[80%]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Add Link</AlertDialogTitle>
                </AlertDialogHeader>
                {Object.keys(form)?.map((key) => {
                  let color = 'bg-gray-100'

                  if (form[key].status == 'SUCCESS') {
                    color = 'bg-green-200'
                  }

                  if (form[key].status == 'FAILED') {
                    color = 'bg-red-200'
                  }

                  return (
                    <div key={key} className="flex flex-row gap-4 mb-1">
                      <Input
                        type="text"
                        value={form[key].url}
                        onChange={(e) => onUrlChange(key, 'url', e.target.value)}
                      />
                      <Input
                        className="w-[20%]"
                        type="text"
                        value={form[key].site_name}
                        onChange={(e) => onFormChange(key, 'site_name', e.target.value)}
                        disabled={form[key].disabled}
                      />
                      <button
                        className={`flex items-center justify-center ${color} rounded-md px-2 w-24`}
                        onClick={() => onSubmit(key)}
                        disabled={['SUCCESS', 'FAILED'].includes(form[key].status)}
                      >
                        {form[key].status ? form[key].status : 'SUBMIT'}
                      </button>
                    </div>
                  )
                })}
                <div className="h-4" />
                <AlertDialogFooter>
                  <AlertDialogCancel>Close</AlertDialogCancel>
                  <Button onClick={addRow}>Add</Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              onClick={onStopCrawling}
              className="w-fit self-start mb-4 bg-red-600 text-white"
            >
              Stop Crawling
            </Button>
          </div>
          <div className="grid grid-cols-12 gap-4 w-full">
            {sites?.map((e) => {
              const statuses = e.details.map((det) => det.status)
              const containsRunningTask = statuses.includes('3')

              return (
                <div key={e.name_site} className="flex flex-col items-center gap-4 col-span-6">
                  <div className="flex flex-row gap-2 w-full items-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="bg-red-400 flex items-center justify-between py-4 rounded-xl w-full hover:bg-red-200 transition px-4 w-full"
                        >
                          <p>{e.name_site}</p>
                          <p>
                            {e.totalRunning} / {e.totalRows}
                          </p>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle className="mb-2">Crawl Confirmation</DialogTitle>
                          <DialogDescription>
                            Are you sure want to execute crawling job for website &quot;
                            {e.name_site}
                            &quot;?
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="secondary">
                              Close
                            </Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button onClick={() => executeCrawl(e.name_site)} type="button">
                              Sure
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className={`h-full ${containsRunningTask ? '' : 'hidden'}`}>
                          Kill
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle className="mb-2">Kill Crawl Confirmation</DialogTitle>
                          <DialogDescription>
                            Are you sure want to kill crawling job for website &quot;
                            {e.name_site}
                            &quot;?
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="secondary">
                              Close
                            </Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button onClick={() => onKill(e.name_site)} type="button">
                              Sure
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="bg-gray-100 flex flex-col py-4 rounded-xl w-full px-4 gap-4 justify-between">
                    {e.details.map((task) => {
                      let badge = ''

                      if (task.status == 0) {
                        badge = (
                          <Badge className="flex-none hover:bg-gray-300 hover:text-black bg-gray-300 text-black">
                            PENDING
                          </Badge>
                        )
                      } else if (task.status == 1) {
                        badge = (
                          <Badge className="flex-none hover:bg-green-500 bg-green-500">
                            POST CRAWLED
                          </Badge>
                        )
                      } else if (task.status == 2) {
                        badge = (
                          <Badge className="flex-none hover:bg-green-500 bg-green-500">
                            SUCCESS
                          </Badge>
                        )
                      } else {
                        badge = <Badge className="flex-none">ON PROCESS</Badge>
                      }

                      return (
                        <div key={task.url} className="flex flex-row w-full gap-8">
                          <p className="truncate w-full">{truncate(task?.url, 70)}</p>
                          {badge}
                        </div>
                      )
                    })}
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
