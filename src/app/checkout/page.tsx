
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Lock, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';

const creditCardSchema = z.object({
  name: z.string().min(2, { message: 'Le nom sur la carte est requis.' }),
  cardNumber: z
    .string()
    .regex(/^\d{16}$/, { message: 'Numéro de carte invalide (16 chiffres).' }),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: "Date d'expiration invalide (MM/AA)." }),
  cvc: z.string().regex(/^\d{3,4}$/, { message: 'CVC invalide (3 ou 4 chiffres).' }),
});

const mobileMoneySchema = z.object({
  telephone: z.string().min(9, { message: 'Numéro de téléphone requis.' }),
  email: z.string().email({ message: 'Adresse e-mail invalide.' }),
});

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'Non sélectionné';
  const price = searchParams.get('price') || '0';

  // Montant en centimes pour MaxiCash
  const amountInCents = parseInt(price, 10) * 100;
  // Référence unique pour la transaction
  const transactionReference = `KELASI-${Date.now()}`;

  const [acceptUrl, setAcceptUrl] = useState('');
  const [declineUrl, setDeclineUrl] = useState('');

  useEffect(() => {
    // We need to construct these URLs on the client-side to get the correct origin
    const origin = window.location.origin;
    const encodedPlan = encodeURIComponent(plan);
    setAcceptUrl(`${origin}/confirmation?plan=${encodedPlan}`);
    setDeclineUrl(`${origin}/payment-status?status=failed`);
  }, [plan]);


  const creditCardForm = useForm<z.infer<typeof creditCardSchema>>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      name: '',
      cardNumber: '',
      expiryDate: '',
      cvc: '',
    },
  });

  const mobileMoneyForm = useForm<z.infer<typeof mobileMoneySchema>>({
    resolver: zodResolver(mobileMoneySchema),
    defaultValues: {
      telephone: '',
      email: '',
    },
  });

  function onCreditCardSubmit(values: z.infer<typeof creditCardSchema>) {
    // In a real application, you would send this to a payment provider like Stripe.
    console.log('Credit Card details:', values);
    const encodedPlan = encodeURIComponent(plan);
    router.push(`/confirmation?plan=${encodedPlan}`);
  }

  // Mobile money form submission is handled by a standard form POST, not an async function.

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
        <Tabs defaultValue="credit-card" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="credit-card">
              <CreditCard className="mr-2 h-4 w-4" />
              Carte de crédit
            </TabsTrigger>
            <TabsTrigger value="mobile-money">
              <Smartphone className="mr-2 h-4 w-4" />
              Mobile Money
            </TabsTrigger>
          </TabsList>
          
          {/* Credit Card Payment Tab */}
          <TabsContent value="credit-card">
            <Card>
              <CardHeader>
                <CardTitle>Informations de paiement</CardTitle>
                <CardDescription>Veuillez entrer les détails de votre carte de crédit.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...creditCardForm}>
                  <form onSubmit={creditCardForm.handleSubmit(onCreditCardSubmit)} className="space-y-4">
                    <FormField
                      control={creditCardForm.control}
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
                      control={creditCardForm.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro de carte</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="•••• •••• •••• ••••" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={creditCardForm.control}
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
                        control={creditCardForm.control}
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
          </TabsContent>
          
          {/* Mobile Money Payment Tab */}
          <TabsContent value="mobile-money">
            <Card>
              <CardHeader>
                <CardTitle>Paiement par Mobile Money</CardTitle>
                <CardDescription>
                  Vous serez redirigé vers MaxiCash pour finaliser le paiement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...mobileMoneyForm}>
                  <form
                    action={process.env.NEXT_PUBLIC_MAXICASH_API_URL}
                    method="POST"
                    className="space-y-4"
                  >
                    {/* Hidden fields for MaxiCash API */}
                    <input type="hidden" name="PayType" value="MaxiCash" />
                    <input type="hidden" name="Amount" value={amountInCents} />
                    <input type="hidden" name="Currency" value="USD" />
                    <input type="hidden" name="MerchantID" value={process.env.NEXT_PUBLIC_MAXICASH_MERCHANT_ID} />
                    <input type="hidden" name="MerchantPassword" value={process.env.NEXT_PUBLIC_MAXICASH_MERCHANT_PASSWORD} />
                    <input type="hidden" name="Language" value="fr" />
                    <input type="hidden" name="Reference" value={transactionReference} />
                    <input type="hidden" name="accepturl" value={acceptUrl} />
                    <input type="hidden" name="declineurl" value={declineUrl} />
                    <input type="hidden" name="cancelurl" value={declineUrl} />

                    <FormField
                      control={mobileMoneyForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse e-mail</FormLabel>
                          <FormControl>
                            <Input placeholder="jean.dupont@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={mobileMoneyForm.control}
                      name="telephone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro de téléphone</FormLabel>
                          <FormControl>
                            <Input placeholder="+243 XXX XXX XXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" size="lg" disabled={!acceptUrl}>
                      Continuer avec MaxiCash
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <CheckoutForm />
    </Suspense>
  );
}
