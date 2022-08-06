import { useQuery, useMutation } from "@tanstack/react-query";
import { fetch } from "./fetch";

type LoginRequest = {
  username: string;
  password: string;
};

type LoginResponse = {
  ok: boolean;
  message: string;
  token?: string;
};

export function useLogin() {
  const url = "http://localhost:3001/auth/login";

  return useMutation(
    [url],
    ({ username, password }: LoginRequest) => {
      return fetch(
        new Request(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }),
        {
          201: async (r) => (await r.json()) as LoginResponse,
          400: async (r) => await r.json(),
        }
      );
    },
    {}
  );
}
