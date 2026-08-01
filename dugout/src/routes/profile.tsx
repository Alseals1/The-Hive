import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { resetPasswordConfirmSchema } from "@/lib/validationSchemas";
import { useUser } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile } from "@/features/profile/hooks/useProfile";
import { PageShell, PageHeader } from "@/components/shared/PageShell";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

const labelCls =
  "block text-xs font-display font-600 uppercase tracking-wider text-pitch-300 mb-1.5";

type PasswordErrors = { password?: string; confirmPassword?: string };

function ProfilePage() {
  const { user } = useUser();
  const userId = user?.id ?? "";

  const { data: profile, isLoading } = useProfile(userId);
  const updateProfileMutation = useUpdateProfile(userId);

  // Display name state
  const [displayName, setDisplayName] = useState("");
  const [displayNameError, setDisplayNameError] = useState<string | undefined>();

  // Password state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<PasswordErrors>({});
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.full_name ?? "");
    }
  }, [profile]);

  function handleDisplayNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) {
      setDisplayNameError("Display name is required.");
      return;
    }
    setDisplayNameError(undefined);
    updateProfileMutation.mutate(
      { full_name: trimmed },
      {
        onSuccess: () => {
          toast.success("Display name saved.");
        },
      },
    );
  }

  function validatePassword(): PasswordErrors {
    const result = resetPasswordConfirmSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const errs: PasswordErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field === "password" || field === "confirmPassword") {
          errs[field] = issue.message;
        }
      });
      return errs;
    }
    return {};
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validatePassword();
    if (Object.keys(errs).length > 0) {
      setPasswordFieldErrors(errs);
      return;
    }
    setPasswordFieldErrors({});
    setPasswordError(null);
    setPasswordLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setPasswordError(error.message);
    } else {
      toast.success("Password updated successfully.");
      setPassword("");
      setConfirmPassword("");
    }
    setPasswordLoading(false);
  }

  return (
    <>
      <Helmet><title>Profile | Dugout</title></Helmet>
      <PageShell
        header={
          <PageHeader
            title="Profile"
            backTo="/teams"
            backLabel="My Teams"
          />
        }
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="px-4 py-6 space-y-6">
            {/* Avatar + email */}
            <div className="flex flex-col items-center gap-3 pt-2 pb-2">
              <div className="w-20 h-20 rounded-full bg-pitch-700 flex items-center justify-center">
                <User size={40} className="text-pitch-400" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-body text-pitch-400">{user?.email}</p>
            </div>

            {/* Display name card */}
            <div className="bg-pitch-800 border border-pitch-700 rounded-2xl p-5">
              <form onSubmit={handleDisplayNameSubmit} className="space-y-4">
                <div>
                  <label htmlFor="display-name" className={labelCls}>
                    Display Name
                  </label>
                  <Input
                    id="display-name"
                    type="text"
                    autoComplete="name"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      if (displayNameError) setDisplayNameError(undefined);
                    }}
                    placeholder="Your name"
                    error={displayNameError}
                  />
                </div>

                {updateProfileMutation.error && (
                  <p className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 font-body">
                    {updateProfileMutation.error instanceof Error
                      ? updateProfileMutation.error.message
                      : "Couldn't save that. Give it another shot."}
                  </p>
                )}

                <Button loading={updateProfileMutation.isPending} type="submit">
                  {updateProfileMutation.isPending ? "Saving…" : "Save Name"}
                </Button>
              </form>
            </div>

            {/* Password change card */}
            <div className="bg-pitch-800 border border-pitch-700 rounded-2xl p-5">
              <p className={labelCls + " mb-4"}>Change Password</p>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label htmlFor="new-password" className={labelCls}>
                    New Password
                  </label>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordFieldErrors.password)
                        setPasswordFieldErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder="Minimum 8 characters"
                    error={passwordFieldErrors.password}
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className={labelCls}>
                    Confirm Password
                  </label>
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordFieldErrors.confirmPassword)
                        setPasswordFieldErrors((prev) => ({
                          ...prev,
                          confirmPassword: undefined,
                        }));
                    }}
                    placeholder="Confirm new password"
                    error={passwordFieldErrors.confirmPassword}
                  />
                </div>

                {passwordError && (
                  <p className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 font-body">
                    {passwordError}
                  </p>
                )}

                <Button loading={passwordLoading} type="submit">
                  {passwordLoading ? "Updating…" : "Update Password"}
                </Button>
              </form>
            </div>
          </div>
        )}
      </PageShell>
    </>
  );
}
