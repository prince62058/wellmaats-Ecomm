import DOMPurify from 'dompurify';
export function cleanRichText(value = '') {
  return DOMPurify.sanitize(String(value ?? ''), {
    ALLOWED_TAGS: ['p','br','div','span','b','strong','i','em','u','s','strike','mark','ul','ol','li','h2','h3','h4','table','thead','tbody','tr','th','td','blockquote','a'],
    ALLOWED_ATTR: ['style','href','title','colspan','rowspan'],
  });
}
