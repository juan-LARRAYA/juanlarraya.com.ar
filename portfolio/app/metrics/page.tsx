import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import LoginForm from './LoginForm';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Visit {
  id: string;
  created_at: string;
  browser: string | null;
  os: string | null;
  device_type: string | null;
  language: string | null;
  screen_width: number | null;
  screen_height: number | null;
  referrer: string | null;
  country: string | null;
  page_path: string | null;
}

interface HistoricalVisit {
  country: string | null;
  os: string | null;
  browser: string | null;
  device_type: string | null;
  language: string | null;
}

// ─── Aggregation helpers ──────────────────────────────────────────────────────

function countBy<T>(arr: T[], key: keyof T): Record<string, number> {
  return arr.reduce((acc, item) => {
    const val = String(item[key] ?? 'Unknown');
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function topN(counts: Record<string, number>, n = 5): [string, number][] {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

// ─── Auth helper ──────────────────────────────────────────────────────────────

function sessionToken(password: string): string {
  return crypto.createHmac('sha256', password).update('metrics_session_v1').digest('hex');
}

// ─── SVG Pie Chart ────────────────────────────────────────────────────────────

const PIE_COLORS = [
  '#E2B54A', '#E8734A', '#C0392B', '#8E44AD',
  '#2980B9', '#27AE60', '#1ABC9C', '#F39C12',
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  if (Math.abs(endAngle - startAngle) >= 359.999) {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r} Z`;
  }
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x.toFixed(3)} ${start.y.toFixed(3)}`,
    `A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x.toFixed(3)} ${end.y.toFixed(3)}`,
    'Z',
  ].join(' ');
}

function PieChart({ data, size = 180 }: { data: [string, number][]; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;
  const total = data.reduce((s, [, n]) => s + n, 0);
  if (total === 0) return null;

  let currentAngle = 0;
  const slices = data.map(([label, count], i) => {
    const sliceDeg = (count / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceDeg;
    currentAngle = endAngle;
    return { label, count, startAngle, endAngle, color: PIE_COLORS[i % PIE_COLORS.length] };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      {slices.map((s, i) => (
        <path
          key={i}
          d={describeArc(cx, cy, r, s.startAngle, s.endAngle)}
          fill={s.color}
          stroke="#0A0A0A"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

function PieLegend({ data }: { data: [string, number][] }) {
  const total = data.reduce((s, [, n]) => s + n, 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center', flex: 1, minWidth: 0 }}>
      {data.map(([label, count], i) => {
        const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              display: 'inline-block', width: '10px', height: '10px',
              borderRadius: '2px', background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0,
            }} />
            <span style={{ color: 'var(--text-subtle)', fontSize: '0.72rem', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {label}
            </span>
            <span style={{ color: 'var(--accent-amber)', fontSize: '0.72rem', fontFamily: 'monospace', marginLeft: 'auto', flexShrink: 0 }}>
              {pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MetricsPage() {
  const password = process.env.METRICS_PASSWORD;
  const cookieStore = await cookies();
  const session = cookieStore.get('metrics_session');

  const authenticated =
    password &&
    session?.value &&
    crypto.timingSafeEqual(
      Buffer.from(session.value),
      Buffer.from(sessionToken(password))
    );

  if (!authenticated) {
    return <LoginForm />;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Query A: histórico completo (columnas ligeras, sin límite)
  const { data: historicalRaw } = await supabase
    .from('visits')
    .select('country, os, browser, device_type, language');

  // Query B: últimas 20 visitas para la tabla
  const { data: recentRaw } = await supabase
    .from('visits')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  const historical: HistoricalVisit[] = historicalRaw || [];
  const recent: Visit[] = recentRaw || [];
  const totalAllTime = historical.length;

  const byCountry = topN(countBy(historical, 'country'));
  const byBrowser = topN(countBy(historical, 'browser'));
  const byDevice = topN(countBy(historical, 'device_type'));
  const byLang = topN(countBy(historical, 'language'));

  const topCountryPie = topN(countBy(historical, 'country'), 8);
  const topOSPie = topN(countBy(historical, 'os'), 8);

  const card = { background: 'var(--bg-medium)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem' };
  const label = { color: 'var(--accent-muted)', fontSize: '0.75rem', fontFamily: 'monospace', marginBottom: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.1em' };
  const value = { color: 'var(--text-primary)', fontSize: '2.5rem', fontWeight: 700, fontFamily: 'monospace' };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'var(--text-primary)', padding: '3rem 2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Métricas</h1>
        <p style={{ color: 'var(--accent-muted)', fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: '3rem' }}>
          {totalAllTime} visitas registradas (histórico completo)
        </p>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={card}>
            <p style={label}>Total visitas</p>
            <p style={value}>{totalAllTime}</p>
          </div>
          <div style={card}>
            <p style={label}>Países</p>
            <p style={value}>{Object.keys(countBy(historical, 'country')).length}</p>
          </div>
          <div style={card}>
            <p style={label}>Mobile</p>
            <p style={value}>{historical.filter(v => v.device_type === 'mobile').length}</p>
          </div>
          <div style={card}>
            <p style={label}>Desktop</p>
            <p style={value}>{historical.filter(v => v.device_type === 'desktop').length}</p>
          </div>
        </div>

        {/* Breakdown grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { title: 'Por País', data: byCountry },
            { title: 'Por Browser', data: byBrowser },
            { title: 'Por Dispositivo', data: byDevice },
            { title: 'Por Idioma', data: byLang },
          ].map(({ title, data }) => (
            <div key={title} style={card}>
              <p style={label}>{title}</p>
              {data.map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-subtle)', fontSize: '0.875rem' }}>{k}</span>
                  <span style={{ color: 'var(--accent-amber)', fontWeight: 600, fontFamily: 'monospace' }}>{v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Histórico - Gráficos de torta */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: 'var(--accent-muted)', fontFamily: 'monospace', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
            Histórico
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>

            <div style={card}>
              <p style={label}>Visitas por País</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <PieChart data={topCountryPie} />
                <PieLegend data={topCountryPie} />
              </div>
            </div>

            <div style={card}>
              <p style={label}>Visitas por OS</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <PieChart data={topOSPie} />
                <PieLegend data={topOSPie} />
              </div>
            </div>

          </div>
        </div>

        {/* Recent visits table */}
        <div style={card}>
          <p style={label}>Últimas 20 visitas</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: 'monospace' }}>
              <thead>
                <tr style={{ color: 'var(--accent-muted)', textAlign: 'left' }}>
                  {['Fecha', 'País', 'Browser', 'OS', 'Dispositivo', 'Idioma', 'Pantalla', 'Ruta'].map(h => (
                    <th key={h} style={{ padding: '0.4rem 0.75rem', whiteSpace: 'nowrap', fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((v) => (
                  <tr key={v.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>
                      {new Date(v.created_at).toLocaleString('es-AR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                        timeZone: 'America/Argentina/Buenos_Aires',
                      })}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-primary)' }}>{v.country ?? '—'}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-primary)' }}>{v.browser ?? '—'}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-subtle)' }}>{v.os ?? '—'}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-subtle)' }}>{v.device_type ?? '—'}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-subtle)' }}>{v.language ?? '—'}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>
                      {v.screen_width && v.screen_height ? `${v.screen_width}×${v.screen_height}` : '—'}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--accent-amber)' }}>{v.page_path ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
