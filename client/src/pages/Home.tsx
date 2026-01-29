import { useState, useEffect } from "react";
import { useLogin, useRegister, useUser } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Shield, Globe, Cpu, Loader2, Clock, Wallet, RefreshCw, CheckCircle, HelpCircle, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: isUserLoading } = useUser();
  const { mutate: login, isPending: isLoginPending } = useLogin();
  const { mutate: register, isPending: isRegisterPending } = useRegister();
  
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  if (user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Hero Section */}
      <div className="relative overflow-hidden flex-1 flex flex-col justify-center items-center p-6 lg:p-12">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:50px_50px]" />
        </div>

        <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Branding */}
          <div className="space-y-8 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
                <Zap className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold tracking-wide uppercase">Revenus Automatiques</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-display font-black leading-tight text-foreground mb-6">
                Gagnez de l'argent <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">chaque seconde</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                Transformez votre temps en ligne en revenus réels. Chaque seconde passée connectée génère des gains automatiques selon la puissance de votre plan.
              </p>
            </motion.div>

            <motion.div 
              className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Pas de trading</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Pas de compétences techniques</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Pas de limite mensuelle</span>
              </div>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {[
                { icon: Clock, title: "Temps réel", desc: "Gains par seconde" },
                { icon: Wallet, title: "Retraits rapides", desc: "Accès à vos fonds" },
                { icon: RefreshCw, title: "Réinvestissement", desc: "Optionnel" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center lg:items-start gap-2">
                  <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-primary">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold font-display uppercase">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </motion.div>

            {/* Example Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Card className="bg-primary/5 border-primary/20 max-w-md mx-auto lg:mx-0">
                <CardContent className="p-4">
                  <h4 className="font-bold text-primary mb-2">Exemple - Plan Starter (49$)</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>0,001203$ / seconde</p>
                    <p>4,33$ / heure</p>
                    <p className="font-semibold text-foreground">26$ en 6 heures</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column: Auth Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="w-full max-w-md mx-auto"
          >
            <Card className="bg-card/80 backdrop-blur-xl border-border shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="font-display tracking-widest uppercase">Accès Plateforme</CardTitle>
                <CardDescription>Connectez-vous ou inscrivez-vous pour commencer</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login" data-testid="tab-login">Connexion</TabsTrigger>
                    <TabsTrigger value="register" data-testid="tab-register">Inscription</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <LoginForm login={login} isPending={isLoginPending} />
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <RegisterForm register={register} isPending={isRegisterPending} />
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="justify-center border-t border-border/50 pt-6">
                <p className="text-xs text-muted-foreground text-center">
                  En accédant à la plateforme, vous acceptez nos <br /> 
                  <Link href="/terms" className="underline hover:text-primary">Conditions d'utilisation</Link> et notre <Link href="/privacy" className="underline hover:text-primary">Politique de confidentialité</Link>.
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-card/50 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold mb-8">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { step: "1", text: "Inscrivez-vous" },
              { step: "2", text: "Choisissez un plan" },
              { step: "3", text: "Connectez-vous" },
              { step: "4", text: "Gagnez chaque seconde" },
              { step: "5", text: "Retirez ou réinvestissez" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>
                <p className="text-sm font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Us Section */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold mb-8">Pourquoi notre plateforme ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Sécurisé", desc: "Transactions chiffrées" },
              { icon: Globe, title: "Accessible", desc: "Partout dans le monde" },
              { icon: Cpu, title: "Automatique", desc: "Revenus passifs" },
              { icon: CheckCircle, title: "Transparent", desc: "Système clair" },
            ].map((item, i) => (
              <Card key={i} className="text-center p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Message */}
      <div className="bg-primary/5 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-xl font-bold mb-4">Nous privilégions</h3>
          <div className="flex flex-wrap justify-center gap-6 text-muted-foreground">
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> La transparence</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> La simplicité</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> L'équité</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> La sécurité des fonds</span>
          </div>
        </div>
      </div>

      {/* FAQ Preview */}
      <div className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold mb-4">Des questions ?</h2>
          <p className="text-muted-foreground mb-6">Consultez notre FAQ pour en savoir plus sur le fonctionnement de la plateforme.</p>
          <Link href="/faq">
            <Button variant="outline" data-testid="link-faq">
              Voir la FAQ <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
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
            <Link href="/faq" className="text-muted-foreground hover:text-primary" data-testid="footer-link-faq">FAQ</Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary" data-testid="footer-link-terms">Conditions d'utilisation</Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-primary" data-testid="footer-link-privacy">Politique de confidentialité</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LoginForm({ login, isPending }: any) {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => login(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <Label>Email</Label>
              <FormControl>
                <Input placeholder="utilisateur@exemple.com" {...field} className="bg-background/50 border-border" data-testid="input-email" />
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
              <Label>Mot de passe</Label>
              <FormControl>
                <Input type="password" {...field} className="bg-background/50 border-border" data-testid="input-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full font-bold tracking-wide" disabled={isPending} data-testid="button-login">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "SE CONNECTER"}
        </Button>
      </form>
    </Form>
  );
}

function RegisterForm({ register, isPending }: any) {
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => register(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <Label>Nom d'utilisateur</Label>
              <FormControl>
                <Input placeholder="MonPseudo" {...field} className="bg-background/50 border-border" data-testid="input-username" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <Label>Email</Label>
              <FormControl>
                <Input placeholder="utilisateur@exemple.com" {...field} className="bg-background/50 border-border" data-testid="input-register-email" />
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
              <Label>Mot de passe</Label>
              <FormControl>
                <Input type="password" {...field} className="bg-background/50 border-border" data-testid="input-register-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full font-bold tracking-wide" disabled={isPending} data-testid="button-register">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "CRÉER MON COMPTE"}
        </Button>
      </form>
    </Form>
  );
}
