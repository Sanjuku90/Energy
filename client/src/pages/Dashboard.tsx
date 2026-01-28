import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { useMiningHeartbeat, usePlans } from "@/hooks/use-mining";
import PowerStation from "@/components/PowerStation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Battery, Timer, Zap, DollarSign, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    refetchInterval: 1000,
  });
  const { data: plans } = usePlans();
  
  // Mining hook automatically sends heartbeats
  const { isMining } = useMiningHeartbeat();
  
  if (!user || !plans) return null; // Or skeleton

  const activePlans = plans.filter(p => user.activePlanIds?.includes(p.id));
  const totalPower = activePlans.reduce((sum, p) => sum + parseFloat(p.powerKw), 0);
  const mainPlan = activePlans[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Control Center</h1>
          <p className="text-muted-foreground">Monitoring {activePlans.length} active energy production units.</p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full">
          <div className={cn("w-2 h-2 rounded-full", isMining && activePlans.length > 0 ? "bg-primary animate-pulse" : "bg-muted")} />
          <span className="text-sm font-mono text-primary uppercase">
            {isMining && activePlans.length > 0 ? "LIVE CONNECTION" : "DISCONNECTED"}
          </span>
        </div>
      </div>

      {activePlans.length > 0 ? (
        <PowerStation 
          powerOutput={totalPower} 
          isActive={isMining} 
          planName={`${activePlans.length} Units Active`} 
        />
      ) : (
        <Card className="bg-card border-dashed border-2 border-border/50 p-12 text-center">
          <CardContent className="space-y-4">
            <Battery className="w-12 h-12 mx-auto text-muted-foreground opacity-20" />
            <h2 className="text-xl font-display font-bold">No Active Power Plan</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              You haven't activated a power station yet. Purchase a plan to start mining energy.
            </p>
            <Button asChild>
              <Link href="/plans">View Available Plans</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Wallet Balance" 
          value={`$${Number(user.balance).toFixed(2)}`} 
          icon={DollarSign}
          trend="+2.5% today"
          color="text-primary"
        />
        <StatCard 
          title="Energy Mined" 
          value={`${Number(user.energyBalance).toFixed(4)} kWh`} 
          icon={Zap}
          subtext="Lifetime Total"
          color="text-accent"
        />
        <StatCard 
          title="Active Units" 
          value={activePlans.length} 
          icon={Battery}
          subtext={`${totalPower.toFixed(2)} kW Total Power`}
          color={activePlans.length > 0 ? "text-yellow-500" : "text-muted-foreground"}
        />
        <StatCard 
          title="Efficiency" 
          value="98.2%" 
          icon={TrendingUp}
          trend="Optimal"
          color="text-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-1 lg:col-span-2 bg-card border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="font-display tracking-wide flex items-center gap-2">
              <Timer className="w-5 h-5 text-primary" />
              Production Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-black/20 rounded-xl border border-white/5">
              Chart visualization would go here (Recharts)
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <CardHeader>
            <CardTitle className="font-display tracking-wide">System Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { time: "10:23 AM", msg: "Connection established securely.", type: "success" },
              { time: "09:15 AM", msg: "Daily bonus acquired: 0.5 kWh", type: "info" },
              { time: "Yesterday", msg: "Plan upgraded to Advanced.", type: "system" },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 text-sm border-b border-border/30 pb-3 last:border-0">
                <span className="font-mono text-xs text-muted-foreground min-w-[60px]">{log.time}</span>
                <span className={cn(
                  "flex-1",
                  log.type === "success" && "text-primary",
                  log.type === "info" && "text-accent",
                  log.type === "system" && "text-muted-foreground"
                )}>{log.msg}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, subtext, trend, color }: any) {
  return (
    <Card className="bg-card border-border/50 hover:border-primary/30 transition-colors shadow-lg group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={cn("p-2 rounded-lg bg-background border border-border group-hover:border-primary/50 transition-colors", color)}>
            <Icon className="w-5 h-5" />
          </div>
          {trend && <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">{trend}</span>}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl font-display font-bold text-foreground group-hover:text-glow transition-all">{value}</h3>
          {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
