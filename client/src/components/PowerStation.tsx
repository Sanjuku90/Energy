import { motion } from "framer-motion";
import { Wind, Sun, Battery, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PowerStationProps {
  powerOutput: number; // in kW
  isActive: boolean;
  planName: string;
}

export default function PowerStation({ powerOutput, isActive, planName }: PowerStationProps) {
  return (
    <div className="relative h-[300px] md:h-[400px] w-full bg-gradient-to-b from-slate-900 to-background border border-border/50 rounded-3xl overflow-hidden shadow-2xl">
      {/* Sky Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(200,40%,20%),transparent_70%)]" />
      
      {/* Sun / Moon */}
      <div className="absolute top-8 right-8 w-16 h-16 rounded-full bg-accent/20 blur-xl animate-pulse" />
      <div className="absolute top-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-accent to-transparent opacity-80 shadow-[0_0_30px_hsl(var(--accent))]" />

      {/* Stats Overlay */}
      <div className="absolute top-6 left-6 z-20 space-y-2">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-primary animate-ping" : "bg-destructive")} />
          <span className="text-xs font-mono uppercase text-muted-foreground tracking-widest">System Status</span>
          <span className={cn("text-xs font-bold uppercase", isActive ? "text-primary text-glow" : "text-destructive")}>
            {isActive ? "Online" : "Offline"}
          </span>
        </div>
        <div>
          <h2 className="text-3xl font-display font-bold text-white drop-shadow-md">
            {powerOutput.toFixed(2)} <span className="text-base text-muted-foreground">kW</span>
          </h2>
          <p className="text-sm text-accent font-medium">{planName} Matrix Active</p>
        </div>
      </div>

      {/* Grid Floor */}
      <div className="absolute bottom-0 w-full h-1/2" 
           style={{ 
             background: 'linear-gradient(180deg, transparent 0%, hsla(var(--primary), 0.05) 100%)',
             transform: 'perspective(500px) rotateX(60deg) translateY(50px) scale(1.5)',
             backgroundImage: `linear-gradient(hsla(var(--primary), 0.1) 1px, transparent 1px), linear-gradient(90deg, hsla(var(--primary), 0.1) 1px, transparent 1px)`,
             backgroundSize: '40px 40px',
             backgroundPosition: 'center bottom'
           }} 
      />

      {/* Wind Turbines */}
      <div className="absolute bottom-12 left-1/4 z-10 opacity-80">
        <div className="relative w-2 h-24 bg-foreground/20 rounded-full mx-auto">
          <motion.div 
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-32 h-32"
            animate={isActive ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-16 bg-white/10 rounded-full origin-bottom" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-16 bg-white/10 rounded-full origin-bottom rotate-120" style={{ transform: 'rotate(120deg)' }} />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-16 bg-white/10 rounded-full origin-bottom rotate-240" style={{ transform: 'rotate(240deg)' }} />
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-20 right-1/4 z-10 opacity-60 scale-75">
        <div className="relative w-2 h-24 bg-foreground/20 rounded-full mx-auto">
          <motion.div 
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-32 h-32"
            animate={isActive ? { rotate: -360 } : { rotate: 0 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-16 bg-white/10 rounded-full origin-bottom" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-16 bg-white/10 rounded-full origin-bottom rotate-120" style={{ transform: 'rotate(120deg)' }} />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-16 bg-white/10 rounded-full origin-bottom rotate-240" style={{ transform: 'rotate(240deg)' }} />
          </motion.div>
        </div>
      </div>

      {/* Solar Panel Array */}
      <div className="absolute bottom-0 left-0 right-0 h-24 z-20 flex justify-center gap-2 px-8">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="w-full h-full panel-gradient transform -skew-x-12 border-t border-r border-white/10 opacity-80"
            style={{ boxShadow: isActive ? '0 -10px 20px -5px hsla(var(--primary), 0.2)' : 'none' }}
          >
            <div className="w-full h-full bg-[linear-gradient(transparent_90%,hsla(255,255,255,0.05)_90%)] bg-[length:10px_10px]" />
          </div>
        ))}
      </div>
      
      {/* Particles */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full shadow-[0_0_5px_hsl(var(--primary))]"
              initial={{ opacity: 0, y: "100%", x: Math.random() * 100 + "%" }}
              animate={{ opacity: [0, 1, 0], y: "0%" }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
