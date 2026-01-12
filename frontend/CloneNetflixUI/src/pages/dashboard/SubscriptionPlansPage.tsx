// src/pages/SubscriptionPlansPage.tsx
import React from "react";
import GooglePayButton from "@google-pay/button-react";
import {
  Check,
  X,
  Users,
  Tv,
  Download,
  Shield,
  Sparkles,
  Zap,
  Lock,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const SubscriptionPlansPage: React.FC = () => {
  const { t, language } = useLanguage();
  const googlePayBaseConfig = {
    environment: "TEST" as const, // Змініть на "PRODUCTION" після налаштування
    buttonLocale: language === 'uk' ? "uk" : "en",
    buttonType: "subscribe" as const,
    buttonSizeMode: "fill" as const,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-gray-100 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок сторінки */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {t('subscription.choose_plan')}
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {t('subscription.choose_plan_desc')}
          </p>
        </div>

        {/* Картки планів */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {/* ========== БАЗОВИЙ ========== */}
          <div className="relative bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 hover:border-gray-700 transition-all duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">{t('subscription.basic')}</h2>
              <p className="text-4xl font-black text-gray-100">{t('subscription.basic_free')}</p>
              <p className="text-gray-500 mt-2">{t('subscription.basic_with_ads')}</p>
            </div>

            <ul className="space-y-5 mb-10">
              <li className="flex items-start gap-4">
                <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{t('subscription.basic_access')}</p>
                  <p className="text-sm text-gray-500">{t('subscription.basic_access_desc')}</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{t('subscription.basic_recommendations')}</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <X className="w-6 h-6 text-gray-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-500">{t('subscription.basic_no_features')}</p>
              </li>
            </ul>

            <button className="w-full py-4 rounded-2xl font-bold text-lg bg-gray-800 hover:bg-gray-700 transition">
              {t('subscription.basic_continue')}
            </button>
          </div>

          {/* ========== СТАНДАРТ ========== */}
          <div className="relative bg-gradient-to-b from-indigo-900/30 to-purple-900/20 backdrop-blur-xl border border-indigo-600/50 rounded-3xl p-8 shadow-2xl shadow-indigo-900/30 transform scale-105 z-10">
            {/* Бейдж "Найпопулярніший" */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-bold text-white rounded-full shadow-2xl whitespace-nowrap">
                <Sparkles className="w-4 h-4" />
                {t('subscription.most_popular')}
              </span>
            </div>

            <div className="text-center mb-8 mt-4">
              <h2 className="text-2xl font-bold mb-2">{t('subscription.standard')}</h2>
              <p className="text-5xl font-black text-white">
                199 <span className="text-xl font-normal text-gray-400">{t('subscription.standard_price')}</span>
              </p>
              <p className="text-indigo-300 mt-2">{t('subscription.standard_features')}</p>
            </div>

            <ul className="space-y-5 mb-10">
              <li className="flex items-start gap-4">
                <Check className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div><p className="font-medium">{t('subscription.standard_all_basic')}</p></div>
              </li>
              <li className="flex items-start gap-4">
                <Zap className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div><p className="font-medium">{t('subscription.standard_full_hd')}</p></div>
              </li>
              <li className="flex items-start gap-4">
                <Tv className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div><p className="font-medium">{t('subscription.standard_no_ads')}</p></div>
              </li>
              <li className="flex items-start gap-4">
                <Download className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div><p className="font-medium">{t('subscription.standard_offline')}</p></div>
              </li>
              <li className="flex items-start gap-4">
                <Users className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div><p className="font-medium">{t('subscription.standard_devices')}</p></div>
              </li>
              <li className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div><p className="font-medium">{t('subscription.standard_parental')}</p></div>
              </li>
            </ul>

            {/* Кастомна кнопка Стандарт */}
            <div className="relative group">
              <button className="w-full py-6 rounded-3xl font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 
                                 hover:from-indigo-500 hover:to-purple-500 
                                 shadow-2xl shadow-indigo-900/60 
                                 transition-all duration-500 
                                 transform hover:scale-105 hover:shadow-3xl 
                                 flex items-center justify-center gap-4 
                                 border border-indigo-500/30 relative overflow-hidden">
                <Lock className="w-7 h-7 text-white/90" />
                <span>{t('subscription.standard_subscribe')}</span>
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              </button>

              {/* Прихований Google Pay */}
              <div className="absolute inset-0 opacity-0 overflow-hidden rounded-3xl">
                <GooglePayButton
                  {...googlePayBaseConfig}
                  paymentRequest={{
                    apiVersion: 2,
                    apiVersionMinor: 0,
                    allowedPaymentMethods: [
                      {
                        type: "CARD",
                        parameters: {
                          allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                          allowedCardNetworks: ["MASTERCARD", "VISA"],
                        },
                        tokenizationSpecification: {
                          type: "PAYMENT_GATEWAY",
                          parameters: {
                            gateway: "example", // Замініть на ваш шлюз
                            gatewayMerchantId: "your_merchant_id",
                          },
                        },
                      },
                    ],
                    merchantInfo: {
                      merchantId: "BCR2DN4T37JZ5X7P", // Ваш реальний merchantId
                      merchantName: "Nexo Cinema",
                    },
                    transactionInfo: {
                      totalPriceStatus: "FINAL",
                      totalPrice: "199.00",
                      currencyCode: "UAH",
                      countryCode: "UA",
                    },
                    callbackIntents: ["PAYMENT_AUTHORIZATION"],
                  }}
                  onLoadPaymentData={(paymentData) => {
                    console.log("Стандарт: оплата успішна", paymentData);
                    // Надішліть paymentData на бекенд для створення підписки
                  }}
                  onPaymentAuthorized={() => ({ transactionState: "SUCCESS" })}
                  onError={(error) => console.error("Google Pay error:", error)}
                />
              </div>
            </div>
          </div>

          {/* ========== ПРЕМІУМ ========== */}
          <div className="relative bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 hover:border-gray-700 transition-all duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">{t('subscription.premium')}</h2>
              <p className="text-5xl font-black text-white">
                299 <span className="text-xl font-normal text-gray-400">{t('subscription.standard_price')}</span>
              </p>
              <p className="text-purple-300 mt-2">{t('subscription.premium_features')}</p>
            </div>

            <ul className="space-y-5 mb-10">
              <li className="flex items-start gap-4">
                <Check className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5" />
                <div><p className="font-medium">{t('subscription.premium_all_standard')}</p></div>
              </li>
              <li className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div><p className="font-medium">{t('subscription.premium_4k')}</p></div>
              </li>
              <li className="flex items-start gap-4">
                <Users className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5" />
                <div><p className="font-medium">{t('subscription.premium_devices')}</p></div>
              </li>
              <li className="flex items-start gap-4">
                <Check className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5" />
                <div><p className="font-medium">{t('subscription.premium_exclusive')}</p></div>
              </li>
            </ul>

            {/* Кастомна кнопка Преміум */}
            <div className="relative group">
              <button className="w-full py-6 rounded-3xl font-bold text-xl bg-gradient-to-r from-purple-600 to-indigo-600 
                                 hover:from-purple-500 hover:to-indigo-500 
                                 shadow-2xl shadow-purple-900/60 
                                 transition-all duration-500 
                                 transform hover:scale-105 hover:shadow-3xl 
                                 flex items-center justify-center gap-4 
                                 border border-purple-500/30 relative overflow-hidden">
                <Lock className="w-7 h-7 text-white/90" />
                <span>{t('subscription.premium_subscribe')}</span>
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              </button>

              {/* Прихований Google Pay */}
              <div className="absolute inset-0 opacity-0 overflow-hidden rounded-3xl">
                <GooglePayButton
                  {...googlePayBaseConfig}
                  paymentRequest={{
                    apiVersion: 2,
                    apiVersionMinor: 0,
                    allowedPaymentMethods: [
                      {
                        type: "CARD",
                        parameters: {
                          allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                          allowedCardNetworks: ["MASTERCARD", "VISA"],
                        },
                        tokenizationSpecification: {
                          type: "PAYMENT_GATEWAY",
                          parameters: {
                            gateway: "example",
                            gatewayMerchantId: "your_merchant_id",
                          },
                        },
                      },
                    ],
                    merchantInfo: {
                      merchantId: "BCR2DN4T37JZ5X7P",
                      merchantName: "Nexo Cinema",
                    },
                    transactionInfo: {
                      totalPriceStatus: "FINAL",
                      totalPrice: "299.00",
                      currencyCode: "UAH",
                      countryCode: "UA",
                    },
                    callbackIntents: ["PAYMENT_AUTHORIZATION"],
                  }}
                  onLoadPaymentData={(paymentData) => {
                    console.log("Преміум: оплата успішна", paymentData);
                    // Обробка на бекенді
                  }}
                  onPaymentAuthorized={() => ({ transactionState: "SUCCESS" })}
                  onError={(error) => console.error("Google Pay error:", error)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Нижній текст */}
        <div className="text-center mt-20">
          <p className="text-gray-500 text-sm">
            {t('subscription.footer')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlansPage;