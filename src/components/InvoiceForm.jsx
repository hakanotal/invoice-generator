import { useState, useRef } from 'react';

const sectionClass =
  'mb-4 rounded-xl border border-border bg-surface-card p-4 transition-all duration-200 hover:border-primary/30';
const labelClass = 'block text-xs font-medium text-text-secondary mb-1';
const inputClass =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors';
const sectionTitle = 'text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2';

const newTaxRow = () => ({
  id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tax-${Date.now()}`,
  label: '',
  rate: '',
});

export default function InvoiceForm({ formData, onChange, onLogoChange, onSignatureChange }) {
  const logoInputRef = useRef(null);
  const sigInputRef = useRef(null);

  const handleChange = (field) => (e) => {
    onChange({ ...formData, [field]: e.target.value });
  };

  const taxes = Array.isArray(formData.taxes) ? formData.taxes : [];

  const updateTax = (id, field, value) => {
    onChange({
      ...formData,
      taxes: taxes.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    });
  };

  const addTax = () => {
    onChange({ ...formData, taxes: [...taxes, newTaxRow()] });
  };

  const removeTax = (id) => {
    onChange({ ...formData, taxes: taxes.filter((t) => t.id !== id) });
  };

  const handleFileUpload = (type) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (type === 'logo') onLogoChange(ev.target.result);
      else onSignatureChange(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-full overflow-y-auto p-5 space-y-1">

      {/* Invoice Meta */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>
          <span>📄</span> Invoice
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Invoice No.</label>
            <input
              className={inputClass}
              value={formData.invoiceNo}
              onChange={handleChange('invoiceNo')}
            />
          </div>
          <div>
            <label className={labelClass}>Date</label>
            <input
              className={inputClass}
              value={formData.date}
              onChange={handleChange('date')}
            />
          </div>
        </div>
      </div>

      {/* Issuer */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>
          <span>🏢</span> Issuer
        </h3>
        <div className="space-y-2">
          <div>
            <label className={labelClass}>Company</label>
            <input className={inputClass} value={formData.issuerCompany} onChange={handleChange('issuerCompany')} />
          </div>
          <div>
            <label className={labelClass}>Address</label>
            <input className={inputClass} value={formData.issuerAddress} onChange={handleChange('issuerAddress')} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} value={formData.issuerEmail} onChange={handleChange('issuerEmail')} />
          </div>
        </div>
      </div>

      {/* Recipient */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>
          <span>👤</span> Recipient
        </h3>
        <div className="space-y-2">
          <div>
            <label className={labelClass}>Name</label>
            <input className={inputClass} value={formData.recipientName} onChange={handleChange('recipientName')} />
          </div>
          <div>
            <label className={labelClass}>Address</label>
            <input className={inputClass} value={formData.recipientAddress} onChange={handleChange('recipientAddress')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Email</label>
              <input className={inputClass} value={formData.recipientEmail} onChange={handleChange('recipientEmail')} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input className={inputClass} value={formData.recipientPhone} onChange={handleChange('recipientPhone')} />
            </div>
          </div>
        </div>
      </div>

      {/* Line Item */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>
          <span>📋</span> Line Item
        </h3>
        <div className="space-y-2">
          <div>
            <label className={labelClass}>Description</label>
            <input className={inputClass} value={formData.description} onChange={handleChange('description')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Quantity</label>
              <input
                className={inputClass}
                type="number"
                step="any"
                value={formData.quantity}
                onChange={handleChange('quantity')}
              />
            </div>
            <div>
              <label className={labelClass}>Unit Price ($)</label>
              <input
                className={inputClass}
                type="number"
                step="0.01"
                value={formData.unitPrice}
                onChange={handleChange('unitPrice')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Taxes */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>
          <span>🧾</span> Taxes
        </h3>
        <p className="text-[11px] text-text-muted mb-3">Optional. Add labels and rates; leave empty or remove all for no tax.</p>
        <div className="space-y-3">
          {taxes.length === 0 && (
            <p className="text-xs text-text-muted italic">No tax lines. Use &quot;Add tax&quot; to add one.</p>
          )}
          {taxes.map((tax) => (
            <div key={tax.id} className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-2">
              <div className="min-w-0 flex-1">
                <label className={labelClass}>Label</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Sales tax, VAT"
                  value={tax.label}
                  onChange={(e) => updateTax(tax.id, 'label', e.target.value)}
                />
              </div>
              <div className="w-full sm:w-28 shrink-0">
                <label className={labelClass}>Rate (%)</label>
                <input
                  className={inputClass}
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={tax.rate}
                  onChange={(e) => updateTax(tax.id, 'rate', e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeTax(tax.id)}
                className="shrink-0 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-xs font-medium text-text-secondary hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-600 transition-all cursor-pointer sm:mb-0"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addTax}
            className="w-full rounded-lg border border-dashed border-border bg-surface-elevated/50 px-3 py-2 text-xs font-medium text-text-secondary hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
          >
            + Add tax
          </button>
        </div>
      </div>

      {/* Assets */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>
          <span>🖼️</span> Assets
        </h3>
        <div className="space-y-3">
          {/* Logo */}
          <div>
            <label className={labelClass}>Company Logo</label>
            <div className="flex items-center gap-3">
              {formData.logoDataUrl && (
                <img
                  src={formData.logoDataUrl}
                  alt="Logo preview"
                  className="h-8 rounded border border-border bg-white p-0.5 object-contain"
                />
              )}
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
              >
                Upload Logo
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload('logo')}
              />
            </div>
          </div>
          {/* Signature */}
          <div>
            <label className={labelClass}>Signature</label>
            <div className="flex items-center gap-3">
              {formData.signatureDataUrl && (
                <img
                  src={formData.signatureDataUrl}
                  alt="Signature preview"
                  className="h-8 rounded border border-border bg-white p-0.5 object-contain"
                />
              )}
              <button
                type="button"
                onClick={() => sigInputRef.current?.click()}
                className="rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
              >
                Upload Signature
              </button>
              <input
                ref={sigInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload('signature')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
