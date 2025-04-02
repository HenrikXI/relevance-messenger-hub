
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const verificationSchema = z.object({
  code: z.string().min(6, "Verifizierungscode muss mindestens 6 Zeichen lang sein").max(6, "Verifizierungscode darf maximal 6 Zeichen lang sein")
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

const VerifyEmail = () => {
  const { verifyEmail, sendVerificationEmail, pendingVerificationEmail } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  // Redirect to signin if no pending verification
  useEffect(() => {
    if (!pendingVerificationEmail) {
      toast.error("Keine ausstehende E-Mail-Überprüfung");
      navigate("/signin");
    }
  }, [pendingVerificationEmail, navigate]);

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (values: VerificationFormValues) => {
    setIsSubmitting(true);
    try {
      const success = await verifyEmail(values.code);
      if (success) {
        toast.success("E-Mail erfolgreich verifiziert! Sie können sich jetzt anmelden.");
        form.reset();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (pendingVerificationEmail && !resendDisabled) {
      setResendDisabled(true);
      setCountdown(60);
      
      try {
        await sendVerificationEmail(pendingVerificationEmail);
        toast.success("Neuer Bestätigungscode wurde gesendet");
      } catch (error) {
        console.error("Fehler beim Senden der Verifizierungs-E-Mail", error);
        toast.error("Fehler beim Senden der Verifizierungs-E-Mail");
      }
      
      // Countdown für erneutes Senden
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">E-Mail bestätigen</CardTitle>
          <CardDescription className="text-center">
            Bitte geben Sie den Bestätigungscode ein, den wir an {pendingVerificationEmail || "Ihre E-Mail-Adresse"} gesendet haben
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bestätigungscode</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="XXXXXX" 
                        {...field}
                        maxLength={6}
                        className="text-center tracking-widest text-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Wird überprüft..." : "Bestätigen"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-sm text-center text-muted-foreground mt-2">
            Keinen Code erhalten?{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto" 
              onClick={resendVerificationEmail}
              disabled={resendDisabled || !pendingVerificationEmail}
            >
              {resendDisabled ? `Erneut senden (${countdown}s)` : "Erneut senden"}
            </Button>
          </div>
          <div className="text-sm text-center text-muted-foreground mt-2">
            <Link to="/signin" className="text-primary underline hover:text-primary/90">
              Zurück zur Anmeldung
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmail;
