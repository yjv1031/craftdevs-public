import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { TagPill } from './TagPill'

type PublicProductImage = {
  id?: number
  imageUrl?: string
  sortOrder?: number
  isMain?: 'Y' | 'N'
}

export type PublicProductDetail = {
  id?: number
  name?: string
  price?: number
  category?: string
  categoryName?: string
  stockQuantity?: number
  mainImageUrl?: string
  description?: string
  images?: PublicProductImage[]
}

type ProductDetailModalProps = {
  open: boolean
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  productDetail?: PublicProductDetail
  onClose: () => void
}

export function ProductDetailModal({
  open,
  isLoading,
  isError,
  errorMessage,
  productDetail,
  onClose,
}: ProductDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const detailImages = useMemo(() => {
    const fromList = [...(productDetail?.images ?? [])]
      .sort((a, b) => {
        if (a.isMain === 'Y' && b.isMain !== 'Y') return -1
        if (a.isMain !== 'Y' && b.isMain === 'Y') return 1
        return (a.sortOrder ?? 999) - (b.sortOrder ?? 999)
      })
      .map((item) => item.imageUrl?.trim())
      .filter((url): url is string => Boolean(url))

    const fallback = productDetail?.mainImageUrl?.trim()
    if (fromList.length === 0 && fallback) {
      fromList.push(fallback)
    }
    if (fromList.length === 1) {
      fromList.push(fromList[0])
    }
    return fromList.slice(0, 2)
  }, [productDetail])

  useEffect(() => {
    setSelectedImageIndex(0)
  }, [open, detailImages.length])

  if (!open) return null

  return (
    <DetailOverlay onClick={onClose}>
      <DetailPanel onClick={(event) => event.stopPropagation()}>
        <DetailHead>
          <h3>상품상세</h3>
          <DetailClose type="button" onClick={onClose}>
            닫기
          </DetailClose>
        </DetailHead>

        {isLoading && <DetailState>상세 정보를 불러오는 중...</DetailState>}
        {isError && <DetailState>오류: {errorMessage}</DetailState>}

        {!isLoading && !isError && (
          <DetailLayout>
            <DetailVisual>
              <DetailMainImageCard>
                {detailImages[selectedImageIndex] ? (
                  <DetailMainImage
                    src={detailImages[selectedImageIndex]}
                    alt={`${productDetail?.name ?? '상품'} 메인`}
                  />
                ) : (
                  <DetailImageFallback>이미지 준비 중</DetailImageFallback>
                )}
              </DetailMainImageCard>

              <DetailThumbRow>
                <DetailThumbCard
                  type="button"
                  $active={selectedImageIndex === 0}
                  onClick={() => setSelectedImageIndex(0)}
                >
                  {detailImages[0] ? (
                    <DetailThumbImage src={detailImages[0]} alt={`${productDetail?.name ?? '상품'} 썸네일 1`} />
                  ) : (
                    <DetailImageFallback>이미지 없음</DetailImageFallback>
                  )}
                </DetailThumbCard>
                <DetailThumbCard
                  type="button"
                  $active={selectedImageIndex === 1}
                  onClick={() => setSelectedImageIndex(1)}
                >
                  {detailImages[1] ? (
                    <DetailThumbImage src={detailImages[1]} alt={`${productDetail?.name ?? '상품'} 썸네일 2`} />
                  ) : (
                    <DetailImageFallback>이미지 없음</DetailImageFallback>
                  )}
                </DetailThumbCard>
              </DetailThumbRow>
            </DetailVisual>

            <DetailInfo>
              <DetailName>{productDetail?.name ?? '-'}</DetailName>
              <DetailPrice>{Number(productDetail?.price ?? 0).toLocaleString()}원</DetailPrice>
              <DetailChips>
                <TagPill tone="info">{productDetail?.categoryName ?? productDetail?.category ?? '-'}</TagPill>
              </DetailChips>
              {productDetail?.description && <DetailDesc>{productDetail.description}</DetailDesc>}
              <DetailActionButton type="button">장바구니 담기</DetailActionButton>
            </DetailInfo>
          </DetailLayout>
        )}
      </DetailPanel>
    </DetailOverlay>
  )
}

const DetailOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  z-index: 100;
`

const DetailPanel = styled.div`
  width: 860px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  border-radius: 14px;
  background: #fff;
  padding: 16px;
`

const DetailHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  h3 {
    margin: 0;
    font-size: 20px;
  }
`

const DetailClose = styled.button`
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 8px;
  height: 30px;
  padding: 0 10px;
  cursor: pointer;
`

const DetailState = styled.p`
  margin: 0;
  color: var(--ink-sub);
`

const DetailLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`

const DetailVisual = styled.div`
  display: grid;
  gap: 10px;
`

const DetailMainImageCard = styled.div`
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px;
  background: linear-gradient(180deg, #f8faff 0%, #eff3ff 100%);
`

const DetailMainImage = styled.img`
  width: 100%;
  height: 320px;
  object-fit: contain;
  border-radius: 8px;
  background: #fff;
`

const DetailThumbRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`

const DetailThumbCard = styled.button<{ $active?: boolean }>`
  border: 1px solid ${(p) => (p.$active ? '#4f7cff' : 'var(--line)')};
  box-shadow: ${(p) => (p.$active ? 'inset 0 0 0 1px #4f7cff' : 'none')};
  border-radius: 10px;
  padding: 8px;
  background: #f8faff;
  cursor: pointer;
`

const DetailThumbImage = styled.img`
  width: 100%;
  height: 88px;
  object-fit: contain;
  border-radius: 8px;
  background: #fff;
`

const DetailImageFallback = styled.div`
  height: 88px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: var(--ink-sub);
  font-size: 12px;
  background: #fff;
`

const DetailInfo = styled.div`
  display: flex;
  flex-direction: column;
`

const DetailName = styled.h4`
  margin: 6px 0 10px;
  font-size: 34px;
  line-height: 1.15;
  letter-spacing: -0.7px;
`

const DetailPrice = styled.p`
  margin: 0 0 14px;
  font-size: 46px;
  font-weight: 700;
  letter-spacing: -1px;
`

const DetailChips = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
`

const DetailDesc = styled.p`
  margin: 14px 0 0;
  font-size: 14px;
  color: var(--ink-sub);
  line-height: 1.6;
`

const DetailActionButton = styled.button`
  margin-top: auto;
  width: 100%;
  height: 46px;
  border: 0;
  border-radius: 10px;
  background: #1f2430;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
`
