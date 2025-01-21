import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import Database from './Database'
import UrlUtils from './UrlUtils'
import child_process from 'child_process'
import Password from './Password'
import Types from './Types'

const api = {
  getConfiguration: async () => {
    return {
      corePath: window.localStorage.getItem('CORE_PATH'),
      mongoUrl: window.localStorage.getItem('MONGO_URL'),
      id: window.localStorage.getItem('id'),
      name: window.localStorage.getItem('name'),
      email: window.localStorage.getItem('email')
    }
  },
  getUserInfo: async (email, password) => {
    const result = await (
      await Database.getUsersCollection()
    ).findOne({
      email: email
    })

    if (!result) {
      return {
        status: false,
        message: 'Account not found.'
      }
    }

    if (!(await Password.comparePasswords(password, result.password))) {
      return {
        status: false,
        message: 'Wrong password.'
      }
    }

    return {
      status: true,
      data: result
    }
  },
  getSiteName: async (url) => {
    const baseUrl = UrlUtils.extractDomain(url)

    const result = await (
      await Database.getJobsCrawlerCollection()
    ).findOne({
      url: { $regex: baseUrl }
    })

    return result?.name_site
  },
  getSites: async () => {
    const aggr = (await Database.getJobsCrawlerCollection()).aggregate([
      {
        $group: {
          _id: '$name_site',
          docs: { $push: '$$ROOT' },
          totalRows: { $sum: 1 },
          totalRunning: {
            $sum: {
              $cond: [{ $in: ['$status', ['1', '3']] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          name_site: '$_id',
          details: {
            // $slice: ['$docs', 5]
            $slice: [{ $sortArray: { input: '$docs', sortBy: { status: -1 } } }, 5]
          },
          totalRows: 1,
          totalRunning: 1
        }
      },
      {
        $sort: {
          name_site: 1
        }
      }
    ])

    const result = []

    for await (const doc of aggr) {
      result.push(doc)
    }

    return result
  },
  submitSite: async (siteName, url) => {
    const existing = await (
      await Database.getJobsCrawlerCollection()
    ).findOne({
      url,
      userid: `${window.localStorage.getItem('id')}`
    })

    if (existing) {
      return {
        status: 'FAILED',
        message: 'URL already exists.'
      }
    }

    await (
      await Database.getJobsCrawlerCollection()
    ).insertOne({
      name_site: siteName,
      url: url,
      status: '0',
      userid: `${window.localStorage.getItem('id')}`,
      created_date: getCurrentDateTime
    })

    return {
      status: 'SUCCESS',
      message: 'URL inserted.'
    }
  },
  executeSite: async (siteName) => {
    console.log('executing', siteName)

    const corePath = window.localStorage.getItem('CORE_PATH')
    const isWindows = process.platform == 'win32'

    const activateCommand = !isWindows
      ? `source ${corePath}/.venv/bin/activate`
      : `${corePath}\\.venv\\Scripts\\activate`

    const separator = isWindows ? '&' : '&&'

    const cdCommand = !isWindows ? `cd ${corePath}/crawler` : `cd ${corePath}\\crawler`

    const redirection = !isWindows ? ' > /dev/null 2>&1' : ''

    // child_process.exec(
    //   `${activateCommand} ${separator} ${cdCommand} ${separator} python script_new.py --sites ${siteName} --action  update_posts --userid ${window.localStorage.getItem('id')}`,
    //   async (err, stdout, stderr) => {
    //     console.log('async in process')
    //     if (err) {
    //       console.log('err', err)
    //       console.log('stderr', stderr)

    //       window.postMessage({
    //         type: Types.PROCESS_CRASHED
    //       })

    //       await setRunningToPendingNamed(siteName)
    //     }
    //   }
    // )

    const exe = child_process.spawn(
      `${activateCommand} ${separator} ${cdCommand} ${separator} python script_new.py --sites ${siteName} --action  update_posts --userid ${window.localStorage.getItem('id')}`,
      [],
      { shell: true }
    )

    let isCaptchaFound = false
    exe.stderr.on('data', (data) => {
      console.log('on error')
      console.log(data.toString())

      if (data.toString().includes('Wait captcha is ready') && isCaptchaFound == false) {
        window.postMessage({
          type: Types.CAPTCHA_FOUND
        })

        isCaptchaFound = true
      }
    })

    exe.on('close', (code, signal) => {
      console.log('close', code, signal)
    })
  },
  killWorker: async (siteName) => {
    console.log(`killing ${siteName}`)

    if (process.platform == 'win32') {
      child_process.exec(
        `powershell.exe -command "& Get-CimInstance -ClassName Win32_Process | Select-Object -Property ProcessId, CommandLine" | findstr ${siteName}`,
        (err, stdout, stderr) => {
          console.log('stdout', stdout)
        }
      )

      child_process.exec(`taskkill -f -im firefox.exe`)
    } else {
      child_process.exec(`pkill -9 -f python`)
      child_process.exec(`pkill -9 -f tor-browser`)
    }

    await setRunningToPendingNamed(siteName)
  },
  stopCrawling: async () => {
    if (process.platform == 'win32') {
      child_process.exec(`taskkill -f -im python.exe`)
      child_process.exec(`taskkill -f -im tor-browser.exe`)
      child_process.exec(`taskkill -f -im firefox.exe`)
    } else {
      child_process.exec(`pkill -9 -f python`)
      child_process.exec(`pkill -9 -f tor-browser`)
    }

    await setRunningToPending()
  }
}

async function setRunningToPending() {
  await (
    await Database.getJobsCrawlerCollection()
  ).updateMany(
    {
      status: '3'
    },
    {
      $set: {
        status: '0'
      }
    }
  )
}

async function setRunningToPendingNamed(siteName) {
  await (
    await Database.getJobsCrawlerCollection()
  ).updateMany(
    {
      status: '3',
      name_site: siteName
    },
    {
      $set: {
        status: '0'
      }
    }
  )
}

function getCurrentDateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0') // Month is 0-indexed
  const day = now.getDate().toString().padStart(2, '0')
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// Example usage:
const currentDateTime = getCurrentDateTime()
console.log(currentDateTime) // Output: 2025-01-15 19:18 (or similar, depending on the current time)

const versions = {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('versions', versions)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
  window.versions = versions
}
