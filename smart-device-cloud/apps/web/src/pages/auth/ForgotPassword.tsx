import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEmailSent(true);
      toast({
        title: 'Email Sent',
        description: 'Check your inbox for password reset instructions.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reset email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            {emailSent
              ? "We've sent a reset link to your email"
              : 'Enter your email to receive password reset instructions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Mail className="h-12 w-12 text-green-500" />
              </div>
              <p className="text-center text-sm">
                A password reset link has been sent to <strong>{email}</strong>
              </p>
              <p className="text-center text-xs text-muted-foreground">
                Check your spam folder if you don't see the email within a few minutes.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
              >
                Try Another Email
              </Button>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
