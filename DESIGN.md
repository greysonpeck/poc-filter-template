## Figma
- File key: `6CISi17bB7BQhmZCdoak84`
- Use components from this page: `https://www.figma.com/design/YqZbFW6psFdmAOXC3gk9fX/Elements-Modernization?node-id=463-1279`
 - Use canonical Tailwind utility classes instead of arbitrary values wherever an equivalent exists (colors, spacing, sizing, typography, radii, etc.).  
- Always check base components (not just the frame) when comparing Figma vs implementation. Use primitives (component instnaces) where necessary.
- Figma asset URLs expire in 7 days — prefer inline SVGs over `<img src={figma_asset_url}>`
- Don't replace text content with text in base components.
- Respect total heights and padding. Container structure doesn't have to match exactly, but height and padding/margin should match exactly.
- Respect layer structure and only apply padding/gap between elements that require it.
- Respect stroke weights and use Tailwind ring, not border.
- Apply hover states as documented in the component variants.

## Figma design system rules
- In an Action bar, there should only ever be one Primary button. Warn when a user tries to add multiple Primary buttons.

## Input wrapper
- Form inputs component: `input-wrapper`
- Inputs may be specified with a Title or not.


## Dropdown
- Use dropdown menu base component: `dropdown-menu`
- Use menu item primitive: `.menu-item`
- Uses the Input wrapper component.
- Use variant to manage helper text and error states.
- Dropdowns can have a title or no title. 
- Groups are divided with a line component: `.menu-item` type=line.
- Selected dropdown menu items get Selected=TRUE state.
- State: "Disabled" gives all elements inside opacity 50%.

## Checkbox
- Context: https://www.figma.com/design/YqZbFW6psFdmAOXC3gk9fX/Elements-Modernization?node-id=4635-431&t=63f4dEsVJic4YOe6-4

## Icons
- Icons context: https://www.figma.com/design/YqZbFW6psFdmAOXC3gk9fX/Elements-Modernization?node-id=4790-12803&t=e5lcaACyDmhBYbdm-4
- Icons are from Lucide, at stroke 1.5. Use icons in context, otherwise reference the closest Lucide icon.
- Icons are formatted in "XX/name" style, e.g. "20/box".
- Download these assets and use them as needed. Don't retrace SVGs.

## Filter chips
- Filter chips context: https://www.figma.com/design/YqZbFW6psFdmAOXC3gk9fX/Elements-Modernization?node-id=1597-15027&t=63f4dEsVJic4YOe6-4
- Cursor-pointer on hover.

## Template control
- Template control context: https://www.figma.com/design/YqZbFW6psFdmAOXC3gk9fX/Elements-Modernization?node-id=5189-54052&t=63f4dEsVJic4YOe6-4
