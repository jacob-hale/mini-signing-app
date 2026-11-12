import { useAppState } from '../state/AppState'
import { UserSwitcher } from './UserSwitcher'

export function Header() {
  const { setView, view } = useAppState()

  return (
    <header className="app-header">
      <div className="brand" onClick={() => setView({ name: 'list' })} role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setView({ name: 'list' })}>
        <span className="brand-mark">Sign</span>
        <span className="brand-sub">Mini</span>
      </div>
      <nav className="header-nav">
        <button
          type="button"
          className={view.name === 'list' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setView({ name: 'list' })}
        >
          Documents
        </button>
        <button
          type="button"
          className={view.name === 'templates' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setView({ name: 'templates' })}
        >
          Templates
        </button>
      </nav>
      <UserSwitcher />
    </header>
  )
}
