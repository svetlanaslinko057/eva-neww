/**
 * LanguageToggle — compact click-to-toggle button (no dropdown).
 * On click: cycles to the next language in the `languages` list (EN ⇄ UK).
 * Displays only the language code (e.g. "EN" / "UK"). No borders/palette
 * frame on mobile per UX requirement; on desktop it shows a subtle border.
 */
import { useLang } from '@/contexts/LanguageContext';

export default function LanguageToggle({ palette, fontMono, compact }) {
  const { lang, setLang, languages } = useLang();

  const C = palette || {};
  const border = C.border2 || 'rgba(0,0,0,0.14)';
  const text1 = C.text1 || '#111';
  const text3 = C.text3 || '#888';
  const monoFont = fontMono || "'IBM Plex Mono','JetBrains Mono',ui-monospace,monospace";

  const current = languages.find((l) => l.id === lang) || languages[0];

  const handleToggle = () => {
    const idx = languages.findIndex((l) => l.id === lang);
    const next = languages[(idx + 1) % languages.length];
    if (next) setLang(next.id);
  };

  const nextLabel =
    languages[(languages.findIndex((l) => l.id === lang) + 1) % languages.length]?.label || '';

  return (
    <button
      type="button"
      onClick={handleToggle}
      data-testid="language-toggle-button"
      aria-label={`Switch language to ${nextLabel}`}
      title={`Switch to ${nextLabel}`}
      className="lang-toggle-btn"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        background: 'transparent',
        border: compact ? '0' : `1px solid ${border}`,
        borderRadius: 8,
        padding: compact ? '4px 6px' : '6px 10px',
        color: text1,
        fontFamily: monoFont,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.08em',
        cursor: 'pointer',
        lineHeight: 1,
        minWidth: 36,
        minHeight: compact ? 32 : 34,
      }}
    >
      <span style={{ color: text1 }}>{current.label}</span>
    </button>
  );
}
