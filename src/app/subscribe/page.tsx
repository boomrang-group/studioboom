
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

const premiumFeatures = [
  'Générations de contenu illimitées',
  'Exportations avancées (Word, PowerPoint, MP4)',
  'Accès aux modèles de cours Premium',
  'Support prioritaire',
];

const subscriptionPlans = [
    {
        title: 'Mensuel',
        price: '7',
        period: '/ mois',
        description: 'Idéal pour commencer et tester toutes les fonctionnalités.',
    },
    {
        title: 'Trimestriel',
        price: '20',
        period: '/ trimestre',
        description: 'Économisez en vous engageant sur 3 mois.',
    },
    {
        title: 'Semestriel',
        price: '35',
        period: '/ semestre',
        description: 'Un excellent compromis pour une utilisation régulière.',
    },
    {
        title: 'Annuel',
        price: '60',
        period: '/ an',
        description: 'La meilleure offre pour un accès illimité toute l\'année.',
    },
]

export default function SubscribePage() {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">
          Passez à Studio BoomRang Premium
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
          Débloquez tout le potentiel de Studio BoomRang avec nos offres Premium.
          Créez, exportez et partagez sans limites.
        </p>
      </div>

      <Card className="max-w-md mx-auto border-primary border-2 shadow-lg">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 rounded-full h-16 w-16 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary"/>
            </div>
            <CardTitle className="text-2xl font-headline">Essayez Premium Gratuitement</CardTitle>
            <CardDescription>
                Profitez de 7 jours d'essai gratuit. Annulez à tout moment. Après 7 jours, l'abonnement mensuel de 7$ s'appliquera.
            </CardDescription>
        </CardHeader>
        <CardFooter>
            <Button className="w-full" size="lg" asChild>
                 <Link href={`/checkout?plan=Mensuel (Essai Gratuit)&price=7`}>Démarrer mon essai gratuit</Link>
            </Button>
        </CardFooter>
      </Card>


      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Avantages Premium</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {premiumFeatures.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-lg">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-3xl font-bold text-center font-headline mb-8">Choisissez votre plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subscriptionPlans.map((plan) => (
                 <Card key={plan.title} className="flex flex-col">
                    <CardHeader>
                        <CardTitle>{plan.title}</CardTitle>
                        <p className="text-3xl font-bold pt-2">{plan.price}$<span className="text-sm font-normal text-muted-foreground">{plan.period}</span></p>
                        <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow"></CardContent>
                    <CardFooter>
                        <Button className="w-full" asChild>
                            <Link href={`/checkout?plan=${plan.title}&price=${plan.price}`}>S'abonner</Link>
                        </Button>
                    </CardFooter>
                 </Card>
            ))}
        </div>
      </div>
      
       <div>
        <h2 className="text-3xl font-bold text-center font-headline mb-8">Utilisation à la carte</h2>
         <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Pay As You Go</CardTitle>
                 <CardDescription>
                    Vous n'avez pas besoin d'un abonnement ? Achetez des crédits pour l'utilisation des fonctionnalités d'IA à la demande. Parfait pour des besoins ponctuels.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <Button variant="outline" asChild>
                    <Link href={`/checkout?plan=Pay-As-You-Go&price=10`}>Acheter 10 crédits</Link>
                </Button>
            </CardFooter>
         </Card>
      </div>

    </div>
  );
}
