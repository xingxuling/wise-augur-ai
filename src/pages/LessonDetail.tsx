import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration_minutes: number;
  course_id: string;
  order_index: number;
}

interface Course {
  id: string;
  title: string;
  level: string;
}

const LessonDetail = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (lessonId) {
      fetchLessonData();
    }
  }, [lessonId]);

  useEffect(() => {
    // 模拟学习进度
    if (lesson && !completed) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, (lesson.duration_minutes * 600)); // 根据课程时长调整进度速度
    }
  }, [lesson, completed]);

  const fetchLessonData = async () => {
    try {
      // 获取课节信息
      const { data: lessonData, error: lessonError } = await supabase
        .from('learning_lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (lessonError) throw lessonError;
      setLesson(lessonData);

      // 获取课程信息
      const { data: courseData, error: courseError } = await supabase
        .from('learning_courses')
        .select('id, title, level')
        .eq('id', lessonData.course_id)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // 检查用户学习进度
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: progressData } = await supabase
          .from('user_learning_progress')
          .select('completed, last_position')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .single();

        if (progressData) {
          setCompleted(progressData.completed);
          setProgress(progressData.last_position || 0);
        }
      }
    } catch (error) {
      console.error('获取课节失败:', error);
      toast.error('加载课节失败');
      navigate('/learning');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('请先登录');
        return;
      }

      const { error } = await supabase
        .from('user_learning_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId!,
          completed: true,
          completed_at: new Date().toISOString(),
          last_position: 100,
        });

      if (error) throw error;

      setCompleted(true);
      setProgress(100);
      toast.success('恭喜完成本节课程！');
    } catch (error) {
      console.error('标记完成失败:', error);
      toast.error('操作失败，请重试');
    }
  };

  const handleSaveProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_learning_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId!,
          completed: false,
          last_position: progress,
        });
    } catch (error) {
      console.error('保存进度失败:', error);
    }
  };

  useEffect(() => {
    // 定期保存进度
    const saveInterval = setInterval(() => {
      if (progress > 0 && progress < 100) {
        handleSaveProgress();
      }
    }, 30000); // 每30秒保存一次

    return () => clearInterval(saveInterval);
  }, [progress]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  if (!lesson || !course) {
    return <div className="min-h-screen flex items-center justify-center">课节不存在</div>;
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-b from-background to-background/50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/learning')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回课程列表
          </Button>
          
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  course.level === 'beginner' 
                    ? 'bg-green-500/20 text-green-700' 
                    : 'bg-blue-500/20 text-blue-700'
                }`}>
                  {course.level === 'beginner' ? '入门' : '进阶'}
                </span>
                <span className="text-sm text-muted-foreground">{course.title}</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {lesson.duration_minutes}分钟
                </span>
                {completed && (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    已完成
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {!completed && (
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span>学习进度</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>

        {/* Content */}
        <Card className="p-8 mb-6 bg-card/80 backdrop-blur-md border-primary/20">
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-foreground">
              {lesson.content}
            </div>
          </div>
        </Card>

        {/* Action Button */}
        <div className="flex justify-center">
          {!completed ? (
            <Button onClick={handleComplete} size="lg" className="px-8">
              <CheckCircle className="w-5 h-5 mr-2" />
              标记为已完成
            </Button>
          ) : (
            <Button onClick={() => navigate('/learning')} size="lg" className="px-8">
              继续学习下一节
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;