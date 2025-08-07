
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Scissors,
  Type,
  Image as ImageIcon,
  Mic,
  Upload,
  Play,
  Pause,
  Download,
  Video,
  Music,
  Text,
  FileImage,
  Circle,
  Square,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Clip {
  id: number;
  start: number;
  end: number;
  duration: number;
  file: File;
}

interface TextClip {
    id: number;
    text: string;
    start: number;
    end: number;
    duration: number;
}

interface ImageClip {
    id: number;
    src: string;
    start: number;
    end: number;
    duration: number;
}

interface AudioClip {
    id: number;
    src: string;
    start: number;
    end: number;
    duration: number;
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
  const [textClips, setTextClips] = useState<TextClip[]>([]);
  const [newText, setNewText] = useState('');
  const [isTextDialogOpen, setIsTextDialogOpen] = useState(false);
  const [imageClips, setImageClips] = useState<ImageClip[]>([]);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  // Voice Over State
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioClips, setAudioClips] = useState<AudioClip[]>([]);
  const [isVoiceOverDialogOpen, setIsVoiceOverDialogOpen] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(0);


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
    if (isNaN(time)) return '0:00';
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

  const handleAddText = () => {
    if (!newText.trim() || !videoRef.current) return;

    const textDuration = 3; // Default duration of 3 seconds
    const startTime = videoRef.current.currentTime;
    const endTime = Math.min(startTime + textDuration, duration);

    const newTextClip: TextClip = {
      id: Date.now(),
      text: newText,
      start: startTime,
      end: endTime,
      duration: endTime - startTime,
    };

    setTextClips(prev => [...prev, newTextClip]);
    setNewText('');
    setIsTextDialogOpen(false);
    toast({
        title: 'Texte Ajouté',
        description: 'Votre texte a été ajouté sur la timeline.'
    })
  }
  
  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        setNewImageFile(file);
    } else {
        setNewImageFile(null);
        toast({
            title: 'Fichier Invalide',
            description: 'Veuillez sélectionner un fichier image valide (PNG, JPG, etc.).',
            variant: 'destructive',
        });
    }
  }

  const handleAddImage = () => {
    if (!newImageFile || !videoRef.current) return;
    
    const imageUrl = URL.createObjectURL(newImageFile);
    const imageDuration = 5; // Default duration 5 seconds
    const startTime = videoRef.current.currentTime;
    const endTime = Math.min(startTime + imageDuration, duration);

    const newImageClip: ImageClip = {
        id: Date.now(),
        src: imageUrl,
        start: startTime,
        end: endTime,
        duration: endTime - startTime,
    };

    setImageClips(prev => [...prev, newImageClip]);
    setNewImageFile(null);
    setIsImageDialogOpen(false);
    toast({
        title: 'Image Ajoutée',
        description: `L'image a été ajoutée à la timeline.`
    });
  }

  const handleStartRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        
        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                setAudioChunks((prev) => [...prev, event.data]);
            }
        };

        mediaRecorderRef.current.onstop = () => {
            stream.getTracks().forEach(track => track.stop()); // Stop mic access
        };
        
        setAudioChunks([]);
        mediaRecorderRef.current.start();
        setIsRecording(true);
        setRecordingStartTime(videoRef.current?.currentTime ?? 0);
        toast({ title: "L'enregistrement a commencé !" });
    } catch (error) {
        console.error("Error accessing microphone:", error);
        toast({
            title: "Accès au microphone refusé",
            description: "Veuillez autoriser l'accès au microphone dans les paramètres de votre navigateur.",
            variant: 'destructive'
        });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        toast({ title: "Enregistrement terminé", description: "Traitement de l'audio..." });
    }
  };

  useEffect(() => {
    if (!isRecording && audioChunks.length > 0) {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audioDuration = (videoRef.current?.currentTime ?? 0) - recordingStartTime;

        const newAudioClip: AudioClip = {
            id: Date.now(),
            src: audioUrl,
            start: recordingStartTime,
            end: recordingStartTime + audioDuration,
            duration: audioDuration,
        };

        setAudioClips(prev => [...prev, newAudioClip]);
        setAudioChunks([]); // Clear chunks for next recording
    }
  }, [isRecording, audioChunks, recordingStartTime]);


  const renderOverlays = () => {
    return (
        <>
            {textClips.map(clip => {
                if (currentTime >= clip.start && currentTime <= clip.end) {
                    return (
                        <div
                            key={clip.id}
                            className="absolute bottom-10 left-1/2 -translate-x-1/2 p-2 bg-black/50 text-white rounded-md text-xl font-bold"
                            style={{pointerEvents: 'none'}} // Make text non-interactive
                        >
                            {clip.text}
                        </div>
                    )
                }
                return null;
            })}
            {imageClips.map(clip => {
                 if (currentTime >= clip.start && currentTime <= clip.end) {
                    return (
                        <img
                            key={clip.id}
                            src={clip.src}
                            alt="Image incrustée"
                            className="absolute top-4 right-4 w-1/4 max-w-48 rounded-md shadow-lg"
                             style={{pointerEvents: 'none'}}
                        />
                    )
                 }
                 return null;
            })}
            {/* Audio overlays are not visual, but we can play them here */}
            {audioClips.map(clip => {
                if(isPlaying && currentTime >= clip.start && currentTime < clip.start + 0.1) {
                    const audio = new Audio(clip.src);
                    audio.play();
                }
                return null;
            })}
        </>
    )
  }
  
  const timelineWidth = 1000; // Fixed width for timeline for now

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
                    <div className="relative">
                        <video
                            ref={videoRef}
                            src={videoSrc}
                            className="w-full rounded-md bg-muted"
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onClick={togglePlay}
                        ></video>
                        {renderOverlays()}
                    </div>
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
              <CardContent className="overflow-x-auto pb-4">
                <div className="relative" style={{ width: `${timelineWidth}px`}}>
                    {/* Playhead */}
                    <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                        style={{ left: `${(currentTime / duration) * timelineWidth}px` }}
                    >
                         <div className="absolute -top-2 -translate-x-1/2 h-4 w-4 bg-red-500 rounded-full"></div>
                    </div>
                    
                    {/* Tracks */}
                    <div className="space-y-2 pt-4">
                        {/* Video Track */}
                        <div className="flex items-center gap-2">
                           <div className="w-24 text-xs font-semibold flex items-center gap-1 shrink-0">
                               <Video className="h-4 w-4" />
                               <span>Piste Vidéo</span>
                           </div>
                           <div className="h-20 bg-muted rounded-md flex-1 relative flex items-center">
                               {clips.map((clip) => (
                                <div
                                    key={clip.id}
                                    onClick={() => setActiveClip(clip)}
                                    className={cn(
                                    'h-full bg-primary/20 border-2 border-transparent cursor-pointer hover:border-primary',
                                    'flex items-center justify-center text-xs text-center p-1',
                                    'absolute',
                                    {
                                        'border-primary bg-primary/40': activeClip?.id === clip.id,
                                    }
                                    )}
                                    style={{
                                       left: `${(clip.start / duration) * timelineWidth}px`,
                                       width: `${(clip.duration / duration) * timelineWidth}px`,
                                    }}
                                >
                                    <span className="truncate">Clip Vidéo<br/>{formatTime(clip.duration)}</span>
                                </div>
                                ))}
                           </div>
                        </div>

                         {/* Image Track */}
                        <div className="flex items-center gap-2">
                           <div className="w-24 text-xs font-semibold flex items-center gap-1 shrink-0">
                               <FileImage className="h-4 w-4" />
                               <span>Piste Image</span>
                           </div>
                           <div className="h-12 bg-muted rounded-md flex-1 relative flex items-center">
                               {imageClips.map((clip) => (
                                <div
                                    key={clip.id}
                                    className={cn(
                                        'h-full bg-orange-500/20 border-2 border-orange-500 cursor-pointer',
                                        'flex items-center justify-center text-xs text-center p-1',
                                        'absolute'
                                    )}
                                    style={{
                                       left: `${(clip.start / duration) * timelineWidth}px`,
                                       width: `${(clip.duration / duration) * timelineWidth}px`,
                                    }}
                                >
                                     <img src={clip.src} alt="" className="h-full w-auto object-contain p-1"/>
                                </div>
                                ))}
                           </div>
                        </div>
                        
                        {/* Text Track */}
                        <div className="flex items-center gap-2">
                           <div className="w-24 text-xs font-semibold flex items-center gap-1 shrink-0">
                               <Text className="h-4 w-4" />
                               <span>Piste Texte</span>
                           </div>
                           <div className="h-12 bg-muted rounded-md flex-1 relative flex items-center">
                               {textClips.map((clip) => (
                                <div
                                    key={clip.id}
                                    className={cn(
                                        'h-full bg-blue-500/20 border-2 border-blue-500 cursor-pointer',
                                        'flex items-center justify-center text-xs text-center p-1',
                                        'absolute'
                                    )}
                                    style={{
                                       left: `${(clip.start / duration) * timelineWidth}px`,
                                       width: `${(clip.duration / duration) * timelineWidth}px`,
                                    }}
                                >
                                     <span className="truncate">{clip.text}</span>
                                </div>
                                ))}
                           </div>
                        </div>

                        {/* Audio Track */}
                        <div className="flex items-center gap-2">
                           <div className="w-24 text-xs font-semibold flex items-center gap-1 shrink-0">
                               <Music className="h-4 w-4" />
                               <span>Piste Audio</span>
                           </div>
                           <div className="h-12 bg-muted rounded-md flex-1 relative flex items-center">
                               {clips.map((clip) => (
                                <div
                                    key={`audio-${clip.id}`}
                                    className={cn(
                                    'h-full bg-green-500/20',
                                    'flex items-center justify-center text-xs text-center p-1',
                                    'absolute'
                                    )}
                                    style={{
                                       left: `${(clip.start / duration) * timelineWidth}px`,
                                       width: `${(clip.duration / duration) * timelineWidth}px`,
                                    }}
                                >
                                </div>
                                ))}
                                <span className="text-muted-foreground text-xs italic pl-2">Piste audio originale</span>
                           </div>
                        </div>

                        {/* Voice Over Track */}
                        <div className="flex items-center gap-2">
                           <div className="w-24 text-xs font-semibold flex items-center gap-1 shrink-0">
                               <Mic className="h-4 w-4" />
                               <span>Voix Off</span>
                           </div>
                           <div className="h-12 bg-muted rounded-md flex-1 relative flex items-center">
                                {audioClips.map((clip) => (
                                <div
                                    key={clip.id}
                                    className={cn(
                                        'h-full bg-red-500/20 border-2 border-red-500',
                                        'flex items-center justify-center text-xs text-center p-1',
                                        'absolute'
                                    )}
                                    style={{
                                       left: `${(clip.start / duration) * timelineWidth}px`,
                                       width: `${(clip.duration / duration) * timelineWidth}px`,
                                    }}
                                >
                                     <span className="truncate">Voix Off</span>
                                </div>
                                ))}
                           </div>
                        </div>
                    </div>
                </div>

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
                
                <Dialog open={isTextDialogOpen} onOpenChange={setIsTextDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full justify-start">
                      <Type className="mr-2 h-4 w-4" /> Ajouter du Texte
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter un calque de texte</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea 
                            placeholder="Votre texte ici..."
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                        />
                         <p className="text-sm text-muted-foreground mt-2">
                           Le texte sera ajouté à la position actuelle de la tête de lecture ({formatTime(currentTime)}) pour une durée de 3 secondes.
                        </p>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                         <Button variant="ghost">Annuler</Button>
                      </DialogClose>
                      <Button onClick={handleAddText}>Ajouter le texte</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full justify-start">
                        <ImageIcon className="mr-2 h-4 w-4" /> Incruster une Image/Logo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Incruster une image ou un logo</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                        />
                         {newImageFile && (
                            <div className="text-sm text-muted-foreground">
                                <p>Aperçu :</p>
                                <img src={URL.createObjectURL(newImageFile)} alt="Aperçu" className="mt-2 rounded-md max-h-40"/>
                            </div>
                         )}
                         <p className="text-sm text-muted-foreground">
                           L'image sera ajoutée à la position actuelle de la tête de lecture ({formatTime(currentTime)}) pour une durée de 5 secondes.
                        </p>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                         <Button variant="ghost">Annuler</Button>
                      </DialogClose>
                      <Button onClick={handleAddImage} disabled={!newImageFile}>Ajouter l'image</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={isVoiceOverDialogOpen} onOpenChange={setIsVoiceOverDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full justify-start" disabled={!videoSrc}>
                        <Mic className="mr-2 h-4 w-4" /> Ajouter une Voix Off
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter une Voix Off</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4 text-center">
                        <p className="text-sm text-muted-foreground">
                           L'enregistrement commencera à la position actuelle de la tête de lecture: {formatTime(currentTime)}.
                        </p>
                         {!isRecording ? (
                            <Button size="lg" onClick={handleStartRecording}>
                                <Circle className="mr-2 h-4 w-4 fill-red-500 text-red-500" />
                                Démarrer l'enregistrement
                            </Button>
                         ) : (
                            <Button size="lg" onClick={handleStopRecording} variant="destructive">
                                <Square className="mr-2 h-4 w-4 fill-white" />
                                Arrêter l'enregistrement
                            </Button>
                         )}
                         {isRecording && (
                            <p className="text-sm text-red-500 animate-pulse">Enregistrement en cours...</p>
                         )}
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                         <Button variant="ghost">Fermer</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

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
