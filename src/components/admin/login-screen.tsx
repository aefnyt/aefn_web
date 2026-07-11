"use client";

import { useState } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { AEFN_LOGOS } from "@/lib/theme";

/**
 * Pantalla de Login del Panel Admin
 * ===========================================
 * Muestra un formulario simple donde el presidente ingresa su clave.
 * Al enviar, llama al hook useAdminAuth que verifica contra el backend.
 *
 * Identidad visual: dorado + negro (colores oficiales AEFN/ECFN).
 */

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { login, isLoading } = useAdminAuth();
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) {
      setError("Por favor ingresa tu clave de acceso.");
      return;
    }

    setError(null);
    const result = await login(key.trim());

    if (result.success) {
      onLoginSuccess?.();
    } else {
      setError(result.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center aefn-mesh-dark p-4 relative overflow-hidden">
      {/* Partículas científicas de fondo */}
      <div className="aefn-particles" aria-hidden="true" />
      {/* Grid sutil */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,215,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      <div className="w-full max-w-md relative z-10 aefn-fade-up">
        {/* Logo y título */}
        <div className="text-center mb-8">
          {/* Símbolo ECFN (hexágono dorado) con glow */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/40 mb-4 overflow-hidden aefn-glow">
            <img
              src={AEFN_LOGOS.ecfnSymbol}
              alt="ECFN"
              className="w-14 h-14 object-contain"
            />
          </div>
          <div className="aefn-tag aefn-tag-dark mx-auto mb-3 inline-flex">
            <span className="aefn-mono">PANEL · ADMIN</span>
          </div>
          <h1 className="text-2xl font-bold text-white aefn-text-glow">AEFN · Panel de Administración</h1>
          <p className="aefn-mono text-xs text-amber-400/80 mt-2 uppercase tracking-wider">
            Asociación de Estudiantes de Física y Nanotecnología
          </p>
        </div>

        <Card className="aefn-card-featured">
          <div className="aefn-card-inner">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2 text-neutral-900">
              <KeyRound className="w-5 h-5 text-amber-600" />
              Iniciar sesión
            </CardTitle>
            <CardDescription>
              Ingresa la clave correspondiente al módulo que quieres administrar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key" className="aefn-data-label text-amber-700">Clave de acceso</Label>
                <div className="relative">
                  <Input
                    id="key"
                    type={showKey ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    disabled={isLoading}
                    autoComplete="off"
                    className="pr-10 aefn-mono border-amber-500/30 focus:border-amber-500 focus:ring-amber-500/20"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-amber-600 transition-colors"
                    tabIndex={-1}
                    aria-label={showKey ? "Ocultar clave" : "Mostrar clave"}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-300 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !key.trim()}
                className="w-full aefn-btn-gold font-semibold relative overflow-hidden"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="aefn-mono uppercase tracking-wider text-xs">Verificando</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    <span className="aefn-mono uppercase tracking-wider text-xs">Ingresar</span>
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-neutral-100">
              <p className="aefn-mono text-[11px] text-neutral-500 leading-relaxed">
                <strong className="text-amber-700">TIPOS DE CLAVE</strong>
                <br />
                <span className="text-amber-600">▸</span> <strong>administrador</strong>: acceso a todos los módulos
                <br />
                <span className="text-amber-600">▸</span> <strong>módulo</strong> (profesores, eventos, etc.): acceso solo a ese módulo
                <br />
                <br />
                Si no tienes una clave, contacta al administrador de la asociación.
              </p>
            </div>
          </CardContent>
          </div>
        </Card>

        <div className="text-center mt-6">
          <a
            href="/"
            className="aefn-mono text-xs text-amber-400/70 hover:text-amber-300 transition-colors uppercase tracking-wider"
          >
            ← Volver al sitio público
          </a>
        </div>
      </div>
    </div>
  );
}
