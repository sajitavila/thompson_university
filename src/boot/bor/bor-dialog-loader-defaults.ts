import { boot } from "quasar/wrappers";
import { configureDialogLoaderDefaults } from "@benjaminor-dev/quasar-app-extension-dialog-loader";

/**
 * SSOT — Dialog Loader defaults for this host app.
 *
 * Language follows Quasar `$q.lang` unless you set `locale` below.
 */
export default boot(() => {
  configureDialogLoaderDefaults({
    // locale: "es", // uncomment to pin a specific language for Dialog Loader
    variant: "glass",
    spinner: "ios",
    openDelayMs: 120,
    hideDelayMs: 450,
    minVisibleMs: 600,
    backdropBlur: "blur(10px)",
    zIndex: 6000,
    gap: "2rem",
    font: {
      family: "Arial, sans-serif",
      size: "1.35rem",
    },
    spinnerColor: {
      light: "primary",
      dark: "white",
    },
    spinnerTrackColor: {
      light: "grey-4",
      dark: "grey-7",
    },
  });
});
