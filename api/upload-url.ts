import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import { requireAdmin } from './_lib/auth.js';
import { s3, BUCKET } from './_lib/s3.js';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];   // Únicos formatos permitidos

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try { await requireAdmin(req); }                           // Primero: ¿es admin?
  catch { return res.status(403).json({ error: 'Solo administradores' }); }

  const { contentType } = req.body ?? {};
  if (!ALLOWED.includes(contentType)) return res.status(400).json({ error: 'Formato no permitido' });

  const key = `products/${randomUUID()}.${contentType.split('/')[1]}`; // Nombre aleatorio: imposible de adivinar
  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 60 },                                       // El permiso dura 60 segundos
  );
  res.status(200).json({ url, key });                        // Devolvemos el link de subida y el nombre de la foto
}