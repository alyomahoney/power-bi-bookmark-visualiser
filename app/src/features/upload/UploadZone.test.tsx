import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UploadZone } from './UploadZone'
import { SINGLE_FILE_DROP_ERROR, UNSUPPORTED_DROP_ERROR } from '@/constants/errorMessages'

// Builds a fireEvent-compatible drop event init with a mocked dataTransfer.
// webkitGetAsEntry is not implemented in JSDOM — we supply a fake.
// isDirectory: true → directory entry, false → file entry, null → webkitGetAsEntry returns null
function makeDragEventInit(isDirectory: boolean | null, files: File[]) {
  return {
    dataTransfer: {
      items: [{ webkitGetAsEntry: () => (isDirectory === null ? null : { isDirectory }) }],
      files: Object.assign([...files], {
        item: (i: number) => files[i] ?? null,
        length: files.length,
      }),
    },
  }
}

// Simulates a drop with no items (empty dataTransfer.items)
function makeEmptyItemsDragEventInit(files: File[]) {
  return {
    dataTransfer: {
      items: [],
      files: Object.assign([...files], {
        item: (i: number) => files[i] ?? null,
        length: files.length,
      }),
    },
  }
}

describe('UploadZone', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('idle state', () => {
    it('renders with role="button"', () => {
      render(<UploadZone />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders upload icon', () => {
      render(<UploadZone />)
      // Lucide Upload renders an SVG — verify by presence of icon container
      const zone = screen.getByRole('button')
      expect(zone.querySelector('svg')).toBeInTheDocument()
    })

    it('renders required hint text with "folder"', () => {
      render(<UploadZone />)
      expect(
        screen.getByText(/Upload your.*\.Report.*folder or PBIP project folder/),
      ).toBeInTheDocument()
    })

    it('renders zero-trust reassurance copy', () => {
      render(<UploadZone />)
      expect(screen.getByText(/no backend/i)).toBeInTheDocument()
    })

    it('has a hidden file input', () => {
      render(<UploadZone />)
      const input = document.querySelector('input[type="file"]')
      expect(input).toBeInTheDocument()
    })

    it('has dashed border class in idle state', () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')
      expect(zone.className).toContain('border-dashed')
    })
  })

  describe('drag-over state', () => {
    it('applies indigo border on dragEnter', () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')
      fireEvent.dragEnter(zone)
      expect(zone.className).toContain('border-indigo-500')
    })

    it('shows "Drop to upload" label on dragEnter', () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')
      fireEvent.dragEnter(zone)
      expect(screen.getByText('Drop to upload')).toBeInTheDocument()
    })

    it('removes dashed border class on dragEnter', () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')
      fireEvent.dragEnter(zone)
      expect(zone.className).not.toContain('border-dashed')
    })

    it('hides idle heading on dragEnter', () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')
      fireEvent.dragEnter(zone)
      expect(screen.queryByText('Drop your report here')).not.toBeInTheDocument()
    })
  })

  describe('drag-leave restores idle state', () => {
    it('removes indigo border on dragLeave after dragEnter', () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')
      fireEvent.dragEnter(zone)
      fireEvent.dragLeave(zone)
      expect(zone.className).not.toContain('border-indigo-500')
    })

    it('restores dashed border on dragLeave', () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')
      fireEvent.dragEnter(zone)
      fireEvent.dragLeave(zone)
      expect(zone.className).toContain('border-dashed')
    })

    it('restores idle heading on dragLeave', () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')
      fireEvent.dragEnter(zone)
      fireEvent.dragLeave(zone)
      expect(screen.getByText('Drop your report here')).toBeInTheDocument()
    })
  })

  describe('drag counter prevents spurious state resets', () => {
    it('stays in drag-over after nested dragEnter/dragLeave (counter technique)', () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')
      fireEvent.dragEnter(zone) // counter = 1
      fireEvent.dragEnter(zone) // counter = 2
      fireEvent.dragLeave(zone) // counter = 1 → still drag-over
      expect(zone.className).toContain('border-indigo-500')
      expect(screen.getByText('Drop to upload')).toBeInTheDocument()
    })

    it('exits drag-over when counter reaches zero', () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')
      fireEvent.dragEnter(zone) // counter = 1
      fireEvent.dragEnter(zone) // counter = 2
      fireEvent.dragLeave(zone) // counter = 1
      fireEvent.dragLeave(zone) // counter = 0 → idle
      expect(zone.className).not.toContain('border-indigo-500')
    })
  })

  describe('drop resets to idle state', () => {
    it('removes indigo border on drop', () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')
      fireEvent.dragEnter(zone)
      fireEvent.drop(zone)
      expect(zone.className).not.toContain('border-indigo-500')
    })

    it('shows idle content after drop', () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')
      fireEvent.dragEnter(zone)
      fireEvent.drop(zone)
      expect(screen.getByText('Drop your report here')).toBeInTheDocument()
    })
  })

  describe('keyboard activation', () => {
    it('opens file picker on Enter key', async () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')
      const input = zone.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {})
      zone.focus()
      await userEvent.keyboard('{Enter}')
      expect(clickSpy).toHaveBeenCalledOnce()
    })

    it('opens file picker on Space key', async () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')
      const input = zone.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {})
      zone.focus()
      await userEvent.keyboard(' ')
      expect(clickSpy).toHaveBeenCalledOnce()
    })
  })

  describe('onFilesSelected callback — folder picker path', () => {
    it('calls onFilesSelected when files are chosen via input', () => {
      const handleFilesSelected = vi.fn()
      render(<UploadZone onFilesSelected={handleFilesSelected} />)
      const zone = screen.getByRole('button')
      const input = zone.querySelector('input[type="file"]') as HTMLInputElement

      const file = new File(['content'], 'test.pbip', { type: 'application/json' })
      Object.defineProperty(input, 'files', {
        value: {
          0: file,
          length: 1,
          item: (i: number) => (i === 0 ? file : null),
          [Symbol.iterator]: function* () {
            yield file
          },
        },
        configurable: true,
      })

      fireEvent.change(input)
      expect(handleFilesSelected).toHaveBeenCalledWith([file])
    })

    it('does not call onFilesSelected on picker cancel (null files)', () => {
      const handleFilesSelected = vi.fn()
      render(<UploadZone onFilesSelected={handleFilesSelected} />)
      const zone = screen.getByRole('button')
      const input = zone.querySelector('input[type="file"]') as HTMLInputElement

      // Simulate cancel: e.target.files is null
      Object.defineProperty(input, 'files', { value: null, configurable: true })
      fireEvent.change(input)
      expect(handleFilesSelected).not.toHaveBeenCalled()
    })

    it('does not throw when onFilesSelected is not provided', () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')
      const input = zone.querySelector('input[type="file"]') as HTMLInputElement
      expect(() => fireEvent.change(input)).not.toThrow()
    })
  })

  describe('drag-and-drop folder upload', () => {
    it('calls onFilesSelected with files from dropped folder', () => {
      const handleFilesSelected = vi.fn()
      render(<UploadZone onFilesSelected={handleFilesSelected} />)
      const zone = screen.getByRole('button')

      const file = new File(['{}'], 'report.json', { type: 'application/json' })
      fireEvent.drop(zone, makeDragEventInit(true, [file]))

      expect(handleFilesSelected).toHaveBeenCalledWith([file])
    })

    it('does not show error on valid folder drop', () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')

      const file = new File(['{}'], 'report.json', { type: 'application/json' })
      fireEvent.drop(zone, makeDragEventInit(true, [file]))

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('clears a prior single-file error when a valid folder is subsequently dropped', () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')
      const file = new File(['{}'], 'report.json', { type: 'application/json' })

      // First: bad drop to set error
      fireEvent.drop(zone, makeDragEventInit(false, [file]))
      expect(screen.getByRole('alert')).toBeInTheDocument()

      // Simulate drag-enter then valid folder drop
      fireEvent.dragEnter(zone)
      fireEvent.drop(zone, makeDragEventInit(true, [file]))

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('resets to idle state after folder drop', () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')
      fireEvent.dragEnter(zone)

      const file = new File(['{}'], 'report.json', { type: 'application/json' })
      fireEvent.drop(zone, makeDragEventInit(true, [file]))

      expect(zone.className).not.toContain('border-indigo-500')
      expect(screen.getByText('Drop your report here')).toBeInTheDocument()
    })

    it('does not call onFilesSelected when dropped folder has no files', () => {
      const handleFilesSelected = vi.fn()
      render(<UploadZone onFilesSelected={handleFilesSelected} />)
      const zone = screen.getByRole('button')

      fireEvent.drop(zone, makeDragEventInit(true, []))

      expect(handleFilesSelected).not.toHaveBeenCalled()
    })
  })

  describe('single file drop error', () => {
    it('shows error alert when a single file (not folder) is dropped', () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')

      const file = new File(['content'], 'report.json', { type: 'application/json' })
      fireEvent.drop(zone, makeDragEventInit(false, [file]))

      expect(screen.getByRole('alert')).toHaveTextContent(SINGLE_FILE_DROP_ERROR)
    })

    it('does not call onFilesSelected on single file drop', () => {
      const handleFilesSelected = vi.fn()
      render(<UploadZone onFilesSelected={handleFilesSelected} />)
      const zone = screen.getByRole('button')

      const file = new File(['content'], 'report.json', { type: 'application/json' })
      fireEvent.drop(zone, makeDragEventInit(false, [file]))

      expect(handleFilesSelected).not.toHaveBeenCalled()
    })

    it('shows unsupported-drop error when webkitGetAsEntry returns null (browser API unavailable)', () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')

      const file = new File(['content'], 'report.json', { type: 'application/json' })
      fireEvent.drop(zone, makeDragEventInit(null, [file]))

      expect(screen.getByRole('alert')).toHaveTextContent(UNSUPPORTED_DROP_ERROR)
    })

    it('shows unsupported-drop error when items list is empty', () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')

      const file = new File(['content'], 'report.json', { type: 'application/json' })
      fireEvent.drop(zone, makeEmptyItemsDragEventInit([file]))

      expect(screen.getByRole('alert')).toHaveTextContent(UNSUPPORTED_DROP_ERROR)
    })

    it('single file drop shows single-file error (distinct from unsupported-drop error)', () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')

      const file = new File(['content'], 'report.json', { type: 'application/json' })
      fireEvent.drop(zone, makeDragEventInit(false, [file]))

      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent(SINGLE_FILE_DROP_ERROR)
      expect(alert).not.toHaveTextContent(UNSUPPORTED_DROP_ERROR)
    })

    it('returns upload zone to idle state after single file drop', () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')
      fireEvent.dragEnter(zone)

      const file = new File(['content'], 'report.json', { type: 'application/json' })
      fireEvent.drop(zone, makeDragEventInit(false, [file]))

      expect(zone.className).not.toContain('border-indigo-500')
      expect(zone.className).toContain('border-dashed')
    })

    it('clears error when user initiates a new drag', () => {
      render(<UploadZone />)
      const zone = screen.getByRole('button')

      const file = new File(['content'], 'report.json', { type: 'application/json' })
      fireEvent.drop(zone, makeDragEventInit(false, [file]))
      expect(screen.getByRole('alert')).toBeInTheDocument()

      fireEvent.dragEnter(zone)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('clears error when user makes a new picker selection', () => {
      const handleFilesSelected = vi.fn()
      render(<UploadZone onFilesSelected={handleFilesSelected} />)
      const zone = screen.getByRole('button')

      // Trigger error via single file drop
      const file = new File(['content'], 'report.json', { type: 'application/json' })
      fireEvent.drop(zone, makeDragEventInit(false, [file]))
      expect(screen.getByRole('alert')).toBeInTheDocument()

      // Now pick a file via input — error should clear
      const input = zone.querySelector('input[type="file"]') as HTMLInputElement
      Object.defineProperty(input, 'files', {
        value: {
          0: file,
          length: 1,
          item: (i: number) => (i === 0 ? file : null),
          [Symbol.iterator]: function* () {
            yield file
          },
        },
        configurable: true,
      })
      fireEvent.change(input)

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})
