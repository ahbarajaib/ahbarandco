import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/oauth-actions";

type GoogleSignInButtonProps = {
  callbackUrl?: string;
  label?: string;
};

export function GoogleSignInButton({
  callbackUrl = "/account",
  label = "Continue with Google",
}: GoogleSignInButtonProps) {
  return (
    <form action={signInWithGoogle}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <Button type="submit" variant="outline" className="h-11 w-full">
        {label}
      </Button>
    </form>
  );
}
