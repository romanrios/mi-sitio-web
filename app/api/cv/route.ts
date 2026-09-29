import { getCvData } from "@/features/cv/cv-data";
import CvDocument from "@/features/cv/CvDocument";
import { DocumentProps, renderToBuffer } from "@react-pdf/renderer";
import React from "react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isDownload =
      searchParams.get("download") === "1" ||
      searchParams.get("download") === "true";

    const data = await getCvData();
    const buffer = await renderToBuffer(
      React.createElement(
        CvDocument,
        { data }
      ) as unknown as React.ReactElement<DocumentProps>
    );

    const disposition = isDownload
      ? 'attachment; filename="CV_Roman_Rios.pdf"'
      : 'inline; filename="CV_Roman_Rios.pdf"';

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": disposition,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error al generar PDF del CV:", error);
    return new Response("Error al generar el CV en PDF", { status: 500 });
  }
}
