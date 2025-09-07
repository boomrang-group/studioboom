
'use client';

import { Suspense, useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { updateSubscription } from '@/lib/actions/update-subscription';
import { useToast } from '@/hooks/use-toast';

function ConfirmationContent() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isUpdating, setIsUpdating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const plan = searchParams.get('plan');

    if (loading) {
      return;
    }

    if (!user || !plan) {
      setError("Impossible de mettre à jour l'abonnement. L'utilisateur ou le plan est manquant.");
      setIsUpdating(false);
      return;
    }
    
    const performUpdate = async () => {
        try {
            await updateSubscription({ userId: user.uid, newPlan: plan });
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 8000); // Stop confetti after 8 seconds
            return () => clearTimeout(timer);
        } catch (err: any) {
             toast({
                title: 'Erreur de mise à jour',
                description: err.message || "Une erreur est survenue lors de la mise à jour de l'abonnement.",
                variant: 'destructive',
            });
            setError("Une erreur est survenue lors de la mise à jour de votre abonnement.");
        } finally {
            setIsUpdating(false);
        }
    }
    
    performUpdate();

  }, [user, loading, searchParams, toast]);

  if (isUpdating) {
    return (
        <div className="container mx-auto p-4 flex items-center justify-center min-h-[70vh]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Finalisation de votre abonnement...</p>
            </div>
        </div>
    )
  }

  if (error) {
     return (
        <div className="container mx-auto p-4 flex items-center justify-center min-h-[70vh]">
            <Card className="max-w-lg text-center">
                <CardHeader>
                    <CardTitle className="text-2xl text-destructive">Erreur</CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
                 <CardFooter>
                    <Button asChild className="w-full" size="lg">
                        <Link href="/">Retourner au tableau de bord</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
     )
  }


  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-[70vh]">
      {showConfetti && <Confetti recycle={false} />}
      <Card className="max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full h-20 w-20 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-headline mt-6">Paiement Réussi !</CardTitle>
          <CardDescription className="text-lg pt-2">
            Merci pour votre confiance. Votre abonnement est maintenant actif et vous avez accès à toutes les fonctionnalités Premium.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Un reçu a été envoyé à votre adresse e-mail. Vous pouvez commencer à utiliser les fonctionnalités avancées dès maintenant.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full" size="lg">
            <Link href="/">Retourner au tableau de bord</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ConfirmationPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <ConfirmationContent/>
        </Suspense>
    )
}
