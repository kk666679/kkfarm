import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Shield } from 'lucide-react';

export default function Verify2FA() {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a 6-digit code.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Verification Successful',
        description: 'You have been authenticated.',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: 'The code you entered is invalid or expired.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
          <CardDescription>Enter the 6-digit code from your authenticator app</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Authentication Code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                className="tracking-widest text-center text-2xl"
                required
              />
            </div>
            <div className="text-center text-sm">
              <span
                className={`font-semibold ${
                  timeLeft < 60 ? 'text-red-500' : 'text-muted-foreground'
                }`}
              >
                {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
              <p className="text-xs text-muted-foreground">Time remaining</p>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || timeLeft === 0}>
              {isSubmitting ? 'Verifying...' : 'Verify'}
            </Button>
            <Button variant="outline" className="w-full">
              Use Backup Code
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
