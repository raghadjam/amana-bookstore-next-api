// utils/helpers.js
import fs from 'fs'

export function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath))
}

export function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}
