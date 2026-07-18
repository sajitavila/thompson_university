import { boot } from "quasar/wrappers";
import { configureFormBuilderDefaults } from "@benjaminor-dev/quasar-app-extension-form-builder";

/**
 * SSOT — global Form Builder defaults for this host.
 *
 * Language follows Quasar `$q.lang` unless you set `locale` below.
 */
export default boot(() => {
  configureFormBuilderDefaults({
    // locale: "es", // uncomment to pin a specific language for Form Builder
    // messages: { formListAdd: "Agregar" },
    
    fieldDesign: "filled",
    labelPosition: "stacked",
    validationMode: 'lazy',
    gap: 'md',

    defaultFieldProps: {
      //
    },
  });
});
