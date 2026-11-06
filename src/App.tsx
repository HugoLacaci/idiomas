import { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom';
import type { Lang } from '@/content/types';
import { useProfile, useStore } from '@/data/settings';
import { LangShell } from '@/ui/LangShell';
import { Loading } from '@/ui/Loading';
import Home from '@/screens/Home';
import Gift from '@/screens/Gift';

const Onboarding = lazy(() => import('@/screens/Onboarding'));
const Today = lazy(() => import('@/screens/Today'));
const CourseMap = lazy(() => import('@/screens/CourseMap'));
const UnitScreen = lazy(() => import('@/screens/UnitScreen'));
const LessonPlayer = lazy(() => import('@/screens/LessonPlayer'));
const GrammarStory = lazy(() => import('@/screens/GrammarStory'));
const GrammarLab = lazy(() => import('@/screens/GrammarLab'));
const GrammarList = lazy(() => import('@/screens/GrammarList'));
const Practice = lazy(() => import('@/screens/Practice'));
const ReviewSession = lazy(() => import('@/screens/ReviewSession'));
const Progress = lazy(() => import('@/screens/Progress'));
const Settings = lazy(() => import('@/screens/Settings'));
const Help = lazy(() => import('@/screens/Help'));
const Credits = lazy(() => import('@/screens/Credits'));
const Install = lazy(() => import('@/screens/Install'));
const GiftCard = lazy(() => import('@/screens/GiftCard'));
const HugoMode = lazy(() => import('@/screens/HugoMode'));
const Certificate = lazy(() => import('@/screens/Certificate'));
const Videos = lazy(() => import('@/screens/Videos'));
const ChatScreen = lazy(() => import('@/screens/ChatScreen'));
const Favorites = lazy(() => import('@/screens/Favorites'));
const LevelTest = lazy(() => import('@/screens/LevelTest'));
const Challenge = lazy(() => import('@/screens/Challenge'));
const Pronunciation = lazy(() => import('@/screens/Pronunciation'));
const Design = lazy(() => import('@/screens/Design'));
const AiTutor = lazy(() => import('@/screens/AiTutor'));

function LangGuard() {
  const { lang } = useParams();
  const setProfile = useStore((s) => s.setProfile);
  const ok = lang === 'en' || lang === 'it';
  useEffect(() => {
    if (ok) setProfile({ lang: lang as Lang });
  }, [lang, ok, setProfile]);
  if (!ok) return <Navigate to="/" replace />;
  return (
    <div data-lang={lang} className="min-h-dvh bg-bg text-ink">
      <Outlet />
    </div>
  );
}

/** Primera vez: felicitación → onboarding. */
function FirstRun({ children }: { children: React.ReactNode }) {
  const profile = useProfile();
  const loc = useLocation();
  const free = ['/regalo', '/bienvenida', '/hugo', '/design', '/tarjeta-regalo', '/creditos'].some((p) => loc.pathname.startsWith(p));
  if (!free && !profile.giftSeen) return <Navigate to="/regalo" replace />;
  if (!free && !profile.onboarded) return <Navigate to="/bienvenida" replace />;
  return <>{children}</>;
}

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <HashRouter>
      <ScrollTop />
      <Suspense fallback={<Loading />}>
        <FirstRun>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/regalo" element={<Gift />} />
            <Route path="/bienvenida" element={<Onboarding />} />
            <Route path="/ajustes" element={<Settings />} />
            <Route path="/ayuda" element={<Help />} />
            <Route path="/creditos" element={<Credits />} />
            <Route path="/instalar" element={<Install />} />
            <Route path="/tarjeta-regalo" element={<GiftCard />} />
            <Route path="/hugo" element={<HugoMode />} />
            <Route path="/design" element={<Design />} />
            <Route path="/:lang" element={<LangGuard />}>
              <Route element={<LangShell />}>
                <Route index element={<Today />} />
                <Route path="lecciones" element={<CourseMap />} />
                <Route path="practicar" element={<Practice />} />
                <Route path="progreso" element={<Progress />} />
              </Route>
              <Route path="unidad/:unitId" element={<UnitScreen />} />
              <Route path="leccion/:lessonId" element={<LessonPlayer />} />
              <Route path="gramatica" element={<GrammarList />} />
              <Route path="gramatica/:gid" element={<GrammarStory />} />
              <Route path="laboratorio/:gid" element={<GrammarLab />} />
              <Route path="repasar" element={<ReviewSession />} />
              <Route path="videos" element={<Videos />} />
              <Route path="charla/:chatId" element={<ChatScreen />} />
              <Route path="tutor" element={<AiTutor />} />
              <Route path="favoritas" element={<Favorites />} />
              <Route path="prueba-nivel" element={<LevelTest />} />
              <Route path="reto/:unitId" element={<Challenge />} />
              <Route path="pronunciacion" element={<Pronunciation />} />
              <Route path="certificado/:level" element={<Certificate />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </FirstRun>
      </Suspense>
    </HashRouter>
  );
}
