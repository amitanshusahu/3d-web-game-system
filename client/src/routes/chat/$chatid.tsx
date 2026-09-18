import { useMemo, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { getToken } from '../../lib/auth'
import { getChatErrorMessage, useChat, useSendMessage } from '../../hooks/useChat'
import { getDreamErrorMessage, usePublishDream } from '../../hooks/useDream'
import { useLogout } from '../../hooks/useAuth'
import { ChatSidebar, PostDreamModal, WorldViewport, parseWorld } from '../../components/ui/Chat'

export const Route = createFileRoute('/chat/$chatid')({
  beforeLoad: () => {
    if (!getToken()) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: App,
})

function App() {
  const { chatid } = Route.useParams()
  const logout = useLogout()
  const chatQuery = useChat(chatid)
  const sendMessage = useSendMessage(chatid)
  const publishDream = usePublishDream(chatid)
  const [showPostModal, setShowPostModal] = useState(false)

  const histories = chatQuery.data?.userChatHistories ?? []
  const latestResponse = histories.length > 0 ? histories[histories.length - 1]?.response : null
  const latestWorld = useMemo(() => parseWorld(latestResponse ?? null), [latestResponse])
  const alreadyPosted = !!chatQuery.data?.dream

  return (
    <div className='grid grid-cols-[30%_70%] h-screen w-screen'>
      <ChatSidebar
        title={chatQuery.data?.title ?? chatid}
        isLoading={chatQuery.isPending}
        loadError={chatQuery.isError}
        alreadyPosted={alreadyPosted}
        histories={histories}
        sendPending={sendMessage.isPending}
        sendError={sendMessage.isError}
        sendErrorMessage={sendMessage.isError ? getChatErrorMessage(sendMessage.error) : null}
        onSend={(message, opts) => sendMessage.mutate(message, opts)}
        onOpenPostModal={() => setShowPostModal(true)}
        onLogout={logout}
      />

      <WorldViewport world={latestWorld} loadFailed={chatQuery.isError} />

      {showPostModal && (
        <PostDreamModal
          isPending={publishDream.isPending}
          isError={publishDream.isError}
          isSuccess={publishDream.isSuccess}
          errorMessage={publishDream.isError ? getDreamErrorMessage(publishDream.error) : null}
          onPublish={(input) =>
            publishDream.mutate(input, {
              onSuccess: () => {
                setShowPostModal(false)
                void chatQuery.refetch()
              },
            })
          }
          onClose={() => setShowPostModal(false)}
        />
      )}
    </div>
  )
}
