"use client";

import React, {
  useState,
  useRef,
  useCallback,
  ChangeEvent,
  KeyboardEvent,
} from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface FormState {
  bdk: string;
  ksn: string;
  ipek: string;
  otp: string[];
  docNum: string;
  docType: string;
  account: string;
}

interface Result {
  pinBlock: string;
  encryptedPinBlock: string;
}

interface StepLog {
  label: string;
  description: string;
}

interface FormErrors {
  bdk?: string;
  ksn?: string;
  ipek?: string;
  otp?: string;
  docNum?: string;
  docType?: string;
  account?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants – doc types derived from docTypeSwitchTransform logic
// ─────────────────────────────────────────────────────────────────────────────

const DOC_TYPES = [
  { value: "1",  label: "Cédula de Ciudadanía (CC)",       code: "1" },
  { value: "2",  label: "Tarjeta de Identidad (TI)",        code: "4" },
  { value: "3",  label: "Cédula de Extranjería (CE)",       code: "2" },
  { value: "4",  label: "Pasaporte (PA)",                   code: "6" },
  { value: "5",  label: "NIT",                              code: "5" },
  { value: "7",  label: "NUIP",                             code: "2" },
  { value: "9",  label: "Registro Civil (RC)",              code: "3" },
  { value: "6",  label: "Permiso Especial de Permanencia",  code: "10" },
  { value: "12", label: "Tarjeta de Extranjería (TE)",      code: "9" },
] as const;

const PROCESS_STEPS: StepLog[] = [
  { label: "Paso 1",  description: 'Bloque₁ = "0" + pin.length + pin' },
  { label: "Paso 2",  description: "Bloque₂ = número de documento" },
  { label: "Paso 3",  description: "Bloque₁ rellenado con F → 16 chars" },
  { label: "Paso 4",  description: "Bloque₂ rellenado con 0 → 10 chars" },
  { label: "Paso 5",  description: "Tipo de documento prefijado en Bloque₂" },
  { label: "Paso 6",  description: "Bloque₂ rellenado con 0 → 16 chars" },
  { label: "Paso 7",  description: "Bloque₁ convertido de hex → ASCII" },
  { label: "Paso 8",  description: "Bloque₂ convertido de hex → ASCII" },
  { label: "Paso 9",  description: "Longitudes igualadas con bytes nulos" },
  { label: "Paso 10", description: "XOR aplicado: Bloque₁ ⊕ Bloque₂" },
  { label: "Paso 11", description: "Resultado XOR → hexadecimal = PIN Block" },
  { label: "Paso 12", description: "BDK descifrado con motor DUKPT" },
  { label: "Paso 13", description: "KSN descifrado con motor DUKPT" },
  { label: "Paso 14", description: "Últimos 4 bytes del KSN removidos" },
  { label: "Paso 15", description: "4 últimos dígitos de cuenta → KSN" },
  { label: "Paso 16", description: "IPEK descifrado con motor DUKPT" },
  { label: "Paso 17", description: "Motor DUKPT inicializado con BDK + KSN" },
  { label: "Paso 18", description: "Clave de sesión DUKPT derivada" },
  { label: "Paso 19", description: "PIN Block cifrado con clave DUKPT" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};
  const hexPattern = /^[0-9A-Fa-f]+$/;

  if (!form.bdk) errors.bdk = "La BDK es requerida";
  else if (!hexPattern.test(form.bdk)) errors.bdk = "Debe ser hexadecimal válido";
  else if (form.bdk.length !== 32) errors.bdk = "Debe tener exactamente 32 caracteres";

  if (!form.ksn) errors.ksn = "El KSN es requerido";
  else if (!hexPattern.test(form.ksn)) errors.ksn = "Debe ser hexadecimal válido";
  else if (form.ksn.length !== 16) errors.ksn = "Debe tener exactamente 16 caracteres";

  if (!form.ipek) errors.ipek = "El IPEK es requerido";
  else if (!hexPattern.test(form.ipek)) errors.ipek = "Debe ser hexadecimal válido";
  else if (form.ipek.length !== 32) errors.ipek = "Debe tener exactamente 32 caracteres";

  const otp = form.otp.join("");
  if (otp.length < 6) errors.otp = "El OTP debe tener 6 dígitos";
  else if (!/^\d{6}$/.test(otp)) errors.otp = "Solo se permiten dígitos";

  if (!form.docNum) errors.docNum = "El número de documento es requerido";
  else if (!/^\d+$/.test(form.docNum)) errors.docNum = "Solo se permiten números";

  if (!form.docType) errors.docType = "Selecciona un tipo de documento";

  if (!form.account) errors.account = "El número de cuenta es requerido";
  else if (!hexPattern.test(form.account)) errors.account = "Debe ser hexadecimal válido";
  else if (form.account.length !== 8) errors.account = "Debe tener exactamente 8 caracteres (hex)";

  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface InputFieldProps {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  monospace?: boolean;
  maxLength?: number;
}

function InputField({
  id, label, hint, value, onChange, error, placeholder, type = "text", monospace, maxLength,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-xs font-medium text-gray-500 uppercase tracking-widest">
          {label}
        </label>
        {hint && <span className="text-[10px] text-gray-400">{hint}</span>}
      </div>
      <input
        id={id}
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className={[
          "w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all",
          "bg-white text-gray-900 placeholder-gray-300",
          monospace ? "font-mono tracking-wider" : "",
          error
            ? "border-red-300 ring-1 ring-red-200 focus:border-red-400 focus:ring-red-200"
            : "border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-200",
        ].join(" ")}
      />
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-500 mt-0.5">
          <svg className="size-3 shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.75 3.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5zm.75 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

interface OtpInputProps {
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
}

function OtpInput({ value, onChange, error }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInput = useCallback(
    (index: number, raw: string) => {
      const digit = raw.replace(/\D/g, "").slice(-1);
      const next = [...value];
      next[index] = digit;
      onChange(next);
      if (digit && index < 5) refs.current[index + 1]?.focus();
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        if (value[index]) {
          const next = [...value];
          next[index] = "";
          onChange(next);
        } else if (index > 0) {
          refs.current[index - 1]?.focus();
        }
      }
      if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
      if (e.key === "ArrowRight" && index < 5) refs.current[index + 1]?.focus();
    },
    [value, onChange]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
      const next = Array(6).fill("");
      for (let i = 0; i < text.length; i++) next[i] = text[i];
      onChange(next);
      refs.current[Math.min(text.length, 5)]?.focus();
    },
    [onChange]
  );

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">
        OTP (PIN)
      </label>
      <div className="flex gap-2" onPaste={handlePaste}>
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[i] ?? ""}
            onChange={(e) => handleInput(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={[
              "flex-1 min-w-0 text-center rounded-lg border py-2.5 text-base font-mono font-semibold outline-none transition-all",
              error
                ? "border-red-300 ring-1 ring-red-200 focus:border-red-400"
                : value[i]
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-900 focus:border-gray-400 focus:ring-1 focus:ring-gray-200",
            ].join(" ")}
          />
        ))}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-500 mt-0.5">
          <svg className="size-3 shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.75 3.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5zm.75 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

interface ResultCardProps {
  label: string;
  value: string;
  accent?: boolean;
}

function ResultCard({ label, value, accent }: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className={[
        "relative rounded-xl border p-4 flex flex-col gap-2 transition-all",
        accent
          ? "border-gray-900 bg-gray-900 text-white"
          : "border-gray-200 bg-white",
      ].join(" ")}
    >
      <span
        className={[
          "text-[10px] font-semibold uppercase tracking-widest",
          accent ? "text-gray-400" : "text-gray-400",
        ].join(" ")}
      >
        {label}
      </span>
      <p
        className={[
          "text-sm font-mono break-all leading-relaxed",
          accent ? "text-green-400" : "text-gray-900",
        ].join(" ")}
      >
        {value || "—"}
      </p>
      {value && (
        <button
          onClick={handleCopy}
          title="Copiar"
          className={[
            "absolute top-3 right-3 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-all",
            accent
              ? "text-gray-400 hover:text-white hover:bg-gray-700"
              : "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
          ].join(" ")}
        >
          {copied ? (
            <>
              <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 1 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
              </svg>
              Copiado
            </>
          ) : (
            <>
              <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
                <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25ZM5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
              </svg>
              Copiar
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_FORM: FormState = {
  bdk:     "",
  ksn:     "",
  ipek:    "",
  otp:     ["", "", "", "", "", ""],
  docNum:  "",
  docType: "",
  account: "",
};

export default function CriptogramaPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeSteps, setActiveSteps] = useState<number>(0);

  const setField = useCallback(<K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setResult(null);
    setActiveSteps(0);

    const validation = validateForm(form);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setLoading(true);

    // Animate steps
    const stepInterval = setInterval(() => {
      setActiveSteps((prev) => {
        if (prev >= PROCESS_STEPS.length) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 120);

    try {
      const response = await fetch("/dev/get/criptograma/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bdk:     form.bdk.toUpperCase(),
          ksn:     form.ksn.toUpperCase(),
          ipek:    form.ipek.toUpperCase(),
          pin:     form.otp.join(""),
          docNum:  form.docNum,
          docType: form.docType,
          account: form.account.toLowerCase(),
        }),
      });

      clearInterval(stepInterval);
      setActiveSteps(PROCESS_STEPS.length);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Error desconocido del servidor");
      }

      setResult({ pinBlock: data.pinBlock, encryptedPinBlock: data.encryptedPinBlock });
    } catch (err: unknown) {
      clearInterval(stepInterval);
      setActiveSteps(0);
      const msg = err instanceof Error ? err.message : "Error de red";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setResult(null);
    setApiError(null);
    setActiveSteps(0);
  };

  const isComplete = form.otp.every(Boolean);
  const completedFields = [
    form.bdk, form.ksn, form.ipek, isComplete ? "ok" : "", form.docNum, form.docType, form.account,
  ].filter(Boolean).length;
  const progress = Math.round((completedFields / 7) * 100);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gray-900">
              <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">Criptograma DUKPT</h1>
              <p className="text-[11px] text-gray-400">Generador y cifrador de PIN Block</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400">{progress}% completado</span>
            <div className="h-1.5 w-20 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gray-900 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <form onSubmit={handleSubmit}>
          {/* ── Bento Grid ── */}
          <div className="grid grid-cols-12 gap-4 auto-rows-auto">

            {/* ─── Cell: Claves (BDK, KSN, IPEK) ─────────────────────────── */}
            <section className="col-span-12 lg:col-span-7 rounded-2xl border border-gray-200 bg-white p-6 flex flex-col gap-5">
              <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                <div className="size-2 rounded-full bg-amber-400" />
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Claves de Cifrado</h2>
              </div>
              <InputField
                id="bdk"
                label="Llave BDK"
                hint="32 chars hex"
                value={form.bdk}
                onChange={(v) => setField("bdk", v.toUpperCase())}
                error={errors.bdk}
                placeholder="04BD110A62E05F9C354266F6DC065C23"
                monospace
                maxLength={32}
              />
              <InputField
                id="ksn"
                label="Llave KSN"
                hint="16 chars hex"
                value={form.ksn}
                onChange={(v) => setField("ksn", v.toUpperCase())}
                error={errors.ksn}
                placeholder="2F9F5985A66B51FA"
                monospace
                maxLength={16}
              />
              <InputField
                id="ipek"
                label="Llave IPEK"
                hint="32 chars hex"
                value={form.ipek}
                onChange={(v) => setField("ipek", v.toUpperCase())}
                error={errors.ipek}
                placeholder="BA7CB9A4474682C0A5C5FD109F0609B3"
                monospace
                maxLength={32}
              />
            </section>

            {/* ─── Cell: OTP ───────────────────────────────────────────────── */}
            <section className="col-span-12 lg:col-span-5 rounded-2xl border border-gray-200 bg-white p-6 flex flex-col gap-5">
              <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                <div className="size-2 rounded-full bg-blue-400" />
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">PIN / OTP</h2>
              </div>
              <OtpInput
                value={form.otp}
                onChange={(v) => setField("otp", v)}
                error={errors.otp}
              />
              <div className="mt-auto rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  El PIN se construye como{" "}
                  <code className="font-mono text-gray-600">"0" + len + pin</code>{" "}
                  y se rellena con <code className="font-mono text-gray-600">F</code> hasta 16 caracteres antes del XOR.
                </p>
              </div>
            </section>

            {/* ─── Cell: Documento ─────────────────────────────────────────── */}
            <section className="col-span-12 lg:col-span-5 rounded-2xl border border-gray-200 bg-white p-6 flex flex-col gap-5">
              <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                <div className="size-2 rounded-full bg-emerald-400" />
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Documento</h2>
              </div>

              {/* Tipo de documento */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="docType" className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                  Tipo de Documento
                </label>
                <select
                  id="docType"
                  value={form.docType}
                  onChange={(e) => setField("docType", e.target.value)}
                  className={[
                    "w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all bg-white appearance-none",
                    "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1rem_1rem] pr-10",
                    errors.docType
                      ? "border-red-300 ring-1 ring-red-200"
                      : "border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-200",
                  ].join(" ")}
                >
                  <option value="">Seleccionar tipo...</option>
                  {DOC_TYPES.map((dt) => (
                    <option key={dt.value} value={dt.value}>
                      {dt.label} → código {dt.code}
                    </option>
                  ))}
                </select>
                {errors.docType && (
                  <p className="flex items-center gap-1 text-[11px] text-red-500 mt-0.5">
                    <svg className="size-3 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.75 3.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5zm.75 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                    </svg>
                    {errors.docType}
                  </p>
                )}
              </div>

              <InputField
                id="docNum"
                label="Número de Documento"
                value={form.docNum}
                onChange={(v) => setField("docNum", v.replace(/\D/g, ""))}
                error={errors.docNum}
                placeholder="1026590349"
                type="text"
                maxLength={15}
              />

              <InputField
                id="account"
                label="ID de Cuenta"
                hint="8 chars hex"
                value={form.account}
                onChange={(v) => setField("account", v.toLowerCase())}
                error={errors.account}
                placeholder="8400f9e9"
                monospace
                maxLength={8}
              />
            </section>

            {/* ─── Cell: Proceso DUKPT (log de pasos) ─────────────────────── */}
            <section className="col-span-12 lg:col-span-7 rounded-2xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                <div className="size-2 rounded-full bg-violet-400" />
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Proceso DUKPT — 19 Pasos</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-1">
                {PROCESS_STEPS.map((step, i) => (
                  <div
                    key={i}
                    className={[
                      "flex items-start gap-2.5 rounded-lg px-3 py-2 text-[11px] transition-all duration-300",
                      activeSteps > i
                        ? "bg-gray-900 text-white"
                        : "bg-gray-50 text-gray-400",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "shrink-0 font-mono font-bold tabular-nums w-10",
                        activeSteps > i ? "text-gray-400" : "text-gray-300",
                      ].join(" ")}
                    >
                      {step.label}
                    </span>
                    <span className="leading-snug">{step.description}</span>
                    {activeSteps > i && (
                      <svg className="ml-auto shrink-0 size-3 text-green-400 mt-0.5" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 1 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* ─── Cell: Resultados ────────────────────────────────────────── */}
            <section className="col-span-12 rounded-2xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                <div className="size-2 rounded-full bg-gray-900" />
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Resultados</h2>
              </div>

              {apiError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <svg className="size-4 text-red-500 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.75 3.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5zm.75 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-700">Error en el proceso</p>
                    <p className="text-[12px] text-red-500 mt-0.5 font-mono">{apiError}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ResultCard
                  label="PIN Block generado (hex)"
                  value={result?.pinBlock ?? ""}
                />
                <ResultCard
                  label="PIN Block cifrado con DUKPT (hex)"
                  value={result?.encryptedPinBlock ?? ""}
                  accent
                />
              </div>

              {!result && !apiError && (
                <div className="flex items-center justify-center h-16 text-[12px] text-gray-300">
                  Completa el formulario y presiona <span className="font-semibold mx-1 text-gray-400">Generar</span> para ver los resultados.
                </div>
              )}
            </section>

            {/* ─── Cell: Actions ───────────────────────────────────────────── */}
            <section className="col-span-12 flex items-center justify-end gap-3 pt-2 pb-4">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition-all hover:border-gray-300 hover:text-gray-900 active:scale-[0.98]"
              >
                Restablecer
              </button>
              <button
                type="submit"
                disabled={loading}
                className="relative flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                    </svg>
                    Procesando…
                  </>
                ) : (
                  <>
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    Generar PIN Block
                  </>
                )}
              </button>
            </section>

          </div>
        </form>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 py-4 mt-4">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">
            Implementación del estándar <span className="font-medium text-gray-500">DUKPT 3DES</span> — ANSI X9.24
          </p>
          <p className="text-[11px] text-gray-300 font-mono">
            @atmira/dukpt3des v0.2.0
          </p>
        </div>
      </footer>
    </div>
  );
}
