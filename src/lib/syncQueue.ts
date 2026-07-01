import { supabase } from './supabase'

interface SyncOperation {
  id: string
  operation: 'create' | 'update' | 'delete'
  tableName: 'trades' | 'trade_images' | 'settings'
  recordId: string
  data: any
}

class SyncQueue {
  private queue: SyncOperation[] = []
  private processing = false

  async add(operation: SyncOperation) {
    this.queue.push(operation)
    await this.saveToLocalStorage()
    this.process()
  }

  private async saveToLocalStorage() {
    localStorage.setItem('syncQueue', JSON.stringify(this.queue))
  }

  private async loadFromLocalStorage() {
    const saved = localStorage.getItem('syncQueue')
    if (saved) {
      this.queue = JSON.parse(saved)
    }
  }

  async process() {
    if (this.processing || this.queue.length === 0) return

    this.processing = true

    while (this.queue.length > 0) {
      const operation = this.queue.shift()!
      
      try {
        await this.executeOperation(operation)
      } catch (error) {
        console.error('Sync error:', error)
        // Re-queue failed operations
        this.queue.unshift(operation)
        break
      }
    }

    await this.saveToLocalStorage()
    this.processing = false
  }

  private async executeOperation(operation: SyncOperation) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    switch (operation.tableName) {
      case 'trades':
        if (operation.operation === 'create') {
          await supabase.from('trades').insert({ ...operation.data, user_id: user.id })
        } else if (operation.operation === 'update') {
          await supabase.from('trades').update(operation.data).eq('id', operation.recordId).eq('user_id', user.id)
        } else if (operation.operation === 'delete') {
          await supabase.from('trades').delete().eq('id', operation.recordId).eq('user_id', user.id)
        }
        break
      
      case 'settings':
        if (operation.operation === 'update') {
          await supabase.from('settings').update(operation.data).eq('user_id', user.id)
        }
        break
      
      case 'trade_images':
        if (operation.operation === 'create') {
          await supabase.from('trade_images').insert({ ...operation.data, user_id: user.id })
        } else if (operation.operation === 'delete') {
          await supabase.from('trade_images').delete().eq('id', operation.recordId).eq('user_id', user.id)
        }
        break
    }
  }

  async initialize() {
    await this.loadFromLocalStorage()
    
    // Listen for online events
    window.addEventListener('online', () => this.process())
    
    // Process on initialization if online
    if (navigator.onLine) {
      this.process()
    }
  }
}

export const syncQueue = new SyncQueue()
