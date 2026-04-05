import styled from 'styled-components'

type MainHeaderProps = {
  cartCount?: number
  isLoggedIn?: boolean
  onUserClick?: () => void
}

export function MainHeader({
  cartCount = 0,
  isLoggedIn = false,
  onUserClick,
}: MainHeaderProps) {
  return (
    <HeaderRoot>
      <BrandGroup>
        <Brand>
          <BrandAccent>META</BrandAccent>
          <span>MALL</span>
        </Brand>
        <Nav>
          <li>
            <NavLink href="#">신상품</NavLink>
          </li>
          <li>
            <NavLink href="#">베스트</NavLink>
          </li>
          <li>
            <NavLink href="#">카테고리</NavLink>
          </li>
          <li>
            <NavLink href="#">이벤트</NavLink>
          </li>
        </Nav>
      </BrandGroup>

      <ActionGroup>
        <IconButton aria-label="장바구니">
          🛒
          {cartCount > 0 && <CountBadge>{cartCount}</CountBadge>}
        </IconButton>
        <IconButton aria-label="내 정보" $isLoggedIn={isLoggedIn} onClick={onUserClick}>
          <UserGlyph
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M5.5 18.3C6.7 15.6 9 14.2 12 14.2C15 14.2 17.3 15.6 18.5 18.3"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </UserGlyph>
        </IconButton>
      </ActionGroup>
    </HeaderRoot>
  )
}

const HeaderRoot = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  height: 72px;
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(12px);

  @media (max-width: 980px) {
    height: auto;
    gap: 12px;
    padding: 14px;
    flex-direction: column;
    align-items: stretch;
  }
`

const BrandGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 28px;
`

const Brand = styled.h1`
  margin: 0;
  font-size: 26px;
  letter-spacing: -0.6px;
  font-weight: 900;
`

const BrandAccent = styled.span`
  color: var(--primary);
`

const Nav = styled.ul`
  display: flex;
  gap: 16px;

  @media (max-width: 720px) {
    display: none;
  }
`

const NavLink = styled.a`
  font-size: 14px;
  color: var(--ink-sub);

  &:hover {
    color: var(--ink);
  }
`

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const IconButton = styled.button<{ $isLoggedIn?: boolean }>`
  position: relative;
  width: 38px;
  height: 38px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #fff;
  color: ${(p) => (p.$isLoggedIn ? '#22c55e' : '#ef4444')};
  cursor: pointer;
`

const UserGlyph = styled.svg`
  width: 20px;
  height: 20px;
  display: block;
  margin: 0 auto;
`

const CountBadge = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  font-size: 10px;
  display: grid;
  place-items: center;
`
