import { NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/api-config'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '5'
    const status = searchParams.get('status') || 'active'

    const response = await fetch(
      `${API_BASE_URL}/api/limited-edition?limit=${limit}&status=${status}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch limited edition products' },
      { status: 500 }
    )
  }
}
