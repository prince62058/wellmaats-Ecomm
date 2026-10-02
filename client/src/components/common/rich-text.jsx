import { cleanRichText } from '@/lib/rich-text';
export default function RichText({ value, className = '' }) {
  return <div className={`rich-content ${className}`} dangerouslySetInnerHTML={{ __html: cleanRichText(value) }} />;
}
