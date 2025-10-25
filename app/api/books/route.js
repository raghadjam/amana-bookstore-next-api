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

export async function POST(req) {
  try {
    authenticate(req)

    const books = readJSON(booksPath).books
    const body = await req.json()

    if (!body.title || !body.author)
      return new Response(JSON.stringify({ message: 'Book must include title and author' }), { status: 400 })

    const newId = books.length ? (parseInt(books[books.length - 1].id) + 1).toString() : '1'
    const newBook = { ...body, id: newId, reviews: [], reviewCount: 0 }

    books.push(newBook)
    writeJSON(booksPath, { books })

    return new Response(JSON.stringify({ message: 'Book added', book: newBook }), { status: 201 })
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message || 'Internal server error' }), { status: err.status || 500 })
  }
}