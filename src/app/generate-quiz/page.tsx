"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateQuiz } from '@/ai/flows/generate-quiz';
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
import { Loader2, File, Presentation, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  lessonText: z.string().min(50, 'Le texte de la leçon doit contenir au moins 50 caractères.'),
  questionType: z.enum(['multiple choice', 'true/false', 'short answer']),
  numberOfQuestions: z.coerce.number().int().min(1).max(10),
});

export default function GenerateQuizPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [quizContent, setQuizContent] = useState('');
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
    setQuizContent('');
    try {
      const result = await generateQuiz(values);
      setQuizContent(result.quiz);
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
      
      {quizContent && (
        <Card>
          <CardHeader>
            <CardTitle>Quiz Généré</CardTitle>
          </CardHeader>
          <CardContent>
             <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: quizContent.replace(/\n/g, '<br />') }}
            />
          </CardContent>
           <CardFooter>
             <Button variant="outline">
                <Crown className="mr-2 h-4 w-4 text-amber-500" />
                Partager le quiz interactif
             </Button>
           </CardFooter>
        </Card>
      )}
    </div>
  );
}
