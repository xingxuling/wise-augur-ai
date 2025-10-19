import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
}

export const useAIChat = (baziRecordId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    // 添加用户消息到UI
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('请先登录');
      }

      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message,
          sessionId,
          baziRecordId
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '请求失败');
      }

      // 获取会话ID
      const newSessionId = response.headers.get('X-Session-Id');
      const currentSessionId = newSessionId || sessionId;
      if (newSessionId && !sessionId) {
        setSessionId(newSessionId);
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      // 添加一个空的助手消息
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString()
      }]);

      if (reader) {
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  assistantMessage += content;
                  // 更新最后一条消息
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === 'assistant') {
                      lastMessage.content = assistantMessage;
                    }
                    return newMessages;
                  });
                }
              } catch (e) {
                console.error('解析SSE数据失败:', e);
              }
            }
          }
        }

        // 保存助手消息到数据库 - 使用当前会话ID
        if (assistantMessage && currentSessionId) {
          await supabase
            .from('ai_chat_messages')
            .insert({
              session_id: currentSessionId,
              role: 'assistant',
              content: assistantMessage
            });
        }
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('请求已取消');
      } else {
        console.error('发送消息失败:', error);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `发送失败：${error.message}`,
          created_at: new Date().toISOString()
        }]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [sessionId, baziRecordId]);

  const loadHistory = useCallback(async (loadSessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('session_id', loadSessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        // 类型转换，确保 role 字段符合 ChatMessage 类型
        const typedMessages: ChatMessage[] = data.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
          created_at: msg.created_at
        }));
        setMessages(typedMessages);
        setSessionId(loadSessionId);
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    messages,
    isLoading,
    sessionId,
    sendMessage,
    loadHistory,
    clearChat,
    stopGeneration
  };
};