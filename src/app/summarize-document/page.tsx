
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { summarizeDocument } from '@/ai/flows/summarize-document';
import { generateSummaryAudio } from '@/ai/flows/generate-summary-audio';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, FileUp, FileCheck, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

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
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [summary, setSummary] = useState('');
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();
  const { userData } = useAuth();
  
  const credits = userData?.subscription?.credits;
  const isPayAsYouGo = userData?.subscription?.plan === 'Pay-As-You-Go';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const fileRef = form.register('document');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSummary('');
    setAudioSrc(null);
    setFileName('');

    try {
      const file = values.document[0];
      const documentDataUri = await fileToDataURI(file);
      const result = await summarizeDocument({ documentDataUri });
      setSummary(result.summary);
      setFileName(file.name);

      // Now generate audio
      setIsGeneratingAudio(true);
      try {
        const audioResult = await generateSummaryAudio(result.summary);
        setAudioSrc(audioResult.media);
      } catch (audioError) {
        console.error(audioError);
        toast({
          title: 'Erreur Audio',
          description: "La synthèse du texte a réussi, mais la génération de l'audio a échoué.",
          variant: 'destructive',
        });
      } finally {
        setIsGeneratingAudio(false);
      }

    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la synthèse du document.',
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
          Synthèse de Document
        </h1>
        <p className="text-muted-foreground">
          Importez un document et obtenez un résumé concis en quelques instants.
        </p>
      </div>

       {isPayAsYouGo && (
        <Card>
            <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Crédits restants : <span className="font-bold text-primary">{credits ?? 0}</span></p>
            </CardContent>
        </Card>
      )}

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
              <Button type="submit" disabled={isLoading || isGeneratingAudio}>
                {(isLoading || isGeneratingAudio) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Analyse du document...' : isGeneratingAudio ? 'Génération de l\'audio...' : 'Générer la synthèse'}
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
             {isGeneratingAudio && (
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <Loader2 className="h-4 w-4 animate-spin"/>
                    <p>Génération de la synthèse audio en cours...</p>
                </div>
             )}
             {audioSrc && (
                <div className="mb-6">
                    <h3 className="font-semibold mb-2 flex items-center gap-2"><Volume2 className="h-5 w-5"/> Écouter la synthèse</h3>
                    <audio controls src={audioSrc} className="w-full">
                        Votre navigateur ne supporte pas l'élément audio.
                    </audio>
                </div>
             )}
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br />') }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
