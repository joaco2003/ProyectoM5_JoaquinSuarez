import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { getProfile, saveProfile } from '../services/profileService'
import type { Profile as ProfileData } from '../types'

export default function Profile() {
  const { user, role } = useAuth()
  const [form, setForm] = useState<ProfileData>({ name: '', phone: '', address: '' })
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Al abrir la página, carga el perfil guardado
  useEffect(() => { if (user) getProfile(user.uid).then(setForm) }, [user])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setStatus('saving')
    try {
      await saveProfile(user.uid, form)
      setStatus('saved')
    } catch { setStatus('error') }
  }

  return (
    <div className="card stack">
      <h2 className="title">Mi perfil</h2>
      <p className="muted small">{user?.email} · {role}</p>

      <form onSubmit={submit} className="profile-form">
        <label className="form-group">
          <span>Nombre y apellido</span>
          <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="form-group">
          <span>Teléfono</span>
          <input className="field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>
        <label className="form-group">
          <span>Dirección de envío</span>
          <input className="field" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </label>

        <button className="primary-btn" disabled={status === 'saving'}>
          {status === 'saving' ? 'Guardando...' : 'Guardar perfil'}
        </button>
        {status === 'saved' && <p className="added-msg">¡Perfil guardado!</p>}
        {status === 'error' && <p className="error-msg">No se pudo guardar el perfil</p>}
      </form>
    </div>
  )
}