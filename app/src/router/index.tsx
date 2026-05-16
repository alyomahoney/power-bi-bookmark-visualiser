import { createBrowserRouter } from 'react-router'
import UploadPage from '@/features/upload/UploadPage'
import AuditPage from '@/features/audit/AuditPage'
import DemoPage from '@/features/demo/DemoPage'

export const router = createBrowserRouter([
  { path: '/', element: <UploadPage /> },
  { path: '/audit', element: <AuditPage /> },
  { path: '/demo', element: <DemoPage /> },
])
