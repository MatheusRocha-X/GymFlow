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

  constructor() {
    super('GymFlowDB');
    
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
