import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
            <path fill="#EA4335" d="M12 10.2v3.6h5.1...Z" />
        </svg>
    );
}

export function AuthDialog({ open, onOpenChange }: Props) {
    const { signIn, signUp, signInWithGoogle } = useAuth();
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    // sign in form
    const [siEmail, setSiEmail] = useState("");
    const [siPass, setSiPass] = useState("");

    // sign up form
    const [suName, setSuName] = useState("");
    const [suEmail, setSuEmail] = useState("");
    const [suPass, setSuPass] = useState("");

    const handle = async (fn: () => Promise<void>) => {
        setBusy(true);
        setErr(null);
        try {
            await fn();
            onOpenChange(false);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Something went wrong";
            setErr(msg);
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Welcome to MovieMuse</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="signin">
                    <TabsList className="grid grid-cols-2 w-full">
                        <TabsTrigger value="signin">Sign in</TabsTrigger>
                        <TabsTrigger value="signup">Create account</TabsTrigger>
                    </TabsList>

                    <TabsContent value="signin" className="space-y-4 mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => handle(signInWithGoogle)}
                        >
                            <GoogleIcon />
                            Continue with Google
                        </Button>


                        <div className="grid gap-2">
                            <Label htmlFor="si-email">Email</Label>
                            <Input
                                id="si-email"
                                type="email"
                                value={siEmail}
                                onChange={(e) => setSiEmail(e.target.value)}
                                placeholder="you@example.com"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="si-pass">Password</Label>
                            <Input
                                id="si-pass"
                                type="password"
                                value={siPass}
                                onChange={(e) => setSiPass(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        {err && <p className="text-sm text-red-500">{err}</p>}

                        <Button
                            className="w-full"
                            disabled={busy}
                            onClick={() => handle(() => signIn(siEmail, siPass))}
                        >
                            {busy ? "Signing in..." : "Sign in"}
                        </Button>
                    </TabsContent>

                    <TabsContent value="signup" className="space-y-4 mt-4">
                        <div className="grid gap-2">
                            <Label htmlFor="su-name">Display name</Label>
                            <Input
                                id="su-name"
                                value={suName}
                                onChange={(e) => setSuName(e.target.value)}
                                placeholder="Jane Doe"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="su-email">Email</Label>
                            <Input
                                id="su-email"
                                type="email"
                                value={suEmail}
                                onChange={(e) => setSuEmail(e.target.value)}
                                placeholder="you@example.com"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="su-pass">Password</Label>
                            <Input
                                id="su-pass"
                                type="password"
                                value={suPass}
                                onChange={(e) => setSuPass(e.target.value)}
                                placeholder="At least 6 characters"
                            />
                        </div>

                        {err && <p className="text-sm text-red-500">{err}</p>}

                        <Button
                            className="w-full"
                            disabled={busy}
                            onClick={() => handle(() => signUp(suEmail, suPass, suName))}
                        >
                            {busy ? "Creating..." : "Create account"}
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
