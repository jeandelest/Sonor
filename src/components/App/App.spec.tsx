import { screen, render, act } from "@testing-library/react";
import { App } from "./App";
import { mockOidcForUser, mockOidcFailed } from "../CustomHooks/useAuth";
import { it, vi } from "vitest";
import D from "../../i18n";
import { OIDC } from "../../utils/constants.json";

vi.mock("components/CustomHooks/useConfiguration", () => ({
  useConfiguration: () => ({
    AUTHENTICATION_MODE: OIDC,
  }),
}));

it("Component is displayed ", async () => {
  mockOidcForUser();
  render(<App />);
  await screen.findByText(D.surveyList);
});

it("Component is not displayed ", async () => {
  mockOidcFailed();
  render(<App />);
  await screen.findByText(D.cannotAuth);
});
