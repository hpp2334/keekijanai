import { detectBrowserLanguage, I18n } from "@/libs/keekijanai-i18n";

export const i18n = I18n.builder()
  .defaultLanguage("en")
  .language(() => {
    let detected = detectBrowserLanguage() ?? "en";
    if (detected.startsWith("en-")) {
      detected = "en";
    }
    return detected;
  })
  .build();
