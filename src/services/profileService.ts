import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { Profile } from '../types'

// Lee el perfil; los campos que todavía no existen se devuelven vacíos
export async function getProfile(uid: string): Promise<Profile> {
  const snap = await getDoc(doc(db, 'users', uid))
  const d = snap.data() ?? {}
  return { name: d.name ?? '', phone: d.phone ?? '', address: d.address ?? '' }
}

// Guarda solo nombre, teléfono y dirección (las reglas no dejan tocar nada más)
export async function saveProfile(uid: string, profile: Profile): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { ...profile })
}