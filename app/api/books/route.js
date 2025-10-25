import path from 'path'
import { authenticate } from '@/utils/auth'
import { readJSON, writeJSON } from '@/utils/helpers'

// Paths
const booksPath = path.join(process.cwd(), 'app', 'data', 'books.json')
const reviewsPath = path.join(process.cwd(), 'app', 'data', 'reviews.json')

// -------------------
// GET handler
// -------------------
export async function GET(req) {
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/').filter(Boolean)
  const query = Object.fromEntries(url.searchParams)

  const booksData = readJSON(booksPath)
  const reviewsData = readJSON(reviewsPath)
  const books = booksData.books
  const reviews = reviewsData.reviews

  // /api/books -> all books
  if (pathParts.length === 2 && pathParts[1] === 'books') return new Response(JSON.stringify(books))

  // /api/books/featured
  if (pathParts.includes('featured')) {
    const featured = books.filter(b => b.featured === true)
    return new Response(JSON.stringify(featured))
  }

  // /api/books/top-rated
  if (pathParts.includes('top-rated')) {
    const top = [...books].sort((a,b) => (b.rating*b.reviewCount)-(a.rating*a.reviewCount)).slice(0,10)
    return new Response(JSON.stringify(top))
  }

  // /api/books/published?start=...&end=...
  if (pathParts.includes('published')) {
    if (!query.start || !query.end) return new Response(JSON.stringify({message:"Provide start and end dates"}), {status:400})
    const startDate = new Date(query.start)
    const endDate = new Date(query.end)
    const filtered = books.filter(b => {
      const pub = new Date(b.datePublished)
      return pub>=startDate && pub<=endDate
    })
    return new Response(JSON.stringify(filtered))
  }

  // /api/books/:id
  if (pathParts.length === 3 && pathParts[1] === 'books') {
    const book = books.find(b => b.id === pathParts[2])
    if (!book) return new Response(JSON.stringify({message:'Book not found'}), {status:404})
    return new Response(JSON.stringify(book))
  }

  // /api/books/:id/reviews
  if (pathParts.length === 4 && pathParts[3] === 'reviews') {
    const bookId = pathParts[2]
    const bookReviews = reviews.filter(r => r.bookId===bookId)
    return new Response(JSON.stringify(bookReviews))
  }

  return new Response(JSON.stringify({message:'Not Found'}), {status:404})
}

// -------------------
// POST handler
// -------------------
export async function POST(req) {
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/').filter(Boolean)

  const booksData = readJSON(booksPath)
  const reviewsData = readJSON(reviewsPath)
  const books = booksData.books
  const reviews = reviewsData.reviews

  try { authenticate(req) } catch(e) {
    return new Response(JSON.stringify({message:e.message}), {status:403})
  }

  const body = await req.json()

  // /api/books -> add a new book
  if (pathParts.length===2 && pathParts[1]==='books') {
    if (!body.title || !body.author) return new Response(JSON.stringify({message:'Book must include title and author'}), {status:400})
    const newId = books.length ? (parseInt(books[books.length-1].id)+1).toString() : '1'
    const newBook = {...body, id:newId, reviews:[], reviewCount:0}
    books.push(newBook)
    writeJSON(booksPath, {books})
    return new Response(JSON.stringify({message:'Book added', book:newBook}), {status:201})
  }

  // /api/books/:id/reviews -> add review
  if (pathParts.length===4 && pathParts[3]==='reviews') {
    const bookId = pathParts[2]
    const book = books.find(b => b.id===bookId)
    if (!book) return new Response(JSON.stringify({message:'Book not found'}), {status:404})
    if (!body.author || !body.rating) return new Response(JSON.stringify({message:'Review must include author and rating'}), {status:400})
    const newReview = {...body, id:`review-${Date.now()}`, bookId, timestamp: new Date().toISOString()}
    reviews.push(newReview)
    book.reviewCount = (book.reviewCount||0)+1
    writeJSON(reviewsPath, {reviews})
    writeJSON(booksPath, {books})
    return new Response(JSON.stringify({message:'Review added', review:newReview}), {status:201})
  }

  return new Response(JSON.stringify({message:'Not Found'}), {status:404})
}
