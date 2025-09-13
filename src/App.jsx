import React, { useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Env (Vite): set VITE_LOOKUP_URL / VITE_CLEAR_URL in .env(.local)
// Falls back to dev-proxy paths if not set.
const LOOKUP_URL =
  import.meta.env.VITE_LOOKUP_URL || '/auth/parents/lookup-id-by-email';
const CLEAR_URL = import.meta.env.VITE_CLEAR_URL || '/user/delete-parent-child';

/* ===================== Inline Styles ===================== */
const S = {
  surface: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    background:
      'radial-gradient(1200px 600px at 20% 0%, #f5f3ff, transparent 60%),' +
      'radial-gradient(800px 600px at 100% 0%, #eef2ff, transparent 60%),' +
      'linear-gradient(0deg, #ffffff, #ffffff)',
  },
  card: {
    width: '100%',
    maxWidth: 880,
    border: '1px solid #e5e7eb',
    borderRadius: 22,
    background: '#fff',
    boxShadow: '0 20px 35px -15px rgba(15,23,42,0.25)',
    overflow: 'hidden',
  },
  head: {
    padding: '28px 32px',
    background: 'linear-gradient(90deg, #4338ca, #4f46e5, #2563eb)',
    color: '#fff',
  },
  title: { margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' },
  sub: { margin: '6px 0 0 0', color: 'rgba(255,255,255,0.92)', fontSize: 14 },
  body: { padding: 32 },
  footer: {
    padding: '16px 32px',
    borderTop: '1px solid #e5e7eb',
    background: '#f8fafc',
    color: '#64748b',
    fontSize: 12,
  },
  endpoints: {
    display: 'flex',
    gap: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  mono: {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: 12,
    padding: '2px 6px',
    borderRadius: 6,
    background: '#eef2ff',
    color: '#312e81',
  },

  // Form
  row: { display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' },
  field: { flex: 1, minWidth: 260 },
  label: {
    display: 'block',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '.08em',
    color: '#64748b',
  },
  input: {
    marginTop: 6,
    width: '100%',
    border: '1px solid #e2e8f0',
    borderRadius: 14,
    padding: '12px 14px',
    fontSize: 16,
    color: '#334155',
    outline: 'none',
    transition: '180ms ease',
  },
  inputFocus: {
    boxShadow: '0 0 0 8px rgba(79, 70, 229, 0.12)',
    borderColor: '#4f46e5',
  },
  btn: {
    height: 48,
    padding: '0 22px',
    border: 0,
    borderRadius: 14,
    fontWeight: 700,
    color: '#fff',
    background: '#4f46e5',
    cursor: 'pointer',
    transition: '180ms ease',
  },
  btnHover: { background: '#4338ca', filter: 'saturate(1.05)' },
  btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  btnDanger: { background: '#e11d48' },
  btnDangerHover: { background: '#be123c' },

  result: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    border: '1px solid #a7f3d0',
    background: '#ecfdf5',
    color: '#065f46',
  },

  // details/summary
  details: {
    marginTop: 22,
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    overflow: 'hidden',
    background: '#fafafa',
  },
  summary: {
    cursor: 'pointer',
    padding: '12px 16px',
    fontSize: 14,
    color: '#334155',
    listStyle: 'none',
    position: 'relative',
  },
  pre: {
    margin: 0,
    padding: '12px 16px 16px 16px',
    background: '#f8fafc',
    borderTop: '1px solid #e5e7eb',
    fontSize: 12,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    overflow: 'auto',
    maxHeight: 320,
  },

  // Modal
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.4)',
    backdropFilter: 'blur(1px)',
    zIndex: 40,
  },
  modalCenter: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 41,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 18,
    boxShadow: '0 20px 35px -15px rgba(15,23,42,0.25)',
    overflow: 'hidden',
  },
  modalHead: { padding: 20, borderBottom: '1px solid #e5e7eb' },
  modalTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  modalBody: { padding: 20, color: '#475569', fontSize: 14, lineHeight: 1.6 },
  modalFoot: {
    padding: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    background: '#f1f5f9',
  },
  btnGhost: {
    padding: '10px 16px',
    borderRadius: 10,
    border: '1px solid #cbd5e1',
    background: '#fff',
    cursor: 'pointer',
  },

  // Helpers
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
};

