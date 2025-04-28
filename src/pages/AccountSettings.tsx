
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  User,
  Settings,
  Camera,
  Mail,
  Lock,
  Trash2,
  Edit,
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProfileFormValues {
  username: string;
  fullName: string;
  email: string;
  bio: string;
}

const AccountSettings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || "");

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      username: user?.user_metadata?.username || user?.email?.split("@")[0] || "",
      fullName: user?.user_metadata?.full_name || "",
      email: user?.email || "",
      bio: user?.user_metadata?.bio || "",
    },
  });

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user?.id}/avatar.${fileExt}`;

      setIsUpdating(true);
      toast({
        title: "Uploading avatar...",
        description: "Please wait while we upload your new avatar.",
      });

      // For demo purposes only - in a real implementation, you would upload to Supabase Storage
      // This is a placeholder for now
      setTimeout(() => {
        setAvatarUrl(URL.createObjectURL(file));
        setIsUpdating(false);
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated successfully.",
        });
      }, 1500);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was a problem uploading your avatar.",
      });
      setIsUpdating(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsUpdating(true);
      
      // In a real implementation, you would update the user's profile in Supabase
      // This is a placeholder for now
      setTimeout(() => {
        setIsUpdating(false);
        toast({
          title: "Profile updated",
          description: "Your profile information has been updated successfully.",
        });
      }, 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was a problem updating your profile.",
      });
      setIsUpdating(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      // In a real implementation, you would trigger a password reset email
      toast({
        title: "Password reset email sent",
        description: "Check your email for instructions to reset your password.",
      });
    } catch (error) {
      console.error("Error sending password reset:", error);
      toast({
        variant: "destructive",
        title: "Failed to send reset email",
        description: "There was a problem sending the password reset email.",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // In a real implementation, you would delete the user's account in Supabase
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      });
      
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete account",
        description: "There was a problem deleting your account.",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <DashboardHeader
        title="Paramètres du Compte"
        description="Gérez vos informations personnelles et préférences"
      />

      <div className="grid gap-6 md:grid-cols-[250px_1fr] mt-8">
        <div className="hidden md:block">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-xl">Navigation</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={() => document.getElementById("profile")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => document.getElementById("security")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Sécurité
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => document.getElementById("email")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate("/settings/subscription")}
              >
                Gérer l'abonnement
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="space-y-8">
          <div id="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={avatarUrl} alt="Profile picture" />
                      <AvatarFallback>{user?.email?.[0].toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -right-2 -bottom-2">
                      <label 
                        htmlFor="avatar-upload" 
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-background shadow-sm"
                      >
                        <Camera className="h-4 w-4" />
                        <span className="sr-only">Change avatar</span>
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        disabled={isUpdating}
                      />
                    </div>
                  </div>
                  <div>
                    <CardTitle>Informations Personnelles</CardTitle>
                    <CardDescription>
                      Mettez à jour vos informations de profil ici.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom d'utilisateur</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom complet</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={4}
                              placeholder="Parlez-nous un peu de vous..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? "Mise à jour..." : "Mettre à jour le profil"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div id="security">
            <Card>
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
                <CardDescription>
                  Gérez vos options de sécurité et de connexion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Changer le mot de passe</h3>
                    <p className="text-sm text-muted-foreground">
                      Mettez à jour votre mot de passe pour plus de sécurité
                    </p>
                  </div>
                  <Button onClick={handlePasswordReset}>
                    <Edit className="mr-2 h-4 w-4" />
                    Changer
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Supprimer le compte</h3>
                    <p className="text-sm text-muted-foreground">
                      Supprimer définitivement votre compte et toutes vos données
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous absolument sûr?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action ne peut pas être annulée. Cela supprimera définitivement votre
                          compte et toutes vos données de nos serveurs.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div id="email">
            <Card>
              <CardHeader>
                <CardTitle>Préférences d'email</CardTitle>
                <CardDescription>
                  Gérez vos préférences de notifications par email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse email</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormDescription>
                          Votre adresse email ne peut pas être modifiée.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Email preferences would go here */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
