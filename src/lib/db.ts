import Dexie, { Table } from 'dexie';

// Types
export interface Exercise {
  id?: number;
  name: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  type: 'compound' | 'isolation';
  equipment: string;
  gifUrl?: string;
  instructions: string[];
  tips: string[];
  isCustom?: boolean;
  createdAt?: Date;
}

export interface WorkoutRoutine {
  id?: number;
  name: string;
  description?: string;
  days: WorkoutDay[];
  createdAt: Date;
  updatedAt: Date;
  isActive: number; // 0 = inactive, 1 = active
}

export interface WorkoutDay {
  id: string;
  name: string;
  exercises: RoutineExercise[];
  dayOfWeek?: number[]; // 0-6 (Sunday-Saturday)
}

export interface RoutineExercise {
  exerciseId: number;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  notes?: string;
  warmupSets?: number;
  order: number;
}

export interface WorkoutSession {
  id?: number;
  routineId?: number;
  routineName: string;
  startTime: Date;
  endTime?: Date;
  exercises: CompletedExercise[];
  notes?: string;
  totalVolume: number; // kg
  duration?: number; // minutes
}

export interface CompletedExercise {
  exerciseId: number;
  exerciseName: string;
  sets: CompletedSet[];
  restSeconds?: number;
}

export interface CompletedSet {
  setNumber: number;
  reps: number;
  weight: number; // kg
  rpe?: number; // 1-10
  isWarmup?: boolean;
  completed: boolean;
  notes?: string;
}

export interface Reminder {
  id?: number;
  type: 'hydration' | 'workout' | 'supplement' | 'stretching' | 'custom';
  title: string;
  message?: string;
  time: Date;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: number[]; // for weekly recurrence
  enabled: boolean;
  createdAt: Date;
  nextTrigger?: Date;
  notificationId?: string;
}

export interface HydrationSettings {
  id?: number;
  enabled: boolean;
  dailyGoalLiters: number;
  glassSize: number; // ml
  reminderInterval: number; // minutes
  startHour: number; // 0-23
  endHour: number; // 0-23
  onboardingCompleted: boolean;
}

export interface HydrationLog {
  id?: number;
  date: Date;
  amount: number; // ml
  time: Date;
}

export interface BodyMeasurement {
  id?: number;
  date: Date;
  weight?: number; // kg
  bodyFat?: number; // %
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
    calves?: number;
  };
  photoUrl?: string;
  notes?: string;
}

export interface UserSettings {
  id?: number;
  theme: 'dark' | 'light';
  defaultRestTime: number; // seconds
  notificationsEnabled: boolean;
  weightUnit: 'kg' | 'lbs';
  firstTimeSetup: boolean;
  onboardingCompleted: boolean;
  hydrationOnboardingCompleted?: boolean;
}

export interface TelegramSettings {
  id?: number;
  enabled: boolean;
  chatId: string;
  botToken?: string;
  dailyMotivationEnabled: boolean;
  dailyMotivationTime: string; // HH:mm format
  lastMotivationalMessage?: Date;
  setupCompleted: boolean;
}

// Database
export class GymFlowDB extends Dexie {
  exercises!: Table<Exercise, number>;
  workoutRoutines!: Table<WorkoutRoutine, number>;
  workoutSessions!: Table<WorkoutSession, number>;
  reminders!: Table<Reminder, number>;
  bodyMeasurements!: Table<BodyMeasurement, number>;
  userSettings!: Table<UserSettings, number>;
  hydrationSettings!: Table<HydrationSettings, number>;
  hydrationLogs!: Table<HydrationLog, number>;
  telegramSettings!: Table<TelegramSettings, number>;

  constructor() {
    super('GymFlowDB');
    
    // Version 2: Original schema
    this.version(2).stores({
      exercises: '++id, name, primaryMuscle, type, equipment, isCustom',
      workoutRoutines: '++id, name, isActive, createdAt',
      workoutSessions: '++id, routineId, startTime, endTime',
      reminders: '++id, type, time, enabled, recurrence, nextTrigger',
      bodyMeasurements: '++id, date, weight',
      userSettings: '++id',
      hydrationSettings: '++id',
      hydrationLogs: '++id, date, time'
    });

    // Version 3: Add Telegram settings
    this.version(3).stores({
      exercises: '++id, name, primaryMuscle, type, equipment, isCustom',
      workoutRoutines: '++id, name, isActive, createdAt',
      workoutSessions: '++id, routineId, startTime, endTime',
      reminders: '++id, type, time, enabled, recurrence, nextTrigger',
      bodyMeasurements: '++id, date, weight',
      userSettings: '++id',
      hydrationSettings: '++id',
      hydrationLogs: '++id, date, time',
      telegramSettings: '++id, enabled, setupCompleted'
    });
  }
}

export const db = new GymFlowDB();

