import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface ClassicText {
  id: string;
  book_name: string;
  book_author?: string;
  chapter?: string;
  keyword: string;
  original_text: string;
  modern_interpretation: string;
  application_scenario: string;
}

interface ClassicReferencesProps {
  texts: ClassicText[];
}

export const ClassicReferences = ({ texts }: ClassicReferencesProps) => {
  if (!texts || texts.length === 0) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
          经典依据
        </h3>
      </div>
      
      <div className="space-y-4">
        {texts.map((text, index) => (
          <div 
            key={text.id} 
            className="pb-4 border-b border-amber-200 dark:border-amber-800 last:border-0 last:pb-0"
          >
            <div className="mb-2">
              <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 dark:text-amber-300">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                《{text.book_name}》
                {text.book_author && <span className="text-xs text-amber-600 dark:text-amber-400">（{text.book_author}）</span>}
                {text.chapter && <span className="text-xs">· {text.chapter}</span>}
              </span>
            </div>
            
            <blockquote className="pl-4 border-l-2 border-amber-400 dark:border-amber-600 mb-3">
              <p className="text-sm text-amber-800 dark:text-amber-200 italic">
                "{text.original_text}"
              </p>
            </blockquote>
            
            <div className="pl-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-amber-700 dark:text-amber-300">现代解读：</span>
                {text.modern_interpretation}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
        <p className="text-xs text-amber-600 dark:text-amber-400">
          💡 以上内容摘自传统命理经典，仅供学习参考
        </p>
      </div>
    </Card>
  );
};
