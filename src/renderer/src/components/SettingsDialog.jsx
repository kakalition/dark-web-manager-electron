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

    setCorePath(configuration.corePath ?? '')
    setPythonVenvPath(configuration.pythonVenvPath ?? '')
    setMongoHost(configuration.mongoHost ?? '')
    setMongoPort(configuration.mongoPort ?? '')
    setMongoUser(configuration.mongoUser ?? '')
    setMongoPassword(configuration.mongoPassword ?? '')
    setTorBinaryPath(configuration.torBinaryPath ?? '')
    setTorProfilePath(configuration.torProfilePath ?? '')
    setGeckoDriverPath(configuration.geckoDriverPath ?? '')
  }

  const [corePath, setCorePath] = useState('')
  const [pythonVenvPath, setPythonVenvPath] = useState('')
  const [mongoHost, setMongoHost] = useState('')
  const [mongoPort, setMongoPort] = useState('')
  const [mongoUser, setMongoUser] = useState('')
  const [mongoPassword, setMongoPassword] = useState('')
  const [torBinaryPath, setTorBinaryPath] = useState('')
  const [torProfilePath, setTorProfilePath] = useState('')
  const [geckoDriverPath, setGeckoDriverPath] = useState('')

  function submitConfiguration() {
    window.localStorage.setItem('CORE_PATH', corePath)
    window.localStorage.setItem('PYTHON_VENV_PATH', pythonVenvPath)

    window.localStorage.setItem('DWC_MONGO_HOST', mongoHost)
    window.localStorage.setItem('DWC_MONGO_PORT', mongoPort)
    window.localStorage.setItem('DWC_MONGO_USER', mongoUser)
    window.localStorage.setItem('DWC_MONGO_PASS', mongoPassword)

    window.localStorage.setItem('DWC_TOR_BINARY_PATH', torBinaryPath)
    window.localStorage.setItem('DWC_TOR_PROFILE_PATH', torProfilePath)
    window.localStorage.setItem('DWC_GECKO_DRIVER_PATH', geckoDriverPath)

    setOpen(false)

    if (afterSubmitCallback) {
      afterSubmitCallback()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center justify-center">{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configuration</DialogTitle>
        </DialogHeader>
        {/* <div className="grid w-full items-center gap-1.5">
          <Label>Core Path</Label>
          <Input type="text" value={corePath} onChange={(e) => setCorePath(e.target.value)} />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label>Python Virtual Environment Path</Label>
          <Input
            type="text"
            value={pythonVenvPath}
            onChange={(e) => setPythonVenvPath(e.target.value)}
          />
        </div> */}
        <div className="grid w-full items-center gap-1.5">
          <Label>Mongo Host</Label>
          <Input type="text" value={mongoHost} onChange={(e) => setMongoHost(e.target.value)} />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label>Mongo Port</Label>
          <Input type="text" value={mongoPort} onChange={(e) => setMongoPort(e.target.value)} />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label>Mongo User</Label>
          <Input type="text" value={mongoUser} onChange={(e) => setMongoUser(e.target.value)} />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label>Mongo Password</Label>
          <Input
            type="text"
            value={mongoPassword}
            onChange={(e) => setMongoPassword(e.target.value)}
          />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label>Tor Binary Path</Label>
          <Input
            type="text"
            value={torBinaryPath}
            onChange={(e) => setTorBinaryPath(e.target.value)}
          />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label>Tor Profile Path</Label>
          <Input
            type="text"
            value={torProfilePath}
            onChange={(e) => setTorProfilePath(e.target.value)}
          />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label>Gecko Driver Path</Label>
          <Input
            type="text"
            value={geckoDriverPath}
            onChange={(e) => setGeckoDriverPath(e.target.value)}
          />
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
