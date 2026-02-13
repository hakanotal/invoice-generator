import { useEffect, useRef, useState } from 'react';

export default function PdfPreview({ pdfBlob, onDownload }) {
  const [objectUrl, setObjectUrl] = useState(null);
  const prevUrl = useRef(null);

  useEffect(() => {
    if (prevUrl.current) {
      URL.revokeObjectURL(prevUrl.current);
    }
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      prevUrl.current = url;
      setObjectUrl(url);
    } else {
      prevUrl.current = null;
      setObjectUrl(null);
    }
    return () => {
      if (prevUrl.current) {
        URL.revokeObjectURL(prevUrl.current);
      }
    };
  }, [pdfBlob]);

  return (
    <div className="flex h-full flex-col">
      {/* Preview area */}
      <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-border bg-surface-card m-4 mb-2">
        {objectUrl ? (
          <iframe
            src={objectUrl}
            title="Invoice Preview"
            className="h-full w-full border-0"
            style={{ background: '#525659' }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-text-muted">
            <div className="text-center">
              <div className="text-4xl mb-3">📄</div>
              <p className="text-sm">Generating preview…</p>
            </div>
          </div>
        )}
      </div>

      {/* Download button */}
      <div className="px-4 pb-4 pt-2">
        <button
          onClick={onDownload}
          disabled={!pdfBlob}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          📥 Download PDF
        </button>
      </div>
    </div>
  );
}
