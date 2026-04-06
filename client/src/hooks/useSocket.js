import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

export function useSocket(serverUrl = 'http://localhost:5000') {
  const socketRef = useRef(null)

  useEffect(() => {
    socketRef.current = io(serverUrl)
    return () => {
      socketRef.current?.disconnect()
    }
  }, [serverUrl])

  return socketRef
}
