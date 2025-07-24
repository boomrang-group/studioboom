'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateLessonContent } from '@/ai/flows/generate-lesson-content';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, File, Presentation, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  prompt: z.string().min(10, 'Le sujet doit contenir au moins 10 caractères.'),
});

export default function GenerateCoursePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [lessonContent, setLessonContent] = useState('');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setLessonContent('');
    try {
      const result = await generateLessonContent(values);
      setLessonContent(result.lessonContent);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la génération du cours.',
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
          Générateur de Cours
        </h1>
        <p className="text-muted-foreground">
          Décrivez le cours que vous souhaitez créer et laissez l'IA faire le reste.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Créer un nouveau cours</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sujet du cours</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Une leçon sur la photosynthèse pour des élèves de CM2, incluant des exemples simples et une activité pratique."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Générer le contenu
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {lessonContent && (
        <Card>
          <CardHeader>
            <CardTitle>Contenu Généré</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: lessonContent.replace(/\n/g, '<br />') }}
            />
          </CardContent>
          <CardFooter className="gap-2">
             <Button variant="outline">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M10.4 12.6c.2-.4.5-.8.9-1a2.1 2.1 0 0 1 2.6 2.5c0 .4-.1.8-.4 1.1l-2.1 2.1-2.1-2.1A2.1 2.1 0 0 1 10.4 12.6Z"></path><path d="M15.5 10H18v.5c.3 1.2-.4 2.5-1.5 3"></path></svg>
                Exporter en PDF
             </Button>
             <Button variant="outline">
                <Crown className="mr-2 h-4 w-4 text-amber-500" />
                <File className="mr-2 h-4 w-4"/>
                Word (.docx)
             </Button>
             <Button variant="outline">
                <Crown className="mr-2 h-4 w-4 text-amber-500" />
                <Presentation className="mr-2 h-4 w-4"/>
                PowerPoint (.pptx)
             </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
