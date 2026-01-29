import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle } from "lucide-react";

const faqItems = [
  {
    question: "Comment je gagne de l'argent ?",
    answer: "En restant connecté. Votre plan active une puissance virtuelle qui génère des gains chaque seconde."
  },
  {
    question: "Dois-je faire quelque chose pendant que je suis connecté ?",
    answer: "Non. Il suffit de rester connecté avec une activité normale."
  },
  {
    question: "Puis-je me déconnecter ?",
    answer: "Oui. Vous pouvez vous connecter et vous déconnecter librement."
  },
  {
    question: "Les gains sont-ils garantis ?",
    answer: "Les gains dépendent du plan choisi, du temps réellement connecté et du respect des règles."
  },
  {
    question: "Le réinvestissement est-il obligatoire ?",
    answer: "Non. Il est totalement facultatif."
  },
  {
    question: "Quel est le minimum de retrait ?",
    answer: "Le minimum est affiché dans votre tableau de bord."
  },
  {
    question: "Combien de temps prend un retrait ?",
    answer: "Entre instantané et 24h selon la méthode utilisée."
  },
  {
    question: "Puis-je avoir plusieurs comptes ?",
    answer: "Non. Un utilisateur = un compte."
  },
  {
    question: "Puis-je perdre mon argent ?",
    answer: "Toute activité frauduleuse peut entraîner la suspension du compte."
  }
];

export default function FAQ() {
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
          <h1 className="text-xl font-bold">Foire aux questions</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <HelpCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-display font-bold mb-4">FAQ</h2>
          <p className="text-muted-foreground">Trouvez les réponses aux questions les plus fréquentes.</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left" data-testid={`faq-question-${index}`}>
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground" data-testid={`faq-answer-${index}`}>
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">Vous avez d'autres questions ?</p>
          <Link href="/">
            <Button data-testid="button-back-register">Retour à l'accueil</Button>
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
