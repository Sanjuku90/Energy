import { useQuery, useMutation } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

export default function AdminPanel() {
  const { toast } = useToast();
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/admin/transactions"],
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/admin/transactions/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });
      toast({ title: "Success", description: "Transaction updated" });
    },
  });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  const pendingCount = transactions?.filter(t => t.status === "pending").length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage deposit and withdrawal requests</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-lg">
          <span className="text-primary font-bold">{pendingCount} PENDING</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions?.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>#{tx.userId}</TableCell>
                  <TableCell className="capitalize">{tx.type}</TableCell>
                  <TableCell className="font-bold">${tx.amount}</TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground max-w-xs truncate">
                      {tx.metadata ? JSON.stringify(tx.metadata) : "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tx.status === "completed" ? "default" : tx.status === "pending" ? "outline" : "destructive"}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {tx.status === "pending" && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => updateStatus.mutate({ id: tx.id, status: "completed" })}
                          disabled={updateStatus.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => updateStatus.mutate({ id: tx.id, status: "failed" })}
                          disabled={updateStatus.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
