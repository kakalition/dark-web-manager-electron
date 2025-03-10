import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import Database from './Database'
import UrlUtils from './UrlUtils'
import child_process from 'child_process'
import Password from './Password'
import Types from './Types'

function isDev() {
  return true
}

function isWindows() {
  return process.platform == 'win32'
}

function getCorePath() {
  if (isDev()) {
    return `${__dirname}/../../resources/darkwebcrawl`.replace('/', isWindows() ? '\\' : '/')
  }

  return `${process.resourcesPath}/app.asar.unpacked/resources/darkwebcrawl`.replace(
    '/',
    isWindows() ? '\\' : '/'
  )
}

const api = {
  test: () => {
    console.log('res dev', `${__dirname}/../../resources/darkwebcrawl`)
    console.log('res prod', `${process.resourcesPath}/app.asar.unpacked/resources/darkwebcrawl`)
  },
  getConfiguration: async () => {
    return {
      corePath: window.localStorage.getItem('CORE_PATH') ?? '',
      pythonVenvPath: window.localStorage.getItem('PYTHON_VENV_PATH') ?? '',

      mongoHost: window.localStorage.getItem('DWC_MONGO_HOST') ?? '',
      mongoPort: window.localStorage.getItem('DWC_MONGO_PORT') ?? '',
      mongoUser: window.localStorage.getItem('DWC_MONGO_USER') ?? '',
      mongoPassword: window.localStorage.getItem('DWC_MONGO_PASS') ?? '',

      torBinaryPath: window.localStorage.getItem('DWC_TOR_BINARY_PATH') ?? '',
      torProfilePath: window.localStorage.getItem('DWC_TOR_PROFILE_PATH') ?? '',
      geckoDriverPath: window.localStorage.getItem('DWC_GECKO_DRIVER_PATH') ?? '',

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
        $addFields: {
          name_site: {
            $cond: {
              if: { $not: ['$name_site'] }, // Check if name_site doesn't exist
              then: '$site_name', // If it doesn't exist, use site_name
              else: '$name_site' // If it exists, keep it as is
            }
          }
        }
      },
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
  getUncrawledSites: async () => {
    const aggr = (await Database.getJobsCrawlerCollection()).aggregate([
      {
        $match: {
          status: { $in: ['0', '1'] } // Match documents with status "0" or "1"
        }
      },
      {
        $group: {
          _id: { name_site: '$name_site', status: '$status' }, // Group by name_site and status
          count: { $sum: 1 } // Count occurrences of each status within each name_site
        }
      },
      {
        $group: {
          _id: '$_id.name_site', // Group by name_site
          statusCounts: { $push: { k: '$_id.status', v: '$count' } } // Array of status counts
        }
      },
      {
        $project: {
          _id: 0,
          name_site: '$_id',
          statusCounts: {
            $arrayToObject: {
              // Convert the array to an object
              $map: {
                input: '$statusCounts',
                as: 'sc',
                in: { k: '$$sc.k', v: '$$sc.v' }
              }
            }
          }
        }
      },
      {
        // Handle the case where a name_site has no status "0" or "1"
        $addFields: {
          statusCounts: {
            $mergeObjects: [
              { 0: 0, 1: 0 }, // Default values for status "0" and "1"
              '$statusCounts' // Existing status counts
            ]
          }
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

    const existing = await (
      await Database.getJobsCrawlerCollection()
    ).findOne({
      name_site: siteName,
      status: '1'
    })

    if (existing) {
      crawlProfile(siteName)
      return
    }

    crawlSite(siteName, () => crawlProfile(siteName))
  },
  executeProfileOnly: async (siteName) => {
    crawlProfile(siteName)
  },
  killWorker: async (siteName) => {
    console.log(`killing ${siteName}`)

    if (process.platform == 'win32') {
      child_process.exec(
        `powershell.exe -command "& Get-CimInstance -ClassName Win32_Process | Select-Object -Property ProcessId, CommandLine" | findstr ${siteName}`,
        (err, stdout) => {
          const procs = stdout
            .split('\n')
            .map((e) => e.replace(/ +(?= )/g, ''))
            .map((e) => e.split(' '))
          const pids = procs.map((e) => e[1]).filter((e) => e != undefined)
          console.log('pids', pids)

          pids.forEach((pid) => {
            child_process.exec(`taskkill /F /PID ${pid}`)
          })
        }
      )
    } else {
      child_process.exec(`pkill -9 -f ${siteName}`)
    }

    await setRunningToPendingNamed(siteName)
  },
  stopCrawling: async () => {
    if (process.platform == 'win32') {
      child_process.exec(`taskkill -f -im python.exe`)
      child_process.exec(`taskkill -f -im firefox.exe`)
    } else {
      child_process.exec(`pkill -9 -f python`)
      child_process.exec(`pkill -9 -f firefox`)
    }

    await setRunningToPending()
  }
}

async function crawlSite(siteName, onExit) {
  console.log('executing crawl site', siteName)

  const corePath = getCorePath()
  const isWindows = process.platform == 'win32'

  const setEnvCommand = isWindows
    ? `set "DWC_TOR_BINARY_PATH=${window.localStorage.getItem('DWC_TOR_BINARY_PATH')}" && set "DWC_TOR_PROFILE_PATH=${window.localStorage.getItem('DWC_TOR_PROFILE_PATH')}" && set "DWC_GECKO_DRIVER_PATH=${window.localStorage.getItem('DWC_GECKO_DRIVER_PATH')}" && set DWC_MONGO_HOST="${window.localStorage.getItem('DWC_MONGO_HOST')}" && set "DWC_MONGO_PORT=${window.localStorage.getItem('DWC_MONGO_PORT')}" && set "DWC_MONGO_USER=${window.localStorage.getItem('DWC_MONGO_USER')}" && set "DWC_MONGO_PASS=${window.localStorage.getItem('DWC_MONGO_PASS')}" `
    : `export DWC_TOR_BINARY_PATH="${window.localStorage.getItem('DWC_TOR_BINARY_PATH')}" DWC_TOR_PROFILE_PATH="${window.localStorage.getItem('DWC_TOR_PROFILE_PATH')}" DWC_GECKO_DRIVER_PATH="${window.localStorage.getItem('DWC_GECKO_DRIVER_PATH')}" DWC_MONGO_HOST="${window.localStorage.getItem('DWC_MONGO_HOST')}" DWC_MONGO_PORT="${window.localStorage.getItem('DWC_MONGO_PORT')}" DWC_MONGO_USER="${window.localStorage.getItem('DWC_MONGO_USER')}" DWC_MONGO_PASS="${window.localStorage.getItem('DWC_MONGO_PASS')}" `

  const activateCommand = !isWindows
    ? `source ${corePath}/.venv/bin/activate`
    : `${corePath}\\.wvenv\\Scripts\\activate`

  const separator = isWindows ? '&' : '&&'

  const cdCommand = !isWindows ? `cd ${corePath}/crawler` : `cd ${corePath}\\crawler`

  console.log(
    `${setEnvCommand} ${separator} ${activateCommand} ${separator} ${cdCommand} ${separator} python script_new.py --sites ${siteName} --action  update_posts --userid ${window.localStorage.getItem('id')}`
  )

  const exe = child_process.spawn(
    `${setEnvCommand} ${separator} ${activateCommand} ${separator} ${cdCommand} ${separator} python script_new.py --sites ${siteName} --action  update_posts --userid ${window.localStorage.getItem('id')}`,
    [],
    { shell: true }
  )

  let isCaptchaFound = false
  exe.stderr.on('data', (data) => {
    console.log('on error')
    console.log(data.toString())

    if (data.toString().includes('Closing')) {
      isCaptchaFound = false
    }

    if (data.toString().includes('Wait captcha is ready') && isCaptchaFound == false) {
      window.postMessage({
        type: Types.CAPTCHA_FOUND
      })

      isCaptchaFound = true

      return
    }
  })

  exe.on('close', async (code, signal) => {
    console.log('close', code, signal)

    if (signal == 'SIGKILL') {
      await setRunningToPendingNamed(siteName)
    }

    window.postMessage({
      type: Types.REFRESH
    })
  })

  exe.on('exit', function () {
    onExit()
  })
}

async function crawlProfile(siteName) {
  console.log('executing crawl profile', siteName)

  const corePath = getCorePath()
  const isWindows = process.platform == 'win32'

  const setEnvCommand = isWindows
    ? `set "DWC_TOR_BINARY_PATH=${window.localStorage.getItem('DWC_TOR_BINARY_PATH')}" && set "DWC_TOR_PROFILE_PATH=${window.localStorage.getItem('DWC_TOR_PROFILE_PATH')}" && set "DWC_GECKO_DRIVER_PATH=${window.localStorage.getItem('DWC_GECKO_DRIVER_PATH')}" && set DWC_MONGO_HOST="${window.localStorage.getItem('DWC_MONGO_HOST')}" && set "DWC_MONGO_PORT=${window.localStorage.getItem('DWC_MONGO_PORT')}" && set "DWC_MONGO_USER=${window.localStorage.getItem('DWC_MONGO_USER')}" && set "DWC_MONGO_PASS=${window.localStorage.getItem('DWC_MONGO_PASS')}" `
    : `export DWC_TOR_BINARY_PATH="${window.localStorage.getItem('DWC_TOR_BINARY_PATH')}" DWC_TOR_PROFILE_PATH="${window.localStorage.getItem('DWC_TOR_PROFILE_PATH')}" DWC_GECKO_DRIVER_PATH="${window.localStorage.getItem('DWC_GECKO_DRIVER_PATH')}" DWC_MONGO_HOST="${window.localStorage.getItem('DWC_MONGO_HOST')}" DWC_MONGO_PORT="${window.localStorage.getItem('DWC_MONGO_PORT')}" DWC_MONGO_USER="${window.localStorage.getItem('DWC_MONGO_USER')}" DWC_MONGO_PASS="${window.localStorage.getItem('DWC_MONGO_PASS')}" `

  const activateCommand = !isWindows
    ? `source ${corePath}/.venv/bin/activate`
    : `${corePath}\\.wvenv\\Scripts\\activate`

  const separator = isWindows ? '&' : '&&'

  const cdCommand = !isWindows ? `cd ${corePath}/crawler` : `cd ${corePath}\\crawler`

  const exe = child_process.spawn(
    `${setEnvCommand} ${separator} ${activateCommand} ${separator} ${cdCommand} ${separator} python script_new.py --sites ${siteName} --action  update_profiles --userid ${window.localStorage.getItem('id')}`,
    [],
    { shell: true }
  )

  let isCaptchaFound = false
  exe.stderr.on('data', (data) => {
    console.log('on error')
    console.log(data.toString())

    if (data.toString().includes('Closing')) {
      isCaptchaFound = false
    }

    if (data.toString().includes('Wait captcha is ready') && isCaptchaFound == false) {
      window.postMessage({
        type: Types.CAPTCHA_FOUND
      })

      isCaptchaFound = true

      return
    }
  })

  exe.on('close', async (code, signal) => {
    console.log('close', code, signal)

    if (signal == 'SIGKILL') {
      await setRunningToPendingNamed(siteName)
    }

    window.postMessage({
      type: Types.REFRESH
    })
  })

  return exe
}

async function setRunningToPending() {
  await (
    await Database.getJobsCrawlerCollection()
  ).updateMany(
    {
      status: '3',
      send_profile_summary: {
        $exists: true
      },
      running_user_id: window.localStorage.getItem('id')
    },
    {
      $set: {
        status: '1'
      }
    }
  )

  await (
    await Database.getJobsCrawlerCollection()
  ).updateMany(
    {
      status: '3',
      send_profile_summary: {
        $exists: false
      },
      running_user_id: window.localStorage.getItem('id')
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
      name_site: siteName,
      send_profile_summary: {
        $exists: true
      },
      running_user_id: window.localStorage.getItem('id')
    },
    {
      $set: {
        status: '1'
      }
    }
  )

  await (
    await Database.getJobsCrawlerCollection()
  ).updateMany(
    {
      status: '3',
      name_site: siteName,
      send_profile_summary: {
        $exists: false
      },
      running_user_id: window.localStorage.getItem('id')
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
