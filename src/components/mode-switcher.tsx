"use client";

import { useAppMode } from "@/hooks/use-app-mode";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Users, User } from "lucide-react";

export default function ModeSwitcher() {
  const { mode, toggleMode } = useAppMode();

  return (
    <div className="flex items-center space-x-2">
      <User className="h-5 w-5 text-muted-foreground" />
      <Label htmlFor="mode-switcher" className="text-sm font-medium capitalize text-muted-foreground">
        Candidate
      </Label>
      <Switch
        id="mode-switcher"
        checked={mode === 'manager'}
        onCheckedChange={toggleMode}
        aria-label="Toggle between Candidate and Hiring Manager modes"
      />
      <Label htmlFor="mode-switcher" className="text-sm font-medium capitalize text-muted-foreground">
        Manager
      </Label>
      <Users className="h-5 w-5 text-muted-foreground" />
    </div>
  );
}
