import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { loginUser } from "@/services/AuthService";

const LoginPage = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setLoading(true);

        try {
            const data = await loginUser({
                username: email,
                password: password,
            });

            console.log("Login response:", data);

            toast.success("Login successful!");

            navigate("/");
        } catch (err: any) {
            console.error("Login error:", err);

            toast.error(
                err?.response?.data?.detail ||
                "Login failed. Please check your email and password."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        navigate("/forgot-password");
    };

    const handleSignup = () => {
        navigate("/signup");
    };

    return (
        <div className="min-h-screen flex justify-center">

            <main className="w-full max-w-[430px] min-h-screen px-5 py-2">

                <Card className="w-full border-0 bg-white rounded-[28px] shadow-[0_8px_30px_rgba(86,130,209,0.12)]">

                    {/* Logo */}
                    <div className="flex justify-center pt-4">
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaIIarxB28skrTlpMOaWrAQWCRhfuzHOQCWsIfCm0K75v727PMMuIHiR4A&s=10"
                            alt="Companion"
                            className="h-30 w-30 rounded-full object-cover"
                        />
                    </div>

                    {/* Header */}
                    <CardHeader className="text-center">

                        <CardTitle className="text-2xl font-bold text-[#202020]">
                            Login your account
                        </CardTitle>

                        <CardDescription className="text-gray-500">
                            Track habits, keep your companion alive.
                        </CardDescription>

                    </CardHeader>

                    {/* Form */}
                    <CardContent>

                        <form onSubmit={handleSubmit}>

                            <div className="flex flex-col gap-2">

                                {/* Email */}
                                <div className="grid gap-2">

                                    <Label htmlFor="email">
                                        Email
                                    </Label>

                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="m@example.com"
                                        className="h-11 rounded-xl border border-[#d9d9d9] text-black"
                                        required
                                    />

                                </div>

                                {/* Password */}
                                <div className="grid gap-2">

                                    <Label htmlFor="password">
                                        Password
                                    </Label>

                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Enter your password"
                                        className="h-11 rounded-xl border border-[#d9d9d9] text-black"
                                        minLength={8}
                                        required
                                    />

                                    {/* Forgot Password */}
                                    <div className="flex justify-end">

                                        <Button
                                            type="button"
                                            variant="link"
                                            onClick={handleForgotPassword}
                                            className="text-[#5682D1] px-0 h-auto"
                                        >
                                            Forgot password?
                                        </Button>

                                    </div>

                                </div>

                                {/* Signup */}
                                <div className="flex justify-center">

                                    <Button
                                        type="button"
                                        variant="link"
                                        onClick={handleSignup}
                                        className="text-[#5682D1]"
                                    >
                                        Don't have an account? Sign up
                                    </Button>

                                </div>

                            </div>

                            {/* Login Button */}
                            <CardFooter className="px-0 pt-6 bg-transparent">
                                <Button
                                    type="submit"
                                    className="w-full h-11 rounded-xl bg-[#5682D1] hover:bg-[#4A72BD] text-white"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Logging in..."
                                        : "Login"}
                                </Button>
                            </CardFooter>
                        </form>
                    </CardContent>

                </Card>

            </main>

        </div>
    );
};

export default LoginPage;