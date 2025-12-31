import Swal from "sweetalert2";

const successIconHtml =
  '<div class="swal-icon-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10" opacity="0.25"></circle><path d="M8 12.5l2.2 2.2L16 9" stroke-linecap="round" stroke-linejoin="round"></path></svg></div>';

const errorIconHtml =
  '<div class="swal-icon-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10" opacity="0.25"></circle><path d="M9 9l6 6m0-6-6 6" stroke-linecap="round" stroke-linejoin="round"></path></svg></div>';

const warningIconHtml =
  '<div class="swal-icon-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10" opacity="0.25"></circle><path d="M12 7v6m0 4h.01" stroke-linecap="round" stroke-linejoin="round"></path></svg></div>';

const infoIconHtml =
  '<div class="swal-icon-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10" opacity="0.25"></circle><path d="M12 11v5m0-8h.01" stroke-linecap="round" stroke-linejoin="round"></path></svg></div>';

const baseConfig = {
  customClass: {
    popup: "swal-modern",
    confirmButton: "swal-confirm",
    cancelButton: "swal-cancel",
    title: "swal-title",
    htmlContainer: "swal-text",
    icon: "swal-icon",
  },
  buttonsStyling: false,
};

const iconPresets = {
  success: { iconHtml: successIconHtml },
  error: { iconHtml: errorIconHtml },
  warning: { iconHtml: warningIconHtml },
  info: { iconHtml: infoIconHtml },
};

const themedSwal = (titleOrConfig, text, icon) => {
  const isObj = typeof titleOrConfig === "object" && titleOrConfig !== null;
  const config = isObj
    ? { ...titleOrConfig }
    : { title: titleOrConfig, text, icon };

  const preset = config.icon && iconPresets[config.icon] ? iconPresets[config.icon] : {};
  const merged = { ...baseConfig, ...preset, ...config };

  // If using iconHtml, suppress default icon so only custom renders
  if (preset.iconHtml && !merged.iconHtml) {
    merged.iconHtml = preset.iconHtml;
  }
  if (merged.iconHtml) {
    merged.icon = undefined;
  }

  return Swal.fire(merged);
};

export const confirmSwal = (config = {}) =>
  themedSwal({
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    ...config,
  });

// maintain Swal.fire signature compatibility
themedSwal.fire = themedSwal;

export default themedSwal;
