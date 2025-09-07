
'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment, DocumentData } from 'firebase/firestore';

/**
 * Checks if a user has access to a premium feature and decrements credits if they are on a Pay-As-You-Go plan.
 * Throws an error if the user does not have access.
 * @param userId The ID of the user to check.
 */
export async function checkAndDeductCredits(userId: string): Promise<void> {
  if (!userId) {
    throw new Error('Utilisateur non authentifié.');
  }

  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    throw new Error("L'utilisateur n'existe pas.");
  }

  const userData = userDoc.data() as DocumentData;
  const subscription = userData.subscription;

  if (!subscription || subscription.status !== 'active') {
    throw new Error("Vous n'avez pas d'abonnement actif.");
  }
  
  // Standard subscription (monthly, yearly, etc.)
  if (subscription.plan !== 'Pay-As-You-Go') {
     if (subscription.endDate && subscription.endDate.toDate() < new Date()) {
        throw new Error('Votre abonnement a expiré.');
     }
     // If standard subscription is active, allow access without credit deduction.
     return;
  }

  // Pay-As-You-Go logic
  const credits = subscription.credits || 0;
  if (credits < 1) {
    throw new Error("Vous n'avez plus de crédits. Veuillez recharger votre compte.");
  }

  // Decrement credits
  await updateDoc(userDocRef, {
    'subscription.credits': increment(-1),
  });

  console.log(`Credit deducted for user ${userId}. Remaining: ${credits - 1}`);
}
