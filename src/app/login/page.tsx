"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "./actions";

const initialState = {
  success: false,
  errors: {},
};

function LoginPage() {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <form action={formAction} noValidate className=" space-y-4 max-w-sm mt-5">
      <div>
        <Label htmlFor="email" className="mb-2">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder={"Enter email here"}
          className="placeholder-gray-400"
          required
        />
        {state.errors?.email && (
          <p className="text-sm text-red-500">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password" className="mb-2">
          Password
        </Label>
        <Input id="password" name="password" type="password" required />
        {state.errors?.password && (
          <p className="text-sm text-red-500">{state.errors.password[0]}</p>
        )}
      </div>

      {state.message && <p className="text-sm text-red-500">{state.message}</p>}

      <Button type="submit">Login</Button>
    </form>
  );
}

export default LoginPage;
