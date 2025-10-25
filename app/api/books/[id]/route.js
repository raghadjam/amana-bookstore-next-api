import { readJSON } from '@/utils/helpers'

const booksPath = 'app/data/books.json'

export async function GET(req, { params }) {
  const id = params.id
  const books = readJSON(booksPath).books
  const book = books.find(b => b.id.toString() === id) // <-- FIXED
  if (!book) return new Response(JSON.stringify({ message:'Book not found' }), { status: 404 })
  return new Response(JSON.stringify(book), { status: 200 })
}
