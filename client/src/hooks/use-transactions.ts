import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type WithdrawRequest } from "@shared/routes";

export function useTransactions() {
  return useQuery({
    queryKey: [api.transactions.list.path],
    queryFn: async () => {
      const res = await fetch(api.transactions.list.path);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return api.transactions.list.responses[200].parse(await res.json());
    },
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: WithdrawRequest) => {
      const res = await fetch(api.transactions.withdraw.path, {
        method: api.transactions.withdraw.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Withdrawal failed");
      }
      return api.transactions.withdraw.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
    },
  });
}
