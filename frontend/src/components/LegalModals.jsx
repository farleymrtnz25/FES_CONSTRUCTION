import React from 'react';
import { X, Shield, Scale, FileText } from 'lucide-react';

export const LegalModals = ({ type, isOpen, onClose }) => {
  if (!isOpen || !type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />
      <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col z-10 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            {type === 'aviso-legal' ? (
              <Scale className="w-5 h-5 text-orange-400" />
            ) : (
              <Shield className="w-5 h-5 text-orange-400" />
            )}
            <h3 className="font-heading font-extrabold text-white text-base">
              {type === 'aviso-legal' ? 'Aviso Legal e Información Corporativa' : 'Política de Privacidad y Tratamiento de Datos'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-300 space-y-4 leading-relaxed">
          {type === 'aviso-legal' ? (
            <>
              <div>
                <h4 className="font-bold text-white text-sm mb-1">1. Datos Identificativos del Responsable</h4>
                <p>En cumplimiento con las normativas legales de comercio electrónico y derecho mercantil:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-400">
                  <li><strong>Razón Social:</strong> F.E.S. CONSTRUCCIÓN S.A.S.</li>
                  <li><strong>NIT:</strong> 901.458.789-3</li>
                  <li><strong>Domicilio Social:</strong> Vereda Patio Bonito, Ladrillera San Luis, Cundinamarca, Colombia</li>
                  <li><strong>Actividad Comercial:</strong> Fabricación y comercialización de materiales de arcilla cocida y elementos para la construcción.</li>
                  <li><strong>Correo Electrónico:</strong> frlmrtnz@gmail.com</li>
                  <li><strong>Línea de Atención:</strong> +57 320 821 6369</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">2. Propiedad Intelectual e Industrial</h4>
                <p>
                  Todos los contenidos de este sitio web, incluyendo marcas, logotipos, imágenes, textos, algoritmos del cotizador de inteligencia artificial y código fuente, son propiedad exclusiva de F.E.S. Construcción o se dispone de la debida autorización para su difusión.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">3. Condiciones de Venta y Garantías Técnicas</h4>
                <p>
                  Los precios exhibidos corresponden a valores unitarios en pesos colombianos (COP) en patio de fábrica. La cotización emitida por el modelo de inteligencia artificial constituye una memoria de cálculo referencial sujeta a verificación de planos por el ingeniero residente de la obra. Los productos cumplen estrictamente con las tolerancias dimensionales y de absorción exigidas por la norma sismorresistente NSR-10.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h4 className="font-bold text-white text-sm mb-1">1. Marco Legal y Cumplimiento</h4>
                <p>
                  F.E.S. CONSTRUCCIÓN trata los datos personales de sus clientes en estricto cumplimiento con la <strong>Ley Estatutaria 1581 de 2012</strong> (Régimen General de Protección de Datos Personales en Colombia) y en concordancia con los principios del Reglamento General de Protección de Datos (RGPD).
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">2. Finalidad del Tratamiento de Datos</h4>
                <p>Los datos solicitados (nombre, teléfono, correo y dirección de despacho) tienen como únicas finalidades:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-400">
                  <li>Generación y envío de la factura / orden de compra en formato PDF.</li>
                  <li>Coordinación logística del despacho de tractomulas o volquetas hacia el punto de obra.</li>
                  <li>Atención técnica personalizada a través del canal oficial de WhatsApp.</li>
                  <li>Respuestas contextuales del Asesor de Inteligencia Artificial sin compartir datos con terceros para publicidad.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">3. Derechos del Titular (Derechos ARCO)</h4>
                <p>
                  Cualquier usuario puede ejercer sus derechos de conocer, actualizar, rectificar y suprimir sus datos personales enviando una solicitud formal a <strong>frlmrtnz@gmail.com</strong>.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
          >
            Entendido y Acepto
          </button>
        </div>

      </div>
    </div>
  );
};
