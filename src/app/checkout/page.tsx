
'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CreditCard, Lock } from 'lucide-react';

const paymentSchema = z.object({
  name: z.string().min(2, { message: 'Le nom sur la carte est requis.' }),
  cardNumber: z.string().regex(/^\d{16}$/, { message: 'Numéro de carte invalide (16 chiffres).' }),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Date d\'expiration invalide (MM/AA).' }),
  cvc: z.string().regex(/^\d{3,4}$/, { message: 'CVC invalide (3 ou 4 chiffres).' }),
});

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'Non sélectionné';
  const price = searchParams.get('price') || '0';

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
        name: '',
        cardNumber: '',
        expiryDate: '',
        cvc: '',
    },
  });

  function onSubmit(values: z.infer<typeof paymentSchema>) {
    // In a real application, you would send this to a payment provider like Stripe.
    console.log('Payment details:', values);
    router.push('/confirmation');
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-6">
        <h1 className="font-headline text-3xl font-bold">Finaliser la commande</h1>
        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif de la commande</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <p className="text-lg">Plan {plan}</p>
              <p className="text-2xl font-bold">{price}$</p>
            </div>
            <CardDescription className="mt-2">
              Vous êtes sur le point de vous abonner au plan {plan}.
            </CardDescription>
          </CardContent>
        </Card>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span className="text-sm">Paiement sécurisé. Toutes les données sont chiffrées.</span>
        </div>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Informations de paiement</CardTitle>
            <CardDescription>Veuillez entrer les détails de votre carte de crédit.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom sur la carte</FormLabel>
                      <FormControl>
                        <Input placeholder="Jean Dupont" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de carte</FormLabel>
                      <FormControl>
                         <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                            <Input placeholder="•••• •••• •••• ••••" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Date d'expiration</FormLabel>
                            <FormControl>
                                <Input placeholder="MM/AA" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="cvc"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>CVC</FormLabel>
                            <FormControl>
                                <Input placeholder="•••" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                 <Button type="submit" className="w-full" size="lg">
                    Payer {price}$
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <CheckoutForm />
        </Suspense>
    )
}
