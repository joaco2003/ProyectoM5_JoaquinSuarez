import { auth } from '../firebase';

// Sube una foto a S3 y devuelve su "key" (el nombre guardado)
export async function uploadImage(file: File): Promise<string> {
  const token = await auth.currentUser?.getIdToken();        // Token que prueba quién sos
  if (!token) throw new Error('Sin sesión');

  // 1) Pedimos permiso de subida a nuestra función
  const res = await fetch('/api/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ contentType: file.type }),
  });
  if (!res.ok) throw new Error('No autorizado');
  const { url, key } = await res.json();

  // 2) Subimos la foto directo a S3 con ese permiso
  const up = await fetch(url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
  if (!up.ok) throw new Error('Falló la subida');
  return key;
}

// Memoria de links ya pedidos, para no pedir el mismo muchas veces
const cache = new Map<string, { promise: Promise<string>; expires: number }>();

// Devuelve un link temporal para mostrar la foto
export function getImageUrl(key: string): Promise<string> {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.promise;   // Si lo tenemos y no venció, lo reutilizamos

  const promise = fetch(`/api/image-url?key=${encodeURIComponent(key)}`)
    .then((r) => { if (!r.ok) throw new Error('Sin imagen'); return r.json(); })
    .then((d) => d.url as string);

  cache.set(key, { promise, expires: Date.now() + 50 * 60 * 1000 }); // Lo guardamos 50 min (el link dura 60)
  promise.catch(() => cache.delete(key));                    // Si falla, no lo guardamos
  return promise;
}