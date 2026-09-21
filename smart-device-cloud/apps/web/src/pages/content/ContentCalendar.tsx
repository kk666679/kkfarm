import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, ChevronLeft, ChevronRight, CalendarClock } from 'lucide-react';
import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isToday,
} from 'date-fns';

export default function ContentCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysInMonth = Array.from({ length: endOfMonth(currentMonth).getDate() }, (_, i) => i + 1);
  const firstDayOfMonth = startOfMonth(currentMonth).getDay();
  const prevMonthDays = Array.from(
    { length: firstDayOfMonth },
    (_, i) => endOfMonth(addDays(currentMonth, -1)).getDate() - firstDayOfMonth + i + 1
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Calendar</h1>
          <p className="text-muted-foreground">Plan and schedule your content</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentMonth(addDays(currentMonth, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>
            <CalendarClock className="h-4 w-4 mr-2" />
            Today
          </Button>
          <Button variant="outline" onClick={() => setCurrentMonth(addDays(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button onClick={() => {}}>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{format(currentMonth, 'MMMM yyyy')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-0.5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            <div className="grid grid-cols-7 gap-0.5">
              {prevMonthDays.map(day => (
                <div
                  key={`prev-${day}`}
                  className="aspect-square p-2 text-sm text-muted-foreground/50"
                >
                  {day}
                </div>
              ))}
              {daysInMonth.map(day => {
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const isSelected =
                  selectedDate && isToday(date) && selectedDate.getTime() === date.getTime();
                return (
                  <div
                    key={day}
                    className={`aspect-square p-2 relative cursor-pointer transition-colors ${
                      isToday(date) ? 'bg-primary/10' : ''
                    } ${isSelected ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <span className={`text-sm ${isToday(date) ? 'font-bold text-primary' : ''}`}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-1 max-h-16 overflow-hidden">
                      <div className="h-2 bg-primary/20 rounded" />
                      <div className="h-2 bg-green-500/20 rounded" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Content for {format(selectedDate, 'EEEE, MMMM d, yyyy')}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)}>
              Close
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-semibold">Scheduled Posts</h4>
                  <div className="space-y-2 border rounded-lg p-4 bg-muted/50">
                    <p className="text-sm text-muted-foreground">No posts scheduled for this day</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Post
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Draft
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
