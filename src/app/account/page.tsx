
'use client';

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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

export default function AccountPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold">
          Mon Compte
        </h1>
        <p className="text-muted-foreground">
          Gérez les informations de votre profil et vos préférences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>
            Ces informations seront visibles par les autres utilisateurs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input id="name" defaultValue="Jean Dupont" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input id="email" type="email" defaultValue="jean.dupont@email.com" readOnly/>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Sauvegarder les modifications</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Préférences</CardTitle>
          <CardDescription>
            Gérez la façon dont vous recevez les notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label className="text-base">Notifications par e-mail</Label>
                    <p className="text-sm text-muted-foreground">
                        Recevoir des mises à jour sur les nouvelles fonctionnalités et les actualités du produit.
                    </p>
                </div>
                <Switch defaultChecked/>
            </div>
             <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label className="text-base">E-mails de marketing</Label>
                    <p className="text-sm text-muted-foreground">
                        Recevoir des offres promotionnelles et des newsletters.
                    </p>
                </div>
                <Switch />
            </div>
        </CardContent>
         <CardFooter>
          <Button>Sauvegarder les préférences</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supprimer le compte</CardTitle>
          <CardDescription>
            Une fois votre compte supprimé, toutes vos données seront définitivement effacées. Cette action est irréversible.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="destructive">Je comprends, supprimer mon compte</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