// Seed data - Initial exercise library
export const seedExercises: Omit<Exercise, 'id'>[] = [
  // CHEST
  {
    name: 'Supino Reto com Barra',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Deite no banco reto com os pés apoiados no chão',
      'Segure a barra com pegada um pouco mais larga que os ombros',
      'Desça a barra controladamente até o peito',
      'Empurre a barra de volta até os braços ficarem estendidos'
    ],
    tips: ['Mantenha os ombros retraídos', 'Não tire o quadril do banco', 'Controle a descida']
  },
  {
    name: 'Supino Inclinado com Halteres',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Ombros', 'Tríceps'],
    type: 'compound',
    equipment: 'Halteres',
    instructions: [
      'Ajuste o banco entre 30-45 graus',
      'Segure os halteres acima do peito',
      'Desça controladamente abrindo os cotovelos',
      'Empurre os halteres de volta'
    ],
    tips: ['Foco na parte superior do peito', 'Não exagere na inclinação']
  },
  {
    name: 'Crucifixo com Halteres',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Ombros'],
    type: 'isolation',
    equipment: 'Halteres',
    instructions: [
      'Deite no banco com halteres acima do peito',
      'Abra os braços em arco até sentir alongamento',
      'Retorne à posição inicial contraindo o peito'
    ],
    tips: ['Mantenha leve flexão nos cotovelos', 'Movimento controlado']
  },
  {
    name: 'Flexão de Braço',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros', 'Core'],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Posição de prancha com mãos na largura dos ombros',
      'Desça o corpo mantendo o core contraído',
      'Empurre até os braços ficarem estendidos'
    ],
    tips: ['Corpo em linha reta', 'Olhar para frente']
  },
  {
    name: 'Crossover no Cabo',
    primaryMuscle: 'Peito',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Cabo',
    instructions: [
      'Fique entre as roldanas com cabo alto',
      'Incline levemente para frente',
      'Puxe os cabos em arco até as mãos se encontrarem'
    ],
    tips: ['Contraia o peito no final', 'Movimento contínuo']
  },

  // BACK
  {
    name: 'Barra Fixa',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps', 'Ombros'],
    type: 'compound',
    equipment: 'Barra Fixa',
    instructions: [
      'Segure a barra com pegada pronada (palmas para frente)',
      'Puxe o corpo até o queixo passar a barra',
      'Desça controladamente'
    ],
    tips: ['Depressão escapular primeiro', 'Não balance o corpo']
  },
  {
    name: 'Remada Curvada com Barra',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps', 'Ombros'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Incline o tronco ~45 graus',
      'Puxe a barra até o abdômen',
      'Contraia as escápulas no topo',
      'Desça controladamente'
    ],
    tips: ['Mantenha coluna neutra', 'Cotovelos próximos ao corpo']
  },
  {
    name: 'Puxada Frontal',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps', 'Ombros'],
    type: 'compound',
    equipment: 'Máquina',
    instructions: [
      'Sente na máquina e segure a barra larga',
      'Puxe a barra até a altura do peito',
      'Contraia as costas no final',
      'Retorne controladamente'
    ],
    tips: ['Não use momentum', 'Puxe com as costas, não com os braços']
  },
  {
    name: 'Remada Unilateral com Halter',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps'],
    type: 'compound',
    equipment: 'Halteres',
    instructions: [
      'Apoie um joelho e uma mão no banco',
      'Puxe o halter até a cintura',
      'Contraia a escápula no topo',
      'Desça controladamente'
    ],
    tips: ['Mantenha tronco paralelo ao chão', 'Não rotacione o tronco']
  },
  {
    name: 'Levantamento Terra',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Glúteos', 'Posterior', 'Core'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Barra sobre o mediopé, pés na largura dos quadris',
      'Segure a barra e levante mantendo costas retas',
      'Estenda quadris e joelhos simultaneamente',
      'Desça controladamente'
    ],
    tips: ['Coluna neutra sempre', 'Barra próxima ao corpo', 'Exercício técnico - aprenda bem']
  },
  {
    name: 'Pullover com Halter',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Peito', 'Tríceps'],
    type: 'isolation',
    equipment: 'Halteres',
    instructions: [
      'Deite perpendicular no banco (só ombros apoiados)',
      'Segure um halter acima do peito',
      'Desça em arco atrás da cabeça',
      'Puxe de volta contraindo dorsais'
    ],
    tips: ['Quadril abaixo dos ombros', 'Alongamento controlado']
  },

  // LEGS
  {
    name: 'Agachamento Livre',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Glúteos', 'Core'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Barra apoiada no trapézio, pés na largura dos quadris',
      'Desça quebrando quadris e joelhos',
      'Vá até paralelo ou abaixo',
      'Empurre pelos calcanhares para subir'
    ],
    tips: ['Joelhos alinhados com os pés', 'Peito para cima', 'Core contraído']
  },
  {
    name: 'Leg Press 45°',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Glúteos'],
    type: 'compound',
    equipment: 'Máquina',
    instructions: [
      'Posicione os pés na plataforma (largura dos ombros)',
      'Desça até joelhos ~90 graus',
      'Empurre a plataforma até quase estender as pernas',
      'Não trave os joelhos'
    ],
    tips: ['Lombar sempre apoiada', 'Amplitude completa']
  },
  {
    name: 'Stiff (Levantamento Terra Romeno)',
    primaryMuscle: 'Posterior',
    secondaryMuscles: ['Glúteos', 'Lombar'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Segure a barra na frente das coxas',
      'Flexione quadris empurrando glúteos para trás',
      'Desça a barra até meio da canela',
      'Retorne contraindo posterior e glúteos'
    ],
    tips: ['Joelhos levemente flexionados', 'Barra próxima às pernas', 'Alongamento controlado']
  },
  {
    name: 'Cadeira Extensora',
    primaryMuscle: 'Quadríceps',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Máquina',
    instructions: [
      'Sente e ajuste o apoio nos tornozelos',
      'Estenda as pernas até a contração máxima',
      'Desça controladamente'
    ],
    tips: ['Contraia o quadríceps no topo', 'Movimento isolado']
  },
  {
    name: 'Cadeira Flexora',
    primaryMuscle: 'Posterior',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Máquina',
    instructions: [
      'Deite na máquina com joelhos no pivô',
      'Flexione os joelhos trazendo calcanhares ao glúteo',
      'Contraia posterior no topo',
      'Retorne controladamente'
    ],
    tips: ['Não tire quadris do banco', 'Amplitude completa']
  },
  {
    name: 'Agachamento Búlgaro',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Glúteos'],
    type: 'compound',
    equipment: 'Halteres',
    instructions: [
      'Pé traseiro elevado em banco',
      'Desça flexionando joelho da frente',
      'Mantenha tronco ereto',
      'Empurre para subir'
    ],
    tips: ['Equilíbrio é desafiador', 'Ótimo para glúteos']
  },
  {
    name: 'Elevação Pélvica (Hip Thrust)',
    primaryMuscle: 'Glúteos',
    secondaryMuscles: ['Posterior'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Apoie as costas no banco',
      'Barra sobre os quadris (use almofada)',
      'Empurre os quadris para cima',
      'Contraia glúteos no topo'
    ],
    tips: ['Tíbias verticais no topo', 'Contração intensa dos glúteos']
  },
  {
    name: 'Panturrilha em Pé',
    primaryMuscle: 'Panturrilha',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Máquina',
    instructions: [
      'Apoie os ombros na máquina',
      'Suba nas pontas dos pés',
      'Contraia as panturrilhas no topo',
      'Desça alongando'
    ],
    tips: ['Amplitude máxima', 'Pausa no topo']
  },

  // SHOULDERS
  {
    name: 'Desenvolvimento com Barra',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Tríceps', 'Core'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Barra na altura do peito (em pé ou sentado)',
      'Empurre a barra acima da cabeça',
      'Estenda completamente os braços',
      'Desça controladamente'
    ],
    tips: ['Core estável', 'Não arquear demais as costas']
  },
  {
    name: 'Desenvolvimento com Halteres',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Tríceps'],
    type: 'compound',
    equipment: 'Halteres',
    instructions: [
      'Halteres na altura dos ombros',
      'Empurre acima da cabeça',
      'Não trave os cotovelos',
      'Desça controladamente'
    ],
    tips: ['Maior amplitude que a barra', 'Palmas para frente']
  },
  {
    name: 'Elevação Lateral',
    primaryMuscle: 'Ombros',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Halteres',
    instructions: [
      'Halteres ao lado do corpo',
      'Eleve lateralmente até a altura dos ombros',
      'Cotovelos levemente flexionados',
      'Desça controladamente'
    ],
    tips: ['Não balance o corpo', 'Foco no deltoide lateral']
  },
  {
    name: 'Elevação Frontal',
    primaryMuscle: 'Ombros',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Halteres',
    instructions: [
      'Halteres na frente das coxas',
      'Eleve à frente até a altura dos olhos',
      'Cotovelos levemente flexionados',
      'Desça controladamente'
    ],
    tips: ['Alternado ou simultâneo', 'Deltoide anterior']
  },
  {
    name: 'Crucifixo Inverso',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Costas'],
    type: 'isolation',
    equipment: 'Halteres',
    instructions: [
      'Incline o tronco até paralelo ao chão',
      'Abra os braços lateralmente em arco',
      'Contraia escápulas e ombros',
      'Retorne controladamente'
    ],
    tips: ['Foco no deltoide posterior', 'Movimento lento']
  },
  {
    name: 'Encolhimento com Halteres',
    primaryMuscle: 'Trapézio',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Halteres',
    instructions: [
      'Halteres ao lado do corpo',
      'Eleve os ombros em direção às orelhas',
      'Contraia o trapézio no topo',
      'Desça controladamente'
    ],
    tips: ['Não rotacione os ombros', 'Movimento vertical']
  },

  // ARMS - Biceps
  {
    name: 'Rosca Direta com Barra',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    type: 'isolation',
    equipment: 'Barra',
    instructions: [
      'Barra na frente do corpo, pegada supinada',
      'Flexione os cotovelos levando barra ao peito',
      'Contraia bíceps no topo',
      'Desça controladamente'
    ],
    tips: ['Cotovelos fixos', 'Não balance o corpo']
  },
  {
    name: 'Rosca Alternada com Halteres',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    type: 'isolation',
    equipment: 'Halteres',
    instructions: [
      'Halteres ao lado do corpo',
      'Alterne os braços flexionando os cotovelos',
      'Gire o punho durante o movimento (supinação)',
      'Desça controladamente'
    ],
    tips: ['Supinação completa', 'Não ajudar com ombros']
  },
  {
    name: 'Rosca Martelo',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: ['Antebraço', 'Braquial'],
    type: 'isolation',
    equipment: 'Halteres',
    instructions: [
      'Halteres ao lado, palmas uma de frente para outra',
      'Flexione cotovelos mantendo pegada neutra',
      'Contraia no topo',
      'Desça controladamente'
    ],
    tips: ['Foca no braquial', 'Pegada neutra o tempo todo']
  },
  {
    name: 'Rosca Scott (Banco Scott)',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Barra',
    instructions: [
      'Braços apoiados no banco inclinado',
      'Flexione os cotovelos com barra W ou reta',
      'Contraia o bíceps',
      'Desça controladamente sem estender totalmente'
    ],
    tips: ['Isola completamente o bíceps', 'Não estenda demais']
  },

  // ARMS - Triceps
  {
    name: 'Tríceps Testa (Skull Crusher)',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Barra',
    instructions: [
      'Deitado, barra acima do peito',
      'Flexione apenas cotovelos, desça barra à testa',
      'Estenda os cotovelos de volta',
      'Mantenha ombros fixos'
    ],
    tips: ['Cotovelos para dentro', 'Movimento isolado']
  },
  {
    name: 'Tríceps Pulley (Puxada no Cabo)',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Cabo',
    instructions: [
      'Cabo alto com corda ou barra',
      'Cotovelos fixos ao lado do corpo',
      'Estenda os braços para baixo',
      'Contraia tríceps no final'
    ],
    tips: ['Não mover os cotovelos', 'Contração completa']
  },
  {
    name: 'Tríceps Francês com Halter',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Halteres',
    instructions: [
      'Sentado ou em pé, halter acima da cabeça',
      'Desça o halter atrás da cabeça flexionando cotovelos',
      'Estenda os braços de volta',
      'Cotovelos apontando para cima'
    ],
    tips: ['Alongamento máximo', 'Cuidado com o ombro']
  },
  {
    name: 'Mergulho em Paralelas',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: ['Peito', 'Ombros'],
    type: 'compound',
    equipment: 'Paralelas',
    instructions: [
      'Apoie nas barras paralelas',
      'Desça flexionando os cotovelos',
      'Tronco vertical (foco em tríceps)',
      'Empurre de volta até estender braços'
    ],
    tips: ['Cotovelos para trás', 'Não descer demais']
  },

  // CORE/ABS
  {
    name: 'Prancha (Plank)',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Ombros', 'Glúteos'],
    type: 'isolation',
    equipment: 'Peso Corporal',
    instructions: [
      'Apoio nos antebraços e pontas dos pés',
      'Corpo em linha reta',
      'Mantenha a posição (isométrico)',
      'Core totalmente contraído'
    ],
    tips: ['Não deixar quadril cair', 'Respiração constante']
  },
  {
    name: 'Abdominal Supra',
    primaryMuscle: 'Core',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Peso Corporal',
    instructions: [
      'Deitado de costas, joelhos flexionados',
      'Eleve o tronco em direção aos joelhos',
      'Contraia abdômen no topo',
      'Desça controladamente'
    ],
    tips: ['Não puxar o pescoço', 'Movimento curto']
  },
  {
    name: 'Elevação de Pernas',
    primaryMuscle: 'Core',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Peso Corporal',
    instructions: [
      'Deitado ou pendurado na barra',
      'Eleve as pernas estendidas ou flexionadas',
      'Contraia abdômen inferior',
      'Desça controladamente'
    ],
    tips: ['Não balançar', 'Foco no abdômen inferior']
  },
  {
    name: 'Abdominal na Polia',
    primaryMuscle: 'Core',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Cabo',
    instructions: [
      'Ajoelhado de frente para polia alta',
      'Segure corda próxima à cabeça',
      'Flexione o tronco contraindo abdômen',
      'Retorne controladamente'
    ],
    tips: ['Quadris fixos', 'Contração intensa']
  },
  {
    name: 'Rotação Russa',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Oblíquos'],
    type: 'isolation',
    equipment: 'Peso Corporal',
    instructions: [
      'Sentado com tronco inclinado para trás',
      'Pés elevados (opcional)',
      'Rotacione o tronco de um lado para outro',
      'Pode segurar peso'
    ],
    tips: ['Movimento controlado', 'Foco nos oblíquos']
  },

  // CHEST - Additional variations
  {
    name: 'Supino Declinado com Barra',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Tríceps'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Deite no banco declinado (-15 a -30 graus)',
      'Segure a barra com pegada média',
      'Desça até o peito inferior',
      'Empurre de volta'
    ],
    tips: ['Foco na parte inferior do peito', 'Prenda os pés']
  },
  {
    name: 'Supino com Pegada Fechada',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: ['Peito'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Pegada mais estreita que os ombros',
      'Desça a barra ao centro do peito',
      'Cotovelos próximos ao corpo',
      'Empurre focando nos tríceps'
    ],
    tips: ['Excelente para tríceps', 'Não feche demais a pegada']
  },
  {
    name: 'Flexão com Pés Elevados',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Ombros', 'Tríceps'],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Pés elevados em banco ou caixa',
      'Desça até peito próximo ao chão',
      'Empurre de volta'
    ],
    tips: ['Mais difícil que flexão normal', 'Foco superior do peito']
  },
  {
    name: 'Flexão Diamante',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: ['Peito'],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Mãos juntas formando diamante',
      'Desça com cotovelos próximos ao corpo',
      'Empurre focando nos tríceps'
    ],
    tips: ['Difícil para tríceps', 'Mantenha core estável']
  },
  {
    name: 'Peck Deck (Voador)',
    primaryMuscle: 'Peito',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Máquina',
    instructions: [
      'Sente na máquina com costas apoiadas',
      'Junte os braços à frente',
      'Contraia o peito',
      'Retorne controladamente'
    ],
    tips: ['Isolamento perfeito', 'Contraia no final']
  },
  {
    name: 'Supino na Smith',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros'],
    type: 'compound',
    equipment: 'Máquina',
    instructions: [
      'Posicione-se sob a barra da Smith',
      'Desça até o peito',
      'Empurre de volta'
    ],
    tips: ['Mais estável que barra livre', 'Foco na contração']
  },

  // BACK - Additional variations
  {
    name: 'Puxada com Pegada Supinada',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps'],
    type: 'compound',
    equipment: 'Máquina',
    instructions: [
      'Pegada inversa (palmas para você)',
      'Puxe até o peito',
      'Contraia dorsais e bíceps'
    ],
    tips: ['Maior ativação de bíceps', 'Pegada mais estreita']
  },
  {
    name: 'Remada Cavalinho',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps'],
    type: 'compound',
    equipment: 'Máquina',
    instructions: [
      'Peito apoiado no banco inclinado',
      'Puxe os cabos ou barra até o peito',
      'Contraia as escápulas'
    ],
    tips: ['Remove stress da lombar', 'Isola bem as costas']
  },
  {
    name: 'Remada no Cabo Sentado',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps'],
    type: 'compound',
    equipment: 'Cabo',
    instructions: [
      'Sentado, pés apoiados',
      'Puxe o cabo até o abdômen',
      'Contraia as costas'
    ],
    tips: ['Mantenha postura ereta', 'Não usar momentum']
  },
  {
    name: 'Levantamento Terra Sumô',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Costas', 'Glúteos'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Stance muito largo, pés apontados para fora',
      'Levante a barra entre as pernas',
      'Foco em glúteos e adutores'
    ],
    tips: ['Variação para glúteos', 'Mais fácil para lombar']
  },
  {
    name: 'Pulldown com Corda',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps'],
    type: 'compound',
    equipment: 'Cabo',
    instructions: [
      'Polia alta com corda',
      'Puxe a corda separando as pontas',
      'Contraia no final'
    ],
    tips: ['Boa amplitude', 'Variação interessante']
  },
  {
    name: 'Face Pull',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Costas', 'Trapézio'],
    type: 'isolation',
    equipment: 'Cabo',
    instructions: [
      'Cabo na altura do rosto',
      'Puxe separando as mãos',
      'Leve em direção às orelhas'
    ],
    tips: ['Excelente para ombros posteriores', 'Saúde dos ombros']
  },
  {
    name: 'Barra Fixa Pegada Neutra',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps'],
    type: 'compound',
    equipment: 'Barra Fixa',
    instructions: [
      'Palmas uma de frente para outra',
      'Puxe o corpo até o queixo passar',
      'Desça controladamente'
    ],
    tips: ['Mais confortável para ombros', 'Boa para bíceps']
  },
  {
    name: 'Remada T-Bar',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps'],
    type: 'compound',
    equipment: 'Máquina',
    instructions: [
      'Apoie o peito na almofada',
      'Puxe a barra até o peito',
      'Contraia as costas'
    ],
    tips: ['Remove stress lombar', 'Carga pesada']
  },

  // LEGS - Additional variations
  {
    name: 'Afundo com Barra',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Glúteos'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Barra nos ombros',
      'Dê um passo à frente e desça',
      'Volte à posição inicial',
      'Alterne as pernas'
    ],
    tips: ['Desafiador para equilíbrio', 'Ótimo para glúteos']
  },
  {
    name: 'Afundo Reverso',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Glúteos'],
    type: 'compound',
    equipment: 'Halteres',
    instructions: [
      'Dê um passo para trás',
      'Desça até joelho quase tocar o chão',
      'Volte à posição inicial'
    ],
    tips: ['Mais fácil que afundo tradicional', 'Bom para iniciantes']
  },
  {
    name: 'Hack Squat',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Glúteos'],
    type: 'compound',
    equipment: 'Máquina',
    instructions: [
      'Costas apoiadas na almofada',
      'Desça até joelhos ~90 graus',
      'Empurre a plataforma'
    ],
    tips: ['Remove stress da lombar', 'Foco em quadríceps']
  },
  {
    name: 'Agachamento Frontal',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Core'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Barra apoiada na frente dos ombros',
      'Desça mantendo tronco ereto',
      'Empurre pelos calcanhares'
    ],
    tips: ['Mais vertical que agachamento normal', 'Menos stress lombar']
  },
  {
    name: 'Cadeira Adutora',
    primaryMuscle: 'Pernas',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Máquina',
    instructions: [
      'Sente com pernas abertas',
      'Junte as pernas contraindo adutores',
      'Retorne controladamente'
    ],
    tips: ['Isolamento dos adutores', 'Importante para estabilidade']
  },
  {
    name: 'Cadeira Abdutora',
    primaryMuscle: 'Glúteos',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Máquina',
    instructions: [
      'Sente com pernas juntas',
      'Afaste as pernas',
      'Contraia glúteos'
    ],
    tips: ['Isolamento de glúteo médio', 'Saúde dos quadris']
  },
  {
    name: 'Sissy Squat',
    primaryMuscle: 'Quadríceps',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Peso Corporal',
    instructions: [
      'Segure em apoio para equilíbrio',
      'Incline para trás flexionando joelhos',
      'Desça até alongamento completo',
      'Volte contraindo quadríceps'
    ],
    tips: ['Avançado', 'Alongamento intenso']
  },
  {
    name: 'Step Up (Subida no Banco)',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Glúteos'],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Suba no banco com uma perna',
      'Empurre apenas com a perna de cima',
      'Desça controladamente'
    ],
    tips: ['Unilateral', 'Funcional']
  },
  {
    name: 'Ponte de Glúteo',
    primaryMuscle: 'Glúteos',
    secondaryMuscles: ['Posterior'],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Deitado com joelhos flexionados',
      'Eleve os quadris',
      'Contraia glúteos no topo'
    ],
    tips: ['Básico mas efetivo', 'Ativação de glúteos']
  },

  // SHOULDERS - Additional variations
  {
    name: 'Arnold Press',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Tríceps'],
    type: 'compound',
    equipment: 'Halteres',
    instructions: [
      'Inicie com palmas para você',
      'Empurre girando as palmas para frente',
      'Movimento completo'
    ],
    tips: ['Criado por Arnold', 'Maior amplitude']
  },
  {
    name: 'Desenvolvimento na Smith',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Tríceps'],
    type: 'compound',
    equipment: 'Máquina',
    instructions: [
      'Barra da Smith na altura dos ombros',
      'Empurre acima da cabeça',
      'Desça controladamente'
    ],
    tips: ['Mais estável', 'Foco na carga']
  },
  {
    name: 'Elevação Lateral no Cabo',
    primaryMuscle: 'Ombros',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Cabo',
    instructions: [
      'Cabo baixo ao lado',
      'Eleve lateralmente',
      'Tensão constante'
    ],
    tips: ['Tensão contínua do cabo', 'Sem descanso']
  },
  {
    name: 'Remada Alta com Barra',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Trapézio'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Barra na frente, pegada média',
      'Puxe verticalmente até o queixo',
      'Cotovelos acima das mãos'
    ],
    tips: ['Deltoide lateral e trapézio', 'Cuidado com ombros sensíveis']
  },
  {
    name: 'Desenvolvimento Militar em Pé',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Core', 'Tríceps'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Em pé, barra no peito',
      'Empurre overhead',
      'Core estável'
    ],
    tips: ['Força funcional', 'Core engajado']
  },
  {
    name: 'Pássaro na Polia',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Costas'],
    type: 'isolation',
    equipment: 'Cabo',
    instructions: [
      'Cabos cruzados à frente',
      'Abra em arco para trás',
      'Contraia posterior de ombro'
    ],
    tips: ['Tensão constante', 'Deltoide posterior']
  },

  // BICEPS - Additional variations
  {
    name: 'Rosca 21',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Barra',
    instructions: [
      '7 reps metade inferior',
      '7 reps metade superior',
      '7 reps completas',
      'Total: 21 repetições'
    ],
    tips: ['Técnica de intensidade', 'Pump intenso']
  },
  {
    name: 'Rosca no Cabo',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Cabo',
    instructions: [
      'Cabo baixo com barra',
      'Flexione cotovelos',
      'Tensão constante'
    ],
    tips: ['Tensão contínua', 'Sem descanso no cabo']
  },
  {
    name: 'Rosca Concentrada',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Halteres',
    instructions: [
      'Sentado, cotovelo apoiado na coxa',
      'Flexione com foco total',
      'Contração máxima'
    ],
    tips: ['Isolamento total', 'Conexão mente-músculo']
  },
  {
    name: 'Rosca Inversa',
    primaryMuscle: 'Antebraço',
    secondaryMuscles: ['Bíceps'],
    type: 'isolation',
    equipment: 'Barra',
    instructions: [
      'Pegada pronada (palmas para baixo)',
      'Flexione os cotovelos',
      'Foco em antebraços'
    ],
    tips: ['Antebraços e braquial', 'Peso moderado']
  },
  {
    name: 'Rosca na Polia Alta',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Cabo',
    instructions: [
      'Polias altas, pose do fisiculturista',
      'Flexione em direção à cabeça',
      'Contração de pico'
    ],
    tips: ['Pose e contração', 'Bombeamento']
  },

  // TRICEPS - Additional variations
  {
    name: 'Tríceps no Banco',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: ['Ombros'],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Mãos apoiadas atrás em banco',
      'Desça flexionando cotovelos',
      'Empurre de volta'
    ],
    tips: ['Acessível', 'Adicione peso no colo']
  },
  {
    name: 'Tríceps Coice (Kickback)',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Halteres',
    instructions: [
      'Incline o tronco',
      'Cotovelo fixo, estenda o braço para trás',
      'Contraia tríceps'
    ],
    tips: ['Isolamento total', 'Leve']
  },
  {
    name: 'Tríceps na Polia com Corda',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Cabo',
    instructions: [
      'Polia alta com corda',
      'Estenda separando as pontas',
      'Contração máxima'
    ],
    tips: ['Excelente isolamento', 'Separar no final']
  },
  {
    name: 'Tríceps Overhead no Cabo',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Cabo',
    instructions: [
      'De costas para polia alta',
      'Corda acima da cabeça',
      'Estenda para frente'
    ],
    tips: ['Alongamento máximo', 'Cabeça longa do tríceps']
  },

  // CORE/ABS - Additional variations
  {
    name: 'Abdominal Canivete',
    primaryMuscle: 'Core',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Peso Corporal',
    instructions: [
      'Deitado, braços estendidos acima',
      'Suba tronco e pernas simultaneamente',
      'Toque os pés'
    ],
    tips: ['Movimento completo', 'Coordenação']
  },
  {
    name: 'Prancha Lateral',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Oblíquos'],
    type: 'isolation',
    equipment: 'Peso Corporal',
    instructions: [
      'Apoio lateral no antebraço',
      'Corpo em linha reta',
      'Mantenha posição'
    ],
    tips: ['Oblíquos e estabilizadores', 'Não deixar quadril cair']
  },
  {
    name: 'Mountain Climbers',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Cardio'],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Posição de prancha',
      'Alterne joelhos ao peito rapidamente',
      'Mantenha core estável'
    ],
    tips: ['Cardio + core', 'Rápido e intenso']
  },
  {
    name: 'Bicicleta no Ar',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Oblíquos'],
    type: 'isolation',
    equipment: 'Peso Corporal',
    instructions: [
      'Deitado, mãos atrás da cabeça',
      'Alterne cotovelo com joelho oposto',
      'Movimento de pedalar'
    ],
    tips: ['Oblíquos', 'Movimento controlado']
  },
  {
    name: 'Hollow Hold',
    primaryMuscle: 'Core',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Peso Corporal',
    instructions: [
      'Deitado, eleve ombros e pernas',
      'Lombar colada no chão',
      'Mantenha posição'
    ],
    tips: ['Isométrico avançado', 'Core completo']
  },
  {
    name: 'Dead Bug',
    primaryMuscle: 'Core',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Peso Corporal',
    instructions: [
      'Deitado, braços e pernas para cima',
      'Alterne braço e perna oposta descendo',
      'Lombar no chão'
    ],
    tips: ['Controle e estabilidade', 'Excelente para lombar']
  },
  {
    name: 'Landmine Rotation',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Oblíquos', 'Ombros'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Barra fixa em um canto',
      'Segure a outra ponta',
      'Rotacione de um lado para outro'
    ],
    tips: ['Potência rotacional', 'Funcional']
  },

  // TRAP/UPPER BACK
  {
    name: 'Encolhimento com Barra',
    primaryMuscle: 'Trapézio',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Barra',
    instructions: [
      'Barra na frente das coxas',
      'Eleve os ombros verticalmente',
      'Contraia trapézio'
    ],
    tips: ['Carga pesada', 'Movimento vertical']
  },
  {
    name: 'Encolhimento na Smith',
    primaryMuscle: 'Trapézio',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Máquina',
    instructions: [
      'Barra na Smith na frente',
      'Eleve ombros verticalmente',
      'Pausa no topo'
    ],
    tips: ['Seguro para cargas altas', 'Contração intensa']
  },
  {
    name: 'Y-Raise',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Trapézio'],
    type: 'isolation',
    equipment: 'Halteres',
    instructions: [
      'Inclinado, polegares para cima',
      'Eleve em Y (diagonal)',
      'Contraia trapézio médio'
    ],
    tips: ['Saúde dos ombros', 'Peso leve']
  },

  // FOREARMS
  {
    name: 'Rosca de Punho',
    primaryMuscle: 'Antebraço',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Barra',
    instructions: [
      'Antebraços apoiados, palmas para cima',
      'Flexione apenas os punhos',
      'Amplitude completa'
    ],
    tips: ['Isolamento de antebraços', 'Alto volume']
  },
  {
    name: 'Rosca de Punho Inversa',
    primaryMuscle: 'Antebraço',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Barra',
    instructions: [
      'Antebraços apoiados, palmas para baixo',
      'Flexione punhos para cima',
      'Amplitude completa'
    ],
    tips: ['Extensores do antebraço', 'Equilíbrio muscular']
  },
  {
    name: 'Farmer Walk',
    primaryMuscle: 'Antebraço',
    secondaryMuscles: ['Trapézio', 'Core'],
    type: 'compound',
    equipment: 'Halteres',
    instructions: [
      'Segure halteres pesados',
      'Caminhe mantendo postura',
      'Aperto forte'
    ],
    tips: ['Força funcional', 'Pegada intensa']
  },

  // OLYMPIC / POWER
  {
    name: 'Power Clean',
    primaryMuscle: 'Full Body',
    secondaryMuscles: ['Trapézio', 'Ombros', 'Pernas'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Puxe a barra do chão explosivamente',
      'Receba na altura dos ombros',
      'Movimento de potência'
    ],
    tips: ['Técnico', 'Explosão e potência']
  },
  {
    name: 'Hang Clean',
    primaryMuscle: 'Full Body',
    secondaryMuscles: ['Trapézio', 'Pernas'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Inicie com barra acima dos joelhos',
      'Puxe explosivamente',
      'Receba nos ombros'
    ],
    tips: ['Mais fácil que do chão', 'Potência']
  },
  {
    name: 'Snatch (Arranco)',
    primaryMuscle: 'Full Body',
    secondaryMuscles: ['Ombros', 'Pernas', 'Costas'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Pegada bem larga',
      'Puxe barra overhead em um movimento',
      'Receba em agachamento'
    ],
    tips: ['Muito técnico', 'Mobilidade e potência']
  },
  {
    name: 'Push Press',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Pernas', 'Tríceps'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Barra nos ombros',
      'Leve flexão de joelhos',
      'Empurre explosivamente overhead'
    ],
    tips: ['Use pernas para ajudar', 'Mais peso que desenvolvimento']
  },
  {
    name: 'Thruster',
    primaryMuscle: 'Full Body',
    secondaryMuscles: ['Pernas', 'Ombros'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Agachamento frontal',
      'Ao subir, empurre barra overhead',
      'Movimento contínuo'
    ],
    tips: ['Metcon intenso', 'Cardio + força']
  },

  // FUNCTIONAL / ATHLETIC
  {
    name: 'Box Jump',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Glúteos', 'Cardio'],
    type: 'compound',
    equipment: 'Caixa',
    instructions: [
      'Pule explosivamente sobre a caixa',
      'Aterrisse suave',
      'Desça e repita'
    ],
    tips: ['Potência e explosão', 'Segurança ao aterrissar']
  },
  {
    name: 'Burpee',
    primaryMuscle: 'Full Body',
    secondaryMuscles: ['Cardio'],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Agachamento, mãos no chão',
      'Pule para prancha',
      'Flexão (opcional)',
      'Pule de volta e salte para cima'
    ],
    tips: ['Condicionamento completo', 'Intenso']
  },
  {
    name: 'Wall Ball',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Ombros', 'Core'],
    type: 'compound',
    equipment: 'Medicine Ball',
    instructions: [
      'Segure medicine ball no peito',
      'Agache e ao subir arremesse alto',
      'Pegue e repita'
    ],
    tips: ['CrossFit clássico', 'Cardio + força']
  },
  {
    name: 'Kettlebell Swing',
    primaryMuscle: 'Glúteos',
    secondaryMuscles: ['Posterior', 'Core'],
    type: 'compound',
    equipment: 'Kettlebell',
    instructions: [
      'Kettlebell entre as pernas',
      'Balanço explosivo dos quadris',
      'Até altura dos olhos'
    ],
    tips: ['Potência de quadris', 'Não usar braços']
  },
  {
    name: 'Turkish Get Up',
    primaryMuscle: 'Full Body',
    secondaryMuscles: ['Core', 'Ombros'],
    type: 'compound',
    equipment: 'Kettlebell',
    instructions: [
      'Deitado com kettlebell estendido',
      'Levante-se mantendo KB overhead',
      'Sequência complexa'
    ],
    tips: ['Movimento complexo', 'Estabilidade total']
  },
  {
    name: 'Battle Ropes',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Core', 'Cardio'],
    type: 'compound',
    equipment: 'Cordas',
    instructions: [
      'Segure as cordas',
      'Ondas alternadas ou simultâneas',
      'Alta intensidade'
    ],
    tips: ['Condicionamento', 'Explosão']
  },
  {
    name: 'Sled Push',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Glúteos', 'Core'],
    type: 'compound',
    equipment: 'Trenó',
    instructions: [
      'Empurre o trenó',
      'Mantenha postura baixa',
      'Potência das pernas'
    ],
    tips: ['Força e condicionamento', 'Intenso']
  },
  {
    name: 'Sled Pull',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Pernas', 'Bíceps'],
    type: 'compound',
    equipment: 'Trenó',
    instructions: [
      'Puxe o trenó usando corda',
      'Movimento de remada',
      'Caminhe para trás'
    ],
    tips: ['Trabalho de costas funcional', 'Cardio']
  },

  // GRIP STRENGTH
  {
    name: 'Dead Hang',
    primaryMuscle: 'Antebraço',
    secondaryMuscles: ['Costas', 'Ombros'],
    type: 'isolation',
    equipment: 'Barra Fixa',
    instructions: [
      'Pendure na barra',
      'Mantenha o tempo',
      'Depressão escapular'
    ],
    tips: ['Força de pegada', 'Saúde dos ombros']
  },
  {
    name: 'Plate Pinch',
    primaryMuscle: 'Antebraço',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Anilhas',
    instructions: [
      'Segure anilhas com os dedos',
      'Mantenha o tempo',
      'Não deixe cair'
    ],
    tips: ['Força dos dedos', 'Pegada em pinça']
  },

  // CARDIO / CONDITIONING
  {
    name: 'Sprints',
    primaryMuscle: 'Cardio',
    secondaryMuscles: ['Pernas'],
    type: 'compound',
    equipment: 'Nenhum',
    instructions: [
      'Corrida de alta intensidade',
      '10-30 segundos',
      'Recuperação entre séries'
    ],
    tips: ['HIIT', 'Explosão']
  },
  {
    name: 'High Knees',
    primaryMuscle: 'Cardio',
    secondaryMuscles: ['Core', 'Pernas'],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Corrida parado',
      'Joelhos alto',
      'Rápido'
    ],
    tips: ['Aquecimento', 'Cardio']
  },
  {
    name: 'Jumping Jacks',
    primaryMuscle: 'Cardio',
    secondaryMuscles: ['Ombros'],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Salte abrindo pernas e braços',
      'Retorne',
      'Repetir rapidamente'
    ],
    tips: ['Aquecimento clássico', 'Cardio leve']
  },

  // STABILITY/MOBILITY
  {
    name: 'Agachamento com Pausa',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Core'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Agachamento normal',
      'Pausa de 3s no fundo',
      'Exploda para cima'
    ],
    tips: ['Força no fundo', 'Controle']
  },
  {
    name: 'Agachamento Goblet',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Core'],
    type: 'compound',
    equipment: 'Halteres',
    instructions: [
      'Segure halter ou KB no peito',
      'Agache profundo',
      'Tronco ereto'
    ],
    tips: ['Ótimo para mobilidade', 'Iniciantes']
  },
  {
    name: 'Overhead Squat',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Core', 'Ombros'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Barra overhead, pegada larga',
      'Agache mantendo barra sobre cabeça',
      'Mobilidade extrema'
    ],
    tips: ['Avançado', 'Mobilidade total']
  },
  {
    name: 'Single Leg Deadlift',
    primaryMuscle: 'Posterior',
    secondaryMuscles: ['Glúteos', 'Core'],
    type: 'compound',
    equipment: 'Halteres',
    instructions: [
      'Em uma perna',
      'Incline para frente estendendo perna de trás',
      'Equilíbrio e controle'
    ],
    tips: ['Unilateral', 'Equilíbrio']
  },
  {
    name: 'Pistol Squat',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Core'],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Agachamento em uma perna',
      'Outra perna estendida à frente',
      'Muito difícil'
    ],
    tips: ['Avançado', 'Força e equilíbrio']
  },
  {
    name: 'Cossack Squat',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Adutores'],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Pernas bem afastadas',
      'Agache para um lado',
      'Outra perna estendida'
    ],
    tips: ['Mobilidade lateral', 'Adutores']
  },
  {
    name: 'Copenhagen Plank',
    primaryMuscle: 'Adutores',
    secondaryMuscles: ['Core'],
    type: 'isolation',
    equipment: 'Banco',
    instructions: [
      'Prancha lateral com perna de cima no banco',
      'Perna de baixo suspensa',
      'Mantenha posição'
    ],
    tips: ['Adutores isométrico', 'Avançado']
  },
  {
    name: 'Bird Dog',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Glúteos', 'Lombar'],
    type: 'isolation',
    equipment: 'Peso Corporal',
    instructions: [
      'Quatro apoios',
      'Estenda braço e perna opostos',
      'Mantenha core estável'
    ],
    tips: ['Estabilidade', 'Prevenção de lesões']
  },
  {
    name: 'Superman',
    primaryMuscle: 'Lombar',
    secondaryMuscles: ['Glúteos'],
    type: 'isolation',
    equipment: 'Peso Corporal',
    instructions: [
      'Deitado de bruços',
      'Eleve braços e pernas simultaneamente',
      'Contraia lombar e glúteos'
    ],
    tips: ['Extensores da coluna', 'Lombar']
  },
  {
    name: 'Hiperextensão (Back Extension)',
    primaryMuscle: 'Lombar',
    secondaryMuscles: ['Glúteos', 'Posterior'],
    type: 'isolation',
    equipment: 'Máquina',
    instructions: [
      'Posicione-se na máquina',
      'Desça controladamente',
      'Suba contraindo lombar e glúteos'
    ],
    tips: ['Saúde da lombar', 'Não hiperextender']
  },
  {
    name: 'Reverse Hyper',
    primaryMuscle: 'Lombar',
    secondaryMuscles: ['Glúteos'],
    equipment: 'Máquina',
    type: 'isolation',
    instructions: [
      'Deitado de bruços em banco',
      'Eleve as pernas pendentes',
      'Contraia glúteos'
    ],
    tips: ['Excelente para lombar', 'Descompressão']
  },
  {
    name: 'Walking Lunge',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Glúteos'],
    type: 'compound',
    equipment: 'Halteres',
    instructions: [
      'Afundo caminhando para frente',
      'Alterne as pernas',
      'Mantenha ritmo'
    ],
    tips: ['Funcional', 'Desafiador']
  },
  {
    name: 'Lateral Lunge',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Adutores'],
    type: 'compound',
    equipment: 'Halteres',
    instructions: [
      'Dê passo lateral',
      'Agache para o lado',
      'Retorne'
    ],
    tips: ['Movimento lateral', 'Adutores']
  },
  {
    name: 'Glute Ham Raise',
    primaryMuscle: 'Posterior',
    secondaryMuscles: ['Glúteos'],
    type: 'compound',
    equipment: 'Máquina',
    instructions: [
      'Prenda pés em GHR',
      'Desça controladamente para frente',
      'Puxe de volta com posterior'
    ],
    tips: ['Avançado para posterior', 'Excêntrico forte']
  },
  {
    name: 'Nordic Curl',
    primaryMuscle: 'Posterior',
    secondaryMuscles: [],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Ajoelhado, pés presos',
      'Desça para frente controladamente',
      'Resistência excêntrica'
    ],
    tips: ['Extremamente difícil', 'Posterior forte']
  },
  {
    name: 'Leg Curl Deitado',
    primaryMuscle: 'Posterior',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Máquina',
    instructions: [
      'Deitado de bruços',
      'Flexione joelhos trazendo calcanhares',
      'Contraia posterior'
    ],
    tips: ['Variação de mesa flexora', 'Isolamento']
  },
  {
    name: 'Leg Curl em Pé',
    primaryMuscle: 'Posterior',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Máquina',
    instructions: [
      'Em pé na máquina',
      'Flexione uma perna por vez',
      'Equilíbrio e controle'
    ],
    tips: ['Unilateral', 'Foco individual']
  },
  {
    name: 'Agachamento Zercher',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Core', 'Costas'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Barra nos cotovelos dobrados',
      'Agache mantendo postura ereta',
      'Desconfortável mas efetivo'
    ],
    tips: ['Variação única', 'Core intenso']
  },
  {
    name: 'Belt Squat',
    primaryMuscle: 'Pernas',
    secondaryMuscles: [],
    type: 'compound',
    equipment: 'Máquina',
    instructions: [
      'Cinto com peso preso',
      'Agache sem carga na coluna',
      'Foco total em pernas'
    ],
    tips: ['Remove stress da coluna', 'Carga alta segura']
  },
  {
    name: 'Seal Row',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps'],
    type: 'compound',
    equipment: 'Banco',
    instructions: [
      'Deitado de bruços em banco elevado',
      'Puxe halteres sem suporte de pés',
      'Isolamento total das costas'
    ],
    tips: ['Remove trapaça completamente', 'Isolamento puro']
  },
  {
    name: 'Pendlay Row',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps', 'Lombar'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Remada curvada',
      'Barra toca chão entre cada rep',
      'Explosão'
    ],
    tips: ['Potência', 'Cada rep do zero']
  },
  {
    name: 'Meadows Row',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Barra em canto (landmine)',
      'Puxe unilateralmente',
      'Grande amplitude'
    ],
    tips: ['Criado por John Meadows', 'Excelente variação']
  },
  {
    name: 'Kroc Row',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps', 'Pegada'],
    type: 'compound',
    equipment: 'Halteres',
    instructions: [
      'Remada unilateral com halter pesado',
      'Permite leve balanço controlado',
      'Alto volume'
    ],
    tips: ['Carga muito alta', 'Volume extremo']
  },
  {
    name: 'Batwing Row',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps'],
    type: 'compound',
    equipment: 'Halteres',
    instructions: [
      'Inclinado, puxe halteres',
      'Segure no topo (pausa longa)',
      'Isométrico no topo'
    ],
    tips: ['Força isométrica', 'Retração escapular']
  },
  // ADDITIONAL 200 EXERCISES
  {
    name: 'Supino Declinado com Barra',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Deite no banco declinado (15-30 graus)',
      'Segure a barra com pegada média',
      'Desça até o peito inferior',
      'Empurre explosivamente'
    ],
    tips: ['Enfatiza peito inferior', 'Manter controle total']
  },
  {
    name: 'Supino Fechado com Barra',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: ['Peito', 'Ombros'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Pegada na largura dos ombros',
      'Cotovelos próximos ao corpo',
      'Desça até o peito',
      'Empurre com foco no tríceps'
    ],
    tips: ['Excelente para tríceps', 'Não abrir os cotovelos']
  },
  {
    name: 'Pullover com Halteres',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Costas', 'Serrátil'],
    type: 'isolation',
    equipment: 'Halteres',
    instructions: [
      'Deitado perpendicular no banco',
      'Halter acima do peito',
      'Desça em arco atrás da cabeça',
      'Retorne contraindo peito'
    ],
    tips: ['Expande caixa torácica', 'Respiração profunda']
  },
  {
    name: 'Fly na Máquina (Peck Deck)',
    primaryMuscle: 'Peito',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Máquina',
    instructions: [
      'Ajuste altura dos pegadores',
      'Braços levemente flexionados',
      'Junte à frente sentindo contração'
    ],
    tips: ['Isolamento perfeito', 'Controle no retorno']
  },
  {
    name: 'Flexão com Pés Elevados',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Ombros', 'Tríceps'],
    type: 'compound',
    equipment: 'Banco',
    instructions: [
      'Pés em banco ou caixa',
      'Flexão normal',
      'Maior ativação superior do peito'
    ],
    tips: ['Progressão da flexão', 'Manter core estável']
  },
  {
    name: 'Flexão Diamante',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: ['Peito'],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Mãos formam diamante com indicadores e polegares',
      'Desça mantendo cotovelos próximos',
      'Empurre com força do tríceps'
    ],
    tips: ['Intenso para tríceps', 'Cotovelos junto ao corpo']
  },
  {
    name: 'Supino Guilhotina',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Ombros'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Similar ao supino reto',
      'Desça a barra até a linha do pescoço',
      'Pegada mais larga',
      'Muito alongamento peitoral'
    ],
    tips: ['Técnica de Vince Gironda', 'Cuidado com carga']
  },
  {
    name: 'Flexão Arqueira',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Tríceps', 'Core'],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Mãos bem afastadas',
      'Desloque peso para um lado',
      'Outro braço quase reto',
      'Alterne lados'
    ],
    tips: ['Progressão avançada', 'Força unilateral']
  },
  {
    name: 'Supino com Pegada Inversa',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Tríceps', 'Bíceps'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Pegada supinada (palmas para cima)',
      'Desça controladamente',
      'Enfatiza peito superior'
    ],
    tips: ['Variação interessante', 'Ativa bíceps']
  },
  {
    name: 'Crucifixo Inclinado',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Ombros'],
    type: 'isolation',
    equipment: 'Halteres',
    instructions: [
      'Banco inclinado 30-45 graus',
      'Abra em arco',
      'Alongamento superior do peito'
    ],
    tips: ['Peito superior', 'Movimento controlado']
  },
  {
    name: 'Remada Invertida',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps', 'Core'],
    type: 'compound',
    equipment: 'Barra Fixa',
    instructions: [
      'Barra baixa ou anéis',
      'Corpo reto, puxe peito até barra',
      'Escápulas contraídas'
    ],
    tips: ['Ótimo para iniciantes', 'Progressão para barra fixa']
  },
  {
    name: 'Remada com Halteres Alternada',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps'],
    type: 'compound',
    equipment: 'Halteres',
    instructions: [
      'Inclinado com halter em cada mão',
      'Puxe alternadamente',
      'Rotação controlada do tronco'
    ],
    tips: ['Permite foco individual', 'Core ativo']
  },
  {
    name: 'Pulldown com Pegada Inversa',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps'],
    type: 'compound',
    equipment: 'Máquina',
    instructions: [
      'Pegada supinada',
      'Puxe até o peito',
      'Maior ativação de bíceps'
    ],
    tips: ['Variação da puxada', 'Bíceps secundário forte']
  },
  {
    name: 'Remada T-Bar',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps', 'Lombar'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Barra em V no chão ou máquina',
      'Inclinado, puxe até o peito',
      'Grande amplitude'
    ],
    tips: ['Variação clássica', 'Carga alta']
  },
  {
    name: 'Face Pull',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Costas', 'Trapézio'],
    type: 'isolation',
    equipment: 'Cabo',
    instructions: [
      'Cabo na altura dos olhos',
      'Puxe corda em direção ao rosto',
      'Cotovelos alto, rotação externa'
    ],
    tips: ['Saúde dos ombros', 'Deltóide posterior']
  },
  {
    name: 'Remada Cavalinho',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps'],
    type: 'compound',
    equipment: 'Máquina',
    instructions: [
      'Sentado, peito apoiado',
      'Puxe pegadores até o corpo',
      'Contração escapular'
    ],
    tips: ['Remove lombar da equação', 'Isolamento das costas']
  },
  {
    name: 'Lat Pulldown Unilateral',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps'],
    type: 'compound',
    equipment: 'Cabo',
    instructions: [
      'Um braço por vez',
      'Puxe até o peito',
      'Correção de assimetrias'
    ],
    tips: ['Unilateral', 'Foco em amplitude']
  },
  {
    name: 'Remada Alta com Barra',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Trapézio'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Pegada média',
      'Puxe barra até linha do peito',
      'Cotovelos alto'
    ],
    tips: ['Deltóide e trapézio', 'Pegada não muito fechada']
  },
  {
    name: 'Pulldown com Corda',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Bíceps'],
    type: 'compound',
    equipment: 'Cabo',
    instructions: [
      'Corda no cabo alto',
      'Puxe separando as pontas',
      'Maior amplitude'
    ],
    tips: ['Variação interessante', 'Rotação do punho']
  },
  {
    name: 'Desenvolvimento Militar',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Tríceps', 'Core'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Em pé, barra na altura dos ombros',
      'Empurre acima da cabeça',
      'Core estável'
    ],
    tips: ['Exercício clássico', 'Força completa']
  },
  {
    name: 'Desenvolvimento Sentado com Halteres',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Tríceps'],
    type: 'compound',
    equipment: 'Halteres',
    instructions: [
      'Sentado, banco vertical',
      'Halteres à altura dos ombros',
      'Empurre simultaneamente acima'
    ],
    tips: ['Estabilidade individual', 'Amplitude completa']
  },
  {
    name: 'Elevação Lateral com Halteres',
    primaryMuscle: 'Ombros',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Halteres',
    instructions: [
      'Em pé, halteres ao lado do corpo',
      'Eleve lateralmente até linha dos ombros',
      'Leve cotovelos para cima primeiro'
    ],
    tips: ['Deltóide lateral', 'Não balançar']
  },
  {
    name: 'Elevação Frontal com Barra',
    primaryMuscle: 'Ombros',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Barra',
    instructions: [
      'Em pé, barra nas coxas',
      'Eleve à frente até linha dos olhos',
      'Braços retos'
    ],
    tips: ['Deltóide anterior', 'Controle excêntrico']
  },
  {
    name: 'Crucifixo Inverso',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Costas'],
    type: 'isolation',
    equipment: 'Halteres',
    instructions: [
      'Inclinado, halteres pendurados',
      'Abra em arco para trás',
      'Deltóide posterior'
    ],
    tips: ['Essencial para ombros saudáveis', 'Não balançar']
  },
  {
    name: 'Arnold Press',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Tríceps'],
    type: 'compound',
    equipment: 'Halteres',
    instructions: [
      'Halteres à frente, palmas para você',
      'Ao empurrar, gire palmas para frente',
      'Movimento de rotação'
    ],
    tips: ['Criado por Arnold', 'Ativa todas as cabeças']
  },
  {
    name: 'Elevação Lateral no Cabo',
    primaryMuscle: 'Ombros',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Cabo',
    instructions: [
      'Cabo baixo, pegue com mão oposta',
      'Eleve lateralmente',
      'Tensão constante'
    ],
    tips: ['Não perde tensão', 'Unilateral']
  },
  {
    name: 'Bradford Press',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Tríceps', 'Trapézio'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Alternadamente empurre frente e atrás da cabeça',
      'Sem lockout completo',
      'Tensão constante'
    ],
    tips: ['Time under tension', 'Cuidado com mobilidade']
  },
  {
    name: 'Bus Driver',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Core'],
    type: 'isolation',
    equipment: 'Anilha',
    instructions: [
      'Segure anilha à frente como volante',
      'Gire de um lado para outro',
      'Braços estendidos'
    ],
    tips: ['Isométrico + rotação', 'Queima deltóides']
  },
  {
    name: 'Desenvolvimento com Kettlebell',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Core', 'Tríceps'],
    type: 'compound',
    equipment: 'Kettlebell',
    instructions: [
      'Kettlebell no ombro',
      'Empurre acima mantendo core',
      'Posição rack limpa'
    ],
    tips: ['Estabilidade extra', 'Funcional']
  },
  {
    name: 'Tríceps Testa com Barra',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Barra',
    instructions: [
      'Deitado, barra acima do peito',
      'Desça até próximo da testa',
      'Apenas cotovelos se movem'
    ],
    tips: ['Isolamento de tríceps', 'Cuidado com cotovelos']
  },
  {
    name: 'Tríceps Pulley',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Cabo',
    instructions: [
      'Cabo alto com corda ou barra',
      'Cotovelos fixos ao lado',
      'Estenda completamente'
    ],
    tips: ['Contração no final', 'Cotovelos estáticos']
  },
  {
    name: 'Mergulho em Barras Paralelas',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: ['Peito', 'Ombros'],
    type: 'compound',
    equipment: 'Paralelas',
    instructions: [
      'Corpo ereto entre as barras',
      'Desça flexionando cotovelos',
      'Empurre de volta'
    ],
    tips: ['Mais vertical = mais tríceps', 'Exercício excelente']
  },
  {
    name: 'Tríceps Francês com Halteres',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Halteres',
    instructions: [
      'Sentado ou em pé',
      'Halter atrás da cabeça',
      'Estenda acima mantendo cotovelos fixos'
    ],
    tips: ['Cabeça longa do tríceps', 'Alongamento']
  },
  {
    name: 'Kickback de Tríceps',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Halteres',
    instructions: [
      'Inclinado, braço ao lado',
      'Estenda antebraço para trás',
      'Contração no topo'
    ],
    tips: ['Isolamento puro', 'Leve, alta contração']
  },
  {
    name: 'Rosca Direta com Barra',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: ['Antebraços'],
    type: 'isolation',
    equipment: 'Barra',
    instructions: [
      'Em pé, barra nas coxas',
      'Flexione levando barra até ombros',
      'Cotovelos fixos'
    ],
    tips: ['Exercício fundamental', 'Não balançar corpo']
  },
  {
    name: 'Rosca Martelo',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: ['Antebraços', 'Braquial'],
    type: 'isolation',
    equipment: 'Halteres',
    instructions: [
      'Halteres com pegada neutra (palmas frente a frente)',
      'Flexione mantendo posição',
      'Antebraços trabalham mais'
    ],
    tips: ['Braquial e braquiorradial', 'Aumenta espessura']
  },
  {
    name: 'Rosca Scott',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Barra',
    instructions: [
      'Braços apoiados no banco scott',
      'Flexione isolando bíceps',
      'Amplitude completa'
    ],
    tips: ['Remove balanço', 'Isolamento total']
  },
  {
    name: 'Rosca Concentrada',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Halteres',
    instructions: [
      'Sentado, cotovelo apoiado na coxa',
      'Flexione focando na contração',
      'Pico de contração'
    ],
    tips: ['Isolamento máximo', 'Conexão mente-músculo']
  },
  {
    name: 'Rosca Alternada',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: ['Antebraços'],
    type: 'isolation',
    equipment: 'Halteres',
    instructions: [
      'Em pé com halteres',
      'Alterne braços',
      'Leve supinação no topo'
    ],
    tips: ['Foco individual', 'Supinação ativa bíceps']
  },
  {
    name: 'Rosca 21',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Barra',
    instructions: [
      '7 reps metade inferior',
      '7 reps metade superior',
      '7 reps amplitude completa'
    ],
    tips: ['Técnica avançada', 'Congestão intensa']
  },
  {
    name: 'Rosca Inversa',
    primaryMuscle: 'Antebraços',
    secondaryMuscles: ['Bíceps'],
    type: 'isolation',
    equipment: 'Barra',
    instructions: [
      'Pegada pronada (palmas para baixo)',
      'Flexione até ombros',
      'Antebraços trabalham forte'
    ],
    tips: ['Braquiorradial', 'Prevenção de lesões']
  },
  {
    name: 'Rosca Spider',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Banco',
    instructions: [
      'Bruços no lado vertical do banco scott',
      'Braços pendurados',
      'Rosca com isolamento total'
    ],
    tips: ['Impossível trapacear', 'Contração de pico']
  },
  {
    name: 'Rosca Cabo',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Cabo',
    instructions: [
      'Cabo baixo',
      'Flexione mantendo tensão',
      'Contração constante'
    ],
    tips: ['Tensão não para', 'Ótimo finalizador']
  },
  {
    name: 'Drag Curl',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Barra',
    instructions: [
      'Arraste barra pelo corpo',
      'Cotovelos vão para trás',
      'Curto range, alta tensão'
    ],
    tips: ['Técnica de Vince Gironda', 'Remove deltóide']
  },
  {
    name: 'Agachamento Livre Completo',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Core', 'Lombar'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Barra nas costas',
      'Desça até paralelo ou abaixo',
      'Empurre pelos calcanhares'
    ],
    tips: ['Rei dos exercícios', 'Form é crucial']
  },
  {
    name: 'Agachamento Frontal',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Core', 'Ombros'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Barra na frente dos ombros',
      'Cotovelos alto',
      'Agache mantendo tronco vertical'
    ],
    tips: ['Mais quadríceps', 'Core intenso']
  },
  {
    name: 'Leg Press 45 Graus',
    primaryMuscle: 'Pernas',
    secondaryMuscles: [],
    type: 'compound',
    equipment: 'Máquina',
    instructions: [
      'Pés na plataforma largura dos ombros',
      'Desça controladamente',
      'Empurre sem travar joelhos'
    ],
    tips: ['Carga alta segura', 'Não arredondar lombar']
  },
  {
    name: 'Afundo com Barra',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Glúteos', 'Core'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Barra nas costas',
      'Passo largo à frente',
      'Desça até joelho quase tocar',
      'Alterne pernas'
    ],
    tips: ['Unilateral', 'Equilíbrio e força']
  },
  {
    name: 'Extensão de Pernas',
    primaryMuscle: 'Pernas',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Máquina',
    instructions: [
      'Sentado na máquina',
      'Estenda pernas completamente',
      'Contração no topo'
    ],
    tips: ['Isolamento de quadríceps', 'Posição dos pés varia foco']
  },
  {
    name: 'Agachamento Búlgaro',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Glúteos'],
    type: 'compound',
    equipment: 'Halteres',
    instructions: [
      'Pé de trás elevado em banco',
      'Agache na perna da frente',
      'Unilateral intenso'
    ],
    tips: ['Excelente para glúteos', 'Equilíbrio']
  },
  {
    name: 'Hack Squat',
    primaryMuscle: 'Pernas',
    secondaryMuscles: [],
    type: 'compound',
    equipment: 'Máquina',
    instructions: [
      'Costas na almofada',
      'Pés na plataforma',
      'Desça e empurre'
    ],
    tips: ['Quadríceps', 'Suporte lombar']
  },
  {
    name: 'Agachamento Sumô',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Glúteos', 'Adutores'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Stance bem largo',
      'Pontas dos pés para fora',
      'Agache mantendo joelhos alinhados'
    ],
    tips: ['Mais glúteos e adutores', 'Abre quadril']
  },
  {
    name: 'Stiff com Barra',
    primaryMuscle: 'Posterior',
    secondaryMuscles: ['Lombar', 'Glúteos'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Pernas quase retas',
      'Incline à frente mantendo costas retas',
      'Barra desliza pelas pernas',
      'Suba contraindo posterior'
    ],
    tips: ['Alongamento de posterior', 'Costas neutras']
  },
  {
    name: 'Mesa Flexora',
    primaryMuscle: 'Posterior',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Máquina',
    instructions: [
      'Deitado de bruços',
      'Calcanhares sob almofada',
      'Flexione pernas'
    ],
    tips: ['Isolamento posterior', 'Contração no topo']
  },
  {
    name: 'Cadeira Flexora',
    primaryMuscle: 'Posterior',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Máquina',
    instructions: [
      'Sentado, pernas estendidas',
      'Flexione para baixo',
      'Versão sentada do leg curl'
    ],
    tips: ['Enfatiza porção inferior', 'Variação']
  },
  {
    name: 'Levantamento Terra Romeno',
    primaryMuscle: 'Posterior',
    secondaryMuscles: ['Lombar', 'Glúteos'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Começa em pé com barra',
      'Desce até mecanismo joelho',
      'Não toca chão entre reps'
    ],
    tips: ['Posterior e glúteos', 'Tensão constante']
  },
  {
    name: 'Hip Thrust',
    primaryMuscle: 'Glúteos',
    secondaryMuscles: ['Posterior'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Costas em banco',
      'Barra sobre quadril',
      'Empurre quadril acima em ponte'
    ],
    tips: ['Melhor exercício para glúteos', 'Contração no topo']
  },
  {
    name: 'Abdução de Quadril na Máquina',
    primaryMuscle: 'Glúteos',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Máquina',
    instructions: [
      'Sentado na máquina',
      'Abra pernas contra resistência',
      'Glúteo médio e mínimo'
    ],
    tips: ['Estabilidade de quadril', 'Importante para corredores']
  },
  {
    name: 'Adução de Quadril na Máquina',
    primaryMuscle: 'Pernas',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Máquina',
    instructions: [
      'Sentado, pernas abertas',
      'Junte contra resistência',
      'Adutores'
    ],
    tips: ['Adutores', 'Previne lesões']
  },
  {
    name: 'Elevação de Quadril no Solo',
    primaryMuscle: 'Glúteos',
    secondaryMuscles: ['Core'],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Deitado de costas, joelhos flexionados',
      'Eleve quadril contraindo glúteos',
      'Segure no topo'
    ],
    tips: ['Ativação de glúteos', 'Bom aquecimento']
  },
  {
    name: 'Step Up',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Glúteos'],
    type: 'compound',
    equipment: 'Banco',
    instructions: [
      'Suba em banco ou caixa',
      'Empurre com calcanhar',
      'Unilateral'
    ],
    tips: ['Funcional', 'Corrige assimetrias']
  },
  {
    name: 'Pistol Squat',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Core', 'Glúteos'],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Agachamento em uma perna',
      'Outra perna estendida à frente',
      'Extremamente difícil'
    ],
    tips: ['Exercício avançado', 'Mobilidade e força']
  },
  {
    name: 'Panturrilha em Pé',
    primaryMuscle: 'Panturrilha',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Máquina',
    instructions: [
      'Em pé na máquina',
      'Eleve calcanhares o máximo',
      'Desça alongando'
    ],
    tips: ['Amplitude completa', 'Pausa no topo']
  },
  {
    name: 'Panturrilha Sentado',
    primaryMuscle: 'Panturrilha',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Máquina',
    instructions: [
      'Sentado, joelhos sob almofada',
      'Eleve calcanhares',
      'Enfatiza sóleo'
    ],
    tips: ['Sóleo (joelho flexionado)', 'Alto volume']
  },
  {
    name: 'Panturrilha no Leg Press',
    primaryMuscle: 'Panturrilha',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Máquina',
    instructions: [
      'Apenas dedos na plataforma',
      'Empurre com panturrilhas',
      'Carga alta'
    ],
    tips: ['Variação com carga', 'Cuidado com joelhos']
  },
  {
    name: 'Prancha Frontal',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Ombros'],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Apoio nos antebraços e pontas dos pés',
      'Corpo em linha reta',
      'Mantenha posição'
    ],
    tips: ['Core fundamental', 'Não deixar quadril cair']
  },
  {
    name: 'Prancha Lateral',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Oblíquos'],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Apoio em um antebraço',
      'Corpo lateral em linha',
      'Quadril elevado'
    ],
    tips: ['Oblíquos', 'Estabilidade lateral']
  },
  {
    name: 'Abdominal Supra',
    primaryMuscle: 'Core',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Peso Corporal',
    instructions: [
      'Deitado, joelhos flexionados',
      'Eleve tronco contraindo abdômen',
      'Não puxar pescoço'
    ],
    tips: ['Básico efetivo', 'Contração qualidade']
  },
  {
    name: 'Abdominal Canivete',
    primaryMuscle: 'Core',
    secondaryMuscles: [],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Deitado, braços e pernas estendidos',
      'Junte simultaneamente',
      'Forma de V'
    ],
    tips: ['Core completo', 'Difícil']
  },
  {
    name: 'Elevação de Pernas',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Flexores do quadril'],
    type: 'isolation',
    equipment: 'Peso Corporal',
    instructions: [
      'Deitado, pernas retas',
      'Eleve até 90 graus',
      'Desça controladamente'
    ],
    tips: ['Abdome inferior', 'Não arquear lombar']
  },
  {
    name: 'Abdominal na Polia',
    primaryMuscle: 'Core',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Cabo',
    instructions: [
      'Ajoelhado, corda atrás da cabeça',
      'Contraia abdômen descendo',
      'Resistência constante'
    ],
    tips: ['Progressão de carga', 'Contração forte']
  },
  {
    name: 'Russian Twist',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Oblíquos'],
    type: 'compound',
    equipment: 'Anilha',
    instructions: [
      'Sentado, pés elevados',
      'Torça tronco lado a lado',
      'Segurando peso'
    ],
    tips: ['Rotação', 'Core completo']
  },
  {
    name: 'Mountain Climber',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Cardio'],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Posição de flexão',
      'Alterne joelhos ao peito rapidamente',
      'Mantém core estável'
    ],
    tips: ['Cardio + core', 'Ritmo constante']
  },
  {
    name: 'Dead Bug',
    primaryMuscle: 'Core',
    secondaryMuscles: [],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Deitado, joelhos e braços acima',
      'Alterne estendendo membros opostos',
      'Lombar colada no chão'
    ],
    tips: ['Estabilidade de core', 'Coordenação']
  },
  {
    name: 'Hollow Body Hold',
    primaryMuscle: 'Core',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Peso Corporal',
    instructions: [
      'Deitado, eleve pernas e ombros',
      'Forma de banana',
      'Segure isométrico'
    ],
    tips: ['Ginástica', 'Core forte']
  },
  {
    name: 'Abdominal Bicicleta',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Oblíquos'],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Deitado, mãos atrás da cabeça',
      'Alterne cotovelo com joelho oposto',
      'Movimento de pedalar'
    ],
    tips: ['Rotação + flexão', 'Eficiente']
  },
  {
    name: 'Levantamento Terra',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Pernas', 'Lombar', 'Trapézio', 'Core'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Barra no chão, pegue com mãos',
      'Costas retas, puxe corpo ereto',
      'Empurre quadril à frente no topo',
      'Desça controladamente'
    ],
    tips: ['Exercício mais completo', 'Forma perfeita essencial']
  },
  {
    name: 'Levantamento Terra Sumô',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Costas', 'Glúteos'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Stance largo, pegada estreita',
      'Tronco mais vertical',
      'Puxa com pernas e quadril'
    ],
    tips: ['Menos stress lombar', 'Mais glúteos']
  },
  {
    name: 'Levantamento Terra Trap Bar',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Costas', 'Core'],
    type: 'compound',
    equipment: 'Trap Bar',
    instructions: [
      'Entre na barra hexagonal',
      'Pegadas paralelas',
      'Puxa mais neutro'
    ],
    tips: ['Mais fácil nas costas', 'Híbrido squat e deadlift']
  },
  {
    name: 'Good Morning',
    primaryMuscle: 'Posterior',
    secondaryMuscles: ['Lombar', 'Glúteos'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Barra nas costas',
      'Incline à frente mantendo pernas quase retas',
      'Volte contraindo posterior'
    ],
    tips: ['Cuidado com lombar', 'Alongamento de posterior']
  },
  {
    name: 'Clean and Press',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Pernas', 'Core', 'Trapézio', 'Tríceps'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Puxe barra do chão aos ombros (clean)',
      'Imediatamente empurre acima (press)',
      'Movimento olímpico'
    ],
    tips: ['Corpo todo', 'Técnica complexa']
  },
  {
    name: 'Thruster',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Ombros', 'Core'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Front squat',
      'Ao subir, continue em shoulder press',
      'Movimento contínuo'
    ],
    tips: ['Explosivo', 'CrossFit staple']
  },
  {
    name: 'Snatch (Arranco)',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Ombros', 'Costas', 'Core', 'Trapézio'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Puxe barra do chão direto acima da cabeça',
      'Agache embaixo',
      'Técnica olímpica avançada'
    ],
    tips: ['Requer treino técnico', 'Explosão total']
  },
  {
    name: 'Clean (Puxada Olímpica)',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Costas', 'Trapézio', 'Core'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Puxe barra do chão aos ombros',
      'Agache embaixo',
      'Movimento explosivo'
    ],
    tips: ['Técnica olímpica', 'Potência']
  },
  {
    name: 'Swing com Kettlebell',
    primaryMuscle: 'Posterior',
    secondaryMuscles: ['Glúteos', 'Core', 'Ombros'],
    type: 'compound',
    equipment: 'Kettlebell',
    instructions: [
      'Kettlebell entre pernas',
      'Balanço explosivo até altura dos olhos',
      'Impulsão do quadril'
    ],
    tips: ['Cardio + força', 'Explosão de quadril']
  },
  {
    name: 'Turkish Get Up',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Ombros', 'Pernas'],
    type: 'compound',
    equipment: 'Kettlebell',
    instructions: [
      'Deitado, kettlebell acima',
      'Levante-se mantendo peso acima',
      'Movimento em etapas'
    ],
    tips: ['Corpo todo', 'Funcional avançado']
  },
  {
    name: 'Farmer Walk',
    primaryMuscle: 'Trapézio',
    secondaryMuscles: ['Antebraços', 'Core', 'Pernas'],
    type: 'compound',
    equipment: 'Halteres',
    instructions: [
      'Segure pesos pesados',
      'Caminhe mantendo postura',
      'Pegada e core'
    ],
    tips: ['Força funcional', 'Pegada brutal']
  },
  {
    name: 'Sled Push',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Core', 'Cardio'],
    type: 'compound',
    equipment: 'Sled',
    instructions: [
      'Empurre trenó carregado',
      'Passos curtos e rápidos',
      'Corpo inclinado'
    ],
    tips: ['Condicionamento', 'Sem excêntrico']
  },
  {
    name: 'Sled Pull',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Pernas', 'Bíceps'],
    type: 'compound',
    equipment: 'Sled',
    instructions: [
      'Puxe trenó caminhando de costas',
      'Corda ou alças',
      'Remada funcional'
    ],
    tips: ['Costas + condicionamento', 'Funcional']
  },
  {
    name: 'Battle Ropes',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Core', 'Cardio'],
    type: 'compound',
    equipment: 'Cordas',
    instructions: [
      'Segure cordas pesadas',
      'Ondule rapidamente',
      'Vários padrões'
    ],
    tips: ['Condicionamento', 'Ombros + cardio']
  },
  {
    name: 'Box Jump',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Core'],
    type: 'compound',
    equipment: 'Caixa',
    instructions: [
      'Salte em caixa',
      'Aterrissage suave',
      'Desça controladamente'
    ],
    tips: ['Pliométrico', 'Explosão']
  },
  {
    name: 'Burpee',
    primaryMuscle: 'Cardio',
    secondaryMuscles: ['Peito', 'Core', 'Pernas'],
    type: 'compound',
    equipment: 'Peso Corporal',
    instructions: [
      'Agache, mãos no chão',
      'Jogue pernas atrás (prancha)',
      'Flexão',
      'Pule de volta e salte'
    ],
    tips: ['Corpo todo', 'Cardio intenso']
  },
  {
    name: 'Wall Ball',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Ombros', 'Core'],
    type: 'compound',
    equipment: 'Medicine Ball',
    instructions: [
      'Segure medicine ball',
      'Agache e ao subir lance na parede',
      'Pegue e repita'
    ],
    tips: ['Explosão', 'CrossFit']
  },
  {
    name: 'Man Maker',
    primaryMuscle: 'Peito',
    secondaryMuscles: ['Costas', 'Ombros', 'Core', 'Cardio'],
    type: 'compound',
    equipment: 'Halteres',
    instructions: [
      'Flexão com halteres',
      'Remadas alternadas',
      'Burpee clean',
      'Shoulder press'
    ],
    tips: ['Exercício completo brutal', 'Condicionamento']
  },
  {
    name: 'Toes to Bar',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Flexores quadril', 'Pegada'],
    type: 'compound',
    equipment: 'Barra Fixa',
    instructions: [
      'Pendurado na barra',
      'Eleve pés até tocar barra',
      'Controle na descida'
    ],
    tips: ['Core avançado', 'Balanço controlado']
  },
  {
    name: 'Muscle Up',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Peito', 'Tríceps', 'Core'],
    type: 'compound',
    equipment: 'Barra Fixa',
    instructions: [
      'Pull up explosivo',
      'Transição sobre a barra',
      'Termina em dip'
    ],
    tips: ['Exercício avançado', 'Força + técnica']
  },
  {
    name: 'L-Sit',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Flexores quadril'],
    type: 'isolation',
    equipment: 'Paralelas',
    instructions: [
      'Apoio em paralelas ou chão',
      'Eleve pernas retas à frente (90 graus)',
      'Segure isométrico'
    ],
    tips: ['Ginástica', 'Core brutal']
  },
  {
    name: 'Handstand Push Up',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Tríceps', 'Core'],
    type: 'compound',
    equipment: 'Parede',
    instructions: [
      'Parada de mão na parede',
      'Desça até cabeça quase tocar',
      'Empurre de volta'
    ],
    tips: ['Exercício avançado', 'Ombros completos']
  },
  {
    name: 'Pistol Squat com Halter',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Core', 'Glúteos'],
    type: 'compound',
    equipment: 'Halteres',
    instructions: [
      'Agachamento em uma perna',
      'Segurando halter',
      'Progressão carregada'
    ],
    tips: ['Força unilateral', 'Equilíbrio + carga']
  },
  {
    name: 'Deficit Deadlift',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Pernas', 'Lombar'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Em pé sobre plataforma',
      'Barra mais baixa',
      'Maior amplitude de movimento'
    ],
    tips: ['Aumenta dificuldade', 'Força da posição baixa']
  },
  {
    name: 'Paused Squat',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Core'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Agachamento normal',
      'Pausa de 2-3 segundos no fundo',
      'Depois explode'
    ],
    tips: ['Remove reflexo de estiramento', 'Força']
  },
  {
    name: 'Overhead Squat',
    primaryMuscle: 'Pernas',
    secondaryMuscles: ['Ombros', 'Core'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Barra acima da cabeça braços retos',
      'Agache mantendo barra acima',
      'Mobilidade extrema'
    ],
    tips: ['Teste de mobilidade', 'Core e estabilização']
  },
  {
    name: 'Sissy Squat',
    primaryMuscle: 'Pernas',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Peso Corporal',
    instructions: [
      'Incline corpo para trás',
      'Joelhos à frente',
      'Desce sem mover quadril'
    ],
    tips: ['Isolamento de quadríceps', 'Cuidado com joelhos']
  },
  {
    name: 'Nordic Hamstring Curl',
    primaryMuscle: 'Posterior',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Peso Corporal',
    instructions: [
      'Ajoelhado, alguém segura tornozelos',
      'Desça lentamente à frente',
      'Resista com posterior'
    ],
    tips: ['Excêntrico brutal', 'Prevenção de lesão']
  },
  {
    name: '45 Degree Back Extension',
    primaryMuscle: 'Lombar',
    secondaryMuscles: ['Glúteos', 'Posterior'],
    type: 'compound',
    equipment: 'Banco',
    instructions: [
      'Banco 45 graus',
      'Incline à frente',
      'Volte contraindo lombar'
    ],
    tips: ['Hiperextensão', 'Lombar e glúteos']
  },
  {
    name: 'Reverse Hyper',
    primaryMuscle: 'Lombar',
    secondaryMuscles: ['Glúteos', 'Posterior'],
    type: 'compound',
    equipment: 'Máquina',
    instructions: [
      'Bruços na máquina',
      'Eleve pernas para trás',
      'Glúteos e lombar'
    ],
    tips: ['Descompressionamento lombar', 'Reabilitação']
  },
  {
    name: 'Glute Ham Raise',
    primaryMuscle: 'Posterior',
    secondaryMuscles: ['Glúteos'],
    type: 'compound',
    equipment: 'Máquina GHR',
    instructions: [
      'Máquina específica',
      'Desça controlado à frente',
      'Volte com posterior e glúteos'
    ],
    tips: ['Melhor exercício de posterior', 'Muito difícil']
  },
  {
    name: 'Cable Crunch Standing',
    primaryMuscle: 'Core',
    secondaryMuscles: [],
    type: 'isolation',
    equipment: 'Cabo',
    instructions: [
      'Em pé de costas para cabo',
      'Corda sobre ombros',
      'Contraia abdômen descendo'
    ],
    tips: ['Variação em pé', 'Sobrecarga progressiva']
  },
  {
    name: 'Ab Wheel Rollout',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Ombros'],
    type: 'compound',
    equipment: 'Roda Abdominal',
    instructions: [
      'Ajoelhado, segure roda',
      'Role à frente mantendo core',
      'Volte contraindo abdômen'
    ],
    tips: ['Core extremo', 'Progressão gradual']
  },
  {
    name: 'Dragon Flag',
    primaryMuscle: 'Core',
    secondaryMuscles: [],
    type: 'compound',
    equipment: 'Banco',
    instructions: [
      'Deitado segurando banco atrás',
      'Eleve corpo todo reto',
      'Desça controladamente'
    ],
    tips: ['Bruce Lee trademark', 'Avançadíssimo']
  },
  {
    name: 'Windmill com Kettlebell',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Oblíquos', 'Ombros'],
    type: 'compound',
    equipment: 'Kettlebell',
    instructions: [
      'Kettlebell acima',
      'Incline lateralmente',
      'Mão livre vai ao chão'
    ],
    tips: ['Mobilidade + força', 'Oblíquos']
  },
  {
    name: 'Pallof Press',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Oblíquos'],
    type: 'isolation',
    equipment: 'Cabo',
    instructions: [
      'Lateral ao cabo',
      'Empurre à frente resistindo rotação',
      'Anti-rotação'
    ],
    tips: ['Estabilidade de core', 'Anti-rotação']
  },
  {
    name: 'Woodchopper',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Oblíquos'],
    type: 'compound',
    equipment: 'Cabo',
    instructions: [
      'Cabo alto, puxe diagonalmente para baixo',
      'Rotação do tronco',
      'Movimento de machado'
    ],
    tips: ['Rotação', 'Oblíquos e core']
  },
  {
    name: 'Landmine Rotation',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Oblíquos', 'Ombros'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Barra em canto (landmine)',
      'Gire lado a lado',
      'Core rotacional'
    ],
    tips: ['Rotação explosiva', 'Funcional']
  },
  {
    name: 'Suitcase Carry',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Oblíquos', 'Pegada'],
    type: 'compound',
    equipment: 'Halteres',
    instructions: [
      'Segure peso em um lado apenas',
      'Caminhe mantendo postura ereta',
      'Não inclinar'
    ],
    tips: ['Anti-flexão lateral', 'Core unilateral']
  },
  {
    name: 'Overhead Carry',
    primaryMuscle: 'Ombros',
    secondaryMuscles: ['Core', 'Trapézio'],
    type: 'compound',
    equipment: 'Halteres',
    instructions: [
      'Peso(s) acima da cabeça',
      'Caminhe mantendo estável',
      'Core e ombros'
    ],
    tips: ['Estabilização extrema', 'Funcional']
  },
  {
    name: 'Zercher Carry',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Bíceps', 'Pernas'],
    type: 'compound',
    equipment: 'Barra',
    instructions: [
      'Barra nos cotovelos dobrados',
      'Caminhe',
      'Desconfortável mas efetivo'
    ],
    tips: ['Fortalece tudo', 'Variação única']
  },
  {
    name: 'Yoke Walk',
    primaryMuscle: 'Trapézio',
    secondaryMuscles: ['Core', 'Pernas'],
    type: 'compound',
    equipment: 'Yoke',
    instructions: [
      'Estrutura pesada nos ombros',
      'Caminhe',
      'Strongman'
    ],
    tips: ['Força bruta', 'Estabilização total']
  },
  {
    name: 'Atlas Stone Lift',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Pernas', 'Core', 'Bíceps'],
    type: 'compound',
    equipment: 'Atlas Stone',
    instructions: [
      'Abrace pedra pesada',
      'Levante em plataforma',
      'Strongman'
    ],
    tips: ['Força total do corpo', 'Técnica específica']
  },
  {
    name: 'Tire Flip',
    primaryMuscle: 'Costas',
    secondaryMuscles: ['Pernas', 'Core', 'Ombros'],
    type: 'compound',
    equipment: 'Pneu',
    instructions: [
      'Pneu pesado deitado',
      'Levante e empurre virando',
      'Explosão total'
    ],
    tips: ['Strongman', 'Condicionamento + força']
  }
];

// Initialize DB with seed data
export async function initializeDatabase() {
  try {
    // Check if exercises already exist
    const count = await db.exercises.count();
    
    if (count === 0) {
      // Seed exercises
      await db.exercises.bulkAdd(seedExercises);
      console.log('✅ Exercícios iniciais carregados:', seedExercises.length);
    }

    // Initialize user settings if not exists
    const settings = await db.userSettings.toArray();
    if (settings.length === 0) {
      await db.userSettings.add({
        theme: 'dark',
        defaultRestTime: 90,
        notificationsEnabled: true,
        weightUnit: 'kg',
        firstTimeSetup: true,
        onboardingCompleted: false,
        hydrationOnboardingCompleted: false
      });
      console.log('✅ Configurações iniciais criadas');
    }

    // Initialize hydration settings if not exists
    const hydrationSettings = await db.hydrationSettings.toArray();
    if (hydrationSettings.length === 0) {
      await db.hydrationSettings.add({
        enabled: false,
        dailyGoalLiters: 3.0,
        glassSize: 300,
        reminderInterval: 60,
        startHour: 7,
        endHour: 22,
        onboardingCompleted: false
      });
      console.log('✅ Configurações de hidratação criadas');
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    return false;
  }
}
