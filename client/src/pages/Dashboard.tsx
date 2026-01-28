import { useUser } from "@/hooks/use-auth";
import { useMiningHeartbeat, usePlans } from "@/hooks/use-mining";
import PowerStation from "@/components/PowerStation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Battery, Timer, Zap, DollarSign, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { data: user } = useUser();
  const { data: plans } = usePlans();
  
  // Mining hook automatically sends heartbeats
  const { isMining } = useMiningHeartbeat();
  
  if (!user || !plans) return null; // Or skeleton

  const currentPlan = plans.find(p => p.id === user.currentPlanId) || plans[0];
  const powerOutput = parseFloat(currentPlan.powerKw);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Control Center</h1>
          <p className="text-muted-foreground">Monitoring active energy production matrix.</p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm font-mono text-primary">LIVE CONNECTION</span>
        </div>
      </div>

      <PowerStation 
        powerOutput={powerOutput} 
        isActive={isMining} 
        planName={currentPlan.name} 
      />

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
          title="Current Plan" 
          value={currentPlan.name} 
          icon={Battery}
          subtext={`${currentPlan.dailyMin}-${currentPlan.dailyMax} kWh/day`}
          color="text-yellow-500"
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
