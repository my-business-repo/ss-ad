export const UI_ELEMENTS = ["Alerts", "Buttons"]
  .sort((a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase()))
  .map((value: any) => ({
    title: value,
    url: "/ui-elements/" + value.split(" ").join("-").toLowerCase(),
    isPro: !["Alerts", "Buttons"].includes(value),
  }));
