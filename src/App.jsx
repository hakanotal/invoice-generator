import { useState, useEffect, useCallback, useRef } from 'react';
import InvoiceForm from './components/InvoiceForm';
import PdfPreview from './components/PdfPreview';
import { generateInvoice } from './lib/pdf-generator';
import { todayFormatted } from './utils/format';

const DEFAULT_FORM = {
  invoiceNo: '2025-001',
  date: todayFormatted(),
  issuerCompany: 'NovaPay Solutions',
  issuerAddress: '742 Evergreen Terrace, Suite 200, Austin, TX 78701',
  issuerEmail: 'billing@novapay.io',
  recipientName: 'James Mitchell',
  recipientAddress: '350 Fifth Avenue, New York, NY 10118',
  recipientEmail: 'j.mitchell@acmecorp.com',
  recipientPhone: '+1 212 555 0147',
  description: 'Software Development (hours)',
  quantity: '80',
  unitPrice: '75',
  taxRate: '8.25',
  logoDataUrl: null,
  signatureDataUrl: null,
};

export default function App() {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const initialRender = useRef(true);

  // Load default assets on mount
  useEffect(() => {
    const basePath = import.meta.env.BASE_URL || '/';
    async function loadDefaults() {
      try {
        const logoRes = await fetch(`${basePath}logo.png`);
        if (logoRes.ok) {
          const blob = await logoRes.blob();
          const reader = new FileReader();
          reader.onload = (e) => {
            setFormData((prev) => ({ ...prev, logoDataUrl: e.target.result }));
          };
          reader.readAsDataURL(blob);
        }
      } catch { /* no default logo */ }

      try {
        const sigRes = await fetch(`${basePath}signature.png`);
        if (sigRes.ok) {
          const blob = await sigRes.blob();
          const reader = new FileReader();
          reader.onload = (e) => {
            setFormData((prev) => ({ ...prev, signatureDataUrl: e.target.result }));
          };
          reader.readAsDataURL(blob);
        }
      } catch { /* no default signature */ }
    }
    loadDefaults();
  }, []);

  // Debounced PDF generation
  const regeneratePdf = useCallback(async (data) => {
    setLoading(true);
    try {
      const blob = await generateInvoice(data);
      setPdfBlob(blob);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Skip the very first render since images haven't loaded yet
    if (initialRender.current) {
      initialRender.current = false;
      // Still generate after a short delay for initial load
      const timer = setTimeout(() => regeneratePdf(formData), 500);
      return () => clearTimeout(timer);
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => regeneratePdf(formData), 300);
    return () => clearTimeout(debounceRef.current);
  }, [formData, regeneratePdf]);

  const handleDownload = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${formData.invoiceNo || 'draft'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen flex-col bg-surface">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border px-6 py-3 bg-surface-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📄</span>
          <h1 className="text-lg font-bold tracking-tight text-text-primary">Invoice Generator</h1>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="text-xs text-text-muted animate-pulse">Generating…</span>
          )}
          <a
            href="https://github.com/hakanotal/invoice-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
            title="View source"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Main split pane */}
      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        {/* Left: Form */}
        <div className="w-full lg:w-[420px] xl:w-[460px] border-r border-border flex-shrink-0 overflow-hidden">
          <InvoiceForm
            formData={formData}
            onChange={setFormData}
            onLogoChange={(dataUrl) => setFormData((p) => ({ ...p, logoDataUrl: dataUrl }))}
            onSignatureChange={(dataUrl) => setFormData((p) => ({ ...p, signatureDataUrl: dataUrl }))}
          />
        </div>

        {/* Right: Preview */}
        <div className="flex-1 min-w-0 min-h-0">
          <PdfPreview pdfBlob={pdfBlob} onDownload={handleDownload} />
        </div>
      </div>
    </div>
  );
}
