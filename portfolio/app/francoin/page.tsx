'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const MINT    = 'BwUMQB67ddfryoBojDzdvNaj7uDMr3MAUnAUtggXKwtG';
const POOL_ID = '6K7gMkg5bAkUw7Tnd2rfcbdnMWA6KzJLtURWkZMRZbTn';
const BUY_URL         = `https://jup.ag/swap/SOL-${MINT}`;
const SOLSCAN_URL     = `https://solscan.io/token/${MINT}`;
const DEXSCREENER_URL = `https://dexscreener.com/solana/${MINT}`;
const RAYDIUM_URL     = `https://raydium.io/liquidity/increase/?pool_id=${POOL_ID}`;
const CHART_EMBED     = `https://dexscreener.com/solana/${POOL_ID}?embed=1&theme=dark&trades=0&info=0`;

interface TokenStats {
  price: string;
  change24h: string;
  liquidity: string;
  volume24h: string;
  marketCap: string;
  positive: boolean;
}

function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  useEffect(() => {
    const read = () =>
      setTheme((document.documentElement.getAttribute('data-theme') ?? 'dark') as 'dark' | 'light');
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return theme;
}

function useTokenStats() {
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const run = () =>
      fetch(`https://api.dexscreener.com/latest/dex/tokens/${MINT}`)
        .then(r => r.json())
        .then(data => {
          const pair = data?.pairs?.[0];
          if (!pair) return;
          const change = parseFloat(pair.priceChange?.h24 ?? '0');
          setStats({
            price:     pair.priceUsd       ? `$${parseFloat(pair.priceUsd).toFixed(4)}`              : '—',
            change24h: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
            liquidity: pair.liquidity?.usd ? `$${Math.round(pair.liquidity.usd).toLocaleString()}`   : '—',
            volume24h: pair.volume?.h24    ? `$${Math.round(pair.volume.h24).toLocaleString()}`      : '—',
            marketCap: pair.fdv            ? `$${Math.round(pair.fdv).toLocaleString()}`             : '—',
            positive:  change >= 0,
          });
          setPulse(true);
          setTimeout(() => setPulse(false), 500);
        })
        .catch(() => {});

    run();
    const id = setInterval(run, 15_000);
    return () => clearInterval(id);
  }, []);

  return { stats, pulse };
}

/* ─── StatCard ────────────────────────────────────────────── */
function StatCard({ label, value, accent, pulse, labelColor }: {
  label: string; value: string; accent?: string; pulse: boolean; labelColor: string;
}) {
  return (
    <motion.div
      animate={pulse ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.3 }}
      style={{
        background: 'var(--bg-medium)',
        border: '1px solid var(--border-color)',
        borderRadius: 12,
        padding: '0.8rem 1rem',
        display: 'flex', flexDirection: 'column', gap: 3,
      }}
    >
      <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: labelColor }}>
        {label}
      </span>
      <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: accent ?? 'var(--accent-amber)' }}>
        {value}
      </span>
    </motion.div>
  );
}

