import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from './ui/dialog'
import { useEffect, useState } from 'react'

export default function SettingsDialog({ children, afterSubmitCallback }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchConfiguration()
  }, [open])

  async function fetchConfiguration() {
    const configuration = await window.api.getConfiguration()

    setCorePath(configuration.corePath)
    setMongoUrl(configuration.mongoUrl)
  }

  const [corePath, setCorePath] = useState()
  const [mongoUrl, setMongoUrl] = useState()

  function submitConfiguration() {
    window.localStorage.setItem('CORE_PATH', corePath)
    window.localStorage.setItem('MONGO_URL', mongoUrl)

    setOpen(false)

    afterSubmitCallback()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center justify-center">{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configuration</DialogTitle>
        </DialogHeader>
        <div className="grid w-full items-center gap-1.5">
          <Label>Core Path</Label>
          <Input type="text" value={corePath} onChange={(e) => setCorePath(e.target.value)} />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label>Mongo URL</Label>
          <Input type="text" value={mongoUrl} onChange={(e) => setMongoUrl(e.target.value)} />
        </div>
        <DialogFooter>
          <Button onClick={submitConfiguration} type="button">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
