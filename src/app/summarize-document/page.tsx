
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { summarizeDocument } from '@/ai/flows/summarize-document';
import { generateAudioSummary } from '@/ai/flows/generate-audio-summary';
import { generateAudioDialogue } from '@/ai/flows/generate-audio-dialogue';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, FileUp, FileCheck, Podcast, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'text/plain'];

const formSchema = z.object({
  document: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, 'Un fichier est requis.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `La taille maximum est de 5MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Uniquement les fichiers .pdf et .txt sont acceptés.'
    ),
});

const fileToDataURI = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function SummarizeDocumentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isDialogueLoading, setIsDialogueLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [audioSummary, setAudioSummary] = useState<string | null>(null);
  const [audioDialogue, setAudioDialogue] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const fileRef = form.register('document');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSummary('');
    setAudioSummary(null);
    setAudioDialogue(null);

    try {
      const file = values.document[0];
      const documentDataUri = await fileToDataURI(file);
      const result = await summarizeDocument({ documentDataUri });
      setSummary(result.summary);
      setFileName(file.name);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la synthèse du document.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleGenerateAudio = async () => {
      if (!summary.trim()) return;
      setIsAudioLoading(true);
      setAudioSummary(null);
      try {
          const result = await generateAudioSummary(summary);
          setAudioSummary(result.media);
          toast({
            title: 'Succès',
            description: 'Le résumé audio a été généré.'
          });
      } catch (error) {
          console.error(error);
          toast({
            title: 'Erreur audio',
            description: 'Une erreur est survenue lors de la génération du résumé audio.',
            variant: 'destructive',
          })
      } finally {
        setIsAudioLoading(false);
      }
  }

  const handleGenerateDialogue = async () => {
      if (!summary.trim()) return;
      setIsDialogueLoading(true);
      setAudioDialogue(null);
      try {
          const result = await generateAudioDialogue(summary);
          setAudioDialogue(result.media);
          toast({
            title: 'Succès',
            description: 'Le dialogue audio a été généré.'
          });
      } catch (error) {
          console.error(error);
          toast({
            title: 'Erreur de dialogue',
            description: 'Une erreur est survenue lors de la génération du dialogue audio.',
            variant: 'destructive',
          })
      } finally {
        setIsDialogueLoading(false);
      }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold">
          Synthèse de Document
        </h1>
        <p className="text-muted-foreground">
          Importez un document et obtenez un résumé concis en quelques instants.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Importer un document</CardTitle>
          <CardDescription>
            Formats acceptés : PDF, TXT. Taille maximale : 5MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fichier</FormLabel>
                    <FormControl>
                       <div className="relative">
                        <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input type="file" className="pl-10" {...fileRef} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Générer la synthèse
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-6 w-6"/>
                Synthèse de <span className="font-normal italic">{fileName}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br />') }}
            />
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <div className="flex flex-wrap gap-2">
                <Button onClick={handleGenerateAudio} disabled={isAudioLoading || !summary.trim()}>
                    {isAudioLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Podcast className="mr-2 h-4 w-4" />}
                    Générer un résumé audio
                </Button>
                <Button onClick={handleGenerateDialogue} disabled={isDialogueLoading || !summary.trim()}>
                    {isDialogueLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
                    Générer un dialogue audio
                </Button>
            </div>
            {audioSummary && (
                <div className="w-full mt-4">
                    <h3 className="font-semibold mb-2">Résumé audio :</h3>
                    <audio controls className="w-full">
                        <source src={audioSummary} type="audio/wav" />
                        Votre navigateur ne supporte pas l'élément audio.
                    </audio>
                </div>
            )}
            {audioDialogue && (
                <div className="w-full mt-4">
                    <h3 className="font-semibold mb-2">Dialogue audio :</h3>
                    <audio controls className="w-full">
                        <source src={audioDialogue} type="audio/wav" />
                        Votre navigateur ne supporte pas l'élément audio.
                    </audio>
                </div>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
