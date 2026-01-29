import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";

export default function Privacy() {
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
          <h1 className="text-xl font-bold">Politique de confidentialité</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-display font-bold mb-4">Politique de Confidentialité</h2>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-8">
            <section>
              <h3 className="text-xl font-bold mb-4">Données collectées</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Email</li>
                <li>Mot de passe chiffré</li>
                <li>Adresse IP</li>
                <li>Temps de connexion</li>
                <li>Historique financier</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold mb-4">Utilisation</h3>
              <p className="text-muted-foreground mb-2">Les données servent à :</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Sécuriser les comptes</li>
                <li>Calculer les gains</li>
                <li>Traiter les retraits</li>
                <li>Prévenir la fraude</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold mb-4">Protection</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Données chiffrées</li>
                <li>Accès restreint</li>
                <li>Aucune revente à des tiers</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold mb-4">Cookies</h3>
              <p className="text-muted-foreground mb-2">Utilisés uniquement pour :</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Session utilisateur</li>
                <li>Sécurité</li>
                <li>Performance</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold mb-4">Droit utilisateur</h3>
              <p className="text-muted-foreground mb-2">Vous pouvez demander :</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Consultation</li>
                <li>Correction</li>
                <li>Suppression de vos données</li>
              </ul>
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
