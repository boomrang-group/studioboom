
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  let title = 'Une erreur est survenue';
  let description = "Une erreur inattendue s'est produite lors de votre paiement. Veuillez réessayer.";
  let Icon = XCircle;
  let iconColor = 'text-red-600';

  if (status === 'failed') {
    title = 'Paiement Échoué';
    description = 'Votre paiement n\'a pas pu être traité. Veuillez vérifier vos informations ou essayer un autre mode de paiement.';
    Icon = XCircle;
    iconColor = 'text-red-600';
  } else if (status === 'cancelled') {
    title = 'Paiement Annulé';
    description = 'Vous avez annulé le processus de paiement. Vous pouvez réessayer à tout moment.';
    Icon = AlertTriangle;
    iconColor = 'text-yellow-600';
  }

  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-[70vh]">
      <Card className="max-w-lg text-center">
        <CardHeader>
          <div className={`mx-auto bg-gray-100 rounded-full h-20 w-20 flex items-center justify-center`}>
            <Icon className={`h-12 w-12 ${iconColor}`} />
          </div>
          <CardTitle className="text-3xl font-headline mt-6">{title}</CardTitle>
          <CardDescription className="text-lg pt-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full" size="lg">
            <Link href="/subscribe">Retourner aux abonnements</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


export default function PaymentStatusPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <PaymentStatusContent />
        </Suspense>
    )
}

