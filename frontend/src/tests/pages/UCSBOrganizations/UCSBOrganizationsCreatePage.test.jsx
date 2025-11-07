import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UCSBOrganizationsCreatePage from "main/pages/UCSBOrganizations/UCSBOrganizationsCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("UCSBOrganizationsCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const queryClient = new QueryClient();
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("OrgCode")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /ucsborganizations", async () => {
    const queryClient = new QueryClient();
    const ucsbOrganization = {
      orgCode: "SCD",
      orgTranslationShort: "South Coast Deli",
      orgTranslation: "South Coast Deli",
      inactive: false,
    };

    axiosMock.onPost("/api/ucsborganizations/post").reply(202, ucsbOrganization);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("OrgCode")).toBeInTheDocument();
    });

    const orgCodeInput = screen.getByLabelText("OrgCode");
    expect(orgCodeInput).toBeInTheDocument();

    const orgTranslationShortInput = screen.getByLabelText("OrgTranslationShort");
    expect(orgTranslationShortInput).toBeInTheDocument();

    const orgTranslationInput = screen.getByLabelText("OrgTranslation");
    expect(orgTranslationInput).toBeInTheDocument();

    const inactiveInput = screen.getByLabelText("Inactive");
    expect(inactiveInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(orgCodeInput, { target: { value: "SCD" } });
    fireEvent.change(orgTranslationShortInput, {
      target: { value: "South Coast Deli" },
    });
    fireEvent.change(orgTranslationInput, {
      target: { value: "South Coast Deli" },
    });
    fireEvent.change(inactiveInput, {
      target: { value: false },
    });   
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      orgCode: "SCD",
      orgTranslationShort: "South Coast Deli",
      orgTranslation: "South Coast Deli",
      inactive: "false",
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toBeCalledWith(
      "New UCSB organization Created - orgCode: SCD orgTranslationShort: South Coast Deli orgTranslation: South Coast Deli inactive: false",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/ucsborganizations" });
  });
});
