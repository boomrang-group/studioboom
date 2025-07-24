import {
  BookCopy,
  Clapperboard,
  FileQuestion,
  FileText,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: <BookCopy className="h-8 w-8 text-primary" />,
    title: 'Générateur de Cours',
    description:
      'Créez des plans de leçon complets et des contenus de cours en quelques secondes.',
    href: '/generate-course',
  },
  {
    icon: <Clapperboard className="h-8 w-8 text-primary" />,
    title: 'Générateur de Script Vidéo',
    description:
      'Produisez des scripts vidéo captivants pour vos leçons.',
    href: '/generate-script',
  },
  {
    icon: <FileQuestion className="h-8 w-8 text-primary" />,
    title: 'Générateur de Quiz',
    description:
      'Élaborez des quiz interactifs pour évaluer la compréhension des élèves.',
    href: '/generate-quiz',
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: 'Synthèse de Document',
    description:
      'Résumez rapidement des documents pour en extraire les points clés.',
    href: '/summarize-document',
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold">
          Tableau de bord
        </h1>
        <p className="text-muted-foreground">
          Bienvenue sur Kelasi Studio ! Choisissez un outil pour commencer.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card
            key={feature.href}
            className="flex flex-col transition-transform transform hover:-translate-y-1 hover:shadow-lg"
          >
            <CardHeader className="flex-row items-start gap-4 space-y-0">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                {feature.icon}
              </div>
              <div className="flex-1">
                <CardTitle className="font-headline text-xl">
                  {feature.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={feature.href}>
                  Ouvrir <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
