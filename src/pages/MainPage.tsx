import { useEffect, useMemo, useRef, useState, type UIEvent } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { MainHeader } from '../components/MainHeader'
import { ProductDetailModal, type PublicProductDetail } from '../components/ProductDetailModal'
import { TagPill } from '../components/TagPill'
import { isLoggedIn as getIsLoggedIn } from '../lib/auth'

type CategoryId = string

type Avatar = {
  id: number
  x: number
  y: number
  name: string
  color: string
}

type UserProduct = {
  id: number
  category?: string
  categoryName?: string
  name: string
  price: number
  stockQuantity?: number
  mainImageUrl?: string
  createdAt?: string
}

type ProductPageResponse = {
  content: UserProduct[]
  currentPage?: number
  totalPages?: number
  pageSize?: number
  totalElements?: number
}

type ProductCategory = {
  category: string
  categoryName: string
  order: number
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080'
const fallbackImages = ['👟', '👜', '⌚', '🕶️', '🛍️', '🎧']
const categoryIconMap: Record<string, string> = {
  ALL: '✨',
  APPAREL: '👕',
  SHOES: '👟',
  BAG: '👜',
  ACCESSORY: '💍',
  BEAUTY: '💄',
  SPORTS_OUTDOOR: '🏃',
  DIGITAL: '📱',
  HOME_LIVING: '🏠',
}

function getCategoryIcon(category: string): string {
  return categoryIconMap[category] ?? '🛒'
}

async function fetchUserProducts(page: number, category: CategoryId): Promise<ProductPageResponse> {
  const params = new URLSearchParams({
    page: String(page),
    size: '20',
  })
  if (category !== 'ALL') {
    params.set('category', category)
  }

  const response = await fetch(`${BACKEND_URL}/public/product?${params.toString()}`)
  if (!response.ok) {
    throw new Error(`상품 목록 조회 실패: ${response.status}`)
  }

  const data = (await response.json()) as ProductPageResponse
  const content = data.content ?? []

  return {
    ...data,
    content,
    currentPage: data.currentPage ?? page,
    totalPages: data.totalPages ?? (content.length > 0 ? page : Math.max(1, page - 1)),
  }
}

async function fetchProductCategories(): Promise<ProductCategory[]> {
  const response = await fetch(`${BACKEND_URL}/public/product/category`)
  if (!response.ok) {
    throw new Error(`카테고리 조회 실패: ${response.status}`)
  }
  return (await response.json()) as ProductCategory[]
}

async function fetchPublicProductDetail(productId: number): Promise<PublicProductDetail> {
  const response = await fetch(`${BACKEND_URL}/public/product/${productId}`)
  if (!response.ok) {
    throw new Error(`상품 상세 조회 실패: ${response.status}`)
  }
  return (await response.json()) as PublicProductDetail
}

function MainPage() {
  const navigate = useNavigate()
  const isLoggedIn = getIsLoggedIn()
  const [isMuted, setIsMuted] = useState(true)
  const [activeCategory, setActiveCategory] = useState<CategoryId>('ALL')
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const productsAreaRef = useRef<HTMLDivElement | null>(null)
  const [avatars, setAvatars] = useState<Avatar[]>([
    { id: 1, x: 30, y: 40, name: 'Mina', color: '#7f5af0' },
    { id: 2, x: 60, y: 55, name: 'Alex', color: '#2cb67d' },
    { id: 3, x: 45, y: 70, name: 'Jin', color: '#ef4565' },
    { id: 4, x: 75, y: 35, name: 'Lia', color: '#f59e0b' },
  ])

  const { data: categoryData = [] } = useQuery({
    queryKey: ['public-product-categories'],
    queryFn: fetchProductCategories,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  })

  const categories = useMemo(
    () =>
      [
        { category: 'ALL', categoryName: '전체', order: 0 },
        ...categoryData,
      ].sort((a, b) => a.order - b.order),
    [categoryData],
  )

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['public-products', activeCategory],
    queryFn: ({ pageParam }) => fetchUserProducts(pageParam, activeCategory),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const current = lastPage.currentPage ?? 1
      const total = lastPage.totalPages ?? current
      return current < total ? current + 1 : undefined
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  })

  const visibleProducts = useMemo(
    () => (data?.pages ?? []).flatMap((page) => page.content ?? []),
    [data?.pages],
  )

  const {
    data: productDetail,
    isLoading: isDetailLoading,
    isError: isDetailError,
    error: detailError,
  } = useQuery({
    queryKey: ['public-product-detail', selectedProductId],
    queryFn: () => fetchPublicProductDetail(selectedProductId as number),
    enabled: selectedProductId !== null,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setAvatars((prev) =>
        prev.map((avatar) => ({
          ...avatar,
          x: Math.max(10, Math.min(90, avatar.x + (Math.random() - 0.5) * 5)),
          y: Math.max(20, Math.min(80, avatar.y + (Math.random() - 0.5) * 5)),
        })),
      )
    }, 2200)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const el = productsAreaRef.current
    if (!el || !hasNextPage || isFetchingNextPage || isLoading || isError) return
    if (el.scrollHeight <= el.clientHeight + 20) {
      fetchNextPage()
    }
  }, [visibleProducts.length, fetchNextPage, hasNextPage, isError, isFetchingNextPage, isLoading])

  useEffect(() => {
    if (productsAreaRef.current) {
      productsAreaRef.current.scrollTop = 0
    }
  }, [activeCategory])

  const handleProductsScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!hasNextPage || isFetchingNextPage) return
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
    if (scrollHeight - scrollTop - clientHeight < 120) {
      fetchNextPage()
    }
  }

  return (
    <Page>
      <MainHeader
        cartCount={3}
        isLoggedIn={isLoggedIn}
        onUserClick={() => navigate(isLoggedIn ? '/user/update' : '/login')}
      />

      <Main>
        <StickyMetaColumn>
          <MetaverseSection>
            <MetaGrid />
            <MetaGlowTop />
            <MetaGlowBottom />
            <MetaTopBar>
              <LiveBadge>
                <LiveDot />
                LIVE
              </LiveBadge>
              <MetaRightActions>
                <MutedState>접속자 142명</MutedState>
                <MiniButton type="button" onClick={() => setIsMuted((prev) => !prev)}>
                  {isMuted ? '🔇' : '🔊'}
                </MiniButton>
                <MiniButton type="button">⛶</MiniButton>
              </MetaRightActions>
            </MetaTopBar>

            <MetaStage>
              <StageCore>STAGE</StageCore>
            </MetaStage>

            {avatars.map((avatar) => (
              <AvatarDot
                key={avatar.id}
                $x={avatar.x}
                $y={avatar.y}
                $color={avatar.color}
                title={avatar.name}
              >
                {avatar.name.charAt(0)}
              </AvatarDot>
            ))}

            <FloatingItem $top="20%" $left="15%" $duration="3s">
              👟
            </FloatingItem>
            <FloatingItem $top="30%" $right="20%" $duration="2.6s">
              🛍️
            </FloatingItem>
            <FloatingItem $bottom="20%" $left="24%" $duration="2.9s">
              ⌚
            </FloatingItem>

            <MetaFooter>
              <MetaTitle>메타버스 쇼핑 체험</MetaTitle>
              <MetaDesc>가상 공간에서 상품을 직접 확인해보세요</MetaDesc>
              <EnterButton type="button">▶ 메타버스 입장하기</EnterButton>
            </MetaFooter>
          </MetaverseSection>
        </StickyMetaColumn>

        <ShoppingSection>
          <ShoppingHeader>
            <h2>상품목록</h2>
          </ShoppingHeader>

          <CategoryTabs>
            {categories.map((category) => (
              <CategoryButton
                key={category.category}
                type="button"
                $active={category.category === activeCategory}
                onClick={() => setActiveCategory(category.category)}
              >
                <span>{getCategoryIcon(category.category)}</span>
                {category.categoryName}
              </CategoryButton>
            ))}
          </CategoryTabs>

          <ProductsArea ref={productsAreaRef} onScroll={handleProductsScroll}>
            {isLoading && <StateMessage>상품을 불러오는 중...</StateMessage>}
            {isError && <StateMessage>오류: {(error as Error).message}</StateMessage>}
            {!isLoading && !isError && visibleProducts.length === 0 && (
              <StateMessage>표시할 상품이 없습니다.</StateMessage>
            )}

            {!isLoading &&
              !isError &&
              visibleProducts.map((product, index) => {
                const imageUrl = product.mainImageUrl?.trim()

                return (
                  <ProductCard key={`${product.id}-${index}`}>
                    <ProductImageWrap>
                      <ProductImageButton
                        type="button"
                        aria-label={`${product.name} 상세보기`}
                        onClick={() => setSelectedProductId(product.id)}
                      >
                        {imageUrl ? (
                          <ProductThumb src={imageUrl} alt={product.name} loading="lazy" />
                        ) : (
                          <ProductEmoji>{fallbackImages[index % fallbackImages.length]}</ProductEmoji>
                        )}
                      </ProductImageButton>

                      {(product.stockQuantity ?? 9999) <= 10 && (
                        <BadgeStack>
                          <TagPill tone="alert">품절임박</TagPill>
                        </BadgeStack>
                      )}

                      <ShareButton type="button">월드공유</ShareButton>
                    </ProductImageWrap>

                    <ProductInfo>
                      <QuickAdd type="button">장바구니 담기</QuickAdd>
                      <ProductName>{product.name}</ProductName>
                      <PriceRow>
                        <Price>{Number(product.price).toLocaleString()}원</Price>
                      </PriceRow>
                    </ProductInfo>
                  </ProductCard>
                )
              })}

            {isFetchingNextPage && <StateMessage>상품을 더 불러오는 중...</StateMessage>}
            {!isLoading && !isError && !hasNextPage && visibleProducts.length > 0 && (
              <StateMessage>마지막 상품까지 모두 불러왔습니다.</StateMessage>
            )}
          </ProductsArea>
        </ShoppingSection>
      </Main>
      <ProductDetailModal
        open={selectedProductId !== null}
        isLoading={isDetailLoading}
        isError={isDetailError}
        errorMessage={(detailError as Error | undefined)?.message}
        productDetail={productDetail}
        onClose={() => setSelectedProductId(null)}
      />
    </Page>
  )
}

