import { db } from "@/app/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  escapeHtml,
  isAllowedOrigin,
  MAX_BODY_BYTES,
  validateContactPayload,
} from "@/lib/security-utils";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  // 1. Verificación de Origen / Referer para prevenir CSRF
  if (!isAllowedOrigin(request)) {
    return NextResponse.json(
      { error: "Origen de solicitud no autorizado." },
      { status: 403 }
    );
  }

  // 2. Verificación de Content-Type
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      { error: "Formato no soportado. Se requiere application/json." },
      { status: 415 }
    );
  }

  // 3. Verificación de tamaño de payload antes de procesar
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "El tamaño de la solicitud excede el límite permitido." },
      { status: 413 }
    );
  }

  // 4. Rate limiting por IP persistente en Turso (5 solicitudes cada 10 min)
  const clientIp = getClientIp(request);
  const rateLimitKey = `contacto:${clientIp}`;
  const rateLimitResult = await checkRateLimit(rateLimitKey, 5, 10 * 60 * 1000);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error:
          "Has superado el límite de mensajes permitidos. Por favor, espera unos minutos antes de intentar de nuevo.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": rateLimitResult.retryAfter.toString(),
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": Math.ceil(
            rateLimitResult.resetAt / 1000
          ).toString(),
        },
      }
    );
  }

  // 5. Lectura segura del cuerpo JSON
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de solicitud inválido o JSON malformado." },
      { status: 400 }
    );
  }

  // 6. Validación estricta del payload y Honeypot anti-spam
  const validation = validateContactPayload(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.statusCode }
    );
  }

  // Si el campo Honeypot fue completado por un bot, se finge éxito silenciosamente (silent drop)
  if (validation.isSpam) {
    return NextResponse.json(
      { success: true, message: "Mensaje procesado correctamente." },
      { status: 200 }
    );
  }

  const { nombre, email, mensaje } = validation.data;

  // 7. Verificación de configuración de servicio de correo
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY no está configurada en el entorno.");
    return NextResponse.json(
      {
        error:
          "El servicio de contacto no está disponible temporalmente. Intenta más tarde.",
      },
      { status: 500 }
    );
  }

  // 8. Determinación del destinatario
  let toEmail = process.env.CONTACT_RECEIVER_EMAIL;
  if (!toEmail) {
    try {
      const items = await db.query.contacto.findMany();
      const correoItem =
        items.find((i) => i.tipo.toLowerCase() === "correo") ||
        items.find((i) => i.valor.includes("@"));
      toEmail = correoItem?.valor || "romanrios@live.com";
    } catch {
      toEmail = "romanrios@live.com";
    }
  }

  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "Sitio Web <onboarding@resend.dev>";

  // 9. Escape estricto de HTML para prevenir inyección en el email
  const safeNombre = escapeHtml(nombre);
  const safeEmail = escapeHtml(email);
  const safeMensaje = escapeHtml(mensaje);

  const plainText = `Has recibido un nuevo mensaje desde el sitio web:\n\nNombre: ${nombre}\nEmail: ${email}\n\nMensaje:\n${mensaje}`;

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
      <h2 style="margin-top: 0; margin-bottom: 16px; color: #0f172a; font-size: 20px;">
        Nuevo mensaje desde tu sitio web
      </h2>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Remitente:</strong> ${safeNombre}</p>
        <p style="margin: 0; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color: #2563eb; text-decoration: none;">${safeEmail}</a></p>
      </div>
      <div style="margin-bottom: 24px;">
        <p style="margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Mensaje</p>
        <p style="margin: 0; font-size: 15px; line-height: 1.6; white-space: pre-line; color: #334155;">${safeMensaje}</p>
      </div>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
        Podés responder directamente a este correo para escribirle a ${safeNombre}.
      </p>
    </div>
  `;

  // 10. Envío mediante Resend con manejo seguro de errores
  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `Nuevo mensaje de contacto de ${nombre}`,
      text: plainText,
      html: htmlBody,
    });

    if (error) {
      console.error("Error devuelto por Resend al enviar correo:", error.name, error.message);
      return NextResponse.json(
        {
          error:
            "No se pudo enviar el mensaje en este momento. Por favor, intenta de nuevo más tarde.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id }, { status: 200 });
  } catch (err) {
    console.error("Error inesperado en endpoint de mensajes:", err);
    return NextResponse.json(
      { error: "Ocurrió un error inesperado al procesar tu solicitud." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return new NextResponse(null, {
    status: 405,
    headers: { Allow: "POST" },
  });
}