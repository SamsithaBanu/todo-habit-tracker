import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import axios from "axios";

const ForgotPasswordPage = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [emailSent, setEmailSent] = useState<boolean>(false);

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.get(
                "/api/users/forgot-password",
                {
                    params: {
                        email: email,
                    },
                }
            );

            console.log(response.data);
            setEmailSent(true);
            toast.success(
                "Password reset link has been sent to your email."
            );
        } catch (error: any) {
            console.error("Forgot password error:", error);

            toast.error(
                error?.response?.data?.detail ||
                "Unable to send password reset email."
            );
        } finally {
            setLoading(false);
        }
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
                            Forgot Password?
                        </CardTitle>

                        <CardDescription className="text-gray-500">
                            Enter your email and we'll send you a
                            password reset link.
                        </CardDescription>

                    </CardHeader>

                    <CardContent>

                        {!emailSent ? (

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
                                            className="h-11 rounded-xl border border-[#d9d9d9]"
                                            required
                                        />

                                    </div>
                                    {/* Send Button */}
                                    <Button
                                        type="submit"
                                        className="w-full mt-2 h-11 rounded-xl bg-[#5682D1] hover:bg-[#4A72BD] text-white"
                                        disabled={loading}
                                    >
                                        {loading
                                            ? "Sending..."
                                            : "Send Reset Link"}
                                    </Button>
                                </div>
                            </form>

                        ) : (

                            /* Email Sent */
                            <div className="flex flex-col gap-5">

                                <div className="text-center">

                                    <p className="text-sm text-gray-600">
                                        We sent a password reset link to:
                                    </p>

                                    <p className="font-medium text-[#202020] mt-1">
                                        {email}
                                    </p>

                                </div>

                                <p className="text-center text-sm text-gray-500">
                                    Please check your inbox and follow
                                    the link to change your password.
                                </p>

                                <Button
                                    type="button"
                                    className="w-full h-11 mb-2 rounded-xl bg-[#5682D1] hover:bg-[#4A72BD] text-white"
                                    onClick={() => navigate("/login")}
                                >
                                    Back to Login
                                </Button>

                            </div>

                        )}

                        {/* Back to Login */}
                        {!emailSent && (
                            <div className="flex justify-center mt-4">

                                <Button
                                    type="button"
                                    variant="link"
                                    onClick={() => navigate("/login")}
                                    className="text-[#5682D1]"
                                >
                                    Back to Login
                                </Button>

                            </div>
                        )}

                    </CardContent>

                </Card>

            </main>

        </div>
    );
};

export default ForgotPasswordPage;