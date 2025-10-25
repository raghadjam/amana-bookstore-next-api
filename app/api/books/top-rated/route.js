import { readJSON } from '@/utils/helpers'
const booksPath = 'app/data/books.json'

export async function GET() {
  const books = readJSON(booksPath).books
  const topRated = [...books]
    .sort((a,b)=> (b.rating*b.reviewCount) - (a.rating*a.reviewCount))
    .slice(0,10)
  return new Response(JSON.stringify(topRated), { status:200 })
}
