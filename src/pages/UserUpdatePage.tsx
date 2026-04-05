import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { isLoggedIn } from '../lib/auth'
import { apiFetch } from '../lib/http'

type UserProfileResponse = {
  id: number
  loginId: string
  name: string
  email: string
}

type UserUpdatePayload = {
  name: string
  email: string
  currentPassword: string
  changePassword: string
  confirmChangePassword: string
}

const PASSWORD_REGEX = /^[A-Za-z0-9\p{P}]{10,20}$/u
const NAME_REGEX = /^[가-힣A-Za-z0-9]{2,19}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function UserUpdatePage() {
  const navigate = useNavigate()
  const [loginId, setLoginId] = useState('')
  const [form, setForm] = useState<UserUpdatePayload>({
    name: '',
    email: '',
    currentPassword: '',
    changePassword: '',
    confirmChangePassword: '',
  })
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login', { replace: true })
      return
    }

    const fetchProfile = async () => {
      setIsLoadingProfile(true)
      setError('')

      try {
        const response = await apiFetch('/api/user', {
          method: 'GET',
        })

        if (!response.ok) {
          throw new Error(`유저 정보 조회 실패 (${response.status})`)
        }

        const profile = (await response.json()) as UserProfileResponse
        setLoginId(profile.loginId ?? '')
        setForm((prev) => ({
          ...prev,
          name: profile.name ?? '',
          email: profile.email ?? '',
        }))
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    void fetchProfile()
  }, [navigate])

  const updateField = (field: keyof UserUpdatePayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')

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

    if (!form.currentPassword.trim()) {
      setError('현재 비밀번호를 입력해주세요.')
      return
    }
    if (!PASSWORD_REGEX.test(form.currentPassword)) {
      setError('현재 비밀번호는 10~20자 영문/숫자/특수문자여야 합니다.')
      return
    }

    if (!form.changePassword.trim()) {
      setError('변경 비밀번호를 입력해주세요.')
      return
    }
    if (!PASSWORD_REGEX.test(form.changePassword)) {
      setError('변경 비밀번호는 10~20자 영문/숫자/특수문자여야 합니다.')
      return
    }

    if (!form.confirmChangePassword.trim()) {
      setError('변경 비밀번호 확인을 입력해주세요.')
      return
    }
    if (form.changePassword !== form.confirmChangePassword) {
      setError('변경 비밀번호와 비밀번호 확인이 일치하지 않습니다.')
      return
    }

    setIsSaving(true)
    try {
      const response = await apiFetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          currentPassword: form.currentPassword,
          changePassword: form.changePassword,
        }),
      })

      if (!response.ok) {
        throw new Error(`변경 저장 실패 (${response.status})`)
      }

      navigate('/', { replace: true })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/', { replace: true })
  }

  return (
    <Page>
      <Shell>
        <TopBar>
          <h1>유저정보 업데이트</h1>
          <TopActions>
            <TopActionButton type="button" onClick={() => navigate('/')}>
              메인으로
            </TopActionButton>
            <TopActionButton type="button" onClick={handleLogout}>
              로그아웃
            </TopActionButton>
          </TopActions>
        </TopBar>

        <Card>
          <CardDesc>변경할 정보를 입력하고 저장하세요.</CardDesc>

          <UserIdBlock>
            <UserIdLabel>아이디</UserIdLabel>
            <UserIdValue>{loginId || '-'}</UserIdValue>
          </UserIdBlock>

          <Form>
            <Field>
              <Label htmlFor="updateName">이름</Label>
              <Input
                id="updateName"
                placeholder="이름"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="updateEmail">이메일</Label>
              <Input
                id="updateEmail"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="updateCurrentPassword">현재 비밀번호</Label>
              <Input
                id="updateCurrentPassword"
                type="password"
                value={form.currentPassword}
                onChange={(e) => updateField('currentPassword', e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="updateChangePassword">변경 비밀번호</Label>
              <Input
                id="updateChangePassword"
                type="password"
                value={form.changePassword}
                onChange={(e) => updateField('changePassword', e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="updateConfirmChangePassword">변경 비밀번호 확인</Label>
              <Input
                id="updateConfirmChangePassword"
                type="password"
                value={form.confirmChangePassword}
                onChange={(e) => updateField('confirmChangePassword', e.target.value)}
              />
            </Field>
          </Form>

          {isLoadingProfile && <InfoText>유저 정보를 불러오는 중...</InfoText>}
          {error && <ErrorText>{error}</ErrorText>}
          {success && <SuccessText>{success}</SuccessText>}

          <Actions>
            <SaveButton type="button" onClick={handleSave} disabled={isSaving || isLoadingProfile}>
              {isSaving ? '저장 중...' : '변경정보 저장'}
            </SaveButton>
          </Actions>
        </Card>
      </Shell>
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
  max-width: 640px;
`

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  h1 {
    margin: 0;
    font-size: 30px;
    letter-spacing: -0.6px;
    color: #111827;
  }
`

const TopActions = styled.div`
  display: flex;
  gap: 8px;
`

const TopActionButton = styled.button`
  height: 34px;
  border: 1px solid #cfd8ef;
  border-radius: 10px;
  padding: 0 12px;
  background: #fff;
  color: #374151;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`

const Card = styled.section`
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #dce4f7;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 16px 35px rgba(30, 60, 130, 0.08);
`

const CardDesc = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 14px;
`

const UserIdBlock = styled.div`
  margin: 14px 0 0;
  display: grid;
  gap: 6px;
`

const UserIdLabel = styled.p`
  margin: 0;
  font-size: 13px;
  color: #374151;
  font-weight: 600;
`

const UserIdValue = styled.p`
  margin: 0;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
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

const Actions = styled.div`
  margin-top: 14px;
  display: flex;
  gap: 8px;
`

const SaveButton = styled.button`
  flex: 1;
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

const InfoText = styled.p`
  margin: 12px 0 0;
  color: #4b5563;
  font-size: 13px;
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

export default UserUpdatePage
