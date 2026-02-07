export type IdeaStatus = 'parked' | 'building' | 'snoozed' | 'killed'

export interface Idea {
  id: string
  user_id: string
  title: string
  description: string | null
  email: string
  status: IdeaStatus
  parked_at: string
  remind_at: string
  resolved_at: string | null
  snooze_count: number
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  created_at: string
}

export interface IdeaCounts {
  parked: number
  building: number
  snoozed: number
  killed: number
}
