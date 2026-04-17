import { NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/api-config'

const API_BASE = API_BASE_URL
const base = API_BASE.endsWith('/api') ? API_BASE : `${API_BASE.replace(/\/$/, '')}/api`

/**
 * GET /api/products/most-popular
 * Returns the 4 products that have been ordered most often (by total quantity across all orders).
 */
export async function GET() {
  try {
    const ordersRes = await fetch(`${base}/orders`, { cache: 'no-store' })
    if (!ordersRes.ok) {
      const err = await ordersRes.text()
      return NextResponse.json(
        { error: err || 'Failed to fetch orders' },
        { status: ordersRes.status }
      )
    }
    const orders = await ordersRes.json()
    const orderList = Array.isArray(orders) ? orders : []

    const countByProductId: Record<string, number> = {}
    for (const order of orderList) {
      const items = order.items || []
      for (const item of items) {
        const id = item.productId != null ? String(item.productId) : null
        if (!id || id.startsWith('unknown-')) continue
        countByProductId[id] = (countByProductId[id] || 0) + (Number(item.quantity) || 0)
      }
    }

    const sortedIds = Object.entries(countByProductId)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id)
      .slice(0, 4)

    if (sortedIds.length === 0) {
      return NextResponse.json({ products: [] })
    }

    const productPromises = sortedIds.map((id) =>
      fetch(`${base}/product/${id}`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null))
    )
    const productResults = await Promise.all(productPromises)
    const products = productResults.filter(Boolean)

    return NextResponse.json({ products })
  } catch (error: unknown) {
    console.error('API most-popular route error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch most popular products' },
      { status: 500 }
    )
  }
}
