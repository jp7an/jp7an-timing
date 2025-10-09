import QRCode from 'qrcode';

export const generateSwishQR = async (
  phoneNumber: string,
  amount: number,
  message: string
): Promise<string> => {
  // Swish payment request format
  const swishData = `C${phoneNumber};${amount};${message}`;
  
  try {
    const qrDataUrl = await QRCode.toDataURL(swishData, {
      width: 300,
      margin: 2,
    });
    return qrDataUrl;
  } catch (error) {
    console.error('Fel vid generering av Swish QR-kod:', error);
    throw new Error('Kunde inte generera Swish QR-kod');
  }
};
