import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

export function BaziTestCase() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testCase = {
    birthYear: 2003,
    birthMonth: 1,
    birthDay: 9,
    birthHour: 13,
    birthMinute: 7,
    gender: 'male',
    region: 'hongkong'
  };

  const runTest = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data, error: calcError } = await supabase.functions.invoke('bazi-calculate', {
        body: testCase
      });

      if (calcError) throw calcError;

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || '计算失败');
      }
    } catch (err) {
      console.error('测试失败:', err);
      setError(err instanceof Error ? err.message : '测试失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-md border-primary/20">
      <h3 className="text-xl font-bold text-gradient mb-4">
        测试案例：2003年1月9日13:07 香港出生 男命
      </h3>

      <Button
        onClick={runTest}
        disabled={loading}
        className="mb-4"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? '计算中...' : '运行测试'}
      </Button>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded p-4 mb-4">
          <p className="font-semibold">错误：</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* 八字四柱 */}
          <div>
            <h4 className="font-semibold mb-2">八字四柱：</h4>
            <div className="grid grid-cols-4 gap-4">
              {['year', 'month', 'day', 'hour'].map((key, index) => (
                <div key={key} className="text-center bg-background/50 rounded p-2">
                  <div className="text-xs text-muted-foreground mb-1">
                    {['年柱', '月柱', '日柱', '时柱'][index]}
                  </div>
                  <div className="text-2xl font-bold text-gradient">
                    {result.bazi[key]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 五行分析 */}
          <div>
            <h4 className="font-semibold mb-2">五行分析：</h4>
            <div className="grid grid-cols-5 gap-2 text-center">
              {Object.entries(result.wuxingAnalysis).map(([element, count]: [string, any]) => (
                <div key={element} className="bg-background/50 rounded p-2">
                  <div className="text-lg font-bold text-primary">{count}</div>
                  <div className="text-xs text-muted-foreground">{element}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 特殊格局识别结果 */}
          {result.pattern && (
            <div>
              <h4 className="font-semibold mb-2">格局识别：</h4>
              <div className={`rounded-lg p-4 border-2 ${
                result.pattern.isSpecial 
                  ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary' 
                  : 'bg-background/50 border-primary/20'
              }`}>
                {result.pattern.isSpecial && (
                  <div className="inline-block px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded mb-2">
                    特殊格局
                  </div>
                )}
                <p className="text-lg font-semibold text-primary mb-2">
                  {result.pattern.pattern}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {result.pattern.description}
                </p>
                
                {/* 所有识别出的格局 */}
                {result.pattern.isSpecial && result.pattern.allPatterns && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-primary">识别出的所有格局：</p>
                    {result.pattern.allPatterns.map((p: any, idx: number) => (
                      <div key={idx} className="bg-background/80 rounded p-3 border border-border text-sm">
                        <p className="font-semibold text-primary mb-1">
                          {p.isPrimary ? '【主格】' : '【兼格】'}{p.name}
                        </p>
                        <p className="text-xs text-muted-foreground mb-1">
                          <span className="font-medium">成格条件：</span>{p.condition}
                        </p>
                        <p className="text-xs text-primary/80">
                          <span className="font-medium">经典依据：</span>{p.reference}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 原始结果（折叠） */}
          <details className="bg-background/50 rounded p-4">
            <summary className="cursor-pointer font-semibold text-sm">
              查看完整计算结果（JSON）
            </summary>
            <pre className="text-xs mt-2 overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </Card>
  );
}
