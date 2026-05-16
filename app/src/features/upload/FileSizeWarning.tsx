import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface FileSizeWarningProps {
  file: File
  onProceed: () => void
  onCancel: () => void
}

export function FileSizeWarning({ file, onProceed, onCancel }: FileSizeWarningProps) {
  const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
  const estimatedSeconds = Math.ceil(file.size / (1024 * 1024))

  return (
    <Dialog open>
      <DialogContent showCloseButton={false} onEscapeKeyDown={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Large file detected</DialogTitle>
          <DialogDescription>
            {sizeMB}MB — this may take approximately {estimatedSeconds}s to parse.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onProceed}>Proceed</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
