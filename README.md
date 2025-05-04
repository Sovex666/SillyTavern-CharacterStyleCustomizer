# Character Style Customizer

A third-party extension for SillyTavern that brings advanced styling options to your characters and personas. Customize the look and feel of individual messages with precision, using per-character color settings and custom CSS.

![](https://github.com/RivelleDays/SillyTavern-CharacterStyleCustomizer/blob/main/.github/ui_overview.png)

| Character Message | Group Chat |
|-------------------|-------------------|
| <img src="https://github.com/RivelleDays/SillyTavern-CharacterStyleCustomizer/blob/main/.github/preview1.png"> | <img src="https://github.com/RivelleDays/SillyTavern-CharacterStyleCustomizer/blob/main/.github/preview2.png"> |

## Features

- **Main Colors**: Set base colors (Primary, Secondary, Backgrounds) using injected CSS variables. Includes **Element Color Mapping** for power users to define consistent styling across roles without repetitive configuration.

- **Specific Colors**: Fine-tune text appearance with individual color settings for: Character Name, Main Text, Quotes, Bold, Italic, Bold+Italic, Underline, Strikethrough, Blockquote Border, Links (normal & hover), and more.

- **Message CSS**: Apply custom CSS styles to character messages only. No selectors needed—just write CSS properties directly.

- **Global CSS**: Apply global styles whenever a character is present on the page. This affects the entire UI and may override other characters’ styles, so use with care.

- **Import / Export Settings**: Easily share or back up your style presets! Settings can be exported as `[CSC] CharacterName.json` and imported into other SillyTavern instances to instantly apply the same look and feel.

## Installation

### Prerequisites

It’s recommended to use the latest version of SillyTavern (Release or Staging) with Google Chrome for the best compatibility.

### Steps
1.	Open the Extension Manager in SillyTavern.
2.	Select **Install from URL**.
3.	Paste the following GitHub URL:
```text
https://github.com/RivelleDays/SillyTavern-CharacterStyleCustomizer/
```

# Usage

## Injected CSS Variables

> [!TIP]
> If you want to define global variables (e.g., `--csc-Evelyn-primary`) for a specific character, you can manually add them inside a `:root` selector in that character’s **Global CSS**.
>
> Example:
> ```css
> :root {
>   --csc-Evelyn-primary: #FF8080;
>   --csc-Evelyn-secondary: #FFBDBD;
> }
> ```

| Scope                          | Variable                         | Description                              |
|-------------------------------|----------------------------------|------------------------------------------|
| **Global (All Non-User Messages)** | `--csc-primary`                  | Primary text color                       |
|                               | `--csc-secondary`                | Secondary text color                     |
|                               | `--csc-bg-primary`               | Primary background color                 |
|                               | `--csc-bg-secondary`             | Secondary background color               |
| **Global (User Messages)**    | `--csc-user-primary`             | User primary text color                  |
|                               | `--csc-user-secondary`           | User secondary text color                |
|                               | `--csc-user-bg-primary`          | User primary background color            |
|                               | `--csc-user-bg-secondary`        | User secondary background color          |
| **Character-Specific**        | `--csc-char-primary`             | Primary text color *(for one character only)*<br>Use fallback: `var(--csc-char-primary, var(--csc-primary))` |
|                               | `--csc-char-secondary`           | Secondary text color                     |
|                               | `--csc-char-bg-primary`          | Primary background color                 |
|                               | `--csc-char-bg-secondary`        | Secondary background color               |
| **Persona-Specific (User Roles)** | `--csc-persona-primary`         | Primary text color *(for one persona only)*<br>Use fallback: `var(--csc-persona-primary, var(--csc-user-primary))` |
|                               | `--csc-persona-secondary`        | Secondary text color                     |
|                               | `--csc-persona-bg-primary`       | Primary background color                 |
|                               | `--csc-persona-bg-secondary`     | Secondary background color               |

## Warning: Use Global CSS with Caution

> [!CAUTION]
> **I’m unable to provide support for issues caused by user-added CSS.**
> 
> If you encounter styling problems or need help writing custom styles, please consult your favorite LLM, refer to [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS), or check a CSS tutorial of your choice.
> This extension provides the tools—but how you style your characters is entirely up to you!

The **Global CSS** feature allows a character's styles to affect the entire page layout and UI—not just their message bubbles. When **Enable Global Character CSS** and **Enable Global CSS for this character** are both turned on, and the Global CSS field contains content, a class like `csc-global-css-${safeCharId}` will be added to the `<body>`.
For example:
```html
<body class="csc-global-css-character-Evelyn-Evelyn_png">
```
Because these styles apply globally, **improper or conflicting CSS may break the interface**, such as:
- Misaligned buttons or layout glitches
- UI elements being hidden or visually corrupted
- Conflicts when multiple characters apply global styles at once

If you're not sure what you're doing, we recommend starting with **Message CSS** only. Use Global CSS sparingly, and always test your styles carefully.

## Known Issues

- In the **Character-Specific Styles** section, the labels for **Main Colors** (e.g., Primary Color, Background Color) do not dynamically reflect whether the style is for a user persona or a character. This is a cosmetic issue only and does **not** affect functionality or variable injection.

# Special Thanks
Huge appreciation to the following projects and creators whose work inspired and informed this extension:

-	[XanadusWorks / SillyTavern-Dialogue-Colorizer](https://github.com/XanadusWorks/SillyTavern-Dialogue-Colorizer)
- [zerofata / SillyTavern-Dialogue-Colorizer-Plus](https://github.com/zerofata/SillyTavern-Dialogue-Colorizer-Plus)

I referenced and built upon many parts of the original Dialogue Colorizer codebase. It’s one of my all-time favorite extensions and was a major inspiration for creating a more advanced and customizable character styling tool.

- [SillyTavern / Extension-TopInfoBar](https://github.com/SillyTavern/Extension-TopInfoBar)

Special thanks to Cohee for their excellent code, especially the sidebar and popup UI logic. I’ve always admired Cohee’s work—every extension they write is a joy to use.

# License
AGPLv3
