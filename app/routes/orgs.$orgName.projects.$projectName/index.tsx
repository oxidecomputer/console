import React from 'react'
import { Navigate } from 'react-router-dom'

export default function Index() {
  return <Navigate to="instances" replace />
}
