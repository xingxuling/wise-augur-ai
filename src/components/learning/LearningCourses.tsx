import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Clock, CheckCircle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMembership } from '@/hooks/useMembership';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  order_index: number;
  lessons?: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  duration_minutes: number;
  order_index: number;
}

interface Progress {
  lesson_id: string;
  completed: boolean;
}

export const LearningCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const { membership } = useMembership();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoursesAndProgress();
  }, []);

  const fetchCoursesAndProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 获取课程和课节
      const { data: coursesData, error: coursesError } = await supabase
        .from('learning_courses')
        .select(`
          *,
          lessons:learning_lessons(id, title, duration_minutes, order_index)
        `)
        .eq('is_published', true)
        .order('order_index');

      if (coursesError) throw coursesError;

      // 获取用户进度
      if (user) {
        const { data: progressData } = await supabase
          .from('user_learning_progress')
          .select('lesson_id, completed')
          .eq('user_id', user.id);
        
        if (progressData) setProgress(progressData);
      }

      setCourses(coursesData || []);
    } catch (error) {
      console.error('获取课程失败:', error);
      toast.error('加载课程失败');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (lessons: Lesson[]) => {
    if (!lessons || lessons.length === 0) return 0;
    const completedCount = lessons.filter(lesson =>
      progress.some(p => p.lesson_id === lesson.id && p.completed)
    ).length;
    return (completedCount / lessons.length) * 100;
  };

  const canAccessCourse = (course: Course, lessonIndex: number) => {
    if (!membership) return lessonIndex < 3; // 未登录可学前3节
    
    if (course.level === 'beginner') {
      if (membership.tier === 'free') return lessonIndex < 3;
      return true; // 付费会员可学全部入门课
    }
    
    if (course.level === 'advanced') {
      if (membership.tier === 'free') return false;
      if (membership.tier === 'basic') return lessonIndex < 3;
      return true; // 尊享版可学全部课程
    }
    
    return false;
  };

  const handleLessonClick = (courseId: string, lessonId: string, lessonIndex: number, course: Course) => {
    if (!canAccessCourse(course, lessonIndex)) {
      toast.error('请升级会员以解锁更多课程');
      return;
    }
    navigate(`/learning/lesson/${lessonId}`);
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">命理学习中心</h1>
        <p className="text-muted-foreground">系统学习八字命理，从入门到精通</p>
      </div>

      {courses.map((course) => {
        const courseProgress = calculateProgress(course.lessons || []);
        const totalDuration = course.lessons?.reduce((sum, l) => sum + (l.duration_minutes || 0), 0) || 0;
        
        return (
          <Card key={course.id} className="p-6 bg-card/80 backdrop-blur-md border-primary/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">{course.title}</h2>
                  <span className={`text-xs px-2 py-1 rounded ${
                    course.level === 'beginner' 
                      ? 'bg-green-500/20 text-green-700' 
                      : 'bg-blue-500/20 text-blue-700'
                  }`}>
                    {course.level === 'beginner' ? '入门' : '进阶'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {totalDuration}分钟
                  </span>
                  <span>{course.lessons?.length || 0}节课</span>
                </div>
              </div>
            </div>

            {courseProgress > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>学习进度</span>
                  <span>{courseProgress.toFixed(0)}%</span>
                </div>
                <Progress value={courseProgress} className="h-2" />
              </div>
            )}

            <div className="space-y-2">
              {course.lessons?.sort((a, b) => a.order_index - b.order_index).map((lesson, idx) => {
                const isCompleted = progress.some(p => p.lesson_id === lesson.id && p.completed);
                const canAccess = canAccessCourse(course, idx);
                
                return (
                  <div
                    key={lesson.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      canAccess 
                        ? 'border-border hover:bg-muted/50 cursor-pointer' 
                        : 'border-border/50 bg-muted/20 cursor-not-allowed'
                    }`}
                    onClick={() => canAccess && handleLessonClick(course.id, lesson.id, idx, course)}
                  >
                    <div className="flex items-center gap-3">
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : canAccess ? (
                        <div className="w-5 h-5 rounded-full border-2 border-primary/50" />
                      ) : (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className={`text-sm font-medium ${!canAccess && 'text-muted-foreground'}`}>
                          {idx + 1}. {lesson.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lesson.duration_minutes}分钟
                        </p>
                      </div>
                    </div>
                    {canAccess && (
                      <Button variant="ghost" size="sm">
                        {isCompleted ? '重新学习' : '开始学习'}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
