import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Habit } from '../types';
import { INITIAL_HABITS } from '../data/initialHabits';

export function subscribeHabits(userId: string, onUpdate: (habits: Habit[]) => void) {
  const habitsColRef = collection(db, 'users', userId, 'habits');

  return onSnapshot(
    habitsColRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Seed default habits for new user
        try {
          const batch = writeBatch(db);
          for (const habit of INITIAL_HABITS) {
            const hDoc = doc(db, 'users', userId, 'habits', habit.id);
            batch.set(hDoc, habit);
          }
          await batch.commit();
        } catch (err) {
          console.error('Failed to seed initial habits in Firestore:', err);
          onUpdate(INITIAL_HABITS);
        }
        return;
      }

      const habitList: Habit[] = [];
      snapshot.forEach((docSnap) => {
        habitList.push(docSnap.data() as Habit);
      });

      // Sort by creation date descending
      habitList.sort(
        (a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      );

      onUpdate(habitList);
    },
    (error) => {
      console.error('Firestore snapshot listener error:', error);
    }
  );
}

export async function saveHabitToFirestore(userId: string, habit: Habit) {
  const habitDocRef = doc(db, 'users', userId, 'habits', habit.id);
  await setDoc(habitDocRef, habit);
}

export async function updateHabitCompletedDatesInFirestore(
  userId: string,
  habitId: string,
  completedDates: string[]
) {
  const habitDocRef = doc(db, 'users', userId, 'habits', habitId);
  await updateDoc(habitDocRef, { completedDates });
}

export async function deleteHabitFromFirestore(userId: string, habitId: string) {
  const habitDocRef = doc(db, 'users', userId, 'habits', habitId);
  await deleteDoc(habitDocRef);
}

export async function resetHabitsToDefaultInFirestore(userId: string) {
  const habitsColRef = collection(db, 'users', userId, 'habits');
  const snapshot = await getDocs(habitsColRef);
  const batch = writeBatch(db);

  snapshot.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  for (const habit of INITIAL_HABITS) {
    const hDoc = doc(db, 'users', userId, 'habits', habit.id);
    batch.set(hDoc, habit);
  }

  await batch.commit();
}
