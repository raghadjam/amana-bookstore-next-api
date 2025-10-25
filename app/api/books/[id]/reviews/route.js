import path from 'path'
import { readJSON, writeJSON } from '@/utils/helpers'
import { authenticate } from '@/utils/auth'

const booksPath = path.join(process.cwd(), 'app', 'data', 'books.json')
const reviewsPath = path.join(process.cwd(), 'app', 'data', 'reviews.json')

// GET all reviews for a book
export async function GET(req, { params }) {
  const id = params.id
  const books = readJSON(booksPath).books
  const reviews = readJSON(reviewsPath).reviews

  const book = books.find(b => b.id === id)
  if (!book) return new Response(JSON.stringify({ message: 'Book not found' }), { status: 404 })

  const bookReviews = reviews.filter(r => r.bookId === id)
  return new Response(JSON.stringify(bookReviews), { status: 200 })
}

export async function POST(req, { params }) {
  try {
    const id = params.id
    authenticate(req)

    const books = readJSON(booksPath).books
    const reviews = readJSON(reviewsPath).reviews
    const body = await req.json()

    const book = books.find(b => b.id === id)
    if (!book) return new Response(JSON.stringify({ message: 'Book not found' }), { status: 404 })
    if (!body.author || !body.rating)
      return new Response(JSON.stringify({ message: 'Review must include author and rating' }), { status: 400 })

    const newReview = { ...body, id: `review-${Date.now()}`, bookId: id, timestamp: new Date().toISOString() }
    reviews.push(newReview)
    book.reviewCount = (book.reviewCount || 0) + 1

    writeJSON(reviewsPath, { reviews })
    writeJSON(booksPath, { books })

    return new Response(JSON.stringify({ message: 'Review added', review: newReview }), { status: 201 })
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message || 'Internal server error' }), { status: err.status || 500 })
  }
}