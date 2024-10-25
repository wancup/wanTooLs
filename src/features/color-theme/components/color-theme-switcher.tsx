import { css } from "$panda/css";
import { IconButton } from "$park/icon-button";
import { Menu } from "$park/menu";
import { Tooltip } from "$park/tooltip";
import { CheckIcon, MoonIcon, SunIcon, SunMoonIcon } from "lucide-solid";
import { createSignal, Index, type JSX, onMount } from "solid-js";
import { match } from "ts-pattern";
import { COLOR_THEME_OPTION, STORAGE_KEY } from "~/site";
import { type ColorThemeOption } from "../types/color-theme-type";

function parseThemeOption(theme: string | null): ColorThemeOption {
  return match(theme)
    .with(COLOR_THEME_OPTION.dark, () => (COLOR_THEME_OPTION.dark))
    .with(COLOR_THEME_OPTION.light, () => COLOR_THEME_OPTION.light)
    .otherwise(() => COLOR_THEME_OPTION.system);
}

export function ColorThemeSwitcher(): JSX.Element {
  const [theme, setTheme] = createSignal<ColorThemeOption>(COLOR_THEME_OPTION.system);

  onMount(() => {
    const storagedTheme = localStorage.getItem(STORAGE_KEY.colorTheme);
    const currentTheme = parseThemeOption(storagedTheme);
    setTheme(currentTheme);
  });

  const handleSelectTheme = (selectedTheme: string): void => {
    const newTheme = parseThemeOption(selectedTheme);
    localStorage.setItem(STORAGE_KEY.colorTheme, newTheme);

    const themeClass = match(newTheme)
      .with("system", () => {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          return COLOR_THEME_OPTION.dark;
        } else {
          return COLOR_THEME_OPTION.light;
        }
      })
      .otherwise((t) => t);
    document.documentElement.classList.remove(COLOR_THEME_OPTION.dark, COLOR_THEME_OPTION.light);
    document.documentElement.classList.add(themeClass);
    setTheme(newTheme);
  };

  return (
    <Menu.Root
      positioning={{ placement: "bottom-end" }}
    >
      <Menu.Trigger
        asChild={(triggerProps) => (
          <Tooltip.Root openDelay={200}>
            <Tooltip.Trigger>
              <IconButton {...triggerProps()} variant="ghost" size="sm">
                {match(theme())
                  .with("dark", () => <MoonIcon />)
                  .with("light", () => <SunIcon />)
                  .with("system", () => <SunMoonIcon />)
                  .exhaustive()}
              </IconButton>
            </Tooltip.Trigger>
            <Tooltip.Positioner>
              <Tooltip.Arrow>
                <Tooltip.ArrowTip />
              </Tooltip.Arrow>
              <Tooltip.Content>Change color theme</Tooltip.Content>
            </Tooltip.Positioner>
          </Tooltip.Root>
        )}
      />
      <Menu.Positioner class={css({ marginRight: "16px" })}>
        <Menu.Content>
          <Menu.RadioItemGroup
            value={theme()}
            onValueChange={(theme) => {
              handleSelectTheme(theme.value);
            }}
          >
            <Index each={Object.values(COLOR_THEME_OPTION)}>
              {(theme) => (
                <Menu.RadioItem value={theme()}>
                  <Menu.ItemIndicator>
                    <CheckIcon />
                  </Menu.ItemIndicator>
                  <Menu.ItemText class={css({ textTransform: "capitalize" })}>
                    {theme()}
                  </Menu.ItemText>
                </Menu.RadioItem>
              )}
            </Index>
          </Menu.RadioItemGroup>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
}