const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`

const appear = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const Page = styled.div`
  --bg-main: #f5f7fb;
  --bg-card: #ffffff;
  --line: #dde3f0;
  --ink: #1f2430;
  --ink-sub: #6a7388;
  --primary: #2667ff;
  --red: #ef4444;
  --meta-bg: radial-gradient(circle at 50% 10%, #2a2f69 0%, #101329 45%, #070911 100%);

  min-height: 100vh;
  background: linear-gradient(180deg, #eff4ff 0%, var(--bg-main) 30%);
  color: var(--ink);
  animation: ${appear} 300ms ease-out;
`

const Main = styled.main`
  min-height: calc(100vh - 72px);
  width: 1400px;
  min-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
`

const StickyMetaColumn = styled.div`
  position: sticky;
  top: 72px;
  align-self: start;
  height: fit-content;
`

const MetaverseSection = styled.section`
  position: relative;
  overflow: hidden;
  background: var(--meta-bg);
  border-right: 1px solid #23294e;
  height: 700px;
  display: flex;
  flex-direction: column;
`

const MetaGrid = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.32;
  background-image:
    linear-gradient(to right, #44508f 1px, transparent 1px),
    linear-gradient(to bottom, #44508f 1px, transparent 1px);
  background-size: 40px 40px;
  transform: perspective(700px) rotateX(62deg);
  transform-origin: center 90%;
`

const MetaGlowTop = styled.div`
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 260px;
  height: 260px;
  border-radius: 50%;
  filter: blur(80px);
  background: rgba(107, 102, 255, 0.55);
`

const MetaGlowBottom = styled.div`
  position: absolute;
  right: 14%;
  bottom: 26%;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  filter: blur(70px);
  background: rgba(44, 182, 125, 0.35);
`

const MetaTopBar = styled.div`
  z-index: 1;
  padding: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(145, 161, 255, 0.2);
`

const LiveBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #bcd2ff;
  border: 1px solid rgba(173, 190, 255, 0.35);
  background: rgba(38, 103, 255, 0.22);
`

const LiveDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #34d399;
`

const MetaRightActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const MutedState = styled.span`
  color: #c7d2fe;
  font-size: 13px;
`

const MiniButton = styled.button`
  border: 1px solid rgba(173, 190, 255, 0.3);
  background: rgba(16, 22, 48, 0.6);
  color: #dbe6ff;
  border-radius: 8px;
  width: 30px;
  height: 30px;
  cursor: pointer;
`

const MetaStage = styled.div`
  z-index: 1;
  margin: auto;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 2px solid rgba(130, 154, 255, 0.5);
  display: grid;
  place-items: center;
  box-shadow: 0 0 0 18px rgba(110, 134, 245, 0.18), 0 0 0 42px rgba(90, 113, 231, 0.1);
`

const StageCore = styled.span`
  padding: 10px 14px;
  border-radius: 999px;
  color: #d8e5ff;
  background: rgba(25, 37, 92, 0.72);
  border: 1px solid rgba(130, 154, 255, 0.45);
  font-size: 12px;
  font-weight: 700;
`

const AvatarDot = styled.div<{ $x: number; $y: number; $color: string }>`
  z-index: 2;
  position: absolute;
  left: ${(p) => p.$x}%;
  top: ${(p) => p.$y}%;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  color: ${(p) => p.$color};
  border: 2px solid ${(p) => p.$color};
  background: color-mix(in srgb, ${(p) => p.$color} 30%, transparent);
  transform: translate(-50%, -50%);
  transition: top 1.8s ease, left 1.8s ease;
`

const FloatingItem = styled.div<{
  $top?: string
  $left?: string
  $right?: string
  $bottom?: string
  $duration: string
}>`
  z-index: 1;
  position: absolute;
  top: ${(p) => p.$top ?? 'auto'};
  left: ${(p) => p.$left ?? 'auto'};
  right: ${(p) => p.$right ?? 'auto'};
  bottom: ${(p) => p.$bottom ?? 'auto'};
  width: 58px;
  height: 58px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 26px;
  border: 1px solid rgba(177, 192, 255, 0.35);
  background: rgba(15, 21, 43, 0.65);
  backdrop-filter: blur(8px);
  animation: ${float} ${(p) => p.$duration} ease-in-out infinite;
`

const MetaFooter = styled.div`
  z-index: 1;
  padding: 20px;
  border-top: 1px solid rgba(145, 161, 255, 0.2);
  background: rgba(7, 10, 27, 0.72);
`

const MetaTitle = styled.h3`
  margin: 0;
  color: #eef3ff;
  font-size: 20px;
`

const MetaDesc = styled.p`
  margin: 6px 0 0;
  color: #c6d3f6;
  font-size: 14px;
`

const EnterButton = styled.button`
  margin-top: 14px;
  width: 100%;
  height: 42px;
  border: 0;
  border-radius: 12px;
  color: #fff;
  background: linear-gradient(90deg, #2667ff 0%, #487eff 100%);
  font-weight: 700;
  cursor: pointer;
`

const ShoppingSection = styled.section`
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  background: var(--bg-card);
  min-height: 640px;
`

const ShoppingHeader = styled.div`
  padding: 22px 20px 8px;
  display: flex;
  justify-content: flex-start;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 28px;
    letter-spacing: -0.4px;
  }
`

const CategoryTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 20px 16px;
  border-bottom: 1px solid var(--line);
`

const CategoryButton = styled.button<{ $active: boolean }>`
  flex: 0 0 auto;
  border: 1px solid ${(p) => (p.$active ? '#2667ff' : 'var(--line)')};
  background: ${(p) => (p.$active ? '#2667ff' : '#f8faff')};
  color: ${(p) => (p.$active ? '#fff' : 'var(--ink-sub)')};
  padding: 10px 14px;
  border-radius: 999px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  white-space: nowrap;
`

const ProductsArea = styled.div`
  padding: 16px 20px 20px;
  overflow-y: auto;
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`

const StateMessage = styled.p`
  grid-column: 1 / -1;
  margin: 0;
  padding: 24px 0;
  text-align: center;
  color: var(--ink-sub);
`

const ProductCard = styled.article`
  border: 1px solid var(--line);
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
`

const ProductImageWrap = styled.div`
  position: relative;
  height: 190px;
  padding: 12px;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: linear-gradient(180deg, #f8faff 0%, #eff3ff 100%);
`

const ProductImageButton = styled.button`
  width: 100%;
  height: 100%;
  border: 0;
  background: transparent;
  padding: 0;
  display: grid;
  place-items: center;
  cursor: pointer;
`

const ProductThumb = styled.img`
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center center;
`

const ProductEmoji = styled.span`
  font-size: 66px;
`

const BadgeStack = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
`

const ShareButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  min-width: 72px;
  height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  cursor: pointer;
`

const QuickAdd = styled.button`
  width: 100%;
  height: 34px;
  border: 0;
  border-radius: 10px;
  background: #1f2430;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  margin-bottom: 10px;
`

const ProductInfo = styled.div`
  padding: 12px;
`

const ProductName = styled.h4`
  margin: 0;
  font-size: 15px;
`

const PriceRow = styled.div`
  margin-top: 6px;
  display: flex;
  gap: 6px;
  align-items: baseline;
`

const Price = styled.strong`
  font-size: 16px;
`

export default MainPage








