
'use client';

import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ConfirmationPage() {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 8000); // Stop confetti after 8 seconds
    return () => clearTimeout(timer);
  }, []);

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
