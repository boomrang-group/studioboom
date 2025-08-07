"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateQuiz, type GenerateQuizOutput } from '@/ai/flows/generate-quiz';
import Link from 'next/link';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Share2, ClipboardCopy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  lessonText: z.string().min(50, 'Le texte de la leçon doit contenir au moins 50 caractères.'),
  questionType: z.enum(['multiple choice', 'true/false', 'short answer']),
  numberOfQuestions: z.coerce.number().int().min(1).max(10),
});

export default function GenerateQuizPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [quizData, setQuizData] = useState<GenerateQuizOutput | null>(null);
  const [quizLink, setQuizLink] = useState('');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lessonText: '',
      questionType: 'multiple choice',
      numberOfQuestions: 5,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setQuizData(null);
    setQuizLink('');

    try {
      const result = await generateQuiz(values);
      setQuizData(result);

      const dataStr = JSON.stringify(result);
      const encodedData = Buffer.from(dataStr).toString('base64');
      const link = `${window.location.origin}/quiz/${Date.now()}?data=${encodeURIComponent(encodedData)}`;
      setQuizLink(link);

    } catch (error) {
      console.error(error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la génération du quiz.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(quizLink);
    toast({
        title: 'Copié !',
        description: 'Le lien du quiz a été copié dans le presse-papiers.'
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold">
          Générateur de Quiz
        </h1>
        <p className="text-muted-foreground">
          Créez des évaluations rapidement à partir de votre contenu de cours.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Créer un nouveau quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="lessonText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texte de la leçon</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Collez ici le contenu de votre leçon..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="questionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de questions</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="multiple choice">
                            Choix multiples (QCM)
                          </SelectItem>
                          <SelectItem value="true/false">Vrai/Faux</SelectItem>
                          <SelectItem value="short answer">
                            Réponse courte
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numberOfQuestions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de questions</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Générer le quiz
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {quizData && (
        <Card>
          <CardHeader>
            <CardTitle>Quiz Généré</CardTitle>
          </CardHeader>
          <CardContent>
             <div
              className="prose dark:prose-invert max-w-none"
             >
                {quizData.questions.map((q, i) => (
                    <div key={i} className="mb-4">
                        <p><strong>{i+1}. {q.question}</strong></p>
                        <ul className="list-disc pl-5">
                            {q.options.map((opt, j) => (
                                <li key={j}>{opt}</li>
                            ))}
                        </ul>
                        <p className="text-sm text-green-600">Réponse : {q.answer}</p>
                    </div>
                ))}
             </div>
          </CardContent>
           <CardFooter className="flex-col items-start gap-4">
            <h3 className="font-semibold">Partager le quiz interactif</h3>
             <div className="flex w-full items-center space-x-2">
                <Input value={quizLink} readOnly />
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                    <ClipboardCopy className="h-4 w-4" />
                </Button>
             </div>
             <Button asChild>
                <Link href={quizLink} target="_blank">
                    Ouvrir le quiz interactif <Share2 className="ml-2 h-4 w-4"/>
                </Link>
             </Button>
           </CardFooter>
        </Card>
      )}
    </div>
  );
}
