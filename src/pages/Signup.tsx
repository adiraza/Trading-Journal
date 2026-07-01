import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus, Mail, Lock, Globe } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export function SignupPage() {
  const navigate = useNavigate()
  const { signUp, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { error } = await signUp(email, password)
    
    if (error) {
      setError(error.message)
    } else {
      navigate('/login')
    }
    
    setLoading(false)
  }

  const handleGoogleSignUp = async () => {
    setLoading(true)
    setError('')

    const { error } = await signInWithGoogle()
    
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Create Account</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Start your trading journey</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            <UserPlus size={16} className="mr-2" />
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[var(--color-surface-card)] px-2 text-[var(--color-text-secondary)]">or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handleGoogleSignUp}
            disabled={loading}
          >
            <Globe size={16} className="mr-2" />
            Google
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--color-accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  )
}
