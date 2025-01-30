import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function parseCSV(csvString, delimiter = ',') {
  const rows = csvString.trim().split('\n')
  const result = []

  // Extract the header row if it exists
  const headers = rows.shift().split(delimiter)

  for (const row of rows) {
    const values = row.split(delimiter)
    const rowObject = {}

    // Map values to header fields
    for (let i = 0; i < headers.length; i++) {
      rowObject[headers[i]] = values[i]
    }

    result.push(rowObject)
  }

  return result
}

export function readCSVFromFileUpload(file, callback, delimiter = ',') {
  if (!file) {
    return
  }

  const reader = new FileReader()

  reader.onload = function (e) {
    const csvData = e.target.result
    const parsedData = parseCSV(csvData, delimiter)
    callback(parsedData)
  }

  reader.readAsText(file)
}

export function sleep(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay))
}

export function generateUUIDv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
