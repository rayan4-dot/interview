
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Mail,
  Video,
  Mic,
  ClipboardList,
  UserPlus,
  DollarSign
} from "lucide-react";
import { useAppMode } from "@/hooks/use-app-mode";

const candidateMenuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/interview", label: "Mock Interview", icon: MessageSquare },
  { href: "/resume-analyzer", label: "Resume Analyzer", icon: FileText },
  { href: "/cover-letter-analyzer", label: "Cover Letter Analyzer", icon: Mail },
  { href: "/video-analysis", label: "Video Analysis", icon: Video },
  { href: "/voice-analysis", label: "Voice Analysis", icon: Mic },
];

const managerMenuItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/manager/create-interview", label: "Create Interview", icon: ClipboardList },
    { href: "/manager/candidates", label: "Candidates", icon: UserPlus },
];

export function MainNav() {
  const pathname = usePathname();
  const { mode } = useAppMode();
  
  const menuItems = mode === 'candidate' ? candidateMenuItems : managerMenuItems;

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={{ children: item.label, side: "right", align: "center" }}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
