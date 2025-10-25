import path from 'path'
import { readJSON, writeJSON } from '@/utils/helpers'
import { authenticate } from '@/utils/auth'

const booksPath = path.join(process.cwd(), 'app', 'data', 'books.json')

// GET all books
export async function GET() {
  try {
    const books = readJSON(booksPath).books
    return new Response(JSON.stringify(books), { status: 200 })
  } catch (e) {
    return new Response(JSON.stringify({ message: 'Error reading books' }), { status: 500 })
  }
}

// POST new book
export async function POST(req) {
  try { authenticate(req) } catch(e) {
    return new Response(JSON.stringify({ message: e.message }), { status: 403 })
  }

  let body
  try { body = await req.json() } catch(e) {
    return new Response(JSON.stringify({ message: 'Invalid JSON' }), { status: 400 })
  }

  if (!body.title || !body.author)
    return new Response(JSON.stringify({ message: 'Book must include title and author' }), { status: 400 })

  let books
  try { books = readJSON(booksPath).books } catch(e) { books = [] }

  const newId = books.length ? (parseInt(books[books.length-1].id) + 1).toString() : '1'
  const newBook = { ...body, id: newId, reviews: [], reviewCount: 0 }

  books.push(newBook)
  writeJSON(booksPath, { books })

  return new Response(JSON.stringify({ message: 'Book added', book: newBook }), { status: 201 })
}
