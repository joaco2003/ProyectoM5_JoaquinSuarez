import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3, BUCKET } from './_lib/s3.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const key = String(req.query.key ?? '');
  // Solo se entregan fotos de la carpeta products/ y se bloquean intentos de salir de ella
  if (!key.startsWith('products/') || key.includes('..'))
    return res.status(400).json({ error: 'Clave inválida' });

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: 3600 },                                     // El link de lectura vence en 1 hora
  );
  res.status(200).json({ url });
}