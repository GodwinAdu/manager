import jwt from 'jsonwebtoken'

const JWT_SECRET = 'your-secret-key-change-in-production'

interface SessionPayload {
  userId: string
  name: string
  email: string
  role: string
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}