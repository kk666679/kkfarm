import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Camera, Mic, Settings, Play, Pause, Square, Download } from 'lucide-react';
import { useState } from 'react';

export default function VideoStudio() {
  const [activeTab, setActiveTab] = useState('record');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Video Studio</h1>
        <p className="text-muted-foreground">
          Create and manage video content for your device farm
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="record">Record</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="record" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recording Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative">
                    {isRecording ? (
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="flex items-center gap-2 text-red-500 mb-4">
                          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                          <span className="font-mono text-lg">REC {recordingTime}s</span>
                        </div>
                        <Video className="h-16 w-16 text-muted-foreground/50" />
                        <p className="mt-4 text-muted-foreground">Recording in progress...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Video className="h-24 w-24 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-muted-foreground">Camera preview will appear here</p>
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <Button
                        variant={isRecording ? 'destructive' : 'default'}
                        size="lg"
                        onClick={() => {
                          setIsRecording(!isRecording);
                          if (isRecording) {
                            setRecordingTime(0);
                          } else {
                            const interval = setInterval(() => {
                              setRecordingTime(t => t + 1);
                            }, 1000);
                            return () => clearInterval(interval);
                          }
                        }}
                      >
                        {isRecording ? (
                          <>
                            <Square className="h-5 w-5 mr-2" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Camera className="h-5 w-5 mr-2" />
                            Start Recording
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="lg">
                        <Mic className="h-5 w-5 mr-2" />
                        Audio Only
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recording Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Video Source</Label>
                    <select className="mt-1 w-full rounded-lg border p-2">
                      <option>Device Camera</option>
                      <option>Screen Recording</option>
                      <option>Both (Picture-in-Picture)</option>
                    </select>
                  </div>
                  <div>
                    <Label>Audio Source</Label>
                    <select className="mt-1 w-full rounded-lg border p-2">
                      <option>Device Microphone</option>
                      <option>System Audio</option>
                      <option>Both</option>
                    </select>
                  </div>
                  <div>
                    <Label>Quality</Label>
                    <select className="mt-1 w-full rounded-lg border p-2">
                      <option>1080p 30fps</option>
                      <option>1080p 60fps</option>
                      <option>720p 30fps</option>
                      <option>4K 30fps</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start">
                    <Play className="h-4 w-4 mr-2" />
                    Start Live Stream
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Import Media
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Video Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Video className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Video editor coming soon</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Trim, cut, add overlays, and more
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Video Library</CardTitle>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="relative aspect-video">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg" />
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-2 text-white/80 text-sm font-medium">
                      Project {i}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Video Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Default Resolution</Label>
                  <select className="mt-1 w-full rounded-lg border p-2">
                    <option>1080p</option>
                    <option>4K</option>
                    <option>720p</option>
                  </select>
                </div>
                <div>
                  <Label>Default Frame Rate</Label>
                  <select className="mt-1 w-full rounded-lg border p-2">
                    <option>30 fps</option>
                    <option>60 fps</option>
                  </select>
                </div>
                <div>
                  <Label>Default Format</Label>
                  <select className="mt-1 w-full rounded-lg border p-2">
                    <option>MP4 (H.264)</option>
                    <option>WebM (VP9)</option>
                    <option>MOV (ProRes)</option>
                  </select>
                </div>
                <div>
                  <Label>Storage Location</Label>
                  <Input placeholder="/videos" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
