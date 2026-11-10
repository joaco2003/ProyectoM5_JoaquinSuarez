import '@testing-library/jest-dom/vitest'          // Activa toBeDisabled, toBeInTheDocument, etc.
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Después de cada test, limpia lo que se dibujó, para que un test no ensucie al siguiente
afterEach(() => cleanup())