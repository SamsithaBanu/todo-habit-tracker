import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { Button } from "../components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

import { registerUser } from "@/services/AuthService";
import { companions } from "@/lib/constants";

const SignupPage = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Pet details
    const [petSpecies, setPetSpecies] = useState("dog");
    const [petNickname, setPetNickname] = useState("");

    // Browser timezone
    const [timezone] = useState(
        Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    );

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setLoading(true);

        try {
            await registerUser({
                name,
                email,
                password,
                pet_species: petSpecies,
                pet_nickname: petNickname,
                timezone,
            });

            toast.success("User Registration Successful!");

            navigate(`/verification-email?email=${encodeURIComponent(email)}`);
        } catch (err: unknown) {
            console.error("Registration error:", err);

            toast.error("User Registration Failed!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#E8EAF7] flex justify-center">
            <main className="w-full max-w-[430px] min-h-screen px-5 py-2">
                <Card className="w-full border-0 bg-white rounded-[28px] shadow-[0_8px_30px_rgba(86,130,209,0.12)]">
                    <div className="flex justify-center pt-2">
                        <img
                            src="https://img.magnific.com/free-photo/adorable-portrait-pets-surrounded-by-flowers_23-2151850032.jpg?semt=ais_hybrid&w=740&q=80"
                            alt="Companion"
                            className="h-20 w-20 rounded-full object-cover"
                        />
                    </div>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-[#202020]">
                            Create your account
                        </CardTitle>
                        <CardDescription className="text-gray-500">
                            Track habits, keep your companion alive.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        User Name
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        placeholder="Enter your name"
                                        className="h-11 rounded-xl border border-[#d9d9d9] text-black"
                                        required
                                    />
                                </div>
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
                                        placeholder="At least 8 characters and 1 number"
                                        className="h-11 rounded-xl border border-[#d9d9d9] text-black"
                                        minLength={8}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="pet_nickname">
                                        Companion Nickname
                                    </Label>
                                    <Input
                                        id="pet_nickname"
                                        name="pet_nickname"
                                        type="text"
                                        value={petNickname}
                                        onChange={(e) =>
                                            setPetNickname(e.target.value)
                                        }
                                        placeholder="Give your companion a name"
                                        className="h-11 rounded-xl border border-[#d9d9d9] text-black"
                                        minLength={1}
                                        maxLength={50}
                                        required
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label>
                                        Choose your companion
                                    </Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {companions.map((item) => {
                                            const isSelected =
                                                petSpecies === item.id;
                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() =>
                                                        setPetSpecies(item.id)
                                                    }
                                                    className={`
                                                        h-24
                                                        rounded-xl
                                                        border
                                                        flex
                                                        flex-col
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                        transition-all
                                                        ${isSelected
                                                            ? "border-[#5682D1] border-2 bg-[#F4F7FF]"
                                                            : "border-gray-200 bg-white hover:border-[#9DB8EA]"
                                                        }
                                                    `}
                                                >

                                                    <span className="text-2xl">
                                                        {item.icon}
                                                    </span>
                                                    <span className="text-sm font-medium text-[#202020]">
                                                        {item.name}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <Button
                                        type="button"
                                        variant="link"
                                        onClick={() =>
                                            navigate("/login")
                                        }
                                        className="text-[#5682D1]"
                                    >
                                        Already have an account? Sign in
                                    </Button>
                                </div>
                            </div>
                            <CardFooter className="px-0 pt-6 bg-transparent">
                                <Button
                                    type="submit"
                                    className="w-full h-11 rounded-xl bg-[#5682D1] hover:bg-[#4A72BD] text-white"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Signing up..."
                                        : "Signup"}
                                </Button>
                            </CardFooter>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default SignupPage;

