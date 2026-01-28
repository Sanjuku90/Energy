import { useUser } from "@/hooks/use-auth";
import { useTransactions, useWithdraw } from "@/hooks/use-transactions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, ArrowDownLeft, Clock, Search, Loader2, Copy } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

const withdrawSchema = z.object({
  amount: z.coerce.number().min(10, "Minimum withdrawal is $10"),
  method: z.string().min(1, "Select a method"),
  destination: z.string().min(3, "Enter a valid address/email"),
});

const depositSchema = z.object({
  amount: z.coerce.number().min(10, "Minimum deposit is $10"),
  transactionHash: z.string().min(10, "Enter a valid transaction hash/ID"),
});

export default function Wallet() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    refetchInterval: 1000,
  });
  const { data: transactions, isLoading } = useTransactions();
  const { mutate: withdraw, isPending: isWithdrawPending } = useWithdraw();
  const { toast } = useToast();

  const withdrawForm = useForm<z.infer<typeof withdrawSchema>>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: 0,
      method: "paypal",
      destination: "",
    },
  });

  const depositForm = useForm<z.infer<typeof depositSchema>>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: 0,
      transactionHash: "",
    },
  });

  const onWithdrawSubmit = (data: z.infer<typeof withdrawSchema>) => {
    if (Number(user?.balance) < data.amount) {
      toast({ title: "Error", description: "Insufficient balance", variant: "destructive" });
      return;
    }
    withdraw(data, {
      onSuccess: () => {
        toast({ title: "Success", description: "Withdrawal request submitted" });
        withdrawForm.reset();
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  const onDepositSubmit = async (data: z.infer<typeof depositSchema>) => {
    try {
      await apiRequest("POST", "/api/transactions/deposit", data);
      toast({ title: "Success", description: "Deposit request submitted. Waiting for validation." });
      depositForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <Card className="bg-card border-border/50 shadow-lg lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-muted-foreground uppercase tracking-wider text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-display font-bold text-glow mb-2">${Number(user.balance).toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mb-8">Available for withdrawal</p>
            
            <Tabs defaultValue="withdraw" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                <TabsTrigger value="deposit">Deposit</TabsTrigger>
              </TabsList>
              
              <TabsContent value="withdraw">
                <Form {...withdrawForm}>
                  <form onSubmit={withdrawForm.handleSubmit(onWithdrawSubmit)} className="space-y-4">
                    <FormField
                      control={withdrawForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Amount (USD)</Label>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                              <Input type="number" className="pl-6 bg-background border-border" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={withdrawForm.control}
                      name="method"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Method</Label>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="paypal">PayPal</SelectItem>
                              <SelectItem value="usdt">USDT (TRC20)</SelectItem>
                              <SelectItem value="bank">Bank Transfer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={withdrawForm.control}
                      name="destination"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Destination Address/Email</Label>
                          <FormControl>
                            <Input className="bg-background border-border" placeholder="e.g. user@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full font-bold uppercase tracking-wider" disabled={isWithdrawPending}>
                      {isWithdrawPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request Withdrawal"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="deposit">
                <div className="space-y-6 pt-4">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-4 uppercase tracking-widest font-mono">USDT TRC20 Address</p>
                    <div className="bg-background border border-border p-3 rounded-lg flex items-center justify-between gap-3 mb-4">
                      <code className="text-xs font-mono text-primary break-all select-all">ТNfP6AXj1cQfQSEscQDs9hkUKQnLx5GyBF</code>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          navigator.clipboard.writeText("ТNfP6AXj1cQfQSEscQDs9hkUKQnLx5GyBF");
                          toast({ title: "Copied", description: "Address copied to clipboard" });
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Send only USDT via TRC20 network.
                    </p>
                  </div>

                  <Form {...depositForm}>
                    <form onSubmit={depositForm.handleSubmit(onDepositSubmit)} className="space-y-4 border-t border-border/30 pt-4">
                      <FormField
                        control={depositForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Amount Deposited (USD)</Label>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                <Input type="number" className="pl-6 bg-background border-border" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={depositForm.control}
                        name="transactionHash"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Transaction Hash / ID</Label>
                            <FormControl>
                              <Input className="bg-background border-border" placeholder="Paste TXID here" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full font-bold uppercase tracking-wider">
                        Confirm Deposit
                      </Button>
                    </form>
                  </Form>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="bg-card border-border/50 shadow-lg lg:col-span-2 flex flex-col h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display tracking-wide">Transaction History</CardTitle>
              <CardDescription>Recent account activity</CardDescription>
            </div>
            <Button variant="outline" size="icon">
              <Search className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
            ) : !transactions || transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        tx.type === 'withdrawal' ? "bg-destructive/10 text-destructive" : 
                        tx.type === 'deposit' ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                      )}>
                        {tx.type === 'withdrawal' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium capitalize text-foreground">{tx.type}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(tx.createdAt || new Date()), "PPP p")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-display font-bold",
                        tx.type === 'withdrawal' ? "text-foreground" : "text-primary"
                      )}>
                        {tx.type === 'withdrawal' ? '-' : '+'}${Number(tx.amount).toFixed(2)}
                      </p>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full capitalize",
                        tx.status === 'completed' ? "bg-primary/10 text-primary" : 
                        tx.status === 'pending' ? "bg-yellow-500/10 text-yellow-500" : "bg-destructive/10 text-destructive"
                      )}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
