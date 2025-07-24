'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Scissors,
  Type,
  Image as ImageIcon,
  Mic,
  Upload,
  Play,
  Pause,
  Clock,
  Download,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EditVideoPage() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const videoUrl = URL.createObjectURL(file);
      setVideoSrc(videoUrl);
    } else {
      toast({
        title: 'Fichier Invalide',
        description: 'Veuillez sélectionner un fichier vidéo valide.',
        variant: 'destructive',
      });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold">
          Editeur Vidéo
        </h1>
        <p className="text-muted-foreground">
          Montez vos vidéos de cours avec des outils simples et intuitifs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Importer une vidéo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2">
            <Input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Importer
            </Button>
          </div>
        </CardContent>
      </Card>

      {videoSrc && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Aperçu Vidéo</CardTitle>
                </CardHeader>
                <CardContent>
                    <video
                        ref={videoRef}
                        src={videoSrc}
                        className="w-full rounded-md bg-muted"
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                    ></video>
                    <div className="mt-4 flex items-center gap-4">
                       <Button onClick={togglePlay} size="icon">
                           {isPlaying ? <Pause /> : <Play />}
                       </Button>
                       <div className="flex items-center gap-2 text-sm font-mono w-full">
                           <span>{formatTime(currentTime)}</span>
                            <Slider
                                value={[currentTime]}
                                max={duration}
                                step={0.1}
                                onValueChange={handleSeek}
                            />
                           <span>{formatTime(duration)}</span>
                       </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent className="h-40 bg-muted rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">La timeline apparaîtra ici.</p>
                </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Outils d'édition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start">
                  <Scissors className="mr-2 h-4 w-4" /> Couper / Scinder
                </Button>
                <Button className="w-full justify-start">
                  <Type className="mr-2 h-4 w-4" /> Ajouter du Texte
                </Button>
                <Button className="w-full justify-start">
                  <ImageIcon className="mr-2 h-4 w-4" /> Incruster une Image/Logo
                </Button>
                <Button className="w-full justify-start">
                  <Mic className="mr-2 h-4 w-4" /> Ajouter une Voix Off
                </Button>
              </CardContent>
            </Card>
            <Button className="w-full" size="lg">
                <Download className="mr-2 h-4 w-4" />
                Exporter la Vidéo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}