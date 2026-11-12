import { useAppState } from '../state/AppState'

export function UserSwitcher() {
  const { currentUser, users, setCurrentUserId } = useAppState()

  return (
    <label className="user-switcher">
      <span className="user-switcher-label">Acting as</span>
      <select
        value={currentUser.id}
        onChange={(e) => setCurrentUserId(e.target.value)}
        aria-label="Switch user"
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.email})
          </option>
        ))}
      </select>
    </label>
  )
}
