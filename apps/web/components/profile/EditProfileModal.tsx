"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth, User } from "@/context/AuthContext";
import { FELLOWSHIP_TEAMS } from "@/lib/directory-data";
import { toast } from "sonner";
import { Loader2, User as UserIcon, Camera, Check } from "lucide-react";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: User | null;
  onProfileUpdated?: (updated: User) => void;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
];

const YEAR_OPTIONS = [
  "Year 1 (Freshman)",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5 (Graduating)",
  "Postgraduate / Masters",
  "Alumni",
];

export function EditProfileModal({
  open,
  onOpenChange,
  currentUser,
  onProfileUpdated,
}: EditProfileModalProps) {
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [team, setTeam] = useState("");
  const [telegramUserName, setTelegramUserName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || "");
      setDepartment(currentUser.department || "");
      setYearOfStudy(currentUser.yearOfStudy || "");
      setTeam(currentUser.team || "");
      setTelegramUserName(
        currentUser.telegramUserName
          ? currentUser.telegramUserName.replace(/^@/, "")
          : ""
      );
      setBio(currentUser.bio || "");
      setProfileImage(currentUser.profileImage || "");
    }
  }, [currentUser, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    setLoading(true);
    try {
      const formattedTelegram = telegramUserName.trim()
        ? `@${telegramUserName.trim().replace(/^@/, "")}`
        : "";

      const payload: Partial<User> = {
        fullName: fullName.trim(),
        department: department.trim(),
        yearOfStudy: yearOfStudy || undefined,
        team: team || undefined,
        telegramUserName: formattedTelegram,
        bio: bio.trim(),
        profileImage: profileImage.trim() || undefined,
      };

      const updated = await updateProfile(payload);
      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }
      toast.success("Profile updated successfully! ✨");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Member Profile</DialogTitle>
          <DialogDescription>
            Update your fellowship details, ministry participation, and student info.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Avatar Preview & Selection */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-muted/40 rounded-xl border border-border/60">
            <Avatar className="h-16 w-16 border-2 border-[#FF6719]">
              <AvatarImage src={profileImage} alt={fullName} />
              <AvatarFallback className="bg-[#FF6719]/15 text-[#FF6719] font-bold text-lg">
                {fullName ? fullName.slice(0, 2).toUpperCase() : "ME"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2 text-center sm:text-left w-full">
              <span className="text-xs font-semibold text-muted-foreground block">
                Choose a Profile Avatar or Enter Image URL
              </span>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setProfileImage(url)}
                    className={`relative rounded-full overflow-hidden h-7 w-7 border-2 transition-all ${
                      profileImage === url
                        ? "border-[#FF6719] ring-2 ring-[#FF6719]/30 scale-110"
                        : "border-border hover:border-foreground/50 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt="preset" className="h-full w-full object-cover" />
                    {profileImage === url && (
                      <div className="absolute inset-0 bg-[#FF6719]/30 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Or paste image URL (https://...)"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                className="h-8 text-xs mt-1"
              />
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs font-medium">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="e.g. Yohannes Bekele"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* Department & Year of Study */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="department" className="text-xs font-medium">
                Academic Department
              </Label>
              <Input
                id="department"
                placeholder="e.g. Software Engineering"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="yearOfStudy" className="text-xs font-medium">
                Year of Study
              </Label>
              <Select value={yearOfStudy} onValueChange={setYearOfStudy}>
                <SelectTrigger id="yearOfStudy">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {YEAR_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ministry Team & Telegram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="team" className="text-xs font-medium">
                Ministry Team
              </Label>
              <Select value={team} onValueChange={setTeam}>
                <SelectTrigger id="team">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None / General Member</SelectItem>
                  {FELLOWSHIP_TEAMS.map((t) => (
                    <SelectItem key={t.id} value={t.name}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telegram" className="text-xs font-medium">
                Telegram Handle
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                  @
                </span>
                <Input
                  id="telegram"
                  placeholder="username"
                  className="pl-7"
                  value={telegramUserName}
                  onChange={(e) => setTelegramUserName(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="bio" className="text-xs font-medium">
                Short Bio / Favorite Scripture
              </Label>
              <span className="text-[10px] text-muted-foreground">
                {bio.length}/200
              </span>
            </div>
            <Textarea
              id="bio"
              rows={3}
              maxLength={200}
              placeholder="Tell fellow students about your spiritual journey, passion in ministry, or campus mission..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#FF6719] hover:bg-[#FF6719]/90 text-white font-medium"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
