
'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

const UpdateSubscriptionInputSchema = z.object({
  userId: z.string().min(1, 'User ID is required.'),
  newPlan: z.string().min(1, 'New plan is required.'),
});

export async function updateSubscription(input: z.infer<typeof UpdateSubscriptionInputSchema>) {
  const validation = UpdateSubscriptionInputSchema.safeParse(input);

  if (!validation.success) {
    throw new Error('Invalid input: ' + validation.error.message);
  }

  const { userId, newPlan } = validation.data;

  try {
    const userDocRef = doc(db, 'users', userId);
    
    const isTrial = newPlan.toLowerCase().includes('essai gratuit');

    const getEndDate = () => {
        const date = new Date();
        if (isTrial) {
            date.setDate(date.getDate() + 7);
        } else if (newPlan.toLowerCase().includes('mensuel')) {
            date.setMonth(date.getMonth() + 1);
        } else if (newPlan.toLowerCase().includes('trimestriel')) {
            date.setMonth(date.getMonth() + 3);
        } else if (newPlan.toLowerCase().includes('semestriel')) {
            date.setMonth(date.getMonth() + 6);
        } else if (newPlan.toLowerCase().includes('annuel')) {
            date.setFullYear(date.getFullYear() + 1);
        } else {
            return null; // For Pay-As-You-Go or other non-expiring plans
        }
        return date;
    }

    await updateDoc(userDocRef, {
      'subscription.plan': newPlan,
      'subscription.status': 'active',
      'subscription.isTrial': isTrial,
      'subscription.startDate': serverTimestamp(),
      'subscription.endDate': getEndDate(),
    });
    
    console.log(`Successfully updated subscription for user ${userId} to ${newPlan}`);

  } catch (error) {
    console.error('Error updating subscription:', error);
    throw new Error('Could not update subscription in Firestore.');
  }
}
