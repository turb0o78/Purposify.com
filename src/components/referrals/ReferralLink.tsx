
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Share2, Info } from "lucide-react";
import { toast } from "sonner";
import { ReferralStats } from "@/hooks/useReferralDashboard";

interface ReferralLinkProps {
  stats: ReferralStats | null;
}

const ReferralLink = ({ stats }: ReferralLinkProps) => {
  const copyReferralLink = async () => {
    if (!stats?.referralUrl) return;
    
    try {
      await navigator.clipboard.writeText(stats.referralUrl);
      toast.success("Lien de parrainage copié dans le presse-papier");
    } catch (error) {
      console.error("Failed to copy referral link:", error);
      toast.error("Impossible de copier le lien");
    }
  };

  const handleShare = async () => {
    if (!stats?.referralUrl) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoignez ReelStreamForge',
          text: 'Utilisez mon lien de parrainage pour vous inscrire à ReelStreamForge',
          url: stats.referralUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback to copy
      copyReferralLink();
    }
  };

  if (!stats) {
    return (
      <Card className="mb-8">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-1">Aucun programme de parrainage</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Connectez-vous à votre compte pour accéder à votre lien de parrainage unique.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
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
            <code className="text-sm text-gray-800">{stats.referralUrl}</code>
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
            <strong>Code de parrainage :</strong> {stats.referralCode}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralLink;
