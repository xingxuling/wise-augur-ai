import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BaziCase {
  id: string;
  case_code: string;
  gender: string;
  age_range: string;
  region: string;
  identity: string;
  bazi_data: any;
  pattern_type: string;
  consultation_question: string;
  system_reading: string;
  user_feedback?: string;
  feedback_time?: string;
  scenario_tags: string[];
  helpful_votes: number;
  unhelpful_votes: number;
}

interface CaseReferencesProps {
  cases: BaziCase[];
  membershipTier?: string;
}

export const CaseReferences = ({ cases, membershipTier = 'free' }: CaseReferencesProps) => {
  const [expandedCases, setExpandedCases] = useState<Set<string>>(new Set());
  const [votedCases, setVotedCases] = useState<Set<string>>(new Set());

  if (!cases || cases.length === 0) return null;

  const toggleExpand = (caseId: string) => {
    setExpandedCases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(caseId)) {
        newSet.delete(caseId);
      } else {
        newSet.add(caseId);
      }
      return newSet;
    });
  };

  const handleVote = async (caseId: string, isHelpful: boolean) => {
    if (votedCases.has(caseId)) {
      toast.info("您已经投过票了");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("请先登录");
        return;
      }

      const { error } = await supabase
        .from('case_feedbacks')
        .insert({
          user_id: user.id,
          case_id: caseId,
          is_helpful: isHelpful
        });

      if (error) throw error;

      setVotedCases(prev => new Set([...prev, caseId]));
      toast.success(isHelpful ? "感谢您的反馈！" : "已记录您的反馈");
    } catch (error) {
      console.error('投票失败:', error);
      toast.error("投票失败，请稍后重试");
    }
  };

  const canViewDetails = membershipTier !== 'free';

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
          类似案例参考
        </h3>
      </div>

      <div className="space-y-4">
        {cases.map((baziCase, index) => {
          const isExpanded = expandedCases.has(baziCase.id);
          const hasVoted = votedCases.has(baziCase.id);

          return (
            <Card key={baziCase.id} className="p-4 bg-white/50 dark:bg-gray-900/50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                      {baziCase.case_code}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {baziCase.gender} · {baziCase.age_range} · {baziCase.region} · {baziCase.identity}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {baziCase.scenario_tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">咨询问题：</span>
                  <p className="text-sm text-foreground mt-1">{baziCase.consultation_question}</p>
                </div>

                {(isExpanded || !canViewDetails) && (
                  <>
                    <div>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">系统解读：</span>
                      <p className="text-sm text-muted-foreground mt-1">{baziCase.system_reading}</p>
                    </div>

                    {baziCase.user_feedback && (
                      <div className="pl-4 border-l-2 border-green-400 dark:border-green-600">
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">用户反馈：</span>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          {baziCase.user_feedback}
                        </p>
                        {baziCase.feedback_time && (
                          <p className="text-xs text-muted-foreground mt-1">
                            反馈时间：{new Date(baziCase.feedback_time).toLocaleDateString('zh-CN')}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{baziCase.helpful_votes}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ThumbsDown className="w-4 h-4" />
                    <span>{baziCase.unhelpful_votes}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!hasVoted && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVote(baziCase.id, true)}
                        className="h-8"
                      >
                        有用
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVote(baziCase.id, false)}
                        className="h-8"
                      >
                        无用
                      </Button>
                    </>
                  )}
                  
                  {canViewDetails && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleExpand(baziCase.id)}
                      className="h-8"
                    >
                      {isExpanded ? (
                        <>
                          收起 <ChevronUp className="w-4 h-4 ml-1" />
                        </>
                      ) : (
                        <>
                          展开详情 <ChevronDown className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {!canViewDetails && index === 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    💎 升级为基础版或以上会员，查看案例详细信息和对比分析
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-600 dark:text-blue-400">
          📊 所有案例均已脱敏处理，投票数据用于优化案例匹配精准度
        </p>
      </div>
    </Card>
  );
};
