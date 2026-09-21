'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  Camera,
  Save,
  Edit2,
  Globe,
  Smartphone,
  Clock,
  Award,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/store/auth.store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

// Types
interface UserProfileData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
  role: 'admin' | 'user' | 'manager';
  createdAt: string;
  lastLogin: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  stats: {
    devicesOwned: number;
    totalReservations: number;
    activeReservations: number;
    automationRules: number;
  };
}

// Profile menu items for dropdown
const profileMenuItems = [
  { name: 'My Profile', href: '/profile', icon: User },
  { name: 'Account Settings', href: '/settings', icon: Settings },
  { name: 'Email Preferences', href: '/email-preferences', icon: Mail },
  { name: 'Privacy & Security', href: '/security', icon: Shield },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Help & Support', href: '/support', icon: HelpCircle },
];

interface UserProfileProps {
  isCollapsed?: boolean;
}

export function UserProfile({ isCollapsed = false }: UserProfileProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<UserProfileData>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Get user initials
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  // Generate avatar color based on user name
  const getAvatarColor = () => {
    if (!user?.name) return 'bg-primary';
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    const index = user.name.length % colors.length;
    return colors[index];
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Current auth context does not expose a profile update API, so we only
      // keep the dialog state in sync and surface success feedback here.
      if (avatarFile) {
        const reader = new FileReader();
        const avatarDataUrl = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read avatar'));
          reader.readAsDataURL(avatarFile);
        });

        // Preserve the selected avatar in the local editing state for preview.
        setEditingUser(previous => ({
          ...previous,
          avatar: avatarDataUrl,
        }));
      }

      setIsEditDialogOpen(false);
      setAvatarFile(null);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Avatar image must be less than 5MB.',
          variant: 'destructive',
        });
        return;
      }
      setAvatarFile(file);
    }
  };

  if (!user) {
    return null;
  }

  // User profile data with stats
  const userData: UserProfileData = {
    id: user.id || 'local-user',
    name: user.name || 'User',
    email: user.email || 'user@example.com',
    avatar: user.avatar,
    bio: (user as Partial<UserProfileData>).bio || '',
    location: (user as Partial<UserProfileData>).location || '',
    phone: (user as Partial<UserProfileData>).phone || '',
    role: (user.role as UserProfileData['role']) || 'user',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    stats: {
      devicesOwned: 12,
      totalReservations: 48,
      activeReservations: 3,
      automationRules: 7,
    },
    preferences: {
      theme: 'dark',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
    },
  };

  return (
    <>
      {/* Profile Trigger */}
      {!isCollapsed ? (
        <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
              <Avatar className="h-9 w-9 border-2 border-primary/20">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className={cn('text-white text-sm', getAvatarColor())}>
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform',
                  isProfileOpen && 'rotate-180'
                )}
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" side="top" sideOffset={10}>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {profileMenuItems.map(item => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.name}
                    onSelect={() => navigate(item.href)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        // Collapsed view
        <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <button className="w-full flex items-center justify-center rounded-lg px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground">
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className={cn('text-white text-sm', getAvatarColor())}>
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          </button>
          <DropdownMenuContent className="w-56" align="start" side="right" sideOffset={5}>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {profileMenuItems.map(item => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.name}
                    onSelect={() => navigate(item.href)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your personal information and preferences.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              {/* Avatar Upload */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-2 border-primary/20">
                    <AvatarImage
                      src={avatarFile ? URL.createObjectURL(avatarFile) : user?.avatar}
                      alt={user?.name}
                    />
                    <AvatarFallback className={cn('text-2xl text-white', getAvatarColor())}>
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-primary p-1.5 text-white shadow-lg transition-colors hover:bg-primary/80"
                  >
                    <Camera className="h-4 w-4" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Profile Photo</p>
                  <p className="text-xs text-muted-foreground">
                    Click the camera icon to upload a new photo. Max size: 5MB.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name || ''}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email || ''}
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="edit-bio">Bio</Label>
                <Textarea
                  id="edit-bio"
                  value={editingUser.bio || ''}
                  onChange={e => setEditingUser({ ...editingUser, bio: e.target.value })}
                  placeholder="Tell us about yourself"
                  rows={3}
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editingUser.location || ''}
                  onChange={e => setEditingUser({ ...editingUser, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={editingUser.phone || ''}
                  onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4 mt-4">
              {/* Theme */}
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex gap-2">
                  {['light', 'dark', 'system'].map(theme => (
                    <Button
                      key={theme}
                      variant={userData.preferences.theme === theme ? 'default' : 'outline'}
                      onClick={() => {
                        setEditingUser({
                          ...editingUser,
                          preferences: {
                            ...userData.preferences,
                            theme: theme as 'light' | 'dark' | 'system',
                          },
                        });
                      }}
                      className="capitalize"
                    >
                      {theme}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label>Language</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={userData.preferences.language}
                  onChange={e =>
                    setEditingUser({
                      ...editingUser,
                      preferences: {
                        ...userData.preferences,
                        language: e.target.value,
                      },
                    })
                  }
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>

              <Separator />

              {/* Notification Preferences */}
              <div className="space-y-4">
                <Label>Notifications</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={userData.preferences.notifications.email}
                      onCheckedChange={checked =>
                        setEditingUser({
                          ...editingUser,
                          preferences: {
                            ...userData.preferences,
                            notifications: {
                              ...userData.preferences.notifications,
                              email: checked,
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Push Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive push notifications</p>
                    </div>
                    <Switch
                      checked={userData.preferences.notifications.push}
                      onCheckedChange={checked =>
                        setEditingUser({
                          ...editingUser,
                          preferences: {
                            ...userData.preferences,
                            notifications: {
                              ...userData.preferences.notifications,
                              push: checked,
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">SMS Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive SMS updates</p>
                    </div>
                    <Switch
                      checked={userData.preferences.notifications.sms}
                      onCheckedChange={checked =>
                        setEditingUser({
                          ...editingUser,
                          preferences: {
                            ...userData.preferences,
                            notifications: {
                              ...userData.preferences.notifications,
                              sms: checked,
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Change Password</Label>
                <div className="space-y-3">
                  <Input type="password" placeholder="Current Password" />
                  <Input type="password" placeholder="New Password" />
                  <Input type="password" placeholder="Confirm New Password" />
                </div>
                <Button variant="outline" className="w-full">
                  Update Password
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Two-Factor Authentication</Label>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">2FA</p>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Active Sessions</Label>
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Chrome on Windows</p>
                        <p className="text-xs text-muted-foreground">Last active 2 hours ago</p>
                      </div>
                    </div>
                    <Badge variant="outline">Current</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Safari on iPhone</p>
                        <p className="text-xs text-muted-foreground">Last active 3 days ago</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      Revoke
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Full Profile Page Component
interface ProfilePageProps {
  user?: UserProfileData;
}

export default function ProfilePage({ user }: ProfilePageProps) {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  const profileUser: UserProfileData = {
    id: user?.id || authUser?.id || 'local-user',
    name: user?.name || authUser?.name || 'User',
    email: user?.email || authUser?.email || 'user@example.com',
    avatar: user?.avatar || authUser?.avatar,
    bio: user?.bio || '',
    location: user?.location || '',
    phone: user?.phone || '',
    role: (user?.role || authUser?.role || 'user') as UserProfileData['role'],
    createdAt: user?.createdAt || new Date().toISOString(),
    lastLogin: user?.lastLogin || new Date().toISOString(),
    preferences: user?.preferences || {
      theme: 'dark',
      language: 'en',
      notifications: { email: true, push: true, sms: false },
    },
    stats: user?.stats || {
      devicesOwned: 0,
      totalReservations: 0,
      activeReservations: 0,
      automationRules: 0,
    },
  };

  const normalizeRole = (role?: string) => {
    const normalizedRole = role?.trim().toLowerCase();
    if (normalizedRole === 'admin' || normalizedRole === 'manager' || normalizedRole === 'user') {
      return normalizedRole;
    }
    return 'user';
  };

  const getRoleBadge = (role?: string) => {
    const roleColors = {
      admin: 'bg-red-500/10 text-red-500 border-red-500/20',
      manager: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      user: 'bg-green-500/10 text-green-500 border-green-500/20',
    };
    return roleColors[normalizeRole(role) as keyof typeof roleColors] || roleColors.user;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'N/A';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 border-2 border-primary/20">
                <AvatarImage src={profileUser?.avatar} alt={profileUser?.name} />
                <AvatarFallback className="bg-primary text-2xl text-white">
                  {profileUser?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4">{profileUser?.name}</CardTitle>
              <CardDescription>{profileUser?.email}</CardDescription>
              <Badge className={cn('mt-2', getRoleBadge(profileUser?.role || 'user'))}>
                {profileUser?.role?.toUpperCase() || 'USER'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {formatDate(profileUser?.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Last login {formatDate(profileUser?.lastLogin)}</span>
              </div>
              {profileUser?.location && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>{profileUser.location}</span>
                </div>
              )}
            </div>
            <Separator />
            <div className="space-y-2">
              <Button className="w-full" variant="outline">
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <Button className="w-full" variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button className="w-full" variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats and Activity */}
        <div className="md:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid gap-4 grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Devices</CardDescription>
                <CardTitle className="text-3xl">{profileUser?.stats.devicesOwned}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Total devices owned</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Reservations</CardDescription>
                <CardTitle className="text-3xl">{profileUser?.stats.totalReservations}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {profileUser?.stats.activeReservations} active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Automation</CardDescription>
                <CardTitle className="text-3xl">{profileUser?.stats.automationRules}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Active rules</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Badges</CardDescription>
                <CardTitle className="text-3xl">
                  <Award className="h-8 w-8 text-yellow-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Pro Member</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Smartphone className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">Added new device "Smart Garden Pro"</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">Reservation confirmed for Device #45</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">Unlocked "Early Adopter" achievement</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
