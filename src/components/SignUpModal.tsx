import { useEffect, useState } from 'react'
import styled from 'styled-components'

type SignUpModalProps = {
  open: boolean
  onClose: () => void
}

type SignUpPayload = {
  loginId: string
  password: string
  confirmPassword: string
  name: string
  email: string
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080'
const LOGIN_ID_REGEX = /^[a-z][a-z0-9]{4,9}$/
const PASSWORD_REGEX = /^[A-Za-z0-9\p{P}]{10,20}$/u
const NAME_REGEX = /^[가-힣A-Za-z0-9]{2,19}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function SignUpModal({ open, onClose }: SignUpModalProps) {
  const [form, setForm] = useState<SignUpPayload>({
    loginId: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setForm({
      loginId: '',
      password: '',
      confirmPassword: '',
      name: '',
      email: '',
    })
    setError('')
    setSuccess('')
    setIsSubmitting(false)
  }, [open])

  if (!open) return null

  const updateField = (field: keyof SignUpPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignUp = async () => {
    setError('')
    setSuccess('')

    if (!form.loginId.trim()) {
      setError('아이디를 입력해주세요.')
      return
    }
    if (!LOGIN_ID_REGEX.test(form.loginId.trim())) {
      setError('아이디는 영문 소문자로 시작하는 5~10자(영문/숫자)여야 합니다.')
      return
    }

    if (!form.name.trim()) {
      setError('이름을 입력해주세요.')
      return
    }
    if (!NAME_REGEX.test(form.name.trim())) {
      setError('이름은 2~19자 한글/영문/숫자만 입력할 수 있습니다.')
      return
    }

    if (!form.email.trim()) {
      setError('이메일을 입력해주세요.')
      return
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      setError('이메일 형식이 올바르지 않습니다.')
      return
    }

    if (!form.password) {
      setError('비밀번호를 입력해주세요.')
      return
    }
    if (!PASSWORD_REGEX.test(form.password)) {
      setError('비밀번호는 10~20자 영문/숫자/특수문자여야 합니다.')
      return
    }

    if (!form.confirmPassword) {
      setError('비밀번호 확인을 입력해주세요.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${BACKEND_URL}/public/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginId: form.loginId,
          password: form.password,
          name: form.name,
          email: form.email,
        }),
      })

      if (!response.ok) {
        throw new Error(`회원가입 실패 (${response.status})`)
      }

      setSuccess('회원가입이 완료되었습니다. 이제 로그인할 수 있어요.')
      setForm({
        loginId: '',
        password: '',
        confirmPassword: '',
        name: '',
        email: '',
      })
      onClose()
      window.location.assign('/login')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Overlay>
      <Panel onClick={(event) => event.stopPropagation()}>
        <Head>
          <h3>회원가입</h3>
          <CloseButton type="button" onClick={onClose}>
            닫기
          </CloseButton>
        </Head>

        <SubTitle>메타버스 쇼핑을 위한 계정을 만들어보세요.</SubTitle>

        <Form>
          <Field>
            <Label htmlFor="signupLoginIdModal">아이디</Label>
            <Input
              id="signupLoginIdModal"
              placeholder="5~10자 영문/숫자"
              value={form.loginId}
              onChange={(e) => updateField('loginId', e.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor="signupNameModal">이름</Label>
            <Input
              id="signupNameModal"
              placeholder="이름을 입력하세요"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor="signupEmailModal">이메일</Label>
            <Input
              id="signupEmailModal"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor="signupPasswordModal">비밀번호</Label>
            <Input
              id="signupPasswordModal"
              type="password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor="signupPasswordConfirmModal">비밀번호 확인</Label>
            <Input
              id="signupPasswordConfirmModal"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
            />
          </Field>
        </Form>

        {error && <ErrorText>{error}</ErrorText>}
        {success && <SuccessText>{success}</SuccessText>}

        <SubmitButton type="button" disabled={isSubmitting} onClick={handleSignUp}>
          {isSubmitting ? '가입 중...' : '회원가입 하기'}
        </SubmitButton>
      </Panel>
    </Overlay>
  )
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 120;
  background: rgba(17, 24, 39, 0.45);
  display: grid;
  place-items: center;
  padding: 20px;
`

const Panel = styled.section`
  width: 100%;
  max-width: 540px;
  background: #fff;
  border: 1px solid #dce4f7;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(24, 39, 75, 0.2);
  padding: 20px;
`

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    margin: 0;
    font-size: 24px;
    color: #111827;
  }
`

const CloseButton = styled.button`
  border: 1px solid #d1d9eb;
  border-radius: 8px;
  background: #fff;
  height: 32px;
  padding: 0 10px;
  cursor: pointer;
`

const SubTitle = styled.p`
  margin: 10px 0 0;
  color: #6b7280;
  font-size: 14px;
`

const Form = styled.form`
  margin-top: 16px;
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

const SubmitButton = styled.button`
  margin-top: 12px;
  width: 100%;
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
  margin: 12px 0 0;
  color: #dc2626;
  font-size: 13px;
`

const SuccessText = styled.p`
  margin: 12px 0 0;
  color: #16a34a;
  font-size: 13px;
`
