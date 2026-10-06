import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function parseUserAgent(ua: string) {
  let browser = 'Unknown';
  let os = 'Unknown';
  let device_type = 'desktop';

  // Browser
  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('OPR/') || ua.includes('Opera')) browser = 'Opera';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';

  // OS — Android must be checked before Linux (Android UA strings contain "Linux")
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  // Device type
  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
    device_type = 'mobile';
  } else if (ua.includes('iPad') || ua.includes('Tablet')) {
    device_type = 'tablet';
  }

  return { browser, os, device_type };
}

// Cap every client-provided string so a malicious caller cannot bloat the table.
function clip(value: unknown, max: number): string | null {
  return typeof value === 'string' && value ? value.slice(0, max) : null;
}
function dimension(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 && value < 20000 ? Math.round(value) : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const ua = (req.headers.get('user-agent') || clip(body.user_agent, 300) || '').slice(0, 300);
    const parsed = parseUserAgent(ua);

    // Override OS with client-provided platform when UA is ambiguous (e.g. Android UA contains "Linux")
    let os = parsed.os;
    const clientPlatform: string = (clip(body.client_platform, 40) || '').toLowerCase();
    if (clientPlatform === 'android') os = 'Android';
    else if (clientPlatform === 'linux') os = 'Linux';
    else if (clientPlatform === 'macintel' || clientPlatform === 'macos') os = 'macOS';
    else if (clientPlatform === 'win32' || clientPlatform === 'windows') os = 'Windows';
    else if (clientPlatform === 'iphone' || clientPlatform === 'ipad') os = 'iOS';

    const { browser, device_type } = parsed;

    // Vercel provides these headers automatically in production
    const country = req.headers.get('x-vercel-ip-country') || null;

    const { error } = await supabase.from('visits').insert({
      browser,
      os,
      device_type,
      language: clip(body.language, 20),
      screen_width: dimension(body.screen_width),
      screen_height: dimension(body.screen_height),
      referrer: clip(body.referrer, 300),
      country,
      page_path: clip(body.page_path, 200) || '/',
    });

    if (error) {
      // Log details server-side for debugging (check terminal/Vercel logs)
      console.error('[track] Supabase error:', error.message, '| code:', error.code);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[track] Unexpected error:', e);
    return NextResponse.json({ ok: true }); // always 200 to client
  }
}
