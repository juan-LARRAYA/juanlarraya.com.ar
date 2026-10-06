import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { clientIp, rateLimit } from '@/lib/rateLimit';

// Derive a session token from the password so we never store the password itself in the cookie
function sessionToken(password: string): string {
  return crypto.createHmac('sha256', password).update('metrics_session_v1').digest('hex');
}

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  const retryAfter = rateLimit(`metrics-auth:${clientIp(req)}`, MAX_ATTEMPTS, WINDOW_MS);
  if (retryAfter) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Probá de nuevo más tarde.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  const expected = process.env.METRICS_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  const { password } = await req.json().catch(() => ({ password: '' }));
  if (typeof password !== 'string' || password.length > 200) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
  }

  // Hash both to equal length, then timing-safe compare
  const inputHash = crypto.createHash('sha256').update(password ?? '').digest();
  const expectedHash = crypto.createHash('sha256').update(expected).digest();
  const valid = crypto.timingSafeEqual(inputHash, expectedHash);

  if (!valid) {
    // Fixed delay on failures makes guessing slower even across instances.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
  }

  const token = sessionToken(expected);
  const res = NextResponse.json({ ok: true });

  res.cookies.set('metrics_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/metrics',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}
