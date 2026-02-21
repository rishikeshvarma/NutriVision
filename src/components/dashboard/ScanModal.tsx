
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Camera, Loader2, Image as ImageIcon, Video, X, AlertCircle, Upload, SwitchCamera } from 'lucide-react';
import { recognizeFood } from '@/ai/flows/recognize-food-from-photo';
import { useUserData } from '@/hooks/use-user-data';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import RecognizedFoodDialog from './RecognizedFoodDialog';
import type { FoodItem } from '@/lib/types';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';

interface ScanModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

type ScanStep = 'initial' | 'camera' | 'preview';

const OptionCard = ({ icon: Icon, title, description, onClick, className }: { icon: React.ElementType, title: string, description: string, onClick: () => void, className?: string }) => (
    <Card 
        className={cn("text-center p-6 cursor-pointer hover:shadow-lg hover:border-primary transition-all duration-300 transform hover:-translate-y-1", className)}
        onClick={onClick}
    >
        <CardContent className="flex flex-col items-center justify-center gap-4">
            <div className="p-4 bg-primary/10 rounded-full">
                <Icon className="h-8 w-8 text-primary" />
            </div>
            <div className='mt-2'>
                <p className="font-semibold text-lg text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </CardContent>
    </Card>
);

export default function ScanModal({ isOpen, setIsOpen }: ScanModalProps) {
  const [step, setStep] = useState<ScanStep>('initial');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizedItems, setRecognizedItems] = useState<(Omit<FoodItem, 'id' | 'calories' | 'protein' | 'carbohydrates' | 'fat'> & { quantity: number; calories: number; protein: number; carbohydrates: number; fat: number; })[] | null>(null);
  const [isRecognitionDialogOpen, setIsRecognitionDialogOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);
  
  const { addMeal } = useUserData();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);


  const resetState = useCallback(() => {
    stopCamera();
    setStep('initial');
    setImagePreview(null);
    setIsRecognizing(false);
    setRecognizedItems(null);
  }, [stopCamera]);

  const handleModalOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetState();
    }
  };

  useEffect(() => {
    if (step !== 'camera' || !isOpen) {
      stopCamera();
      return;
    }
  
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({ variant: 'destructive', title: 'Camera not supported', description: 'Your browser does not support camera access.' });
        setHasCameraPermission(false);
        setStep('initial');
        return;
      }
  
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const availableVideoDevices = devices.filter(device => device.kind === 'videoinput');
        setVideoDevices(availableVideoDevices);
  
        let preferredDeviceId = selectedDeviceId;
        if (!preferredDeviceId) {
          const rearCamera = availableVideoDevices.find(device => device.label.toLowerCase().includes('back'));
          if (rearCamera) {
            preferredDeviceId = rearCamera.deviceId;
          } else if (availableVideoDevices.length > 0) {
            preferredDeviceId = availableVideoDevices[0].deviceId;
          }
          setSelectedDeviceId(preferredDeviceId);
        }
  
        const constraints: MediaStreamConstraints = {
          video: preferredDeviceId ? { deviceId: { exact: preferredDeviceId } } : true,
        };
  
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setHasCameraPermission(true);
  
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };
  
    getCameraPermission();
  
    return () => {
      stopCamera();
    };
  }, [step, isOpen, selectedDeviceId, stopCamera, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setStep('preview');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/jpeg');
        setImagePreview(dataUri);
        stopCamera();
        setStep('preview');
      }
    }
  };

  const handleSwitchCamera = () => {
    if (videoDevices.length > 1) {
      const currentDeviceIndex = videoDevices.findIndex(device => device.deviceId === selectedDeviceId);
      const nextDeviceIndex = (currentDeviceIndex + 1) % videoDevices.length;
      setSelectedDeviceId(videoDevices[nextDeviceIndex].deviceId);
    }
  };

  const handleRecognize = async () => {
    if (!imagePreview) return;
    setIsRecognizing(true);
    try {
      const result = await recognizeFood({ photoDataUri: imagePreview });
      setRecognizedItems(result.foodItems);
      setIsRecognitionDialogOpen(true);
    } catch (error) {
      console.error('Food recognition failed:', error);
      toast({
        title: 'Recognition Failed',
        description: 'Could not recognize food in the image. Please try another photo.',
        variant: 'destructive',
      });
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleLogMeal = (items: FoodItem[]) => {
    if (items.length > 0) {
      addMeal({ name: 'Scanned Meal', items });
    }
    setIsRecognitionDialogOpen(false);
    handleModalOpenChange(false);
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 'initial':
        return (
            <div className="p-2">
                <div className='text-center mb-6'>
                    <h3 className="text-xl font-bold font-headline">Log a Meal</h3>
                    <p className="text-sm text-muted-foreground">Choose how to add your meal to today's log.</p>
                </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <OptionCard 
                    icon={Camera}
                    title="Take Picture"
                    description="Use your camera to scan a meal."
                    onClick={() => setStep('camera')}
                />
                <OptionCard 
                    icon={Upload}
                    title="Upload Photo"
                    description="Select a photo from your gallery."
                    onClick={() => fileInputRef.current?.click()}
                />
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
          );
      case 'camera':
        return (
          <div className="flex flex-col gap-4">
            <div className="relative w-full aspect-video flex justify-center items-center bg-black rounded-lg overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4">
                <Button onClick={handleCapture} size="lg" className="rounded-full h-16 w-16 p-0 border-4 border-white bg-primary/70 backdrop-blur-sm" disabled={!hasCameraPermission}>
                    <Camera className="h-8 w-8" />
                </Button>
                </div>
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                <Button onClick={() => setStep('initial')} variant="ghost" size="icon" className="h-10 w-10 text-white bg-black/30 hover:bg-black/50 hover:text-white">
                    <X />
                </Button>
                {videoDevices.length > 1 && (
                    <Button onClick={handleSwitchCamera} variant="ghost" size="icon" className="h-10 w-10 text-white bg-black/30 hover:bg-black/50 hover:text-white">
                    <SwitchCamera />
                    </Button>
                )}
                </div>
            </div>
            {hasCameraPermission === false && (
                 <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        To take a picture, you must enable camera permissions for this app in your device's settings.
                    </AlertDescription>
                </Alert>
            )}
          </div>
        );
      case 'preview':
        return (
            <div className="flex flex-col gap-4">
                <div className="relative w-full aspect-video flex justify-center items-center bg-black rounded-lg overflow-hidden">
                    {imagePreview && <Image src={imagePreview} alt="Meal preview" fill className="object-contain" />}
                    <Button onClick={resetState} variant="ghost" size="icon" className="absolute top-2 left-2 h-10 w-10 text-white bg-black/30 hover:bg-black/50 hover:text-white">
                    <X />
                    </Button>
                </div>
                <Button onClick={handleRecognize} disabled={isRecognizing} className="w-full" size="lg">
                    {isRecognizing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Recognizing...</>
                    ) : (
                    <><Camera className="mr-2 h-4 w-4" /> Scan with AI</>
                    )}
                </Button>
            </div>
        );
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleModalOpenChange}>
        <DialogContent className={cn(
            "max-w-xl transition-all duration-300",
            step === 'initial' ? 'p-6' : 'p-2'
        )}>
            <DialogHeader className="sr-only">
                <DialogTitle>Scan a Meal</DialogTitle>
                <DialogDescription>Use your camera or upload a photo to recognize food items and log your meal.</DialogDescription>
            </DialogHeader>
            {renderStepContent()}
            <canvas ref={canvasRef} className="hidden"></canvas>
        </DialogContent>
      </Dialog>
      <RecognizedFoodDialog
        isOpen={isRecognitionDialogOpen}
        setIsOpen={setIsRecognitionDialogOpen}
        items={recognizedItems}
        onLogMeal={handleLogMeal}
        mealName="Scanned Meal"
      />
    </>
  );
}

    