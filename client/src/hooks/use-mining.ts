import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useEffect, useRef } from "react";
import { useUser } from "./use-auth";

export type MiningHeartbeatRequest = {
  connectedSeconds: number;
};

// Hook to handle the periodic heartbeat
export function useMiningHeartbeat() {
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const intervalRef = useRef<NodeJS.Timeout>();

  const mutation = useMutation({
    mutationFn: async (data: MiningHeartbeatRequest) => {
      const res = await fetch(api.mining.heartbeat.path, {
        method: api.mining.heartbeat.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Heartbeat failed");
      return api.mining.heartbeat.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      // Optimistically update user balance and energy
      queryClient.setQueryData([api.auth.me.path], (old: any) => {
        if (!old) return null;
        return {
          ...old,
          balance: data.newBalance.toString(),
          energyBalance: (parseFloat(data.energyProduced.toString()) + parseFloat(old.energyBalance)).toString(),
        };
      });
    },
  });

  useEffect(() => {
    if (!user) return;

    // Send heartbeat every 1 second for real-time updates
    intervalRef.current = setInterval(() => {
      mutation.mutate({ connectedSeconds: 1 });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, mutation]);

  return { isMining: !!user, lastHeartbeat: mutation.data };
}

export function usePlans() {
  return useQuery({
    queryKey: [api.plans.list.path],
    queryFn: async () => {
      const res = await fetch(api.plans.list.path);
      if (!res.ok) throw new Error("Failed to fetch plans");
      return api.plans.list.responses[200].parse(await res.json());
    },
  });
}

export function usePurchasePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (planId: number) => {
      const res = await fetch(api.plans.purchase.path, {
        method: api.plans.purchase.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to purchase plan");
      }
      return api.plans.purchase.responses[200].parse(await res.json());
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData([api.auth.me.path], updatedUser);
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
    },
  });
}
