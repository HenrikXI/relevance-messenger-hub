
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const verificationSchema = z.object({
  code: z.string().min(6, "Verifizierungscode muss mindestens 6 Zeichen lang sein").max(6, "Verifizierungscode darf maximal 6 Zeichen lang sein")
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

const VerifyEmail = () => {
  const { verifyEmail, sendVerificationEmail, pendingVerificationEmail } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (values: VerificationFormValues) => {
    setIsSubmitting(true);
    try {
      await verifyEmail(values.code);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (pendingVerificationEmail) {
      await sendVerificationEmail(pendingVerificationEmail);
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
          {!pendingVerificationEmail ? (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Keine ausstehende E-Mail-Überprüfung.</p>
              <Link to="/signin">
                <Button variant="outline">Zurück zur Anmeldung</Button>
              </Link>
            </div>
          ) : (
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
          )}
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-sm text-center text-muted-foreground mt-2">
            Keinen Code erhalten?{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto" 
              onClick={resendVerificationEmail}
              disabled={!pendingVerificationEmail || isSubmitting}
            >
              Erneut senden
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
