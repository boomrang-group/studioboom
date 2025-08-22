'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateLessonContent } from '@/ai/flows/generate-lesson-content';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
import { Loader2, File, Presentation, Crown, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const formSchema = z.object({
  prompt: z.string().min(10, 'Le sujet doit contenir au moins 10 caractères.'),
});

export default function GenerateCoursePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lessonContent, setLessonContent] = useState('');
  const { toast } = useToast();
  const lessonContentRef = useRef<HTMLDivElement>(null);

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

  const handleExportPDF = async () => {
    if (!lessonContentRef.current) return;
    setIsExporting(true);
    toast({ title: 'Exportation en PDF', description: 'Veuillez patienter...' });

    try {
      const canvas = await html2canvas(lessonContentRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('cours-studio-boomrang.pdf');
      toast({ title: 'Succès', description: 'Le PDF a été téléchargé.' });
    } catch (error) {
      console.error('Export PDF error:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'exportation en PDF.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };


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
              ref={lessonContentRef}
              className="prose dark:prose-invert max-w-none p-4 bg-white text-black"
              dangerouslySetInnerHTML={{ __html: lessonContent.replace(/\n/g, '<br />') }}
            />
          </CardContent>
          <CardFooter className="gap-2">
             <Button variant="outline" onClick={handleExportPDF} disabled={isExporting}>
                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4"/>}
                Exporter en PDF
             </Button>
             <Button variant="outline" asChild>
                <Link href="/subscribe">
                    <Crown className="mr-2 h-4 w-4 text-amber-500" />
                    <File className="mr-2 h-4 w-4"/>
                    Word (.docx)
                </Link>
             </Button>
             <Button variant="outline" asChild>
                <Link href="/subscribe">
                    <Crown className="mr-2 h-4 w-4 text-amber-500" />
                    <Presentation className="mr-2 h-4 w-4"/>
                    PowerPoint (.pptx)
                </Link>
             </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
