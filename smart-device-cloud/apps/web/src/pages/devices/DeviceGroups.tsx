import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

interface DeviceGroup {
  id: string;
  name: string;
  description: string;
  deviceCount: number;
  createdAt: string;
  tags: string[];
}

export default function DeviceGroups() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  const { data: groups, isLoading } = useQuery({
    queryKey: ['device-groups'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        {
          id: '1',
          name: 'iOS Devices',
          description: 'All iPhone and iPad devices',
          deviceCount: 45,
          createdAt: '2025-01-01T00:00:00Z',
          tags: ['iOS', 'Production'],
        },
        {
          id: '2',
          name: 'Android Devices',
          description: 'Android phones and tablets',
          deviceCount: 78,
          createdAt: '2025-01-01T00:00:00Z',
          tags: ['Android', 'Production'],
        },
        {
          id: '3',
          name: 'Testing Devices',
          description: 'Devices reserved for QA testing',
          deviceCount: 32,
          createdAt: '2025-01-05T00:00:00Z',
          tags: ['QA', 'Testing'],
        },
      ] as DeviceGroup[];
    },
  });

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    // Handle create group logic
    setNewGroupName('');
    setNewGroupDesc('');
    setIsDialogOpen(false);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Device Groups"
        description="Organize devices into logical groups"
        breadcrumbs={[{ label: 'Devices' }, { label: 'Groups' }]}
        actions={[
          {
            label: 'Export',
            onClick: () => {},
          },
        ]}
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{groups?.length || 0}</p>
              <p className="text-sm text-muted-foreground mt-2">Total Groups</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {groups?.reduce((acc, g) => acc + g.deviceCount, 0) || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Grouped Devices</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    New Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Device Group</DialogTitle>
                    <DialogDescription>
                      Create a new group to organize your devices
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Group Name</label>
                      <Input
                        placeholder="e.g., Production iOS"
                        value={newGroupName}
                        onChange={e => setNewGroupName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Input
                        placeholder="Optional description"
                        value={newGroupDesc}
                        onChange={e => setNewGroupDesc(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button onClick={handleCreateGroup} className="w-full">
                      Create Group
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">Loading groups...</div>
            </CardContent>
          </Card>
        ) : groups && groups.length > 0 ? (
          groups.map((group: DeviceGroup) => (
            <Card key={group.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">{group.name}</h3>
                      <Badge variant="outline">{group.deviceCount} devices</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      {group.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                No groups yet. Create one to get started.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
