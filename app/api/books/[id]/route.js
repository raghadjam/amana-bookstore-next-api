import path from 'path'
import { readJSON, writeJSON } from '@/utils/helpers'
import { authenticate } from '@/utils/auth'

const booksPath = path.join(process.cwd(), 'app', 'data', 'books.json')
const reviewsPath = path.join(process.cwd(), 'app', 'data', 'reviews.json')

export async function GET(req, { params }) {
  const books = readJSON(booksPath).books
  const reviews = readJSON(reviewsPath).reviews
  const id = params.id

  if (req.url.endsWith('/reviews')) {
    const bookReviews = reviews.filter(r => r.bookId===id)
    return new Response(JSON.stringify(bookReviews))
  }

  const book = books.find(b => b.id===id)
  if (!book) return new Response(JSON.stringify({message:'Book not found'}), {status:404})
  return new Response(JSON.stringify(book))
}

export async function POST(req, { params }) {
  const books = readJSON(booksPath).books
  const reviews = readJSON(reviewsPath).reviews
  const id = params.id

  try { authenticate(req) } catch(e) {
    return new Response(JSON.stringify({message:e.message}), {status:403})
  }

  const body = await req.json()

  if (req.url.endsWith('/reviews')) {
    const book = books.find(b => b.id===id)
    if (!book) return new Response(JSON.stringify({message:'Book not found'}), {status:404})
    if (!body.author || !body.rating) return new Response(JSON.stringify({message:'Review must include author and rating'}), {status:400})

    const newReview = {...body, id:`review-${Date.now()}`, bookId:id, timestamp: new Date().toISOString()}
    reviews.push(newReview)
    book.reviewCount = (book.reviewCount||0)+1
    writeJSON(reviewsPath, {reviews})
    writeJSON(booksPath, {books})

    return new Response(JSON.stringify({message:'Review added', review:newReview}), {status:201})
  }

  return new Response(JSON.stringify({message:'Not Found'}), {status:404})
}
