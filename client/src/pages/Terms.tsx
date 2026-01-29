import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back-home">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Conditions d'utilisation</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-display font-bold mb-4">Conditions Générales d'Utilisation</h2>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-8">
            <section>
              <h3 className="text-xl font-bold mb-4">1. Objet</h3>
              <p className="text-muted-foreground">
                La plateforme fournit un service de génération de revenus basé sur le temps de connexion.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold mb-4">2. Compte utilisateur</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Un seul compte par personne</li>
                <li>Informations exactes obligatoires</li>
                <li>L'utilisateur est responsable de son compte</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold mb-4">3. Fonctionnement</h3>
              <p className="text-muted-foreground mb-2">Les gains sont calculés automatiquement selon :</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Le plan actif</li>
                <li>Le temps connecté</li>
                <li>Le tarif interne du système</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold mb-4">4. Paiements</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Les plans sont payables à l'avance</li>
                <li>Les retraits sont soumis aux règles internes</li>
                <li>La plateforme peut refuser un retrait suspect</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold mb-4">5. Interdictions</h3>
              <p className="text-muted-foreground mb-2">Il est interdit de :</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Utiliser des bots</li>
                <li>Automatiser la connexion</li>
                <li>Manipuler le système</li>
                <li>Créer plusieurs comptes</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold mb-4">6. Sanctions</h3>
              <p className="text-muted-foreground mb-2">En cas de fraude :</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Gel des gains</li>
                <li>Suspension</li>
                <li>Suppression du compte sans compensation</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold mb-4">7. Limitation de responsabilité</h3>
              <p className="text-muted-foreground mb-2">
                La plateforme ne garantit pas un revenu fixe et ne peut être tenue responsable :
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Des pertes indirectes</li>
                <li>Des problèmes techniques externes</li>
                <li>Des interruptions temporaires</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold mb-4">8. Modification</h3>
              <p className="text-muted-foreground">
                La plateforme peut modifier ses règles à tout moment pour assurer sa stabilité.
              </p>
            </section>
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <Link href="/">
            <Button data-testid="button-back-home-bottom">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-muted-foreground text-center mb-4">
            Cette plateforme n'est pas un service financier ni un produit d'investissement réglementé. Les gains dépendent de l'activité de l'utilisateur et du plan choisi. Aucune garantie de profit n'est fournie.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary">Conditions d'utilisation</Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-primary">Politique de confidentialité</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
