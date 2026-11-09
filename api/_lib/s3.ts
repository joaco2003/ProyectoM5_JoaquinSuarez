import { S3Client } from '@aws-sdk/client-s3';

export const BUCKET = process.env.S3_BUCKET as string;      // Nombre del bucket

// Cliente de S3 con las claves guardadas en Vercel (no en el código)
export const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
  },
  // Evita que el SDK agregue "checksums" a los links, que hacen fallar las subidas desde el navegador
  requestChecksumCalculation: 'WHEN_REQUIRED',
});