/* ─── page ────────────────────────────────────────────────── */
export default function FrancoinPage() {
  const { stats, pulse } = useTokenStats();
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  // En modo claro el fondo es crema y var(--accent-muted) #777 tiene poco contraste.
  // En modo oscuro var(--accent-muted) #555 queda bien sobre fondo oscuro.
  const subtle = theme === 'light' ? 'var(--text-primary)' : 'var(--accent-muted)';

  const copyMint = () => {
    navigator.clipboard.writeText(MINT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main style={{ background: 'var(--bg-dark)', minHeight: '100vh', color: 'var(--text-primary)' }}>

      {/* nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 40,
        padding: '0.7rem 1.5rem',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(var(--bg-dark-rgb), 0.92)',
        backdropFilter: 'blur(14px)',
      }}>
        <Link href="/"
          style={{ fontSize: '0.7rem', fontFamily: 'monospace', letterSpacing: '0.2em', textTransform: 'uppercase', color: subtle, transition: 'color .2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--accent-amber)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = subtle; }}
        >← inicio</Link>
      </nav>

      {/* ambient glow — subtle in both themes */}
      <div aria-hidden className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 400,
          background: 'radial-gradient(ellipse, rgba(var(--accent-amber-rgb), 0.07) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }} />
      </div>

      {/* content wrapper */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 820, margin: '0 auto', padding: '0 1.5rem' }}>

        {/* ══ HERO ═════════════════════════════════════════ */}
        <section style={{ paddingTop: '5rem', paddingBottom: '4rem', textAlign: 'center' }}>

          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07, duration: 0.4 }}
            style={{ fontSize: '0.66rem', fontFamily: 'monospace', letterSpacing: '0.5em', color: 'rgba(var(--accent-amber-rgb), 0.6)', marginBottom: '0.7rem' }}>
            SOLANA MAINNET · TOKEN
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13, duration: 0.4 }}
            style={{
              fontSize: 'clamp(3rem, 11vw, 7rem)',
              fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.88,
              color: 'var(--accent-amber)',
              marginBottom: '0.6rem',
            }}>FRANCOIN</motion.h1>

          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.19, duration: 0.4 }}
            style={{ fontSize: '0.75rem', fontFamily: 'monospace', letterSpacing: '0.3em', color: subtle, marginBottom: '2rem' }}>
            $FRC
          </motion.p>

          {/* stat grid — 5 cols */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <StatCard label="Precio"   value={stats?.price     ?? '—'} pulse={pulse} labelColor={subtle} />
            <StatCard label="24h"      value={stats?.change24h ?? '—'} pulse={pulse} labelColor={subtle}
              accent={stats ? (stats.positive ? 'var(--accent-green)' : 'var(--accent-red)') : 'var(--accent-amber)'} />
            <StatCard label="Liquidez" value={stats?.liquidity ?? '—'} pulse={pulse} labelColor={subtle} />
            <StatCard label="Vol 24h"  value={stats?.volume24h ?? '—'} pulse={pulse} labelColor={subtle} />
            <StatCard label="Mkt Cap"  value={stats?.marketCap ?? '—'} pulse={pulse} labelColor={subtle} />
          </motion.div>

          {/* nota explicativa */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ fontSize: '0.66rem', fontFamily: 'monospace', color: subtle, marginBottom: '2rem', letterSpacing: '0.03em', opacity: 0.7 }}>
            Supply total: 100 FRC · Mkt Cap = precio × 100 · Liquidez real tras fees de creación del pool
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.4 }}
            style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>

            <motion.a href={BUY_URL} target="_blank" rel="noopener noreferrer"
              whileHover={{ scale: 1.04, boxShadow: '0 0 28px rgba(var(--accent-amber-rgb), 0.45)' }}
              whileTap={{ scale: 0.96 }}
              style={{
                padding: '0.85rem 2rem', borderRadius: 999,
                fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.02em',
                background: 'var(--accent-amber)',
                color: '#1a1a1a', /* dark text always readable on amber */
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              }}>
              Comprar FRC en Jupiter →
            </motion.a>

            <motion.a href={DEXSCREENER_URL} target="_blank" rel="noopener noreferrer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                padding: '0.85rem 2rem', borderRadius: 999,
                fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.02em',
                background: 'rgba(var(--accent-amber-rgb), 0.1)',
                border: '1.5px solid rgba(var(--accent-amber-rgb), 0.55)',
                color: 'var(--accent-amber)',
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              }}>
              Ver en DexScreener ↗
            </motion.a>
          </motion.div>
        </section>

        {/* ══ CHART ════════════════════════════════════════ */}
        <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '3rem', paddingBottom: '3.5rem' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                FRC / SOL
              </h2>
              <span style={{
                fontSize: '0.58rem', fontFamily: 'monospace', padding: '0.2rem 0.5rem',
                borderRadius: 5, letterSpacing: '0.12em',
                background: 'rgba(var(--accent-amber-rgb), 0.08)',
                color: 'var(--accent-amber)',
                border: '1px solid rgba(var(--accent-amber-rgb), 0.18)',
              }}>LIVE</span>
            </div>
            <a href={DEXSCREENER_URL} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '0.66rem', fontFamily: 'monospace', color: subtle }}>
              DexScreener ↗
            </a>
          </div>

          {/* El iframe siempre usa theme=dark — el gráfico necesita fondo oscuro para leerse bien */}
          <div style={{
            borderRadius: 18, overflow: 'hidden', height: 420,
            background: 'var(--bg-dark)',
            border: '1px solid var(--border-color)',
          }}>
            <iframe
              src={CHART_EMBED}
              width="100%" height="100%"
              style={{ border: 'none', display: 'block' }}
              title="Francoin FRC/SOL chart"
              loading="lazy"
            />
          </div>
        </section>

        {/* ══ TOKEN INFO ═══════════════════════════════════ */}
        <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '3rem', paddingBottom: '3.5rem' }}>

          <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Info del token
          </h2>

          <div style={{ background: 'var(--bg-medium)', border: '1px solid var(--border-color)', borderRadius: 18, overflow: 'hidden', marginBottom: '0.75rem' }}>
            {([
              { label: 'Nombre',           value: 'Francoin' },
              { label: 'Símbolo',          value: 'FRC' },
              { label: 'Supply total',     value: '100 FRC' },
              { label: 'Decimales',        value: '2' },
              { label: 'Mint Authority',   value: 'Desactivada ✓', green: true },
              { label: 'Freeze Authority', value: 'Desactivada ✓', green: true },
              { label: 'Red',              value: 'Solana Mainnet' },
              { label: 'DEX',              value: 'Raydium CPMM' },
            ] as { label: string; value: string; green?: boolean }[]).map(({ label, value, green }, i, arr) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.8rem 1.4rem',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border-color)' : 'none',
              }}>
                <span style={{ fontSize: '0.85rem', color: subtle }}>{label}</span>
                <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 600, color: green ? 'var(--accent-green)' : 'var(--text-primary)' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* mint address */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
            padding: '0.9rem 1.4rem', borderRadius: 12, marginBottom: '0.75rem',
            background: 'rgba(var(--accent-amber-rgb), 0.04)',
            border: '1px solid rgba(var(--accent-amber-rgb), 0.15)',
          }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.58rem', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(var(--accent-amber-rgb), 0.5)', marginBottom: '0.2rem' }}>
                Mint Address
              </p>
              <p style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: 'var(--accent-amber)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {MINT}
              </p>
            </div>
            <motion.button onClick={copyMint} whileTap={{ scale: 0.88 }}
              style={{
                flexShrink: 0, padding: '0.35rem 0.9rem', borderRadius: 8,
                fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 600,
                background: copied ? 'rgba(var(--accent-green-rgb), 0.1)'  : 'rgba(var(--accent-amber-rgb), 0.1)',
                color:      copied ? 'var(--accent-green)'                  : 'var(--accent-amber)',
                border:     copied ? '1px solid rgba(var(--accent-green-rgb), 0.25)' : '1px solid rgba(var(--accent-amber-rgb), 0.22)',
              }}>
              {copied ? '✓ Copiado' : 'Copiar'}
            </motion.button>
          </div>

          {/* explorer links */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {[
              { label: 'Solscan',      href: SOLSCAN_URL },
              { label: 'Raydium Pool', href: RAYDIUM_URL },
              { label: 'DexScreener', href: DEXSCREENER_URL },
            ].map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                style={{
                  padding: '0.35rem 0.9rem', borderRadius: 8,
                  fontSize: '0.72rem', fontFamily: 'monospace',
                  background: 'var(--bg-medium)', border: '1px solid var(--border-color)', color: subtle,
                }}>
                {label} ↗
              </a>
            ))}
          </div>
        </section>

        {/* ══ CÓMO COMPRAR ═════════════════════════════════ */}
        <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '3rem', paddingBottom: '6rem' }}>

          <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Cómo comprar
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '2.5rem' }}>
            {([
              { step: '01', icon: '👻', title: 'Descargá Phantom',  desc: 'La wallet más popular de Solana. iOS, Android y Chrome.' },
              { step: '02', icon: '⚡', title: 'Cargá SOL',         desc: 'Comprá SOL en Lemon Cash, Binance u otro exchange y retiralo a tu wallet.' },
              { step: '03', icon: '🔄', title: 'Comprá FRC',        desc: 'Conectá tu Phantom en Jupiter y canjeá SOL por Francoin.' },
            ] as { step: string; icon: string; title: string; desc: string }[]).map(({ step, icon, title, desc }) => (
              <motion.div key={step}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.18 }}
                style={{
                  padding: '1.4rem 1.2rem', borderRadius: 18,
                  background: 'var(--bg-medium)', border: '1px solid var(--border-color)',
                  display: 'flex', flexDirection: 'column', gap: '0.6rem',
                }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'monospace', color: 'var(--accent-amber)', lineHeight: 1 }}>
                    {step}
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</p>
                <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: subtle, fontWeight: 500 }}>{desc}</p>
              </motion.div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.a href={BUY_URL} target="_blank" rel="noopener noreferrer"
              whileHover={{ scale: 1.04, boxShadow: '0 0 36px rgba(var(--accent-amber-rgb), 0.4)' }}
              whileTap={{ scale: 0.96 }}
              style={{
                padding: '1rem 2.6rem', borderRadius: 999,
                fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.02em',
                background: 'var(--accent-amber)',
                color: '#1a1a1a',
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              }}>
              Comprar Francoin en Jupiter →
            </motion.a>
          </div>
        </section>

      </div>
    </main>
  );
}
