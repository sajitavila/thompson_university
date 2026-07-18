import { boot } from "quasar/wrappers";
import {
  configureTableBuilder,
  defaultIsTableFetchAbortError,
  useTableFetchAbortStore,
} from "@benjaminor-dev/quasar-app-extension-table-builder";

/**
 * SSOT — global Table Builder defaults for this host.
 *
 * Language follows Quasar `$q.lang` unless you set `locale` below.
 */
export default boot(() => {
  configureTableBuilder({
    // locale: "es", // uncomment to pin a specific language for Table Builder
    // messages: { search: "Find" },

    filters: {
      layout: "drawer",
      openFiltersOnMount: false,
      showFilterChips: true,
    },

    // pagination: placement "bottom", scrollOnPageChange "auto", pageSize 10 (omit block = built-in)
    // persistData: true, // uncomment for SPA global cache

    fetchOnMount: false,

    filterUi: {
      buttonStyle: {
        light: {
          filtersColor: "teal",
          filtersVariant: "outline",
          searchColor: "primary",
          searchVariant: "outline",
          clearVariant: "flat",
          submitColor: "primary",
          submitVariant: "unelevated",
          stopColor: "negative",
          stopVariant: "unelevated",
        },
        dark: {
          filtersColor: "teal",
          filtersVariant: "unelevated",
          searchColor: "primary",
          searchVariant: "unelevated",
          clearColor: "white",
          clearVariant: "flat",
          submitColor: "primary",
          submitVariant: "unelevated",
          stopColor: "negative",
          stopVariant: "unelevated",
        },
      },
      panelHeader: {
        light: { color: "primary", textColor: "white" },
        dark: { color: "primary", textColor: "white" },
      },
      chips: {
        light: { color: "primary", textColor: "white" },
        dark: { color: "primary", textColor: "white" },
      },
      chipsPanel: {
        light: {
          borderColor: "rgba(25, 118, 210, 0.16)",
          backgroundColor: "rgba(25, 118, 210, 0.04)",
        },
        dark: {
          borderColor: "rgba(255, 255, 255, 0.12)",
          backgroundColor: "rgba(255, 255, 255, 0.04)",
        },
      },
    },

    // onFetchError: globalTableFetchError,

    // Advanced cancellation: shared AbortSignal for global HTTP (e.g. axios + Pinia).
    // Without `fetchAbort`, each table uses an internal AbortController (enough for many apps).
    // Compact alternative: fetchAbort: { useStore: true, allowUserCancel: false },
    fetchAbort: {
      allowUserCancel: false,
      abort: () => useTableFetchAbortStore().abort(),
      getSignal: () => useTableFetchAbortStore().getSignal(),
      isAbortError: (error) =>
        defaultIsTableFetchAbortError(error) ||
        (error instanceof Error && error.message === "canceled"),
    },
  });
});
