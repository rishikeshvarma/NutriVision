
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const heroImage = PlaceHolderImages.find(img => img.id === 'hero-onboarding');

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

function AuthForm({ mode, onSubmit, isSubmitting }: { mode: 'login' | 'signup', onSubmit: (values: z.infer<typeof formSchema>) => void, isSubmitting: boolean }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </CardFooter>
      </form>
    </Form>
  )
}

export default function LoginPage() {
    const auth = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, isUserLoading } = useUser();

    useEffect(() => {
      // If the user is authenticated, redirect them to the main page,
      // which will then handle routing to the dashboard or onboarding.
      if (!isUserLoading && user) {
        router.replace('/');
      }
    }, [user, isUserLoading, router]);
    
    const handleAuthAction = async (mode: 'login' | 'signup', values: z.infer<typeof formSchema>) => {
        if (!auth) {
            toast({
                title: "Authentication service not ready",
                description: "Please wait a moment and try again.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        
        try {
            if (mode === 'signup') {
                await createUserWithEmailAndPassword(auth, values.email, values.password);
            } else {
                await signInWithEmailAndPassword(auth, values.email, values.password);
            }
            // On success, the useEffect above will handle the redirect.
        } catch (error: any) {
            console.error("Authentication Error:", error);
            toast({
                title: "Authentication Failed",
                description: error.message || "An unexpected error occurred. Please check your credentials and try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // While loading or if user is already logged in and redirecting, show a spinner.
    if (isUserLoading || user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Connecting...</p>
            </div>
        );
    }
    
    // Only render the form if there is no user and auth is not loading.
    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    <div className="flex justify-center mb-6">
                        <Logo className="h-12 w-auto" />
                    </div>
                    
                    <Tabs defaultValue="login" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Sign In</TabsTrigger>
                        <TabsTrigger value="signup">Create Account</TabsTrigger>
                      </TabsList>
                      <TabsContent value="login">
                        <Card>
                          <CardHeader>
                            <CardTitle className="font-headline">Welcome Back</CardTitle>
                            <CardDescription>Sign in to continue to your personalized dashboard.</CardDescription>
                          </CardHeader>
                          <AuthForm mode="login" onSubmit={(values) => handleAuthAction('login', values)} isSubmitting={isSubmitting} />
                        </Card>
                      </TabsContent>
                      <TabsContent value="signup">
                        <Card>
                          <CardHeader>
                            <CardTitle className="font-headline">Create an Account</CardTitle>
                            <CardDescription>Get started with your AI-powered nutrition plan today.</CardDescription>
                          </CardHeader>
                          <AuthForm mode="signup" onSubmit={(values) => handleAuthAction('signup', values)} isSubmitting={isSubmitting} />
                        </Card>
                      </TabsContent>
                    </Tabs>

                </div>
            </div>
            <div className="hidden md:block relative">
                {heroImage && (
                    <Image
                        src={heroImage.imageUrl}
                        alt={heroImage.description}
                        fill
                        sizes="50vw"
                        className="object-cover"
                        data-ai-hint={heroImage.imageHint}
                        priority
                    />
                )}
                <div className="absolute inset-0 bg-primary/30"></div>
            </div>
        </div>
    );
}
