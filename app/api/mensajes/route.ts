import { db } from "@/app/db";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const contenido =
    typeof body.mensaje === "string"
      ? body.mensaje.trim()
      : typeof body.contenido === "string"
      ? body.contenido.trim()
      : "";

  if (!nombre) {
    return NextResponse.json(
      { error: "Por favor, ingresa tu nombre." },
      { status: 400 }
    );
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Por favor, ingresa un correo electrónico válido." },
      { status: 400 }
    );
  }

  if (!contenido) {
    return NextResponse.json(
      { error: "Por favor, escribe un mensaje." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY no está configurada en las variables de entorno.");
    return NextResponse.json(
      {
        error:
          "El servicio de envío de correos no está configurado (falta RESEND_API_KEY).",
      },
      { status: 500 }
    );
  }

  let toEmail = process.env.CONTACT_RECEIVER_EMAIL;
  if (!toEmail) {
    try {
      const datosContacto = await db.query.contacto.findFirst();
      toEmail = datosContacto?.correo || "romanrios@live.com";
    } catch {
      toEmail = "romanrios@live.com";
    }
  }

  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "Sitio Web <onboarding@resend.dev>";

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `Nuevo mensaje de contacto de ${nombre}`,
      text: `Has recibido un nuevo mensaje desde el sitio web:\n\nNombre: ${nombre}\nEmail: ${email}\n\nMensaje:\n${contenido}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
          <h2 style="margin-top: 0; margin-bottom: 16px; color: #0f172a; font-size: 20px;">
            Nuevo mensaje desde tu sitio web
          </h2>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Remitente:</strong> ${nombre}</p>
            <p style="margin: 0; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></p>
          </div>
          <div style="margin-bottom: 24px;">
            <p style="margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Mensaje</p>
            <p style="margin: 0; font-size: 15px; line-height: 1.6; white-space: pre-line; color: #334155;">${contenido}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
            Podés responder directamente a este correo para escribirle a ${nombre}.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Error devuelto por Resend:", error);
      return NextResponse.json(
        { error: `Error al enviar correo: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id }, { status: 200 });
  } catch (err: any) {
    console.error("Error inesperado en Resend:", err);
    return NextResponse.json(
      { error: "Error inesperado al enviar el correo." },
      { status: 500 }
    );
  }
}