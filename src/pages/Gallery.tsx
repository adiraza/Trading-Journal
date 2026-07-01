import { useMemo, useState } from 'react'
import { useTrades } from '../hooks/useTrades'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { ImageGalleryGrid } from '../components/ui/ImageUpload'

export function GalleryPage() {
  const { trades, updateTrade } = useTrades()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'before' | 'after'>('all')

  const allImages = useMemo(() => {
    const images: { image: import('../types').TradeImage; tradeId: string; type: 'before' | 'after' }[] = []

    for (const trade of trades) {
      if (filter === 'all' || filter === 'before') {
        for (const img of trade.beforeEntryImages) {
          if (!search || img.name.toLowerCase().includes(search.toLowerCase()) || trade.instrument.toLowerCase().includes(search.toLowerCase())) {
            images.push({ image: img, tradeId: trade.id, type: 'before' })
          }
        }
      }
      if (filter === 'all' || filter === 'after') {
        for (const img of trade.afterExitImages ?? []) {
          if (!search || img.name.toLowerCase().includes(search.toLowerCase()) || trade.instrument.toLowerCase().includes(search.toLowerCase())) {
            images.push({ image: img, tradeId: trade.id, type: 'after' })
          }
        }
      }
    }

    return images
  }, [trades, search, filter])

  const handleDelete = async (tradeId: string, imageId: string, type: 'before' | 'after') => {
    const trade = trades.find((t) => t.id === tradeId)
    if (!trade || !confirm('Delete this image?')) return

    if (type === 'before') {
      await updateTrade({
        ...trade,
        beforeEntryImages: trade.beforeEntryImages.filter((i) => i.id !== imageId),
      })
    } else {
      await updateTrade({
        ...trade,
        afterExitImages: (trade.afterExitImages ?? []).filter((i) => i.id !== imageId),
      })
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Image Gallery</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">{allImages.length} images</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search images..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'before' | 'after')}
          options={[
            { value: 'all', label: 'All Images' },
            { value: 'before', label: 'Before Entry' },
            { value: 'after', label: 'After Exit' },
          ]}
        />
      </div>

      <ImageGalleryGrid images={allImages} onDelete={handleDelete} />
    </div>
  )
}
