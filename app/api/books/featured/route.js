import { readJSON } from '@/utils/helpers'
const booksPath = 'app/data/books.json'

export async function GET() {
  const books = readJSON(booksPath).books
  const featured = books.filter(b => b.featured)
  return new Response(JSON.stringify(featured), { status:200 })
}
