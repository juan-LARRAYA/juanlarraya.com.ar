'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface ProjectCardProps {
  name: string;
  description: string;
  href: string;
  image?: string;
  tag?: string;
  dark?: boolean;
  contain?: boolean;
  imgPosition?: string;
  compact?: boolean;
}

export default function ProjectGridCard({ name, description, href, image, tag, dark = false, contain = false, imgPosition = 'top', compact = false }: ProjectCardProps) {
  const isExternal = href.startsWith('http');
  const bg = 'var(--bg-medium)';
  const textColor = 'var(--text-primary)';

  return (
    <motion.a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      style={{ background: bg, minHeight: compact ? '220px' : '420px', borderRadius: '28px', border: '1px solid var(--border-color-subtle)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      whileHover={{ y: -6, scale: 1.01, borderColor: 'rgba(var(--accent-amber-rgb), 0.55)', boxShadow: '0 12px 40px rgba(var(--accent-amber-rgb), 0.12)' }}
      transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {/* Text block */}
      <div style={{ padding: '1.6rem 1.6rem 1rem' }}>
        {tag && (
          <p style={{ color: 'var(--accent-amber)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            {tag}
          </p>
        )}
        <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: textColor, lineHeight: 1.15, marginBottom: '0.4rem' }}>
          {name}
        </h3>
        <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--accent-muted)', lineHeight: 1.5 }}>
          {description}
        </p>
      </div>

      {/* Image fills bottom */}
      {image && (
        <div style={{ position: 'relative', flex: 1, minHeight: '220px' }}>
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
            style={{ objectFit: contain ? 'contain' : 'cover', objectPosition: imgPosition, padding: contain ? '1rem' : '0' }}
          />
        </div>
      )}
    </motion.a>
  );
}
