import { boot } from "quasar/wrappers";
import { configureDialogMessageDefaults } from "@benjaminor-dev/quasar-app-extension-dialog-message";

/**
 * SSOT — Dialog Message defaults for this host app.
 *
 * Language follows Quasar `$q.lang` unless you set `locale` below.
 */
export default boot(() => {
  configureDialogMessageDefaults({
    // locale: "es", // uncomment to pin a specific language for Dialog Message
    width: "420px",
    persistent: true,
    zIndex: 7000,
    gap: "1rem",
    actionsGap: "2rem",
    font: {
      family: "Arial, sans-serif",
      sizeTitle: "1.4rem",
      sizeText: "1.2rem",
    },
    buttonStyle: {
      light: {
        acceptColor: "primary",
        acceptVariant: "unelevated",
        cancelColor: "primary",
        cancelVariant: "outline",
      },
      dark: {
        acceptColor: "primary",
        acceptVariant: "unelevated",
        cancelColor: "white",
        cancelVariant: "outline",
      },
    },
    // presets: { success: { title: "Done", text: "…" } }, // override visual/i18n per preset
  });
});
