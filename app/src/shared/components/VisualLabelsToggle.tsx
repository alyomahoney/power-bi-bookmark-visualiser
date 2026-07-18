import { Toggle } from '@/components/ui/toggle'
import { Tag, EyeOff } from 'lucide-react'
import { useShowVisualLabels } from '@/store/hooks'

export function VisualLabelsToggle() {
  const { showVisualLabels, toggleVisualLabels } = useShowVisualLabels()

  return (
    <Toggle
      pressed={showVisualLabels}
      onPressedChange={() => toggleVisualLabels()}
      aria-label={showVisualLabels ? 'Hide visual labels' : 'Show visual labels'}
      size="sm"
    >
      {showVisualLabels ? <Tag className="size-4" /> : <EyeOff className="size-4" />}
    </Toggle>
  )
}
