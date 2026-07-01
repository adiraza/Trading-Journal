import { useState } from 'react'
import { X, ZoomIn, Trash2, Upload } from 'lucide-react'
import type { TradeImage } from '../../types'
import { fileToBase64, generateImageId } from '../../utils/export'
import { Button } from './Button'

interface ImageUploadProps {
  images: TradeImage[]
  onChange: (images: TradeImage[]) => void
  maxImages?: number
  label?: string
}

export function ImageUpload({ images, onChange, maxImages = 5, label = 'Screenshots' }: ImageUploadProps) {
  const [zoomImage, setZoomImage] = useState<TradeImage | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const remaining = maxImages - images.length
    const toProcess = Array.from(files).slice(0, remaining)

    const newImages: TradeImage[] = []
    for (const file of toProcess) {
      const data = await fileToBase64(file)
      newImages.push({
        id: generateImageId(),
        data,
        name: file.name,
        createdAt: new Date().toISOString(),
      })
    }

    onChange([...images, ...newImages])
    e.target.value = ''
  }

  const removeImage = (id: string) => {
    onChange(images.filter((img) => img.id !== id))
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-medium text-[var(--color-text-secondary)]">
          {label} ({images.length}/{maxImages})
        </label>
        {images.length < maxImages && (
          <label className="cursor-pointer">
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
            <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]/30">
              <Upload size={14} /> Upload
            </span>
          </label>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-video overflow-hidden rounded-lg border border-[var(--color-border)]">
              <img src={img.data} alt={img.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setZoomImage(img)}
                  className="rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="rounded-full bg-white/20 p-1.5 text-white hover:bg-red-500/80"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {zoomImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoomImage(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setZoomImage(null)}
          >
            <X size={24} />
          </button>
          <img
            src={zoomImage.data}
            alt={zoomImage.name}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

interface ImageGalleryGridProps {
  images: { image: TradeImage; tradeId: string; type: 'before' | 'after' }[]
  onDelete?: (tradeId: string, imageId: string, type: 'before' | 'after') => void
}

export function ImageGalleryGrid({ images, onDelete }: ImageGalleryGridProps) {
  const [zoomImage, setZoomImage] = useState<(typeof images)[0] | null>(null)
  const [fullscreen, setFullscreen] = useState(false)

  if (images.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">
        No images found
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {images.map((item) => (
          <div
            key={`${item.tradeId}-${item.image.id}`}
            className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg border border-[var(--color-border)]"
            onClick={() => setZoomImage(item)}
          >
            <img src={item.image.data} alt={item.image.name} className="h-full w-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <p className="truncate text-xs text-white">{item.type === 'before' ? 'Entry' : 'Exit'}</p>
            </div>
            {onDelete && (
              <button
                className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(item.tradeId, item.image.id, item.type)
                }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {zoomImage && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-white">{zoomImage.image.name}</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setFullscreen(!fullscreen)}>
                <ZoomIn size={16} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setZoomImage(null)}>
                <X size={16} />
              </Button>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center p-4">
            <img
              src={zoomImage.image.data}
              alt={zoomImage.image.name}
              className={fullscreen ? 'h-full w-full object-contain' : 'max-h-[80vh] max-w-[90vw] rounded-lg object-contain'}
            />
          </div>
        </div>
      )}
    </>
  )
}
