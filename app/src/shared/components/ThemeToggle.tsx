import { Toggle } from '@/components/ui/toggle'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/store/hooks'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <Toggle
      pressed={isDark}
      onPressedChange={() => toggleTheme()}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      size="sm"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Toggle>
  )
}
