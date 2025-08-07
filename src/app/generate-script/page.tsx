"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateVideoScript } from '@/ai/flows/generate-video-script';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Download, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

const formSchema = z.object({
  topic: z.string().min(10, 'Le sujet doit contenir au moins 10 caractères.'),
  targetAudience: z.string().min(5, "Le public cible doit contenir au moins 5 caractères."),
  lessonLengthMinutes: z.coerce.number().int().min(1).max(60),
});

export default function GenerateScriptPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [scriptContent, setScriptContent] = useState('');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      targetAudience: 'Élèves de primaire',
      lessonLengthMinutes: 5,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setScriptContent('');
    try {
      const result = await generateVideoScript(values);
      setScriptContent(result.script);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la génération du script.',
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
          Générateur de Script Vidéo
        </h1>
        <p className="text-muted-foreground">
          Transformez vos idées de leçons en scripts vidéo prêts à être tournés.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nouveau script vidéo</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sujet de la vidéo</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Le cycle de l'eau expliqué aux enfants"
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
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Public Cible</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Lycéens" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="lessonLengthMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée de la vidéo (minutes)</FormLabel>
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
                Générer le script
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {scriptContent && (
        <Card>
          <CardHeader>
            <CardTitle>Script Généré</CardTitle>
          </CardHeader>
          <CardContent>
             <div
              className="prose dark:prose-invert max-w-none whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: scriptContent }}
            />
          </CardContent>
          <CardFooter>
             <Button asChild variant="outline">
                <Link href="/subscribe">
                    <Crown className="mr-2 h-4 w-4 text-amber-500" />
                    <Download className="mr-2 h-4 w-4" />
                    Exporter en MP4
                </Link>
             </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
