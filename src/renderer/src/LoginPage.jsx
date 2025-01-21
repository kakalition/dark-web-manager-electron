import { cn } from './lib/utils'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { CogIcon } from 'lucide-react'
import SettingsDialog from './components/SettingsDialog'

export default function LoginPage({ className, ...props }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    console.log(email, password)

    const response = await window.api.getUserInfo(email, password)

    if (!response.status) {
      toast.error(response.message)
      return
    }

    window.localStorage.setItem('id', response.data.user_id)
    window.localStorage.setItem('name', response.data.name)
    window.localStorage.setItem('email', response.data.email)

    toast.success('Login success.')

    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center justify-center h-screen" {...props}>
      <div className={cn('flex flex-col gap-6 w-[40%]', className)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your email below to login to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <SettingsDialog>
          <div className="p-3 rounded-xl border border-gray-200 flex items-center justify-center w-fit self-center">
            <CogIcon />
          </div>
        </SettingsDialog>

        {/* <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="flex items-center justify-center"></DialogTrigger>
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
        </Dialog> */}
      </div>

      <Toaster />
    </div>
  )
}
