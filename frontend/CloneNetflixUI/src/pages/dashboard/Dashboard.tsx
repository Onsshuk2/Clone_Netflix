import { useEffect } from "react";
import { Sparkles, Zap, ArrowRight } from "lucide-react";

export default function WelcomeDashboard() {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <>
      {/* Анімований фон на весь екран */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" />
        <div className="absolute inset-0 bg-black/50" />

        {/* Плавні анімовані градієнтні кулі */}
        <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-32 -right-32 w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Основний контент — притиснутий до верху */}
      <div className="relative min-h-screen pt-20 pb-32 px-6 lg:px-12 xl:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-start">
            {/* Лівий блок — текст */}
            <div className="space-y-8 max-w-2xl">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 animate-in fade-in slide-in-from-left duration-700">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-medium">
                  Вітаємо у твоєму новому просторі!
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight animate-in fade-in slide-in-from-left duration-700 delay-200">
                Ласкаво просимо,
                <br />
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent animate-gradient">
                  друже
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-gray-300 leading-relaxed animate-in fade-in slide-in-from-left duration-700 delay-300">
                Ти успішно приєднався до найкращої платформи 2025 року. Тепер у
                тебе є всі інструменти, щоб рости швидше за всіх.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 pt-6 animate-in fade-in slide-in-from-left duration-700 delay-500">
                <button className="group px-10 py-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl font-semibold text-lg shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all hover:scale-105 flex items-center justify-center gap-3">
                  Почати зараз
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition" />
                </button>
                <button className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl font-medium hover:bg-white/20 transition-all">
                  Дізнатися більше
                </button>
              </div>

              {/* Переваги */}
            </div>

            {/* Правий блок — карточка плану */}
            <div className="flex justify-center lg:justify-end animate-in fade-in slide-in-from-right duration-1000 delay-300">
              <div className="relative group">
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-10 shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 w-96 lg:w-full max-w-md">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl opacity-60" />

                  <div className="relative z-10 space-y-8">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Zap className="w-12 h-12 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">Твій план</h3>
                        <p className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                          PRO Ultra
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="flex justify-between text-lg">
                        <span className="text-gray-300">Стартовий бонус</span>
                        <span className="font-bold text-emerald-400">
                          +5000 кредитів
                        </span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span className="text-gray-300">Швидкість</span>
                        <span className="font-bold">Turbo Mode ×10</span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/20 text-center">
                      <p className="text-sm text-gray-400 font-medium">
                        Ти вже в топ-1% користувачів
                      </p>
                    </div>
                  </div>
                </div>

                {/* Декор */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Анімації */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.1); }
          66% { transform: translate(-30px, 40px) scale(0.9); }
        }
        .animate-blob { animation: blob 25s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
      `}</style>
    </>
  );
}
