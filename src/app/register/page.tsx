"use client";

import { signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState } from "react";

const initialState = {
  success: false,
  errors: {},
};

export default function RegisterPage() {
  const [state, formAction] = useActionState(signup, initialState);

  return (
    <form action={formAction} className="space-y-4 max-w-sm">
      <div>
        <Label htmlFor="firstname" className="mb-2">
          First Name
        </Label>
        <Input
          id="firstname"
          name="firstname"
          required
          placeholder="Jane"
          className="placeholder-gray-400"
        />
        {state.errors?.firstname && (
          <p className="text-sm text-red-500">{state.errors.firstname[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="lastname" className="mb-2">
          Last Name
        </Label>
        <Input
          id="lastname"
          name="lastname"
          required
          placeholder="Doe"
          className="placeholder-gray-400"
        />
        {state.errors?.lastname && (
          <p className="text-sm text-red-500">{state.errors.lastname[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email" className="mb-2">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="example@gmail.com"
          className="placeholder-gray-400"
        />
        {state.errors?.email && (
          <p className="text-sm text-red-500">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password" className="mb-2">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          placeholder="Enter a password"
          className="placeholder-gray-400"
        />
        {state.errors?.password && (
          <p className="text-sm text-red-500">{state.errors.password[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword" className="mb-2">
          Confirm Password
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          placeholder="Re-enter your password"
          className="placeholder-gray-400"
        />
        {state.errors?.confirmPassword && (
          <p className="text-sm text-red-500">
            {state.errors.confirmPassword[0]}
          </p>
        )}
      </div>

      {state.message && <p className="text-sm text-red-500">{state.message}</p>}

      <Button type="submit">Sign Up</Button>
    </form>
  );
}
