'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import SectionHeading from './ui/SectionHeading';
import { IconLinkedIn, IconGitHub, IconMail } from './icons';
import { useLang } from '@/lib/i18n/LangContext';

export default function Contact() {
  const { t } = useLang();

  return (
    <section id="contacto" className="pt-40 pb-36 px-8 border-t" style={{ borderColor: 'var(--border-color)', margin: '0 var(--section-mx)' }}>
      <div className="max-w-5xl mx-auto">

        <div style={{ marginBottom: '3rem', marginTop: '2rem' }}>
          <SectionHeading align="center">{t.contact.heading}</SectionHeading>
        </div>

        <motion.div
          className="flex flex-wrap justify-center"
          style={{ gap: '1rem',  marginBottom: '1rem' }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          <motion.a
            href="mailto:juanlarraya00@gmail.com"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '12px 24px', borderRadius: '999px', border: '1px solid rgba(var(--text-primary-rgb), 0.15)', color: 'rgba(var(--text-primary-rgb), 0.7)', background: 'rgba(var(--text-primary-rgb), 0.04)', backdropFilter: 'blur(8px)', fontSize: '0.875rem', fontWeight: 500 }}
            whileHover={{ borderColor: 'rgba(var(--text-primary-rgb), 0.4)', color: 'var(--text-primary)', scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <IconMail /><span className="text-sm font-medium">juanlarraya00@gmail.com</span>
          </motion.a>

          <motion.a
            href="https://www.linkedin.com/in/juan-cruz-larraya"
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '12px 24px', borderRadius: '999px', border: '1px solid rgba(var(--accent-linkedin-rgb), 0.4)', color: 'rgba(var(--text-primary-rgb), 0.6)', background: 'rgba(var(--accent-linkedin-rgb), 0.06)', backdropFilter: 'blur(8px)', fontSize: '0.875rem', fontWeight: 500 }}
            whileHover={{ borderColor: 'rgba(var(--accent-linkedin-rgb), 0.8)', color: 'var(--text-primary)', background: 'rgba(var(--accent-linkedin-rgb), 0.12)', scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <IconLinkedIn /><span className="text-sm font-medium">LinkedIn</span>
          </motion.a>

          <motion.a
            href="https://github.com/juan-LARRAYA"
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '12px 24px', borderRadius: '999px', border: '1px solid rgba(var(--text-primary-rgb), 0.12)', color: 'rgba(var(--text-primary-rgb), 0.6)', background: 'rgba(var(--text-primary-rgb), 0.03)', backdropFilter: 'blur(8px)', fontSize: '0.875rem', fontWeight: 500 }}
            whileHover={{ borderColor: 'rgba(var(--text-primary-rgb), 0.35)', color: 'var(--text-primary)', background: 'rgba(var(--text-primary-rgb), 0.08)', scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <IconGitHub /><span className="text-sm font-medium">GitHub</span>
          </motion.a>

          <Link href="/cv"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '12px 24px', borderRadius: '999px', border: '1px solid rgba(var(--accent-amber-rgb), 0.3)', color: 'rgba(var(--accent-amber-rgb), 0.8)', background: 'rgba(var(--accent-amber-rgb), 0.06)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}
          >
            <span>CV</span>
          </Link>

        </motion.div>

      </div>
    </section>
  );
}