/* ===================== Confirm Modal ===================== */
function ConfirmModal({
  open,
  title,
  body,
  confirmText = 'Confirm',
  onConfirm,
  onCancel,
  busy,
}) {
  if (!open) return null;
  return (
    <>
      <div style={S.overlay} onClick={onCancel} />
      <div style={S.modalCenter}>
        <div style={S.modalCard}>
          <div style={S.modalHead}>
            <h3 style={S.modalTitle}>
              <span style={{ color: '#e11d48' }}>⚠️</span> {title}
            </h3>
          </div>
          <div style={S.modalBody}>{body}</div>
          <div style={S.modalFoot}>
            <button style={S.btnGhost} onClick={onCancel} disabled={busy}>
              Cancel
            </button>
            <button
              style={{
                ...S.btn,
                ...(busy ? S.btnDisabled : {}),
                ...S.btnDanger,
              }}
              onClick={onConfirm}
              disabled={busy}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = S.btnDangerHover.background)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = S.btnDanger.background)
              }
            >
              {busy ? 'Working...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ===================== Main App ===================== */
export default function App() {
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parentId, setParentId] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [raw, setRaw] = useState(null);

  const emailIsValid = useMemo(() => /.+@.+\..+/.test(email.trim()), [email]);

  const handleLookup = async (e) => {
    e?.preventDefault();
    setParentId('');
    setRaw(null);

    if (!email.trim() || !emailIsValid) {
      toast.error('Enter a valid email.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(LOOKUP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      setRaw(json);

      if (json?.success && json?.data?.parentId) {
        setParentId(json.data.parentId);
        toast.success('Parent found.');
      } else if (json?.statusCode === 404) {
        toast.error('Parent not found for the given email.');
      } else {
        toast.error(`Unexpected response (HTTP ${res.status}).`);
        console.debug('Lookup unexpected:', { httpStatus: res.status, json });
      }
    } catch (err) {
      console.error(err);
      toast.error('Network or server error during lookup.');
    } finally {
      setLoading(false);
    }
  };

  const confirmClear = () => setShowConfirm(true);

  const handleClear = async () => {
    try {
      setLoading(true);
      const res = await fetch(CLEAR_URL, {
        method: 'DELETE',
        headers: { 'parent-id': parentId },
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.success) {
        toast.success('Data cleared successfully.');
      } else {
        toast.error(
          `Clear failed (HTTP ${res.status}). ${json?.message || 'Unknown'}`
        );
      }
    } catch (err) {
      console.error(err);
      toast.error('Network or server error during clear.');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div style={S.surface}>
      <ToastContainer
        position="top-right"
        newestOnTop
        closeOnClick
        pauseOnHover={false}
        theme="colored"
      />

      <ConfirmModal
        open={showConfirm}
        title="Clear parent & child data?"
        body={
          <>
            <p>
              This action is irreversible. The following parent will be
              affected:
            </p>
            <p
              style={{
                marginTop: 10,
                fontFamily: S.mono.fontFamily,
                fontSize: 12,
                wordBreak: 'break-all',
                background: '#f1f5f9',
                padding: 8,
                borderRadius: 8,
              }}
            >
              parent-id: {parentId}
            </p>
          </>
        }
        confirmText="Yes, clear it"
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleClear}
        busy={loading}
      />

      <div style={S.card}>
        <div style={S.head}>
          <h1 style={S.title}>Parent Email Checker</h1>
          <p style={S.sub}>
            Lookup a parent by email and (if found) clear their data with
            confirmation.
          </p>
        </div>

        <div style={S.body}>
          <form onSubmit={handleLookup} style={S.row}>
            <div style={S.field}>
              <label htmlFor="email" style={S.label}>
                Parent email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                style={{ ...S.input, ...(focused ? S.inputFocus : {}) }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <button
              type="submit"
              style={{ ...S.btn, ...(loading ? S.btnDisabled : {}) }}
              disabled={loading}
              title="Check by email"
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = S.btnHover.background)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = S.btn.background)
              }
            >
              {loading ? 'Checking...' : 'Check'}
            </button>
          </form>

          {parentId && (
            <div style={S.result}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 14,
                  color: '#065f46',
                }}
              >
                <span>✅</span>
                <span>Parent found</span>
              </div>
              <div
                style={{
                  marginTop: 8,
                  ...S.mono,
                  background: 'transparent',
                  color: '#065f46',
                  padding: 0,
                }}
              >
                parentId: {parentId}
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                <button
                  onClick={confirmClear}
                  style={{
                    ...S.btn,
                    ...S.btnDanger,
                    ...(loading ? S.btnDisabled : {}),
                  }}
                  disabled={loading}
                  title="Clear parent + child data"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      S.btnDangerHover.background)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = S.btnDanger.background)
                  }
                >
                  {loading ? 'Clearing...' : 'Clear Data'}
                </button>
              </div>
            </div>
          )}

          {raw && (
            <details style={S.details}>
              {/* Using a plain summary; advanced chevron styling would require ::marker replacements not allowed inline */}
              <summary style={S.summary}>Response JSON</summary>
              <pre style={S.pre}>{JSON.stringify(raw, null, 2)}</pre>
            </details>
          )}
        </div>

        <div style={S.footer}>
          <div style={S.endpoints}>
            <span>
              Using endpoint: <code style={S.mono}>{LOOKUP_URL}</code>
            </span>
            <span>
              Clear endpoint: <code style={S.mono}>{CLEAR_URL}</code>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
