
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReferredUser } from "@/hooks/useReferralDashboard";

interface ReferredUsersProps {
  referrals: ReferredUser[];
}

const ReferredUsers = ({ referrals }: ReferredUsersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Utilisateurs parrainés</CardTitle>
        <CardDescription>
          Liste des utilisateurs que vous avez parrainés
        </CardDescription>
      </CardHeader>
      <CardContent>
        {referrals.length === 0 ? (
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
              {referrals.map((referral) => (
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
  );
};

export default ReferredUsers;
