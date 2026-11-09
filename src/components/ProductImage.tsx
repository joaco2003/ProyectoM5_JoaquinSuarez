import { useEffect, useState } from 'react';
import { getImageUrl } from '../services/imageService';

interface Props {
  imageKey?: string; imageUrl?: string; emoji?: string; alt: string;
  imgClass: string; emojiClass: string;      // Clases del CSS para la foto y para el emoji
}

export default function ProductImage({ imageKey, imageUrl, emoji, alt, imgClass, emojiClass }: Props) {
  // undefined = cargando, null = no hay foto (se muestra el emoji), texto = link de la foto
  const [src, setSrc] = useState<string | null | undefined>(imageKey ? undefined : imageUrl || null);

  useEffect(() => {
    if (!imageKey) { setSrc(imageUrl || null); return; }     // Sin key de S3: usamos el link viejo (si hay)
    let alive = true;                                        // Evita actualizar si el componente ya se cerró
    getImageUrl(imageKey).then((u) => alive && setSrc(u)).catch(() => alive && setSrc(null));
    return () => { alive = false; };
  }, [imageKey, imageUrl]);

  if (src === undefined) return <div className={emojiClass} />;   // Cargando: recuadro vacío
  if (src === null) return <div className={emojiClass}>{emoji ?? '🎾'}</div>;
  return <img src={src} alt={alt} className={imgClass} />;
}