import { useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ReferralQRCodeProps {
  url: string;
  label?: string;
  size?: number;
}

export function ReferralQRCode({ url, label, size = 180 }: ReferralQRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const copyQR = useCallback(async () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    img.onload = async () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(blobUrl);
      try {
        const pngBlob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), 'image/png')
        );
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
        toast.success('QR copiato negli appunti!');
      } catch {
        toast.error('Impossibile copiare il QR');
      }
    };
    img.src = blobUrl;
  }, []);

  const downloadQR = useCallback(() => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    img.onload = () => {
      canvas.width = img.width * 3;
      canvas.height = img.height * 3;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(blobUrl);
      const link = document.createElement('a');
      link.download = `qr-referral-${label || 'code'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('QR scaricato!');
    };
    img.src = blobUrl;
  }, [label]);

  const printQR = useCallback(() => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>QR Code - ${label || 'Referral'}</title>
      <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;margin:0}
      .label{margin-top:16px;font-size:14px;color:#666;text-align:center;max-width:300px;word-break:break-all}</style></head>
      <body>${svgData}<p class="label">${url}</p>
      <script>setTimeout(()=>{window.print();window.close()},300)<\/script></body></html>
    `);
    win.document.close();
  }, [url, label]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={qrRef} className="bg-white p-3 rounded-xl border shadow-sm">
        <QRCodeSVG value={url} size={size} level="M" />
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={copyQR} className="h-8 text-xs gap-1.5">
          <Copy className="w-3.5 h-3.5" /> Copia
        </Button>
        <Button variant="ghost" size="sm" onClick={downloadQR} className="h-8 text-xs gap-1.5">
          <Download className="w-3.5 h-3.5" /> Scarica
        </Button>
        <Button variant="ghost" size="sm" onClick={printQR} className="h-8 text-xs gap-1.5">
          <Printer className="w-3.5 h-3.5" /> Stampa
        </Button>
      </div>
    </div>
  );
}
