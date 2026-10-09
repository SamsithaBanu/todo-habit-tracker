import {
    Button,
} from "@/components/ui/button";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { useNavigate, useSearchParams } from "react-router-dom";

const VerificationPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const email = searchParams.get("email");

    const handleSignup = () => {
        navigate("/signup");
    };

    return (
        <div className="min-h-screen bg-[#E8EAF7] flex justify-center">
            <main className="w-full max-w-[430px] min-h-screen px-5 py-2">
                <Card className="w-full border-0 bg-white rounded-[28px] shadow-[0_8px_30px_rgba(86,130,209,0.12)]">
                    <div className="flex justify-center pt-2">
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjXy6RJImES-Qi8SnGfU853QlXFBhQtu5wN0jRPUF-Tuy8DryaeeUllxU&s=100"
                            alt="Companion"
                            className="h-25 w-25 rounded-full object-cover"
                        />
                    </div>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-[#202020]">
                            Check your inbox
                        </CardTitle>
                        <CardDescription className="text-gray-500">
                            We sent a verification link to
                        </CardDescription>
                        <div className="font-medium text-[#202020] mt-1">
                            {email}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-5">
                            <p className="text-center text-sm text-gray-500">
                                Click the link in your email to verify your
                                account. Once verified, you can log in.
                            </p>
                            <Button
                                type="button"
                                className="w-full h-11 rounded-xl bg-[#5682D1] hover:bg-[#4A72BD] text-white"
                                onClick={() => navigate("/login")}
                            >
                                Go to Login
                            </Button>
                            <div className="text-center">
                                <p className="text-sm text-gray-500">
                                    Didn't receive the email?
                                </p>
                                <Button
                                    type="button"
                                    variant="link"
                                    onClick={handleSignup}
                                    className="text-[#5682D1]"
                                >
                                    Sign up again
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default VerificationPage;
