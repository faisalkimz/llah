import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CodeBlock({ code, language, className = '' }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className={`code-block ${className}`}>
      <button
        onClick={handleCopy}
        className="code-block-copy btn-icon btn-sm"
        aria-label={copied ? 'Copied' : 'Copy to clipboard'}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      {language && (
        <span className="absolute top-2 left-3 text-[10px] uppercase tracking-wider text-muted-foreground">
          {language}
        </span>
      )}
      <pre className={language ? 'mt-4' : ''}><code>{code}</code></pre>
    </div>
  );
}
