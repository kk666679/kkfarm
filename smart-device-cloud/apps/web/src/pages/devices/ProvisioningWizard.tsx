import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, Circle } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  { id: 1, title: 'Device Info', description: 'Basic device information' },
  { id: 2, title: 'Configuration', description: 'Setup and configuration' },
  { id: 3, title: 'Apps', description: 'Install applications' },
  { id: 4, title: 'Review', description: 'Review and confirm' },
];

export default function ProvisioningWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    deviceName: '',
    deviceType: '',
    osVersion: '',
    location: '',
    owner: '',
    notes: '',
  });
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Handle provisioning logic
    navigate('/devices');
  };

  return (
    <PageContainer>
      <PageHeader
        title="Device Provisioning Wizard"
        description="Set up a new device for the fleet"
        breadcrumbs={[{ label: 'Devices' }, { label: 'Provisioning' }]}
      />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {steps.map(step => (
                <div key={step.id} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {currentStep > step.id ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : currentStep === step.id ? (
                      <Circle className="h-6 w-6 text-blue-600" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-300" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`font-medium text-sm ${
                        currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].title}</CardTitle>
              <CardDescription>{steps[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="deviceName">Device Name</Label>
                    <Input
                      id="deviceName"
                      placeholder="e.g., iPhone-14-001"
                      value={formData.deviceName}
                      onChange={e => setFormData({ ...formData, deviceName: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deviceType">Device Type</Label>
                    <Select
                      value={formData.deviceType}
                      onValueChange={value => setFormData({ ...formData, deviceType: value ?? '' })}
                    >
                      <SelectTrigger id="deviceType" className="mt-1">
                        <SelectValue placeholder="Select device type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iphone">iPhone</SelectItem>
                        <SelectItem value="ipad">iPad</SelectItem>
                        <SelectItem value="android-phone">Android Phone</SelectItem>
                        <SelectItem value="android-tablet">Android Tablet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="osVersion">OS Version</Label>
                    <Input
                      id="osVersion"
                      placeholder="e.g., iOS 17.2"
                      value={formData.osVersion}
                      onChange={e => setFormData({ ...formData, osVersion: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Lab A, Building 1"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="owner">Owner/Team</Label>
                    <Input
                      id="owner"
                      placeholder="e.g., QA Team"
                      value={formData.owner}
                      onChange={e => setFormData({ ...formData, owner: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional configuration notes..."
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-4">Select apps to install on this device:</p>
                    <div className="space-y-2">
                      {['Chrome', 'Gmail', 'Maps', 'YouTube', 'Slack'].map(app => (
                        <div key={app} className="flex items-center gap-2">
                          <input type="checkbox" id={app} defaultChecked className="h-4 w-4" />
                          <Label htmlFor={app} className="font-normal">
                            {app}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-accent">
                    <h4 className="font-semibold mb-3">Provisioning Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Device Name:</span>
                        <span className="font-medium">{formData.deviceName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium">{formData.deviceType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">{formData.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Owner:</span>
                        <span className="font-medium">{formData.owner}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1}>
                  Previous
                </Button>
                {currentStep < steps.length ? (
                  <Button onClick={handleNext} className="flex-1">
                    Next
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} className="flex-1">
                    Complete Provisioning
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
