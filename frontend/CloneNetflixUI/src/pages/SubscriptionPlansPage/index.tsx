import React from "react";
import GooglePayButton from "@google-pay/button-react";

const SubscriptionPlansPage: React.FC = () => {
  return (
    <div className="w-full min-h-screen p-3 bg-black text-white font-sans">
      <h1 className="text-2xl mb-5 text-center">Функції</h1>
      <div className="flex flex-row gap-5 justify-center">
        <div className="text-center border border-gray-700 p-5 rounded-lg flex-1">
          <h2 className="font-bold text-lg">Базовий</h2>
          <p className="mb-4">Безкоштовно</p>
          <ul className="list-none p-0 text-left">
            <li>✔ Доступ до фільмів</li>
            <li className="text-gray-500">
              Дивіться класичні фільми та популярні хіти в базовій якості з
              рекламою, як на Netflix з безмежним натхненням для вечірнього
              перегляду.
            </li>
            <li>✔ Рекомендації фільмів</li>
            <li className="text-gray-500">
              Отримуйте персоналізовані рекомендації на основі ваших уподобань,
              ніби Netflix знає, що ви хочете побачити наступним.
            </li>
            <li>✘ HD якість НОВИНКА</li>
            <li className="text-gray-500">
              Насолоджуйтесь чітким зображенням у HD, ідеальним для сімейних
              вечорів чи романтичних побачень, без розмитостей – як у
              справжньому кінотеатрі вдома.
            </li>
            <li>✘ Без реклами</li>
            <li>✘ Офлайн завантаження</li>
            <li>✘ До 2 пристроїв одночасно</li>
            <li>✘ Ексклюзивні фільми</li>
            <li className="text-gray-500">
              Доступ до оригінальних фільмів та серіалів, створених спеціально
              для платформи, з захоплюючими сюжетами, що тримають у напрузі до
              останньої хвилини.
            </li>
            <li>✘ Батьківський контроль</li>
            <li className="text-gray-500">
              Налаштуйте профілі для дітей з обмеженням контенту, щоб перегляд
              був безпечним та веселим для всієї родини.
            </li>
            <li>✘ 4K Ultra HD</li>
            <li className="text-gray-500">
              Переглядайте в приголомшливій 4K якості з HDR, де кожна деталь
              оживає, ніби ви в центрі подій фільму.
            </li>
            <li>✘ До 4 пристроїв НОВИНКА</li>
            <li className="text-gray-500">
              Діліться акаунтом з родиною: дивіться одночасно на 4 пристроях,
              кожен у своєму профілі з персональними рекомендаціями.
            </li>
          </ul>
        </div>
        <div className="text-center border border-gray-700 p-5 rounded-lg flex-1">
          <h2 className="font-bold text-lg">Стандарт</h2>
          <p className="mb-4">HD якість, до 2 пристроїв</p>
          <GooglePayButton
            environment="TEST"
            buttonLocale="uk"
            buttonType="subscribe"
            buttonColor="black"
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
                      gateway: "example", // Replace with your gateway
                      gatewayMerchantId: "exampleGatewayMerchantId", // Replace with your gateway merchant ID
                    },
                  },
                },
              ],
              merchantInfo: {
                merchantId: "12345678901234567890", // Replace with your Google Pay merchant ID
                merchantName: "Your App Name",
              },
              transactionInfo: {
                totalPriceStatus: "FINAL",
                totalPriceLabel: "Total",
                totalPrice: "9.99", // Replace with the actual price for Standard plan
                currencyCode: "UAH", // Or USD, etc.
                countryCode: "UA",
              },
            }}
            onLoadPaymentData={(paymentData) => {
              console.log("Success", paymentData);
              // Handle the payment data: send to your server to process the subscription
            }}
            className="mb-4"
          />
          <ul className="list-none p-0 text-left">
            <li>✔ Доступ до фільмів</li>
            <li className="text-gray-500">
              Дивіться класичні фільми та популярні хіти в базовій якості з
              рекламою, як на Netflix з безмежним натхненням для вечірнього
              перегляду.
            </li>
            <li>✔ Рекомендації фільмів</li>
            <li className="text-gray-500">
              Отримуйте персоналізовані рекомендації на основі ваших уподобань,
              ніби Netflix знає, що ви хочете побачити наступним.
            </li>
            <li className="text-orange-500">✔ HD якість НОВИНКА</li>
            <li className="text-gray-500">
              Насолоджуйтесь чітким зображенням у HD, ідеальним для сімейних
              вечорів чи романтичних побачень, без розмитостей – як у
              справжньому кінотеатрі вдома.
            </li>
            <li>✔ Без реклами</li>
            <li>✔ Офлайн завантаження</li>
            <li>✔ До 2 пристроїв одночасно</li>
            <li>✔ Ексклюзивні фільми</li>
            <li className="text-gray-500">
              Доступ до оригінальних фільмів та серіалів, створених спеціально
              для платформи, з захоплюючими сюжетами, що тримають у напрузі до
              останньої хвилини.
            </li>
            <li>✔ Батьківський контроль</li>
            <li className="text-gray-500">
              Налаштуйте профілі для дітей з обмеженням контенту, щоб перегляд
              був безпечним та веселим для всієї родини.
            </li>
            <li>✘ 4K Ultra HD</li>
            <li className="text-gray-500">
              Переглядайте в приголомшливій 4K якості з HDR, де кожна деталь
              оживає, ніби ви в центрі подій фільму.
            </li>
            <li>✘ До 4 пристроїв НОВИНКА</li>
            <li className="text-gray-500">
              Діліться акаунтом з родиною: дивіться одночасно на 2 пристроях,
              кожен у своєму профілі з персональними рекомендаціями.
            </li>
          </ul>
        </div>
        <div className="text-center border border-gray-700 p-5 rounded-lg flex-1">
          <h2 className="font-bold text-lg">Преміум</h2>
          <p className="mb-4">4K якість, до 4 пристроїв</p>
          <GooglePayButton
            environment="TEST"
            buttonLocale="uk"
            buttonType="subscribe"
            buttonColor="black"
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
                      gateway: "example", // Replace with your gateway
                      gatewayMerchantId: "exampleGatewayMerchantId", // Replace with your gateway merchant ID
                    },
                  },
                },
              ],
              merchantInfo: {
                merchantId: "12345678901234567890", // Replace with your Google Pay merchant ID
                merchantName: "Your App Name",
              },
              transactionInfo: {
                totalPriceStatus: "FINAL",
                totalPriceLabel: "Total",
                totalPrice: "14.99", // Replace with the actual price for Premium plan
                currencyCode: "UAH", // Or USD, etc.
                countryCode: "UA",
              },
            }}
            onLoadPaymentData={(paymentData) => {
              console.log("Success", paymentData);
              // Handle the payment data: send to your server to process the subscription
            }}
            className="mb-4"
          />
          <ul className="list-none p-0 text-left">
            <li>✔ Доступ до фільмів</li>
            <li className="text-gray-500">
              Дивіться класичні фільми та популярні хіти в базовій якості з
              рекламою, як на Netflix з безмежним натхненням для вечірнього
              перегляду.
            </li>
            <li>✔ Рекомендації фільмів</li>
            <li className="text-gray-500">
              Отримуйте персоналізовані рекомендації на основі ваших уподобань,
              ніби Netflix знає, що ви хочете побачити наступним.
            </li>
            <li className="text-orange-500">✔ HD якість НОВИНКА</li>
            <li className="text-gray-500">
              Насолоджуйтесь чітким зображенням у HD, ідеальним для сімейних
              вечорів чи романтичних побачень, без розмитостей – як у
              справжньому кінотеатрі вдома.
            </li>
            <li>✔ Без реклами</li>
            <li>✔ Офлайн завантаження</li>
            <li>✔ До 2 пристроїв одночасно</li>
            <li>✔ Ексклюзивні фільми</li>
            <li className="text-gray-500">
              Доступ до оригінальних фільмів та серіалів, створених спеціально
              для платформи, з захоплюючими сюжетами, що тримають у напрузі до
              останньої хвилини.
            </li>
            <li>✔ Батьківський контроль</li>
            <li className="text-gray-500">
              Налаштуйте профілі для дітей з обмеженням контенту, щоб перегляд
              був безпечним та веселим для всієї родини.
            </li>
            <li>✔ 4K Ultra HD</li>
            <li className="text-gray-500">
              Переглядайте в приголомшливій 4K якості з HDR, де кожна деталь
              оживає, ніби ви в центрі подій фільму.
            </li>
            <li className="text-orange-500">✔ До 4 пристроїв НОВИНКА</li>
            <li className="text-gray-500">
              Діліться акаунтом з родиною: дивіться одночасно на 4 пристроях,
              кожен у своєму профілі з персональними рекомендаціями.
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-5 text-center">
        <button className="text-white underline">
          ПОСМОТРЕТЬ ВСЕ ФУНКЦИИ ↓
        </button>
      </div>
    </div>
  );
};

export default SubscriptionPlansPage;
