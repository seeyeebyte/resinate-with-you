export type PlatformKey = "wechat" | "xiaohongshu" | "line" | "shopee" | "naver" | "kakaotalk" | "etsy" | "email" | "other";

export type PlatformLink = {
  platform: PlatformKey;
  value: string;
  href?: string;
};

const platformLabels: Record<PlatformKey, string> = {
  wechat: "WeChat",
  xiaohongshu: "Xiaohongshu",
  line: "LINE",
  shopee: "Shopee",
  naver: "Naver",
  kakaotalk: "KakaoTalk",
  etsy: "Etsy",
  email: "Email",
  other: "Other",
};

export const contactPlatformOptions = [
  { label: "WeChat", value: "wechat" },
  { label: "Xiaohongshu", value: "xiaohongshu" },
  { label: "LINE", value: "line" },
  { label: "Shopee", value: "shopee" },
  { label: "Naver", value: "naver" },
  { label: "KakaoTalk", value: "kakaotalk" },
  { label: "Etsy", value: "etsy" },
  { label: "Other", value: "other" },
] as const;

export function PlatformLinks({ links, compact = false }: { links?: PlatformLink[]; compact?: boolean }) {
  if (!links?.length) {
    return null;
  }

  return (
    <div className={`flex flex-wrap ${compact ? "gap-1.5" : "gap-2"}`}>
      {links.map((link) => (
        <PlatformIconLink key={`${link.platform}-${link.value}`} link={link} compact={compact} />
      ))}
    </div>
  );
}

function PlatformIconLink({ link, compact }: { link: PlatformLink; compact: boolean }) {
  const label = `${platformLabels[link.platform]}: ${link.value}`;
  const className = `${compact ? "h-8 w-8" : "h-10 w-10"} inline-flex items-center justify-center rounded-full border border-[#d9ddd2] bg-white text-[#2d3842] shadow-sm transition hover:-translate-y-0.5 hover:border-[#9ba69d] hover:bg-[#f5fbff]`;

  if (!link.href) {
    return (
      <span aria-label={label} className={className} title={label}>
        <PlatformIcon platform={link.platform} compact={compact} />
      </span>
    );
  }

  return (
    <a aria-label={label} className={className} href={link.href} rel="noreferrer" target="_blank" title={label}>
      <PlatformIcon platform={link.platform} compact={compact} />
    </a>
  );
}

function PlatformIcon({ platform, compact }: { platform: PlatformKey; compact: boolean }) {
  const size = compact ? "h-4 w-4" : "h-5 w-5";

  if (platform === "wechat") {
    return (
      <svg aria-hidden="true" className={size} fill="none" viewBox="0 0 24 24">
        <path d="M10.4 6.2c-4 0-7.2 2.4-7.2 5.4 0 1.7 1 3.2 2.6 4.2l-.5 2 2.4-1.1c.8.2 1.7.3 2.7.3 4 0 7.2-2.4 7.2-5.4s-3.2-5.4-7.2-5.4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
        <path d="M14.2 11.2c3.6.1 6.4 2.2 6.4 4.9 0 1.4-.8 2.7-2.1 3.6l.4 1.6-2-1c-.8.2-1.6.3-2.5.3-2.4 0-4.5-1-5.6-2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        <path d="M7.9 10h.1M12.3 10h.1" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
      </svg>
    );
  }

  if (platform === "shopee") {
    return (
      <svg aria-hidden="true" className={size} fill="none" viewBox="0 0 24 24">
        <path d="M7.2 8.4h9.6l.8 11.1H6.4L7.2 8.4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
        <path d="M9.1 8.2C9.2 5.8 10.3 4 12 4s2.8 1.8 2.9 4.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
        <path d="M14.1 11.2c-.6-.4-1.4-.7-2.2-.7-1 0-1.8.5-1.8 1.2 0 1.8 4.1 1 4.1 3.7 0 1.1-1 2-2.4 2-.9 0-1.8-.3-2.5-.8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
      </svg>
    );
  }

  if (platform === "line" || platform === "kakaotalk") {
    return (
      <svg aria-hidden="true" className={size} fill="none" viewBox="0 0 24 24">
        <path d="M4 11.2C4 7.8 7.3 5 12 5s8 2.8 8 6.2c0 3.2-2.8 5.8-6.8 6.2L9 20v-2.9c-3-.9-5-3.1-5-5.9Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
        <path d={platform === "line" ? "M9 9.5v4h2.3M13 9.5v4M15.2 13.5v-4l2.3 4v-4" : "M9 13.5v-4M9.2 11.7l3-2.2M10.6 11.5l2 2M14.8 9.5v4"} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    );
  }

  if (platform === "naver") {
    return (
      <svg aria-hidden="true" className={size} fill="none" viewBox="0 0 24 24">
        <rect height="15" rx="3" stroke="currentColor" strokeWidth="1.7" width="15" x="4.5" y="4.5" />
        <path d="M8.6 15.5v-7l6.8 7v-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" />
      </svg>
    );
  }

  if (platform === "etsy" || platform === "email") {
    return (
      <svg aria-hidden="true" className={size} fill="none" viewBox="0 0 24 24">
        <rect height="15" rx="3" stroke="currentColor" strokeWidth="1.7" width="15" x="4.5" y="4.5" />
        {platform === "email" ? (
          <>
            <path d="M6.7 8.3 12 12.2l5.3-3.9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
            <path d="M6.7 16.3h10.6V8.3H6.7v8Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
          </>
        ) : (
          <path d="M9 8.5h6M9 12h4.8M9 15.5h6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        )}
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className={size} fill="none" viewBox="0 0 24 24">
      <rect height="15" rx="3" stroke="currentColor" strokeWidth="1.7" width="15" x="4.5" y="4.5" />
      <path d="M9 8.5h6v7H9z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
      <path d="M10.7 13.8 13.9 10" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}
