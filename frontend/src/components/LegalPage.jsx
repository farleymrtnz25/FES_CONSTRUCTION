import React from 'react';
import { ArrowLeft, ShieldCheck, Scale, Award, Lock } from 'lucide-react';

const policies = {
    'privacidad': {
        title: 'Política de Privacidad',
        icon: <Lock size={28} color="var(--color-primary)" />,
        content: (
            <>
                <p>En F.E.S. Construcción, nos tomamos muy en serio la protección de tu información personal. Al usar nuestros servicios, aceptas la recopilación y uso de tus datos conforme a esta política.</p>
                <h4>1. Información que recopilamos</h4>
                <p>Recopilamos información personal (nombre, correo electrónico, teléfono, dirección) únicamente para el procesamiento de tus pedidos, la facturación electrónica y la comunicación directa sobre tus compras.</p>
                <h4>2. Uso de la información</h4>
                <p>Tu información se utiliza exclusivamente para: procesar y entregar tu pedido, brindarte soporte al cliente, emitir documentos fiscales (como la factura electrónica DIAN) y, si lo autorizas, enviarte promociones de nuestros productos.</p>
                <h4>3. Protección de datos</h4>
                <p>Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos contra el acceso no autorizado. No vendemos ni compartimos tu información con terceros, salvo con los proveedores logísticos y de pago estrictamente necesarios para concretar tu pedido.</p>
                <h4>4. Tus derechos</h4>
                <p>Tienes derecho a acceder, rectificar o solicitar la eliminación de tus datos personales de nuestra base de datos comunicándote a nuestro correo o líneas de atención.</p>
            </>
        )
    },
    'terminos': {
        title: 'Términos del Servicio',
        icon: <Scale size={28} color="var(--color-primary)" />,
        content: (
            <>
                <p>Bienvenido a la plataforma de F.E.S. Construcción. Al acceder a este sitio web y realizar compras, aceptas estar sujeto a los siguientes términos y condiciones.</p>
                <h4>1. Uso del Sitio</h4>
                <p>Este sitio web está diseñado para la comercialización de materiales de construcción. Queda prohibido el uso del sitio con fines ilícitos o que puedan dañar la infraestructura de F.E.S. Construcción.</p>
                <h4>2. Precios y Pagos</h4>
                <p>Todos los precios publicados están sujetos a cambios sin previo aviso. Los pedidos solo se procesarán una vez que el pago haya sido confirmado por nuestras pasarelas (Nequi, DaviPlata, PSE) o métodos acordados.</p>
                <h4>3. Envíos y Entregas</h4>
                <p>Los tiempos de entrega estimados se brindan al momento de la compra. F.E.S. Construcción no se hace responsable por retrasos causados por fuerza mayor o problemas logísticos de terceros. El cliente debe asegurar que el sitio de entrega sea accesible para los vehículos de carga.</p>
                <h4>4. Devoluciones</h4>
                <p>Sólo se aceptan devoluciones por defectos de fábrica comprobables dentro de los 5 días hábiles siguientes a la entrega. El material no debe haber sido utilizado ni alterado.</p>
            </>
        )
    },
    'garantia': {
        title: 'Garantía de Calidad',
        icon: <Award size={28} color="var(--color-primary)" />,
        content: (
            <>
                <p>En F.E.S. Construcción, estamos comprometidos con ofrecer materiales de la más alta calidad, respaldando la solidez de cada una de tus obras.</p>
                <h4>Nuestro Compromiso</h4>
                <p>Garantizamos que todos nuestros productos (ladrillos, bloques, arena, triturado, etc.) cumplen con los estándares y normativas vigentes en Colombia para la construcción civil.</p>
                <h4>Condiciones de la Garantía</h4>
                <ul>
                    <li>La garantía cubre exclusivamente defectos de fabricación que afecten la integridad estructural del material.</li>
                    <li>No cubre daños ocasionados por mal manejo en obra, almacenamiento inadecuado o exposición a condiciones climáticas extremas sin la debida protección.</li>
                    <li>Para hacer efectiva la garantía, el cliente debe presentar la factura de compra original y evidencia fotográfica del material defectuoso antes de ser instalado.</li>
                </ul>
                <p>F.E.S. Construcción se reserva el derecho de inspeccionar el material en sitio antes de autorizar cualquier reemplazo.</p>
            </>
        )
    },
    'sic': {
        title: 'Protección SIC',
        icon: <ShieldCheck size={28} color="var(--color-primary)" />,
        content: (
            <>
                <p>En cumplimiento de la legislación colombiana, F.E.S. Construcción acata y promueve los derechos de los consumidores protegidos por la Superintendencia de Industria y Comercio (SIC).</p>
                <h4>Estatuto del Consumidor (Ley 1480 de 2011)</h4>
                <p>Respetamos íntegramente tus derechos como consumidor, garantizando información clara, veraz, suficiente, oportuna y verificable sobre los productos que ofrecemos.</p>
                <h4>Derecho de Retracto</h4>
                <p>De acuerdo con el artículo 47 de la Ley 1480, tienes derecho a retractarte de tu compra en un término máximo de cinco (5) días hábiles contados a partir de la entrega del producto. El producto deberá ser devuelto por los mismos medios y en las mismas condiciones en que se recibió. Los costos de transporte serán asumidos en este caso por el consumidor.</p>
                <h4>Peticiones, Quejas y Reclamos (PQRs)</h4>
                <p>Para interponer una queja o reclamo, puedes dirigirte a nuestro correo electrónico de contacto. Responderemos a tu solicitud en un plazo no mayor a 15 días hábiles, conforme a lo establecido por la ley.</p>
            </>
        )
    }
};

export default function LegalPage({ policyId, onBack }) {
    const policy = policies[policyId];

    if (!policy) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h2>Política no encontrada</h2>
                <button className="btn btn-primary" onClick={onBack} style={{ marginTop: '1rem' }}>Volver</button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ padding: '4rem 5%', maxWidth: '900px', margin: '0 auto' }}>
            <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowLeft size={16} /> Volver
            </button>

            <div className="card" style={{ padding: '3rem 2rem', background: 'var(--color-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--color-bg-alt)', paddingBottom: '1.5rem' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '12px', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {policy.icon}
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                        {policy.title}
                    </h1>
                </div>

                <div className="legal-content" style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--color-text-muted)' }}>
                    {policy.content}
                </div>
            </div>
        </div>
    );
}
