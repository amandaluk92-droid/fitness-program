import { NextRequest, NextResponse } from 'next/server'

const EXERCISEDB_BASE_URL = 'https://exercisedb-api.vercel.app/api/v1'

interface ExerciseDBResult {
  exerciseId: string
  name: string
  gifUrl: string
  targetMuscles: string[]
  bodyParts: string[]
  equipments: string[]
  secondaryMuscles: string[]
  instructions: string[]
}

// Simple in-memory cache to reduce API calls
const cache = new Map<string, { data: ExerciseDBResult[]; timestamp: number }>()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

function getCached(key: string): ExerciseDBResult[] | null {
  const entry = cache.get(key)
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data
  }
  cache.delete(key)
  return null
}

function setCache(key: string, data: ExerciseDBResult[]) {
  cache.set(key, { data, timestamp: Date.now() })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()
    const bodyPart = searchParams.get('bodyPart')?.trim()
    const equipment = searchParams.get('equipment')?.trim()
    const target = searchParams.get('target')?.trim()
    const offset = parseInt(searchParams.get('offset') || '0')
    const limit = parseInt(searchParams.get('limit') || '12')

    if (!q && !bodyPart && !equipment && !target) {
      return NextResponse.json(
        { error: 'At least one search parameter is required (q, bodyPart, equipment, or target)' },
        { status: 400 }
      )
    }

    const cacheKey = `${q || ''}|${bodyPart || ''}|${equipment || ''}|${target || ''}`
    let exercises = getCached(cacheKey)

    if (!exercises) {
      let url: string

      if (q) {
        url = `${EXERCISEDB_BASE_URL}/exercises?search=${encodeURIComponent(q)}&offset=0&limit=50`
      } else if (bodyPart) {
        url = `${EXERCISEDB_BASE_URL}/exercises?search=${encodeURIComponent(bodyPart)}&offset=0&limit=50`
      } else if (equipment) {
        url = `${EXERCISEDB_BASE_URL}/exercises?search=${encodeURIComponent(equipment)}&offset=0&limit=50`
      } else if (target) {
        url = `${EXERCISEDB_BASE_URL}/exercises?search=${encodeURIComponent(target)}&offset=0&limit=50`
      } else {
        url = `${EXERCISEDB_BASE_URL}/exercises?offset=0&limit=50`
      }

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('ExerciseDB API error:', response.status, response.statusText)
        return NextResponse.json(
          { error: 'Failed to fetch exercises from ExerciseDB' },
          { status: 502 }
        )
      }

      const data = await response.json()
      exercises = (data.data?.exercises || data.data || data || []) as ExerciseDBResult[]

      // Apply additional filters if combined search
      if (q && bodyPart) {
        exercises = exercises.filter((e) =>
          e.bodyParts?.some((bp: string) => bp.toLowerCase().includes(bodyPart.toLowerCase()))
        )
      }
      if (q && equipment) {
        exercises = exercises.filter((e) =>
          e.equipments?.some((eq: string) => eq.toLowerCase().includes(equipment.toLowerCase()))
        )
      }
      if (q && target) {
        exercises = exercises.filter((e) =>
          e.targetMuscles?.some((tm: string) => tm.toLowerCase().includes(target.toLowerCase()))
        )
      }

      setCache(cacheKey, exercises)
    }

    // Paginate
    const paginated = exercises.slice(offset, offset + limit)

    const results = paginated.map((e) => ({
      id: e.exerciseId,
      name: e.name,
      gifUrl: e.gifUrl,
      target: Array.isArray(e.targetMuscles) ? e.targetMuscles.join(', ') : '',
      bodyPart: Array.isArray(e.bodyParts) ? e.bodyParts.join(', ') : '',
      equipment: Array.isArray(e.equipments) ? e.equipments.join(', ') : '',
      secondaryMuscles: Array.isArray(e.secondaryMuscles) ? e.secondaryMuscles : [],
      instructions: Array.isArray(e.instructions) ? e.instructions : [],
    }))

    return NextResponse.json({
      exercises: results,
      total: exercises.length,
      offset,
      limit,
    })
  } catch (error) {
    console.error('Error searching exercises:', error)
    return NextResponse.json(
      { error: 'Failed to search exercises' },
      { status: 500 }
    )
  }
}
