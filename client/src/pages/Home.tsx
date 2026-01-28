import { useState } from "react";
import { useLogin, useRegister, useUser } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Shield, Globe, Cpu, Loader2, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { motion } from "framer-motion";

// Schema Definitions
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: isUserLoading } = useUser();
  const { mutate: login, isPending: isLoginPending } = useLogin();
  const { mutate: register, isPending: isRegisterPending } = useRegister();
  
  // If user is already logged in, redirect to dashboard
  if (user) {
    setLocation("/dashboard");
    return null;
  }

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
                <span className="text-sm font-bold tracking-wide uppercase">Next Gen Energy Mining</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-display font-black leading-tight text-white mb-6">
                Turn Time <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Into Energy</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                Join the decentralized energy network. Stay connected, contribute computational power, and earn real value in real-time.
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {[
                { icon: Shield, title: "Secure", desc: "Encrypted transactions" },
                { icon: Globe, title: "Global", desc: "Access anywhere" },
                { icon: Cpu, title: "Auto-Mine", desc: "Passive income" },
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
                <CardTitle className="font-display tracking-widest uppercase">Access Terminal</CardTitle>
                <CardDescription>Log in or register to start mining</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
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
                  By accessing the Energy Bank, you agree to our <br /> 
                  <a href="#" className="underline hover:text-primary">Terms of Service</a> and <a href="#" className="underline hover:text-primary">Privacy Protocol</a>.
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
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
                <Input placeholder="user@example.com" {...field} className="bg-background/50 border-border" />
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
              <Label>Password</Label>
              <FormControl>
                <Input type="password" {...field} className="bg-background/50 border-border" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full font-bold tracking-wide" disabled={isPending}>
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "AUTHENTICATE"}
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
              <Label>Username</Label>
              <FormControl>
                <Input placeholder="MinerOne" {...field} className="bg-background/50 border-border" />
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
                <Input placeholder="user@example.com" {...field} className="bg-background/50 border-border" />
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
              <Label>Password</Label>
              <FormControl>
                <Input type="password" {...field} className="bg-background/50 border-border" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full font-bold tracking-wide" disabled={isPending}>
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "INITIALIZE ACCOUNT"}
        </Button>
      </form>
    </Form>
  );
}
