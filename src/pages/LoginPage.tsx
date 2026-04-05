import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { setAuthTokens } from '../lib/auth'
import { SignUpModal } from '../components/SignUpModal'

type UserLoginResponseDto = {
  tokenType: string
  accessToken: string
  refreshToken: string
}

function LoginPage() {
  const navigate = useNavigate()
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080'

  const handleLogin = async () => {
    if (!loginId.trim() || !password.trim()) {
      setLoginError('아이디와 비밀번호를 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    setLoginError('')

    try {
      const response = await fetch(`${backendUrl}/public/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginId: loginId.trim(),
          password: password.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error(`로그인 실패 (${response.status})`)
      }

      const data = (await response.json()) as UserLoginResponseDto
      setAuthTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tokenType: data.tokenType,
      })

      navigate('/', { replace: true })
    } catch (error) {
      setLoginError((error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Page>
      <Shell>
        <BrandWrap>
          <Brand>
            <span>META</span>MALL
          </Brand>
          <SubTitle>메타버스 쇼핑을 계속하려면 로그인하세요</SubTitle>
        </BrandWrap>

        <Card>
          <CardTitle>로그인</CardTitle>
          <CardDesc>아이디와 비밀번호를 입력해 접속할 수 있어요.</CardDesc>

          <Form>
            <Field>
              <Label htmlFor="loginId">아이디</Label>
              <Input
                id="loginId"
                name="loginId"
                placeholder="아이디를 입력하세요"
                value={loginId}
                onChange={(event) => setLoginId(event.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    void handleLogin()
                  }
                }}
              />
            </Field>
            <PrimaryButton type="button" onClick={handleLogin} disabled={isSubmitting}>
              {isSubmitting ? '로그인 중...' : '로그인'}
            </PrimaryButton>
            {loginError && <ErrorText>{loginError}</ErrorText>}
          </Form>

          <FooterLinks>
            <LinkButton to="/">메인으로</LinkButton>
            <Divider />
            <TextButton type="button" onClick={() => setIsSignUpOpen(true)}>
              회원가입
            </TextButton>
          </FooterLinks>
        </Card>
      </Shell>

      <SignUpModal open={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} />
    </Page>
  )
}

const Page = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #eef4ff 0%, #f6f8fc 35%, #f9fbff 100%);
  display: grid;
  place-items: center;
  padding: 24px;
`

const Shell = styled.div`
  width: 100%;
  max-width: 520px;
`

const BrandWrap = styled.div`
  text-align: center;
  margin-bottom: 16px;
`

const Brand = styled.h1`
  margin: 0;
  font-size: 32px;
  letter-spacing: -0.8px;
  color: #111827;

  span {
    color: #2667ff;
  }
`

const SubTitle = styled.p`
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 14px;
`

const Card = styled.section`
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);
  border: 1px solid #dce4f7;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 16px 35px rgba(30, 60, 130, 0.08);
`

const CardTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  color: #111827;
`

const CardDesc = styled.p`
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 14px;
`

const Form = styled.form`
  margin-top: 18px;
  display: grid;
  gap: 12px;
`

const Field = styled.div`
  display: grid;
  gap: 6px;
`

const Label = styled.label`
  font-size: 13px;
  color: #374151;
  font-weight: 600;
`

const Input = styled.input`
  height: 42px;
  border: 1px solid #cfd8ef;
  border-radius: 10px;
  padding: 0 12px;
  background: #fff;
  color: #111827;

  &:focus {
    outline: 2px solid #a9c2ff;
    border-color: #a9c2ff;
  }
`

const PrimaryButton = styled.button`
  margin-top: 4px;
  height: 44px;
  border: 0;
  border-radius: 10px;
  background: linear-gradient(90deg, #2667ff 0%, #4a7bff 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`

const ErrorText = styled.p`
  margin: 0;
  color: #dc2626;
  font-size: 13px;
`

const FooterLinks = styled.div`
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`

const LinkButton = styled(Link)`
  color: #2667ff;
  font-size: 13px;
  text-decoration: none;
`

const Divider = styled.span`
  width: 1px;
  height: 12px;
  background: #d1d9eb;
`

const TextButton = styled.button`
  border: 0;
  background: transparent;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
`

export default LoginPage
