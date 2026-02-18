
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAppState, StateProvider } from './state';
import CatListView from './views/CatListView';
import CatDetailView from './views/CatDetailView';
import CatCreateView from './views/CatCreateView';
import TeamBuilderView from './views/TeamBuilderView';
import BranchManagementView from './views/BranchManagementView';
import GameIcon from './components/GameIcon';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAppState();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b-4 border-black bg-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-10">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="bg-black p-2 sketch-border-sm group-hover:bg-zinc-800 transition">
                   <GameIcon type="cat" size={28} className="text-white" />
                </div>
                <span className="text-3xl font-black tracking-tighter text-black uppercase italic">MEWGENICS<span className="text-red-700"> PLUS</span></span>
              </Link>
              <div className="hidden md:flex items-center space-x-1">
                <Link to="/" className="hover:bg-zinc-100 px-4 py-2 text-sm font-black text-black uppercase tracking-widest transition">Коты</Link>
                <Link to="/branches" className="hover:bg-zinc-100 px-4 py-2 text-sm font-black text-black uppercase tracking-widest transition">Ветки</Link>
                <Link to="/team" className="hover:bg-zinc-100 px-4 py-2 text-sm font-black text-black uppercase tracking-widest transition italic">Команда</Link>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col text-right hidden sm:flex">
                 <span className="text-[10px] font-black uppercase opacity-40">Журнал заведен на:</span>
                 <span className="text-xs text-black font-black uppercase">{user?.email}</span>
              </div>
              <button 
                onClick={logout}
                className="bg-red-200 hover:bg-red-300 text-black border-2 border-black px-4 py-1 font-black text-xs transition sketch-border-sm uppercase"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10">
        {children}
      </main>
      <footer className="border-t-4 border-black bg-white p-8 text-center text-black font-black uppercase text-[11px] tracking-widest italic opacity-60">
        &copy; 1999-2024 Mewgenics Database. Genetic Superiority Project. Hand-drawn Interface.
      </footer>
    </div>
  );
};

const LoginView: React.FC = () => {
  const { login, register } = useAppState();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        register(email, password);
      } else {
        login(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-12 rounded border-8 border-black w-full max-w-md sketch-border relative shadow-2xl">
        <div className="text-center mb-10">
          <div className="bg-black inline-block p-6 sketch-border mb-6">
             <GameIcon type="cat" size={80} className="text-white" />
          </div>
          <h1 className="text-5xl font-black text-black mb-2 uppercase italic tracking-tighter">Mewgenics+</h1>
          <p className="text-black font-black text-xs uppercase opacity-40 tracking-widest italic">Ваша база данных по котам</p>
        </div>
        
        <form onSubmit={handleAction} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase mb-1 ml-1 opacity-60">Доступ (Email)</label>
            <input 
              required
              type="email" 
              className="w-full bg-[#fdf6e3] border-4 border-black rounded px-4 py-3 text-black font-black focus:outline-none sketch-border-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase mb-1 ml-1 opacity-60">Код доступа (Пароль)</label>
            <input 
              required
              type="password" 
              className="w-full bg-[#fdf6e3] border-4 border-black rounded px-4 py-3 text-black font-black focus:outline-none sketch-border-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {error && <p className="text-red-700 text-xs text-center font-black bg-red-50 p-2 border-2 border-red-200 uppercase">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-black text-white font-black py-5 rounded hover:bg-zinc-800 transition sketch-border uppercase tracking-widest text-xl italic"
          >
            {isRegistering ? 'РЕГИСТРАЦИЯ' : 'АВТОРИЗАЦИЯ'}
          </button>
        </form>

        <div className="mt-8 text-center border-t-4 border-black pt-6">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-black font-black text-xs hover:bg-black hover:text-white transition px-3 py-1 uppercase tracking-widest border border-black/20"
          >
            {isRegistering ? 'Есть запись? Войти' : 'Нет записи? Создать'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user } = useAppState();

  if (!user) {
    return <LoginView />;
  }

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<CatListView />} />
          <Route path="/cats/new" element={<CatCreateView />} />
          <Route path="/cats/:id" element={<CatDetailView />} />
          <Route path="/team" element={<TeamBuilderView />} />
          <Route path="/branches" element={<BranchManagementView />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

const App: React.FC = () => {
  return (
    <StateProvider>
      <AppContent />
    </StateProvider>
  );
};

export default App;
