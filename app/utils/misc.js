import sanitizeHtml from 'sanitize-html';

export function toDate(d, format) {
  const date = new Date(d);
  switch (format) {
    case 'year': return date.getFullYear();
    case 'full':
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric',
        hour12: false };
      return `${date.toLocaleString('en-US', options)}`;
    default: return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  }
}

export function sanitize(t) {
  const html = t;
  
  return sanitizeHtml(html, {
    allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
      'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'del', 'code', 'hr', 'br', 'div',
      'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'iframe', 'img'],
    selfClosing: ['img', 'br', 'hr'],
    allowedAttributes: {
      a: ['href'],
      p: ['style'],
      td: ['style'],
      th: ['style'],
      iframe: ['src'],
      img: ['src', 'alt']
    },
    allowedStyles: {
      '*': {
        'color': [/^\#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
        'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
        'font-size': [/^\d+px$/]
      }
    },
    allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com'],
    allowedSchemes: ['http', 'https'],
    allowedSchemesByTag: {},
    allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
  });
}