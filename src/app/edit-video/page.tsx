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
import { cn } from '@/lib/utils';

interface Clip {
  id: number;
  start: number;
  end: number;
  duration: number;
  file: File;
}

export default function EditVideoPage() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const [clips, setClips] = useState<Clip[]>([]);
  const [activeClip, setActiveClip] = useState<Clip | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const videoUrl = URL.createObjectURL(file);
      setVideoSrc(videoUrl);
      // We need to wait for metadata to be loaded to get duration
    } else {
      toast({
        title: 'Fichier Invalide',
        description: 'Veuillez sélectionner un fichier vidéo valide.',
        variant: 'destructive',
      });
    }
  };
  
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      const file = (document.querySelector('input[type="file"]') as HTMLInputElement)?.files?.[0];
      if (file) {
        const initialClip: Clip = {
            id: Date.now(),
            start: 0,
            end: videoDuration,
            duration: videoDuration,
            file: file,
        };
        setClips([initialClip]);
        setActiveClip(initialClip);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
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

  const handleSplitClip = () => {
     if (!activeClip || !videoRef.current) return;

    const splitTime = videoRef.current.currentTime;
    
    // Ensure we can only split within the clip boundaries (not at the very start or end)
    if (splitTime <= activeClip.start + 0.1 || splitTime >= activeClip.end - 0.1) {
        toast({
            title: 'Impossible de scinder',
            description: 'Vous ne pouvez pas scinder au tout début ou à la toute fin du clip.',
            variant: 'destructive',
        });
        return;
    }

    const newClip1: Clip = {
      ...activeClip,
      id: activeClip.id, // Keep original ID for the first part
      end: splitTime,
      duration: splitTime - activeClip.start,
    };

    const newClip2: Clip = {
      ...activeClip,
      id: Date.now(), // New ID for the second part
      start: splitTime,
      duration: activeClip.end - splitTime,
    };

    setClips(prevClips => {
      const index = prevClips.findIndex(c => c.id === activeClip.id);
      if (index === -1) return prevClips;
      const updatedClips = [...prevClips];
      updatedClips.splice(index, 1, newClip1, newClip2);
      return updatedClips;
    });

    setActiveClip(newClip1); // Set the first new clip as active
     toast({
        title: 'Clip Scindé',
        description: `Le clip a été scindé à ${formatTime(splitTime)}.`,
      });
  };

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
              <CardContent className="h-40 bg-muted rounded-md p-2 flex items-center gap-1 overflow-x-auto">
                {clips.length > 0 ? (
                  clips.map((clip) => (
                    <div
                      key={clip.id}
                      onClick={() => setActiveClip(clip)}
                      className={cn(
                        'h-20 bg-primary/20 rounded-md border-2 border-transparent cursor-pointer hover:border-primary',
                        'flex items-center justify-center text-xs text-center p-1',
                        {
                          'border-primary bg-primary/40': activeClip?.id === clip.id,
                        }
                      )}
                      style={{ width: `${(clip.duration / duration) * 100}%` }}
                    >
                      <span className="truncate">Clip<br/>{formatTime(clip.duration)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center w-full">
                    La timeline apparaîtra ici.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Outils d'édition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" onClick={handleSplitClip} disabled={!activeClip}>
                  <Scissors className="mr-2 h-4 w-4" /> Couper / Scinder
                </Button>
                <Button className="w-full justify-start" disabled>
                  <Type className="mr-2 h-4 w-4" /> Ajouter du Texte
                </Button>
                <Button className="w-full justify-start" disabled>
                  <ImageIcon className="mr-2 h-4 w-4" /> Incruster une Image/Logo
                </Button>
                <Button className="w-full justify-start" disabled>
                  <Mic className="mr-2 h-4 w-4" /> Ajouter une Voix Off
                </Button>
              </CardContent>
            </Card>
            <Button className="w-full" size="lg" disabled>
                <Download className="mr-2 h-4 w-4" />
                Exporter la Vidéo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
