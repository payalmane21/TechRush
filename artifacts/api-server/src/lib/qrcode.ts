import QRCode from "qrcode";

export async function generateQrCodeDataUrl(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: "M",
    width: 256,
    margin: 2,
  });
}
