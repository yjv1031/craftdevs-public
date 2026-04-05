import type { ReactNode } from 'react'
import styled from 'styled-components'

type TagPillProps = {
  children: ReactNode
  tone?: 'alert' | 'info'
  className?: string
}

export function TagPill({ children, tone = 'alert', className }: TagPillProps) {
  return (
    <Pill className={className} $tone={tone}>
      {children}
    </Pill>
  )
}

const Pill = styled.span<{ $tone: 'alert' | 'info' }>`
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;
  padding: 3px 8px;

  ${(p) =>
    p.$tone === 'alert'
      ? `
    color: #fff;
    background: var(--red, #ef4444);
  `
      : `
    color: #3451a3;
    border: 1px solid #cbd8ff;
    background: #f3f7ff;
  `}
`
