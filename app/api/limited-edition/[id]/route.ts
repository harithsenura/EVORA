import { NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/api-config'

export const dynamic = 'force-dynamic'


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const response = await fetch(
      `${API_BASE_URL}/api/limited-edition/${id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      // Return the same status code from backend instead of always throwing 500
      const errorData = await response.json().catch(() => ({ message: 'Product not found' }))
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch limited edition product' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch limited edition product' },
      { status: 500 }
    )
  }
}
