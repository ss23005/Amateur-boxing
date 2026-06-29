import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

export function useSocket(serverUrl = 'http://localhost:5001') {
  const socketRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    socketRef.current = io(serverUrl, {
      auth: { token },
    })
    return () => {
      socketRef.current?.disconnect()
    }
  }, [serverUrl])

  return socketRef
}
