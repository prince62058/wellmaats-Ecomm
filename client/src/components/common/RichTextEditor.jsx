import { useEffect, useRef } from "react";

/* ──────────────────────────────────────────────────────────
   Lightweight Rich Text Editor (no external deps)
   Supports: Bold, Italic, Underline, Bullets, Numbered list,
             Highlight, Table insert, heading (H2/H3)
   Stores HTML in value, calls onChange(html)
────────────────────────────────────────────────────────── */

const TOOLBAR_BUTTONS = [
  { cmd: "bold",          icon: "<b>B</b>",                   title: "Bold (Ctrl+B)" },
  { cmd: "italic",        icon: "<i>I</i>",                   title: "Italic (Ctrl+I)" },
  { cmd: "underline",     icon: "<u>U</u>",                   title: "Underline (Ctrl+U)" },
  { cmd: "strikeThrough", icon: "<s>S</s>",                   title: "Strikethrough" },
  { type: "sep" },
  { cmd: "insertUnorderedList", icon: "• List",                title: "Bullet List" },
  { cmd: "insertOrderedList",   icon: "1. List",               title: "Numbered List" },
  { type: "sep" },
  { cmd: "h2",            icon: "H2",                         title: "Heading 2", isBlock: true },
  { cmd: "h3",            icon: "H3",                         title: "Heading 3", isBlock: true },
  { type: "sep" },
  { cmd: "highlight",     icon: "✦ Highlight",                title: "Highlight key point", isHighlight: true },
  { cmd: "table",         icon: "⊞ Table",                    title: "Insert 3×3 Table", isTable: true },
  { type: "sep" },
  { cmd: "removeFormat",  icon: "✕ Clear",                    title: "Remove Formatting" },
];

function insertTable(editorRef) {
  const rows = 3, cols = 3;
  let html = `<table style="border-collapse:collapse;width:100%;margin:8px 0">`;
  for (let r = 0; r < rows; r++) {
    html += "<tr>";
    for (let c = 0; c < cols; c++) {
      const tag = r === 0 ? "th" : "td";
      html += `<${tag} style="border:1px solid #108644;padding:6px 10px;background:${r===0?"#e6f4ed":"white"};text-align:left;font-size:13px">${r===0?`Column ${c+1}`:`Row ${r}`}</${tag}>`;
    }
    html += "</tr>";
  }
  html += "</table><p><br></p>";
  document.execCommand("insertHTML", false, html);
}

function execBlock(tag) {
  document.execCommand("formatBlock", false, tag);
}

export default function RichTextEditor({ value = "", onChange, placeholder = "Type here…", minHeight = 120 }) {
  const editorRef = useRef(null);
  const isComposing = useRef(false);

  // Set initial HTML once on mount / when value changes externally
  useEffect(() => {
    if (!editorRef.current) return;
    // Only update if the content actually differs (avoid cursor jumping)
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  function handleInput() {
    if (isComposing.current) return;
    onChange?.(editorRef.current?.innerHTML || "");
  }

  function handleCommand(btn) {
    editorRef.current?.focus();
    if (btn.isTable) { insertTable(editorRef); handleInput(); return; }
    if (btn.isBlock) { execBlock(btn.cmd); handleInput(); return; }
    if (btn.isHighlight) {
      document.execCommand("backColor", false, "#fffde7");
      handleInput(); return;
    }
    document.execCommand(btn.cmd, false, null);
    handleInput();
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white focus-within:border-forest focus-within:ring-2 focus-within:ring-forest/20 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-100 bg-gray-50">
        {TOOLBAR_BUTTONS.map((btn, i) =>
          btn.type === "sep" ? (
            <div key={`sep-${i}`} className="w-px h-5 bg-gray-300 mx-1" />
          ) : (
            <button
              key={btn.cmd}
              type="button"
              title={btn.title}
              onMouseDown={(e) => { e.preventDefault(); handleCommand(btn); }}
              className="px-2 py-1 text-xs rounded-lg hover:bg-forest/10 hover:text-forest text-gray-600 transition-colors whitespace-nowrap leading-tight"
              dangerouslySetInnerHTML={{ __html: btn.icon }}
            />
          )
        )}
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onCompositionStart={() => { isComposing.current = true; }}
        onCompositionEnd={() => { isComposing.current = false; handleInput(); }}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className={[
          "p-3 text-sm text-gray-800 outline-none",
          "prose-sm prose max-w-none",
          "[&_table]:w-full [&_table]:border-collapse",
          "[&_td]:border [&_td]:border-forest/30 [&_td]:p-2",
          "[&_th]:border [&_th]:border-forest/30 [&_th]:p-2 [&_th]:bg-leaf/50 [&_th]:font-semibold",
          "[&_ul]:list-disc [&_ul]:pl-5",
          "[&_ol]:list-decimal [&_ol]:pl-5",
          "[&_h2]:text-base [&_h2]:font-bold [&_h2]:text-forest",
          "[&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-forest/80",
          "[&:empty:before]:content-[attr(data-placeholder)] [&:empty:before]:text-gray-400 [&:empty:before]:pointer-events-none",
        ].join(" ")}
      />
    </div>
  );
}
