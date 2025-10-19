import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AIChat } from '@/components/chat/AIChat';
import { ChatHistory } from '@/components/chat/ChatHistory';
import { UsageStats } from '@/components/chat/UsageStats';

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const baziRecordId = searchParams.get('baziRecordId') || undefined;
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  const handleNewChat = () => {
    setSelectedSessionId(null);
  };

  const handleSessionCreated = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      {/* 头部 */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <Button onClick={handleNewChat}>
              <Plus className="w-4 h-4 mr-2" />
              新对话
            </Button>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">AI 命理问答</h1>
            <p className="text-muted-foreground">
              与专业命理顾问对话，获取个性化解读与建议
            </p>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左侧：聊天历史和使用统计 */}
          <div className="lg:col-span-1 space-y-6">
            <UsageStats />
            <ChatHistory 
              onSelectSession={handleSelectSession}
              currentSessionId={selectedSessionId}
              refreshTrigger={refreshTrigger}
            />
          </div>

          {/* 右侧：聊天界面 */}
          <div className="lg:col-span-2">
            <AIChat 
              baziRecordId={baziRecordId}
              sessionId={selectedSessionId}
              onSessionCreated={handleSessionCreated}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;