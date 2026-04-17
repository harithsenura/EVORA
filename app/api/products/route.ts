import { NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/api-config'

const API_BASE = API_BASE_URL
const base = API_BASE.endsWith('/api') ? API_BASE : `${API_BASE.replace(/\/$/, '')}/api`

/**
 * Fetches products from the backend. When status is not passed (or status=all),
 * returns every product in the database so the All Products page lists them all.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    // Don't filter by status when status is 'all' or missing - return every product in DB
    const statusParam = status && status !== 'all' ? `&status=${encodeURIComponent(status)}` : ''
    const url = `${base}/products?sortBy=${sortBy}&sortOrder=${sortOrder}&limit=10000${statusParam}`
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json(
        { error: err || 'Failed to fetch products' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: unknown) {
    console.error('API products route error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
