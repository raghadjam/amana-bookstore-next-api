import { readJSON, writeJSON } from '@/utils/helpers'
import { authenticate } from '@/utils/auth'

import path from 'path'

const booksPath = path.join(process.cwd(), 'app', 'data', 'books.json')

export async function GET() {
  const books = readJSON(booksPath).books
  return new Response(JSON.stringify(books), { status: 200 })
}

export async function POST(req) {
  try { authenticate(req) } catch(e) {
    return new Response(JSON.stringify({ message:e.message }), { status:403 })
  }

  const books = readJSON(booksPath).books
  const body = await req.json()
  if (!body.title || !body.author) return new Response(JSON.stringify({ message:'Book must include title and author' }), { status:400 })

  const newId = books.length ? (parseInt(books[books.length-1].id)+1).toString() : '1'
  const newBook = { ...body, id:newId, reviews:[], reviewCount:0 }
  books.push(newBook)
  writeJSON(booksPath, { books })

  return new Response(JSON.stringify({ message:'Book added', book:newBook }), { status:201 })
}
