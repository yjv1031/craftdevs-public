import styled from 'styled-components'

type MainHeaderProps = {
  cartCount?: number
}

export function MainHeader({ cartCount = 0 }: MainHeaderProps) {
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
        <IconButton aria-label="내 정보">👤</IconButton>
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

const IconButton = styled.button`
  position: relative;
  width: 38px;
  height: 38px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
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
