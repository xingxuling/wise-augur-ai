import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ReadingBookmark } from './ReadingBookmark';
import { ReadingFeedback } from './ReadingFeedback';
import { ReadingExport } from './ReadingExport';

interface EnhancedReadingDisplayProps {
  content: string;
  baziRecordId: string;
  readingType: string;
  baziData: any;
}

export const EnhancedReadingDisplay = ({
  content,
  baziRecordId,
  readingType,
  baziData,
}: EnhancedReadingDisplayProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [content]);

  const needsExpansion = contentHeight > 400;
  const displayContent = needsExpansion && !expanded 
    ? content.substring(0, 300) + '...'
    : content;

  // Generate table of contents from content
  const generateToc = () => {
    const sections = [];
    if (content.includes('格局') || content.includes('八字')) sections.push('格局解读');
    if (content.includes('事业') || content.includes('职场')) sections.push('事业发展');
    if (content.includes('感情') || content.includes('婚姻')) sections.push('感情经营');
    if (content.includes('健康') || content.includes('养生')) sections.push('健康养生');
    if (content.includes('大运') || content.includes('流年')) sections.push('运势走向');
    return sections;
  };

  const toc = generateToc();

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-md border-primary/20">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">AI解读内容</h3>
        <div className="flex gap-2">
          <ReadingBookmark
            baziRecordId={baziRecordId}
            readingType={readingType}
            content={content}
          />
          <ReadingExport
            baziRecordId={baziRecordId}
            contentRef={contentRef}
            baziData={baziData}
          />
        </div>
      </div>

      {/* Table of Contents (only for expanded professional readings) */}
      {expanded && toc.length > 0 && (
        <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
          <p className="text-sm font-medium mb-2">目录导航</p>
          <div className="flex flex-wrap gap-2">
            {toc.map((section, idx) => (
              <button
                key={idx}
                className="text-xs px-2 py-1 bg-background rounded hover:bg-primary/10 transition-colors"
                onClick={() => {
                  // Smooth scroll would require section markers in content
                  // For now, just a visual indicator
                }}
              >
                {idx + 1}. {section}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Notice */}
      <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
        <p className="text-xs text-muted-foreground">
          ⚠️ <strong>重要提示：</strong>本解读基于传统命理规则生成,仅供参考。人生走向取决于个人选择与努力,请勿依据解读做出重大决策(如投资、辞职等)。必要时请咨询专业人士。
        </p>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className={`relative ${needsExpansion && !expanded ? 'max-h-[400px] overflow-hidden' : ''}`}
      >
        <div className="prose prose-sm max-w-none">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {displayContent}
          </p>
        </div>
        
        {needsExpansion && !expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card to-transparent" />
        )}
      </div>

      {/* Expand Button */}
      {needsExpansion && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={() => setExpanded(!expanded)}
            className="gap-2"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                收起内容
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                查看完整解读
              </>
            )}
          </Button>
        </div>
      )}

      {/* Footer actions */}
      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
        <ReadingFeedback
          baziRecordId={baziRecordId}
          readingType={readingType}
          readingContent={content}
        />
        <p className="text-xs text-muted-foreground italic">
          * 以上解读仅供参考,人生决策请结合实际判断
        </p>
      </div>
    </Card>
  );
};