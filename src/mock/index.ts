export const STORE = {
  id: 'company-1',
  // image: show image 48x48
  image: 'images/logo.png',
  name: 'Bitcoin Mendoza |🇦🇷',
  website: 'https://t.me/bitcoinmendoza',
  lnaddress: process.env.NEXT_LN_ADDRESS,
};

export const CHECKOUT = {
  success_url: '',
  cancel_url: '',
  // submit_type: '' | 'donate'
  submit_type: 'donate',
  // locale: only 'en'
  locale: 'en',
};

export const PRODUCT = {
  id: 'Cowork ticket',
  // image: 4/3 aspect ratio
  image:
    'images/btc-pizza-day.webp',
  name: `Bitcoin Pizza Day 🍕 Mendoza 2025`,
  description: `¡Celebra el Bitcoin Pizza Day 2025 en Mendoza!
Únete a nosotros el 22/05 en [lugar] para conmemorar el histórico día en que se compraron las primeras pizzas pagando con Bitcoin. Disfruta de una tarde llena de pizza, charlas sobre Bitcoin, Nostr y Lightning Network, además networking entre bitcoiners y actividades especiales.
¿Qué incluye? Deliciosas pizzas, bebidas, ponencias sobre el futuro de Bitcoin y más.

¿Para quién? Entusiastas de Bitcoin, curiosos y amantes de la pizza por igual.

¡No te pierdas esta oportunidad de celebrar la revolución del dinero digital con un buen slice en mano! #BitcoinPizzaDay #Mendoza2025

`,
  price: 1,
  // currency: only 'SAT'
  currency: 'SAT',
  variants: null,
};
