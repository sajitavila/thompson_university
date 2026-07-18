import { boot } from "quasar/wrappers";
import { configureDataTableDefaults } from "@benjaminor-dev/quasar-app-extension-datatable";

/**
 * SSOT — DataTable defaults for this host app.
 *
 * Language follows Quasar `$q.lang` unless you set `locale` below.
 * Override individual pagination strings via `messages`.
 */
export default boot(() => {
  configureDataTableDefaults({
    // locale: "es", // uncomment to pin a specific language for DataTable UI
    // messages: {
    //   allRows: "Show all",
    //   rowsPerPageLong: "Rows per page",
    //   rangeFormat: "{start}-{end} of {total}",
    // },
  });
});
