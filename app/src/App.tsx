import { RouterProvider } from 'react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import { router } from '@/router'
import { detectUnsupportedBrowser } from '@/shared/utils/browserDetect'
import { UnsupportedBrowser } from '@/shared/components/UnsupportedBrowser'

export default function App() {
  const unsupportedBrowser = detectUnsupportedBrowser()
  if (unsupportedBrowser) {
    return <UnsupportedBrowser {...unsupportedBrowser} />
  }
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </ErrorBoundary>
  )
}
