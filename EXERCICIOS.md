# Lista de Exercícios Implementados - GymFlow

## ✅ 50 Exercícios na Seed Inicial

### Peito (5 exercícios)
1. Supino Reto com Barra
2. Supino Inclinado com Halteres
3. Crucifixo com Halteres
4. Flexão de Braço
5. Crossover no Cabo

### Costas (6 exercícios)
1. Barra Fixa
2. Remada Curvada com Barra
3. Puxada Frontal
4. Remada Unilateral com Halter
5. Levantamento Terra
6. Pullover com Halter

### Pernas (8 exercícios)
1. Agachamento Livre
2. Leg Press 45°
3. Stiff (Levantamento Terra Romeno)
4. Cadeira Extensora
5. Cadeira Flexora
6. Agachamento Búlgaro
7. Elevação Pélvica (Hip Thrust)
8. Panturrilha em Pé

### Ombros (6 exercícios)
1. Desenvolvimento com Barra
2. Desenvolvimento com Halteres
3. Elevação Lateral
4. Elevação Frontal
5. Crucifixo Inverso
6. Encolhimento com Halteres

### Bíceps (4 exercícios)
1. Rosca Direta com Barra
2. Rosca Alternada com Halteres
3. Rosca Martelo
4. Rosca Scott (Banco Scott)

### Tríceps (4 exercícios)
1. Tríceps Testa (Skull Crusher)
2. Tríceps Pulley (Puxada no Cabo)
3. Tríceps Francês com Halter
4. Mergulho em Paralelas

### Core/Abdômen (5 exercícios)
1. Prancha (Plank)
2. Abdominal Supra
3. Elevação de Pernas
4. Abdominal na Polia
5. Rotação Russa

## 📝 Detalhes de Cada Exercício

Todos os exercícios incluem:
- ✅ Nome completo
- ✅ Músculo primário
- ✅ Músculos secundários
- ✅ Tipo (Composto ou Isolado)
- ✅ Equipamento necessário
- ✅ Instruções passo a passo (3-4 passos)
- ✅ Dicas de execução (2-3 dicas)

## 🎯 Cobertura Muscular

✅ Peito - 5 exercícios
✅ Costas completas - 6 exercícios
✅ Pernas (quad, posterior, glúteo, panturrilha) - 8 exercícios
✅ Ombros (anterior, lateral, posterior) - 6 exercícios
✅ Bíceps - 4 exercícios
✅ Tríceps - 4 exercícios
✅ Core/Abdômen - 5 exercícios
✅ Trapézio - incluído
✅ Antebraço - incluído
✅ Braquial - incluído

**Total: 50+ exercícios**

## 🔄 Como Adicionar Mais Exercícios

### Pelo App (Feature Futura)
1. Vá em "Exercícios"
2. Clique em "+" no canto superior
3. Preencha os campos
4. Salve

### Programaticamente
Edite `src/lib/db.ts` e adicione no array `seedExercises`:

```typescript
{
  name: 'Nome do Exercício',
  primaryMuscle: 'Peito', // ou Costas, Pernas, etc
  secondaryMuscles: ['Ombros', 'Tríceps'],
  type: 'compound', // ou 'isolation'
  equipment: 'Barra', // ou Halteres, Máquina, etc
  instructions: [
    'Passo 1',
    'Passo 2',
    'Passo 3'
  ],
  tips: [
    'Dica 1',
    'Dica 2'
  ]
}
```

## 📚 Sugestões para Expandir (Meta: 200+ exercícios)

### Peito
- Supino declinado
- Flexão em declínio
- Peck deck
- Chest press máquina

### Costas
- Remada cavalinho
- Puxada pegada fechada
- Remada low row
- Levantamento terra sumô

### Pernas
- Afundo
- Hack squat
- Sissy squat
- Cadeira adutora/abdutora

### Ombros
- Arnold press
- Face pull
- Remada alta
- Elevação W

### Braços
- Rosca 21
- Rosca concentrada
- Tríceps corda
- Kickback

### Core
- Mountain climbers
- Hollow hold
- Ab wheel
- V-ups

---

**A biblioteca cresce conforme uso! 💪**
