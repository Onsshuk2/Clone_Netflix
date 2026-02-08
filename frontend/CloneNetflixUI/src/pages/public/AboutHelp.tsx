

import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const AboutHelp: React.FC = () => {
  const { t, language } = useLanguage();
  const faqList = [
    'aboutHelp.faq1',
    'aboutHelp.faq2',
    'aboutHelp.faq3',
    'aboutHelp.faq4',
  ];

  // FAQ answers (ua/en)
  const faqAnswers: {
    [key in 'aboutHelp.faq1' | 'aboutHelp.faq2' | 'aboutHelp.faq3' | 'aboutHelp.faq4']: {
      ua: string;
      en: string;
    }
  } = {
    'aboutHelp.faq1': {
      ua: 'Щоб змінити мову сайту, скористайтесь перемикачем мов у верхньому меню.',
      en: 'To change the site language, use the language switcher in the top menu.'
    },
    'aboutHelp.faq2': {
      ua: 'Додати фільм у "Вибране" можна натиснувши на іконку серця на сторінці фільму.',
      en: 'To add a movie to "Favorites", click the heart icon on the movie page.'
    },
    'aboutHelp.faq3': {
      ua: 'Історію переглядів можна переглянути у розділі "Історія переглядів" у профілі.',
      en: 'You can view your watch history in the "Watch History" section in your profile.'
    },
    'aboutHelp.faq4': {
      ua: 'Оформити підписку можна у розділі "Підписки" у профілі користувача.',
      en: 'You can subscribe in the "Subscriptions" section in your profile.'
    }
  };

  const [modalOpen, setModalOpen] = React.useState(false);
  const [activeFaq, setActiveFaq] = React.useState<string | null>(null);

  const handleFaqClick = (key: string) => {
    setActiveFaq(key);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setActiveFaq(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-black to-purple-950 text-white flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-3xl rounded-3xl shadow-2xl bg-black/80 backdrop-blur-lg border border-indigo-900/40 p-10 md:p-16 relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-t-3xl" />
        <div className="flex flex-col items-center text-center mb-10">
          <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="mb-6 text-indigo-400 drop-shadow-lg">
            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 14v-4m0-4h.01" />
          </svg>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
            {t('aboutHelp.title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-light mb-6">
            {t('aboutHelp.description')}
          </p>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" className="text-purple-400">
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 10.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4.5m18 0V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7.5m18 0-9 6.75m-9-6.75 9 6.75" />
            </svg>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              {t('aboutHelp.contact')}
            </h2>
          </div>
          <p className="text-lg text-gray-200 font-medium mb-2">
            {t('aboutHelp.email')}
          </p>
          <div className="text-sm text-gray-400 mb-2">
            Telegram: <a href="https://t.me/nexo_support" className="underline hover:text-purple-300">@nexo_support</a>
          </div>
          <div className="text-sm text-gray-400">
            Instagram: <a href="https://instagram.com/nexo.cinema" className="underline hover:text-purple-300">@nexo.cinema</a>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" className="text-indigo-400">
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
            </svg>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {t('aboutHelp.faq')}
            </h2>
          </div>
          <ul className="space-y-4">
            {faqList.map((key, idx) => (
              <li
                key={key}
                className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-xl p-5 text-left shadow-md border border-indigo-700/20 cursor-pointer hover:bg-indigo-800/60 transition"
                onClick={() => handleFaqClick(key)}
              >
                <span className="font-semibold text-lg text-indigo-300 mr-2">{idx + 1}.</span>
                <span className="text-gray-200 text-base">{t(key)}</span>
              </li>
            ))}
          </ul>

          {/* Modal for FAQ answer */}
          {modalOpen && activeFaq && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-gradient-to-br from-indigo-900 via-black to-purple-900 rounded-2xl shadow-2xl border border-indigo-700/40 p-8 max-w-lg w-full relative animate-fadeIn">
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
                  aria-label="Закрити"
                >
                  ×
                </button>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {t(activeFaq)}
                </h3>
                <p className="text-lg text-gray-200">
                  {faqAnswers[activeFaq as keyof typeof faqAnswers][language === 'uk' ? 'ua' : 'en']}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold text-purple-300 mb-2">{t('aboutHelp.finalTitle')}</h3>
          <p className="text-gray-400 text-base mb-4">
            {t('aboutHelp.finalDesc')}
          </p>
          <p className="text-gray-500 text-sm">
            {t('aboutHelp.finalCopyright')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutHelp;
