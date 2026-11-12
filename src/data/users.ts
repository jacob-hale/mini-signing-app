import type { User } from '../types'

/** Fake users for the user switcher — no real auth. */
export const USERS: User[] = [
  {
    id: 'user-alex',
    name: 'Alex Sender',
    email: 'alex@lonestarfleet.example',
  },
  {
    id: 'user-jordan',
    name: 'Jordan Recipient',
    email: 'jordan@acme.example',
  },
  {
    id: 'user-sam',
    name: 'Sam Buyer',
    email: 'sam@buyer.example',
  },
]

export function getUserById(id: string): User | undefined {
  return USERS.find((u) => u.id === id)
}

export function getUserByEmail(email: string): User | undefined {
  const normalized = email.trim().toLowerCase()
  return USERS.find((u) => u.email.toLowerCase() === normalized)
}
