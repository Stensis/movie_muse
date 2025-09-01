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
import { Eye, EyeOff } from "lucide-react";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

function GoogleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
        </svg>
    );
}

type PasswordFieldProps = {
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    autoComplete?: string;
};

function PasswordField({
    id,
    label,
    value,
    onChange,
    placeholder = "••••••••",
    autoComplete,
}: PasswordFieldProps) {
    const [show, setShow] = useState(false);

    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <div className="relative">
                <Input
                    id={id}
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className="pr-10"
                />
                <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                >
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
            </div>
        </div>
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
                            <PasswordField
                                id="si-pass"
                                label="Password"
                                value={siPass}
                                onChange={(e) => setSiPass(e.target.value)}
                                autoComplete="current-password"
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

                        <PasswordField
                            id="su-pass"
                            label="Password"
                            value={suPass}
                            onChange={(e) => setSuPass(e.target.value)}
                            placeholder="At least 6 characters"
                            autoComplete="new-password"
                        />

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
