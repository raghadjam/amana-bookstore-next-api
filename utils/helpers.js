// utils/helpers.js
import fs from 'fs'

export function readJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (e) {
    console.error('Error reading JSON:', e)
    return { books: [], reviews: [] } // default fallback
  }
}

export function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('Error writing JSON:', e)
    throw e
  }
}
