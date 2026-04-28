"use client";

import { useEffect, useMemo, useState } from "react";

interface ShareModalProps {
  onClose: () => void;
  url?: string;
  message?: string;
}

export function ShareModal({ onClose, url, message }: ShareModalProps) {
  const shareUrl = useMemo(() => {
    if (url) return url;
    if (typeof window === "undefined") return "";
    return window.location.origin + window.location.pathname;
  }, [url]);

  const shareText = message ?? "Play today's WordHunt with me!";
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 1800);
    return () => clearTimeout(t);
  }, [notice]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setNotice("Couldn't copy — select the link and copy manually.");
    }
  }

  function openShare(href: string) {
    window.open(href, "_blank", "noopener,noreferrer");
  }

  async function shareNative(label: string) {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "WordHunt", text: shareText, url: shareUrl });
        return;
      } catch {
        // user dismissed — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setNotice(`Link copied — open ${label} and paste it.`);
    } catch {
      setNotice(`Copy the link, then paste into ${label}.`);
    }
  }

  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const targets: Array<{
    name: string;
    color: string;
    onClick: () => void;
    icon: React.ReactNode;
  }> = [
    {
      name: "WhatsApp",
      color: "#25D366",
      onClick: () => openShare(`https://wa.me/?text=${encodedText}%20${encodedUrl}`),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.52 3.48A11.86 11.86 0 0 0 12.05 0C5.5 0 .15 5.34.15 11.91a11.85 11.85 0 0 0 1.6 5.96L0 24l6.27-1.65a11.9 11.9 0 0 0 5.78 1.47h.01c6.55 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.18-3.44-8.44ZM12.05 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.97.99-3.62-.24-.37a9.84 9.84 0 0 1-1.51-5.27c0-5.45 4.43-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.9 6.98c0 5.45-4.43 9.88-9.89 9.88Zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.39-1.47a8.92 8.92 0 0 1-1.65-2.05c-.17-.3-.02-.46.13-.6.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.91-2.18-.24-.58-.49-.5-.66-.51l-.56-.01c-.2 0-.51.07-.78.37-.27.3-1.03 1-1.03 2.45 0 1.45 1.05 2.85 1.2 3.05.15.2 2.07 3.16 5.02 4.43.7.3 1.25.48 1.68.62.7.22 1.34.19 1.85.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.3.18-1.42-.07-.13-.27-.2-.57-.35Z" />
        </svg>
      ),
    },
    {
      name: "Telegram",
      color: "#229ED9",
      onClick: () => openShare(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.56 8.21-1.86 8.78c-.14.62-.5.77-1.02.48l-2.81-2.07-1.36 1.31c-.15.15-.28.28-.57.28l.2-2.87 5.22-4.71c.23-.2-.05-.32-.35-.12L8.6 12.96l-2.78-.87c-.6-.19-.62-.6.13-.89l10.86-4.19c.5-.18.94.12.75.99Z" />
        </svg>
      ),
    },
    {
      name: "X",
      color: "#000000",
      onClick: () =>
        openShare(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      color: "#E1306C",
      onClick: () => shareNative("Instagram"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      name: "Snapchat",
      color: "#FFFC00",
      onClick: () => shareNative("Snapchat"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#000" aria-hidden="true">
          <path d="M12 1.5c2.86 0 5.21 1.65 6.34 4.32.34.8.42 2.03.42 3.06 0 1.04-.06 2.05-.1 2.5.13.07.32.13.55.13.36 0 .82-.13 1.27-.42.13-.08.32-.16.55-.16.21 0 .42.04.6.13.5.21.6.66.6.93 0 .26-.13.55-.4.79-.47.4-1.27.66-1.84.93-.13.07-.5.32-.55.5-.04.18.05.4.13.6.04.07.92 2.13 2.84 2.45.16.03.27.18.27.34v.05c-.03.34-.5 1-2.42 1.3-.07.05-.13.34-.16.5-.04.16-.08.34-.13.55-.07.27-.21.5-.55.5h-.05c-.16 0-.34-.04-.55-.08-.27-.05-.55-.1-.92-.1-.21 0-.42.01-.66.05-.55.08-1 .42-1.55.84-.84.66-1.79 1.42-3.34 1.42s-2.46-.76-3.32-1.42c-.55-.42-1.03-.76-1.55-.84-.21-.03-.42-.05-.66-.05-.4 0-.7.07-.92.13-.21.04-.4.08-.55.08-.4 0-.55-.27-.6-.5-.05-.21-.08-.4-.13-.55-.04-.18-.08-.45-.16-.5-2-.32-2.4-1-2.42-1.3v-.05c.01-.16.13-.31.27-.34 1.92-.32 2.8-2.4 2.84-2.45.07-.18.16-.42.13-.6-.05-.18-.42-.42-.55-.5-.55-.27-1.42-.55-1.84-.93-.27-.24-.4-.5-.4-.79 0-.27.13-.71.6-.92.18-.08.39-.13.6-.13.21 0 .42.05.55.13.45.21.84.42 1.21.42.34 0 .55-.13.66-.21-.04-.37-.13-1.32-.13-2.45 0-1.03.08-2.26.42-3.06C6.79 3.16 9.13 1.5 12 1.5Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Share this play</h2>
        <p className="modal-body text-sm text-gray-400">
          Send a friend the link to today&apos;s WordHunt.
        </p>

        <div className="share-link-row">
          <input
            className="input share-link-input"
            type="text"
            readOnly
            value={shareUrl}
            onFocus={(e) => e.currentTarget.select()}
            aria-label="Share link"
          />
          <button className="btn btn-secondary share-copy-btn" onClick={copyLink}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="share-targets">
          {targets.map((t) => (
            <button
              key={t.name}
              className="share-target"
              onClick={t.onClick}
              aria-label={`Share on ${t.name}`}
              title={`Share on ${t.name}`}
            >
              <span className="share-target-icon" style={{ background: t.color }}>
                {t.icon}
              </span>
              <span className="share-target-label">{t.name}</span>
            </button>
          ))}
        </div>

        {notice && <p className="modal-body text-sm" style={{ marginTop: 12 }}>{notice}</p>}

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
