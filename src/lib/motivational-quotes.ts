// Motivational quotes for fitness and wellness

export interface MotivationalQuote {
  text: string;
  author?: string;
  category: 'fitness' | 'discipline' | 'success' | 'health' | 'motivation';
}

export const motivationalQuotes: MotivationalQuote[] = [
  {
    text: "A dor que você sente hoje será a força que você sentirá amanhã.",
    category: "fitness"
  },
  {
    text: "O corpo alcança o que a mente acredita.",
    category: "motivation"
  },
  {
    text: "Não importa quão devagar você vá, desde que não pare.",
    author: "Confúcio",
    category: "discipline"
  },
  {
    text: "O sucesso não é final, o fracasso não é fatal: é a coragem de continuar que conta.",
    author: "Winston Churchill",
    category: "success"
  },
  {
    text: "Seu corpo pode aguentar quase tudo. É sua mente que você precisa convencer.",
    category: "fitness"
  },
  {
    text: "A única pessoa que você está destinado a se tornar é a pessoa que você decide ser.",
    author: "Ralph Waldo Emerson",
    category: "motivation"
  },
  {
    text: "Não se trata de ter tempo. Se trata de fazer tempo.",
    category: "discipline"
  },
  {
    text: "A diferença entre tentar e triunfar é apenas um pouco de umph!",
    category: "motivation"
  },
  {
    text: "Acredite em você mesmo e tudo será possível.",
    category: "motivation"
  },
  {
    text: "Treine como se sua vida dependesse disso. Sua saúde depende.",
    category: "health"
  },
  {
    text: "O único treino ruim é aquele que você não fez.",
    category: "fitness"
  },
  {
    text: "Seu futuro é criado pelo que você faz hoje, não amanhã.",
    author: "Robert Kiyosaki",
    category: "discipline"
  },
  {
    text: "A motivação é o que te faz começar. O hábito é o que te mantém.",
    category: "discipline"
  },
  {
    text: "Você não precisa ser extremo, apenas consistente.",
    category: "discipline"
  },
  {
    text: "O progresso, não a perfeição, é o objetivo.",
    category: "motivation"
  },
  {
    text: "Seu único limite é você.",
    category: "motivation"
  },
  {
    text: "Transpire agora, brilhe depois.",
    category: "fitness"
  },
  {
    text: "A força não vem da capacidade física. Vem de uma vontade indomável.",
    author: "Mahatma Gandhi",
    category: "motivation"
  },
  {
    text: "Comece onde você está. Use o que você tem. Faça o que você pode.",
    author: "Arthur Ashe",
    category: "motivation"
  },
  {
    text: "O caminho para o sucesso é sempre em construção.",
    category: "success"
  },
  {
    text: "Cuidar do seu corpo é a melhor forma de cuidar da sua mente.",
    category: "health"
  },
  {
    text: "Todo campeão foi uma vez um competidor que se recusou a desistir.",
    category: "fitness"
  },
  {
    text: "A disciplina é a ponte entre metas e conquistas.",
    author: "Jim Rohn",
    category: "discipline"
  },
  {
    text: "Você é mais forte do que pensa.",
    category: "motivation"
  },
  {
    text: "Grandes coisas nunca vêm de zonas de conforto.",
    category: "motivation"
  },
  {
    text: "A consistência é a chave para alcançar e manter momentum.",
    category: "discipline"
  },
  {
    text: "Transforme seu 'não posso' em 'posso' e seus sonhos em planos.",
    category: "motivation"
  },
  {
    text: "O desconforto temporário é o preço do sucesso permanente.",
    category: "fitness"
  },
  {
    text: "Faça hoje o que outros não querem, tenha amanhã o que outros não têm.",
    category: "discipline"
  },
  {
    text: "Sua saúde é um investimento, não uma despesa.",
    category: "health"
  }
];

/**
 * Get a random motivational quote
 */
export function getRandomQuote(category?: MotivationalQuote['category']): MotivationalQuote {
  const filteredQuotes = category 
    ? motivationalQuotes.filter(q => q.category === category)
    : motivationalQuotes;
  
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  return filteredQuotes[randomIndex];
}

/**
 * Get a daily quote (same quote for the whole day)
 */
export function getDailyQuote(): MotivationalQuote {
  const today = new Date().toDateString();
  const hash = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % motivationalQuotes.length;
  return motivationalQuotes[index];
}

/**
 * Get morning motivation message
 */
export function getMorningMotivation(): MotivationalQuote {
  return getRandomQuote('motivation');
}
