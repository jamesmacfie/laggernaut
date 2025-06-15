export type BaseMessage = {
  msg_id: string
  read_ct: number
  enqueued_at: string
  vt: string
}

export type SiteInfo = BaseMessage & {
  message: {
    url: string
    site_id: string
    user_id: string
  }
}
