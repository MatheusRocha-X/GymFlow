import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkoutSession, CompletedExercise, CompletedSet } from '../db';

interface ActiveWorkoutState {
  currentWorkout: WorkoutSession | null;
  isActive: boolean;
  startTime: Date | null;
  currentExerciseIndex: number;
  restTimer: {
    isActive: boolean;
    seconds: number;
    startTime: number | null;
  };

  // Actions
  startWorkout: (routineId: number | undefined, routineName: string, exercises: Array<{ exerciseId: number; exerciseName: string; sets: number; restSeconds?: number }>) => void;
  endWorkout: () => WorkoutSession | null;
  addSet: (exerciseIndex: number, set: CompletedSet) => void;
  updateSet: (exerciseIndex: number, setIndex: number, set: Partial<CompletedSet>) => void;
  nextExercise: () => void;
  previousExercise: () => void;
  startRestTimer: (seconds: number) => void;
  stopRestTimer: () => void;
  tickRestTimer: () => void;
  cancelWorkout: () => void;
}

export const useActiveWorkout = create<ActiveWorkoutState>()(
  persist(
    (set, get) => ({
      currentWorkout: null,
      isActive: false,
      startTime: null,
      currentExerciseIndex: 0,
      restTimer: {
        isActive: false,
        seconds: 0,
        startTime: null
      },

      startWorkout: (routineId, routineName, exercises) => {
        const now = new Date();
        const workoutExercises: CompletedExercise[] = exercises.map(ex => ({
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseName,
          restSeconds: ex.restSeconds || 90,
          sets: Array.from({ length: ex.sets }, (_, i) => ({
            setNumber: i + 1,
            reps: 0,
            weight: 0,
            completed: false
          }))
        }));

        set({
          currentWorkout: {
            routineId,
            routineName,
            startTime: now,
            exercises: workoutExercises,
            totalVolume: 0
          },
          isActive: true,
          startTime: now,
          currentExerciseIndex: 0
        });
      },

      endWorkout: () => {
        const state = get();
        if (!state.currentWorkout) return null;

        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - state.currentWorkout.startTime.getTime()) / 1000 / 60);
        
        // Calculate total volume
        const totalVolume = state.currentWorkout.exercises.reduce((total: number, exercise: any) => {
          return total + exercise.sets
            .filter((s: any) => s.completed)
            .reduce((sum: number, set: any) => sum + (set.reps * set.weight), 0);
        }, 0);

        const completedWorkout: WorkoutSession = {
          ...state.currentWorkout,
          endTime,
          duration,
          totalVolume
        };

        set({
          currentWorkout: null,
          isActive: false,
          startTime: null,
          currentExerciseIndex: 0,
          restTimer: { isActive: false, seconds: 0, startTime: null }
        });

        return completedWorkout;
      },

      addSet: (exerciseIndex, newSet) => {
        set((state: any) => {
          if (!state.currentWorkout) return state;
          
          const exercises = [...state.currentWorkout.exercises];
          exercises[exerciseIndex].sets.push(newSet);

          return {
            currentWorkout: {
              ...state.currentWorkout,
              exercises
            }
          };
        });
      },

      updateSet: (exerciseIndex, setIndex, setUpdate) => {
        set(state => {
          if (!state.currentWorkout) return state;

          const exercises = [...state.currentWorkout.exercises];
          exercises[exerciseIndex].sets[setIndex] = {
            ...exercises[exerciseIndex].sets[setIndex],
            ...setUpdate
          };

          return {
            currentWorkout: {
              ...state.currentWorkout,
              exercises
            }
          };
        });
      },

      nextExercise: () => {
        set(state => ({
          currentExerciseIndex: Math.min(
            state.currentExerciseIndex + 1,
            (state.currentWorkout?.exercises.length ?? 0) - 1
          ),
          restTimer: { isActive: false, seconds: 0, startTime: null }
        }));
      },

      previousExercise: () => {
        set(state => ({
          currentExerciseIndex: Math.max(state.currentExerciseIndex - 1, 0),
          restTimer: { isActive: false, seconds: 0, startTime: null }
        }));
      },

      startRestTimer: (seconds) => {
        set({
          restTimer: {
            isActive: true,
            seconds,
            startTime: Date.now()
          }
        });
      },

      stopRestTimer: () => {
        set({
          restTimer: {
            isActive: false,
            seconds: 0,
            startTime: null
          }
        });
      },

      tickRestTimer: () => {
        set(state => {
          if (!state.restTimer.isActive || state.restTimer.seconds <= 0) {
            return {
              restTimer: {
                isActive: false,
                seconds: 0,
                startTime: null
              }
            };
          }

          return {
            restTimer: {
              ...state.restTimer,
              seconds: state.restTimer.seconds - 1
            }
          };
        });
      },

      cancelWorkout: () => {
        set({
          currentWorkout: null,
          isActive: false,
          startTime: null,
          currentExerciseIndex: 0,
          restTimer: { isActive: false, seconds: 0, startTime: null }
        });
      }
    }),
    {
      name: 'active-workout-storage'
    }
  )
);
