import { createContext, useState, useCallback } from 'react'

export const TutorialContext = createContext(null)

const STORAGE_KEY = 'abw_tutorial_done'

export const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    route: '/feed',
    title: 'Welcome to Amateur Boxing World!',
    body: "You're in — let's take a quick tour so you know where everything lives. You can skip at any time.",
    target: null,
    position: 'center',
  },
  {
    id: 'feed',
    route: '/feed',
    title: 'Community Feed',
    body: 'This is your main hub. Posts from fighters, promoters, and fans show up here. Share updates, training clips, and fight results.',
    target: '[data-tutorial="feed-main"]',
    position: 'bottom',
  },
  {
    id: 'fighters',
    route: '/fighters',
    title: 'Fighter Leaderboard',
    body: 'Every registered fighter in one place. Filter by weight class, sort by record, and click any row to see a full profile.',
    target: '[data-tutorial="fighters-main"]',
    position: 'bottom',
  },
  {
    id: 'events',
    route: '/events',
    title: 'Events',
    body: 'Find upcoming boxing events, venues, and competitions. Never miss a bout near you.',
    target: '[data-tutorial="events-main"]',
    position: 'bottom',
  },
  {
    id: 'messages',
    route: '/messages',
    title: 'Direct Messages',
    body: 'Send direct messages to fighters, promoters, and other members of the community.',
    target: '[data-tutorial="messages-main"]',
    position: 'bottom',
  },
  {
    id: 'account',
    route: '/account',
    title: 'Your Profile',
    body: "Update your fighter profile, set your stance, edit your win-loss record, and manage your account settings here.",
    target: '[data-tutorial="account-main"]',
    position: 'bottom',
  },
]

export function TutorialProvider({ children }) {
  const [active,    setActive]    = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  const startTutorial = useCallback(() => {
    if (localStorage.getItem(STORAGE_KEY)) return
    setStepIndex(0)
    setActive(true)
  }, [])

  const next = useCallback(() => {
    setStepIndex(i => {
      const nextIdx = i + 1
      if (nextIdx >= TUTORIAL_STEPS.length) {
        localStorage.setItem(STORAGE_KEY, '1')
        setActive(false)
        return i
      }
      return nextIdx
    })
  }, [])

  const prev = useCallback(() => {
    setStepIndex(i => Math.max(0, i - 1))
  }, [])

  const skip = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, '1')
    setActive(false)
  }, [])

  return (
    <TutorialContext.Provider value={{ active, stepIndex, startTutorial, next, prev, skip }}>
      {children}
    </TutorialContext.Provider>
  )
}
