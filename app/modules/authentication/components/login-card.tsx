import { Form, Link, useActionData, useNavigation } from "react-router";
import { useConfigurables } from "~/modules/configurables/src/hooks/use-configurables";

interface ActionData {
  error?: string;
}

export function LoginCard() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const { config, loading } = useConfigurables();

  const appName = loading ? "MiCasa" : (config?.appName ?? "MiCasa");
  const primaryColor = loading ? "#C1440E" : (config?.brandColor?.primary ?? "#C1440E");

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#FAF7F2" }}
    >
      {/* Header */}
      <div
        className="px-6 pt-16 pb-10 flex flex-col items-center gap-3"
        style={{ background: primaryColor }}
      >
        {config?.logoUrl && config.logoUrl !== "FILL_LOGO_URL_HERE" ? (
          <img src={config.logoUrl} alt={appName} className="h-12 w-12 rounded-xl object-cover" />
        ) : (
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            {appName.charAt(0)}
          </div>
        )}
        <h1 className="text-2xl font-bold text-white tracking-tight">{appName}</h1>
        <p className="text-sm text-white/80">Sign in to your account</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-8 pb-8">
        <Form method="post" className="flex flex-col gap-4">
          {actionData?.error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {actionData.error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="h-12 rounded-lg border border-[#E8E2DA] bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2"
              style={{ focusRingColor: primaryColor } as any}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="h-12 rounded-lg border border-[#E8E2DA] bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-12 w-full rounded-lg text-white font-semibold text-sm transition-all disabled:opacity-60"
            style={{ background: isSubmitting ? "#aaa" : primaryColor }}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </Form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Need an account?{" "}
          <span className="font-medium" style={{ color: primaryColor }}>
            Contact your manager.
          </span>
        </p>
      </div>
    </div>
  );
}
