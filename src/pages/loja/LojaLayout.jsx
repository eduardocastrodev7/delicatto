import { useState } from 'react'
import LojaHeader from './LojaHeader'
import LojaPage from './LojaPage'

export default function LojaLayout() {
  return (
    <>
      <LojaHeader />
      <main>
        <LojaPage />
      </main>
    </>
  )
}