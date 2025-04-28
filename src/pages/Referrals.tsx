
import { useState } from 'react';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useReferralDashboard } from "@/hooks/useReferralDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Copy, Share2, Users, CreditCard, Info } from "lucide-react";
import { toast } from "sonner";
import StatCard from "@/components/dashboard/StatCard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

const Referrals = () => {
  const { data, isLoading } = useReferralDashboard();
  const [activeTab, setActiveTab] = useState("overview");

  const copyReferralLink = async () => {
    if (!data?.stats?.referralUrl) return;
    
    try {
      await navigator.clipboard.writeText(data.stats.referralUrl);
      toast.success("Lien de parrainage copié dans le presse-papier");
    } catch (error) {
      console.error("Failed to copy referral link:", error);
      toast.error("Impossible de copier le lien");
    }
  };

  const handleShare = async () => {
    if (!data?.stats?.referralUrl) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoignez ReelStreamForge',
          text: 'Utilisez mon lien de parrainage pour vous inscrire à ReelStreamForge',
          url: data.stats.referralUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback to copy
      copyReferralLink();
    }
  };

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'available':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Disponible</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Payé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <DashboardHeader
          title="Parrainage"
          description="Invitez vos amis et gagnez des commissions"
        />
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded w-full" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <DashboardHeader
        title="Programme de parrainage"
        description="Invitez vos amis et gagnez 50% de leur abonnement"
      />

      {!data?.stats ? (
        <Card className="mb-8">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Info className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">Aucun programme de parrainage</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Connectez-vous à votre compte pour accéder à votre lien de parrainage unique.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-8 overflow-hidden border-2 border-brand-purple/20">
            <CardHeader className="bg-gradient-to-r from-brand-purple/10 to-brand-blue/10">
              <CardTitle>Votre lien de parrainage</CardTitle>
              <CardDescription>
                Partagez ce lien avec vos amis pour gagner 50% de commission sur leur abonnement
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-grow p-3 bg-gray-50 rounded-md border border-gray-200 break-all">
                  <code className="text-sm text-gray-800">{data.stats.referralUrl}</code>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={copyReferralLink} className="gap-2">
                    <Copy className="h-4 w-4" />
                    Copier
                  </Button>
                  <Button onClick={handleShare} className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Partager
                  </Button>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                <p className="text-blue-700 text-sm">
                  <strong>Code de parrainage :</strong> {data.stats.referralCode}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard 
              title="Utilisateurs parrainés"
              value={data.stats.totalReferrals}
              icon={<Users className="h-5 w-5 text-brand-purple" />}
            />
            <StatCard 
              title="Commissions totales"
              value={formatCurrency(data.stats.totalCommissions)}
              icon={<CreditCard className="h-5 w-5 text-brand-purple" />}
            />
            <StatCard 
              title="Commissions en attente"
              value={formatCurrency(data.stats.pendingCommissions)}
              icon={<CreditCard className="h-5 w-5 text-brand-purple" />}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-2 mb-4">
              <TabsTrigger value="overview">Utilisateurs parrainés</TabsTrigger>
              <TabsTrigger value="commissions">Commissions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Utilisateurs parrainés</CardTitle>
                  <CardDescription>
                    Liste des utilisateurs que vous avez parrainés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.referrals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p>Vous n'avez pas encore parrainé d'utilisateurs</p>
                      <p className="text-sm mt-2">
                        Partagez votre lien de parrainage pour commencer à gagner des commissions
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Date d'inscription</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.referrals.map((referral) => (
                          <TableRow key={referral.id}>
                            <TableCell>{referral.email}</TableCell>
                            <TableCell>
                              {format(new Date(referral.joinedAt), "PPP", { locale: fr })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="commissions">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des commissions</CardTitle>
                  <CardDescription>
                    Détail de vos commissions gagnées
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.commissions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p>Vous n'avez pas encore de commissions</p>
                      <p className="text-sm mt-2">
                        Gagnez des commissions lorsque vos filleuls s'abonnent
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Montant</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Paiement</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.commissions.map((commission) => (
                          <TableRow key={commission.id}>
                            <TableCell className="font-medium">
                              {formatCurrency(commission.amount, commission.currency)}
                            </TableCell>
                            <TableCell>{getStatusBadge(commission.status)}</TableCell>
                            <TableCell>
                              {format(new Date(commission.createdAt), "PPP", { locale: fr })}
                            </TableCell>
                            <TableCell>
                              {commission.paidAt ? (
                                format(new Date(commission.paidAt), "PPP", { locale: fr })
                              ) : (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-gray-400">-</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Pas encore payé</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Referrals;
