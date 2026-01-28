import { usePlans, usePurchasePlan } from "@/hooks/use-mining";
import { useUser } from "@/hooks/use-auth";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Zap, BatteryCharging, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Plans() {
  const { data: plans, isLoading } = usePlans();
  const { data: user } = useUser();
  const { mutate: purchase, isPending } = usePurchasePlan();
  const { toast } = useToast();

  if (isLoading || !plans) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const handlePurchase = (planId: number, planName: string, price: number) => {
    if (Number(user?.balance) < price) {
      toast({
        title: "Insufficient Funds",
        description: "Please deposit more funds to purchase this plan.",
        variant: "destructive"
      });
      return;
    }
    
    if (confirm(`Purchase ${planName} for $${price}?`)) {
      purchase(planId, {
        onSuccess: () => {
          toast({
            title: "Plan Activated!",
            description: `You are now on the ${planName} plan.`,
          });
        }
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-display font-bold mb-4 text-glow">Energy Matrices</h1>
        <p className="text-muted-foreground text-lg">
          Upgrade your connection hardware to increase energy mining efficiency and daily output.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {plans.map((plan) => {
          const isCurrent = user?.currentPlanId === plan.id;
          const isAffordable = Number(user?.balance) >= Number(plan.price);

          return (
            <Card 
              key={plan.id} 
              className={cn(
                "relative flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border-border/50",
                isCurrent ? "border-primary shadow-[0_0_30px_-10px_hsl(var(--primary))]" : "bg-card"
              )}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                  Active Matrix
                </div>
              )}
              
              <CardHeader className="text-center pt-8 pb-4 border-b border-border/50">
                <h3 className="font-display text-xl font-bold uppercase tracking-widest">{plan.name}</h3>
                <div className="mt-4 flex items-baseline justify-center text-foreground">
                  <span className="text-3xl font-bold">$</span>
                  <span className="text-5xl font-display font-black tracking-tighter">{Number(plan.price)}</span>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2">One-time Purchase</p>
              </CardHeader>
              
              <CardContent className="flex-1 py-8 px-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Power Output</p>
                    <p className="font-display font-bold text-lg">{plan.powerKw} kW</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    <BatteryCharging className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Potential</p>
                    <p className="font-display font-bold text-lg">{plan.dailyMin} - {plan.dailyMax} kWh</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/50">
                  {["24/7 Mining Access", "Real-time Analytics", "Priority Support", "Instant Withdrawal"].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary" />
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Button 
                  className={cn("w-full h-12 font-bold tracking-wide uppercase", isCurrent ? "bg-muted text-muted-foreground hover:bg-muted" : "")}
                  variant={isCurrent ? "outline" : "default"}
                  disabled={isCurrent || isPending}
                  onClick={() => !isCurrent && handlePurchase(plan.id, plan.name, Number(plan.price))}
                >
                  {isCurrent ? (
                    "Current Plan" 
                  ) : isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {isAffordable ? "Upgrade Now" : "Insufficient Funds"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
