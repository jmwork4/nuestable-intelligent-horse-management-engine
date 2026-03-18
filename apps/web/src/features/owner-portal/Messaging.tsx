import { useState } from 'react';
import { PageHeader, Card, Button, Input, EmptyState } from '@/components/ui';
import { useAuthStore } from '@/stores/auth';
import { useHorses } from '@/api/horses';
import { cn, formatDateTime, getInitials } from '@/lib/utils';
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface Message {
  id: string;
  horseId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export default function Messaging() {
  const { user } = useAuthStore();
  const { data: horsesData } = useHorses({ limit: 50 });
  const [selectedHorseId, setSelectedHorseId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const horses = horsesData?.data ?? [];

  // Placeholder messages - in production these come from API
  const messages: Message[] = [];

  const handleSend = () => {
    if (!newMessage.trim() || !selectedHorseId) return;
    // In production: call API to send message
    setNewMessage('');
  };

  return (
    <div>
      <PageHeader
        title="Messages"
        subtitle="Communicate with your trainer"
        breadcrumbs={[
          { label: 'Owner Portal', href: '/owner-portal' },
          { label: 'Messages' },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4" style={{ minHeight: '60vh' }}>
        {/* Thread list */}
        <Card padding="none" className="lg:col-span-1 overflow-hidden">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Conversations</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {horses.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No horses found</p>
            ) : (
              horses.map((horse) => (
                <button
                  key={horse.id}
                  onClick={() => setSelectedHorseId(horse.id)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors min-h-touch',
                    selectedHorseId === horse.id
                      ? 'bg-brand-50 dark:bg-brand-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800',
                  )}
                >
                  <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
                    {horse.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{horse.name}</p>
                    <p className="text-xs text-gray-500 truncate">Tap to view conversation</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Message area */}
        <Card padding="none" className="lg:col-span-3 flex flex-col overflow-hidden">
          {!selectedHorseId ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                icon={<ChatBubbleLeftRightIcon className="mx-auto h-12 w-12" />}
                message="Select a horse to view the conversation"
              />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {horses.find((h) => h.id === selectedHorseId)?.name}
                </h3>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-8">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                        <div className={cn('max-w-[70%]', isMe ? 'order-2' : '')}>
                          {!isMe && (
                            <p className="text-xs font-medium text-gray-500 mb-1">{msg.senderName}</p>
                          )}
                          <div
                            className={cn(
                              'rounded-lg px-4 py-2',
                              isMe
                                ? 'bg-brand-600 text-white'
                                : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
                            )}
                          >
                            <p className="text-sm">{msg.content}</p>
                          </div>
                          <p className="mt-1 text-[10px] text-gray-400">{formatDateTime(msg.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-4 dark:border-gray-800">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 min-h-touch"
                  />
                  <Button onClick={handleSend} icon={<PaperAirplaneIcon className="h-4 w-4" />}>
                    Send
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
