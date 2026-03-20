// Filter Documentation Page

const NAVY = '#1d2f5d'
const SKY_50 = '#f0f9ff'
const SKY_100 = '#dff2fe'
const SKY_200 = '#b8e6fe'
const SKY_800 = '#00598a'
const SKY_900 = '#024a70'
const SLATE_300 = '#cad5e2'
const SLATE_500 = '#62748e'
const GRAY_100 = '#f3f4f6'
const GRAY_200 = '#e5e7eb'
const GRAY_400 = '#99a1af'
const GRAY_700 = '#364153'

// ─── Primitives ──────────────────────────────────────────────────────────────

function Chip({ label, active, hasX }) {
  const bg = active ? SKY_200 : SKY_50
  const color = active ? SKY_900 : SKY_800
  return (
    <div className="flex items-center gap-1.5 rounded-2xl text-sm font-semibold whitespace-nowrap px-3 py-0.5" style={{ backgroundColor: bg, color }}>
      {label}
      {hasX && (
        <span className="flex items-center justify-center w-5 h-5 shrink-0">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      )}
    </div>
  )
}

function LoadBtn({ active }) {
  const bg = active ? NAVY : GRAY_100
  const color = active ? '#fff' : '#45556c'
  return (
    <div className="flex items-center rounded-2xl text-sm font-semibold px-3 py-0.5" style={{ backgroundColor: bg, color }}>
      Load
    </div>
  )
}

function TemplateChip({ name, selected }) {
  const color = selected ? NAVY : SLATE_500
  return (
    <div className="bg-white flex gap-1 items-center px-2 py-0.5 rounded cursor-default" style={{ outline: `1px solid ${SLATE_300}` }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color, flexShrink: 0 }}>
        <path d="M11.3333 2C11.6869 2 12.026 2.14048 12.2761 2.39052C12.5261 2.64057 12.6666 2.97971 12.6666 3.33333V13.3333C12.6665 13.4501 12.6359 13.5648 12.5776 13.6659C12.5193 13.7671 12.4355 13.8512 12.3345 13.9098C12.2335 13.9683 12.1189 13.9994 12.0022 13.9998C11.8854 14.0002 11.7706 13.9699 11.6693 13.912L8.66125 11.1933C8.45983 11.0783 8.23188 11.0178 7.99992 11.0178C7.76795 11.0178 7.54 11.0783 7.33859 11.1933L4.33059 13.912C4.22921 13.9699 4.11441 14.0002 3.99767 13.9998C3.88092 13.9994 3.76633 13.9683 3.66535 13.9098C3.56437 13.8512 3.48055 13.7671 3.42226 13.6659C3.36398 13.5648 3.33329 13.4501 3.33325 13.3333V3.33333C3.33325 2.97971 3.47373 2.64057 3.72378 2.39052C3.97382 2.14048 4.31296 2 4.66659 2H11.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-sm font-semibold whitespace-nowrap" style={{ color }}>{name}</span>
    </div>
  )
}

function FilterBar({ chips = [], templateName = 'No template', templateSelected = false, loadActive = false }) {
  return (
    <div className="flex items-center gap-10">
      <div className="flex items-center gap-2">
        {chips.map((c, i) => <Chip key={i} label={c.label} active={c.active} hasX={c.active} />)}
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <TemplateChip name={templateName} selected={templateSelected} />
        <LoadBtn active={loadActive} />
      </div>
    </div>
  )
}

function DropdownMenu({ items }) {
  return (
    <div className="rounded-[4px] border py-1 bg-white w-[180px]" style={{ borderColor: GRAY_200, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      {items.map((item, i) =>
        item === '---'
          ? <div key={i} className="my-1 border-t" style={{ borderColor: GRAY_200 }} />
          : <div key={i} className="px-3 py-1.5 text-sm" style={{ color: GRAY_700 }}>{item}</div>
      )}
    </div>
  )
}

function ChipDropdown({ label, values, checkedValues = [] }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <Chip label={`${label}${checkedValues.length === 1 ? ': ' + checkedValues[0] : checkedValues.length > 1 ? ` (${checkedValues.length})` : ''}`} active={checkedValues.length > 0} hasX={checkedValues.length > 0} />
      <div className="rounded border py-1 bg-white w-[160px]" style={{ borderColor: '#d1d5dc', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        {values.map(v => (
          <label key={v} className="flex items-center gap-2 px-3 py-1.5 text-sm" style={{ color: GRAY_700 }}>
            <div className="w-[14px] h-[14px] rounded-[2px] border-2 flex items-center justify-center shrink-0" style={{ borderColor: checkedValues.includes(v) ? '#0084d1' : GRAY_400, backgroundColor: checkedValues.includes(v) ? '#0084d1' : '#fff' }}>
              {checkedValues.includes(v) && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            {v}
          </label>
        ))}
      </div>
    </div>
  )
}

function TemplateForm({ prefilled = '', visibleToAll = false, isEdit = false }) {
  return (
    <div className="rounded-[4px] border bg-white overflow-hidden w-[320px]" style={{ borderColor: GRAY_200 }}>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <span className="text-[14px] font-bold" style={{ color: '#3f3f46' }}>Template name</span>
          <div className="h-10 bg-white border rounded-[4px] flex items-center px-3" style={{ borderColor: '#a1a1aa' }}>
            <span className="text-[14px]" style={{ color: prefilled ? '#3f3f46' : GRAY_400 }}>{prefilled || '\u00A0'}</span>
          </div>
        </div>
        <div className="flex gap-1 items-center">
          <span className="flex-1 text-[14px] font-bold" style={{ color: GRAY_700 }}>Visible to all users</span>
          <div className="p-[10px]">
            <div className="size-[22px] rounded-[2px] border-2 flex items-center justify-center" style={{ borderColor: visibleToAll ? '#0084d1' : GRAY_400, backgroundColor: visibleToAll ? '#0084d1' : '#fff' }}>
              {visibleToAll && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
      {isEdit ? (
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="text-[14px] underline" style={{ color: '#e7000b' }}>Delete template</span>
          <div className="flex gap-2 items-center justify-end flex-1">
            <div className="h-8 px-2 rounded-[4px] border flex items-center text-[14px]" style={{ borderColor: NAVY, color: NAVY }}>Save as New</div>
            <div className="h-8 w-16 rounded-[4px] flex items-center justify-center text-[14px] text-white" style={{ backgroundColor: NAVY }}>Save</div>
          </div>
        </div>
      ) : (
        <div className="flex justify-end px-4 py-3">
          <div className="h-8 w-16 rounded-[4px] flex items-center justify-center text-[14px] text-white" style={{ backgroundColor: NAVY }}>Save</div>
        </div>
      )}
    </div>
  )
}

const TABLE_COLS = ['Customer Name', 'Customer ID', 'Type', 'Date', 'Contact', 'Class']

function EmptyTableState({ message = 'Choose at least one filter then click Load.' }) {
  return (
    <div className="border rounded bg-white overflow-hidden" style={{ borderColor: GRAY_200 }}>
      <div className="border-b px-3 py-2 flex gap-4" style={{ borderColor: GRAY_200, backgroundColor: '#fafafa' }}>
        {TABLE_COLS.map(h => (
          <span key={h} className="text-xs font-semibold" style={{ color: GRAY_700 }}>{h}</span>
        ))}
      </div>
      <div className="flex items-center justify-center py-8 text-sm" style={{ color: SLATE_500 }}>
        {message}
      </div>
    </div>
  )
}

function LoadedTableState() {
  const rows = [
    { name: "prashant Demo' quick", id: '9100650', type: 'SYS EMAIL', date: 'Mar 13, 2026', contact: 'prashant.sharma@routeware.com', cls: 'Default class' },
    { name: 'Jeffs QA Shop',        id: '9100624', type: 'SYS EMAIL', date: 'Mar 13, 2026', contact: 'jgardner@routeware.com',          cls: 'Default class' },
    { name: 'John Muir College',    id: '300212',  type: 'CALL',      date: 'Mar 13, 2026', contact: 'arpitstpss@gmail.com',            cls: 'Default class' },
  ]
  return (
    <div className="border rounded bg-white overflow-hidden" style={{ borderColor: GRAY_200 }}>
      <div className="border-b grid grid-cols-6 px-3 py-2 gap-2" style={{ borderColor: GRAY_200, backgroundColor: '#fafafa' }}>
        {TABLE_COLS.map(h => (
          <span key={h} className="text-xs font-semibold truncate" style={{ color: GRAY_700 }}>{h}</span>
        ))}
      </div>
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-6 px-3 py-1.5 gap-2 border-b last:border-b-0" style={{ borderColor: GRAY_200 }}>
          <span className="text-xs truncate" style={{ color: GRAY_700 }}>{r.name}</span>
          <span className="text-xs" style={{ color: GRAY_700 }}>{r.id}</span>
          <span className="text-xs" style={{ color: GRAY_700 }}>{r.type}</span>
          <span className="text-xs" style={{ color: GRAY_700 }}>{r.date}</span>
          <span className="text-xs truncate" style={{ color: GRAY_700 }}>{r.contact}</span>
          <span className="text-xs" style={{ color: GRAY_700 }}>{r.cls}</span>
        </div>
      ))}
    </div>
  )
}

function LoadingTableState() {
  return (
    <div className="relative border rounded bg-white overflow-hidden" style={{ borderColor: GRAY_200 }}>
      <div className="border-b grid grid-cols-6 px-3 py-2 gap-2" style={{ borderColor: GRAY_200, backgroundColor: '#fafafa' }}>
        {TABLE_COLS.map(h => (
          <span key={h} className="text-xs font-semibold truncate" style={{ color: GRAY_700 }}>{h}</span>
        ))}
      </div>
      {[0, 1, 2].map(i => (
        <div key={i} className="grid grid-cols-6 px-3 py-1.5 gap-2 border-b last:border-b-0" style={{ borderColor: GRAY_200 }}>
          {[0, 1, 2, 3, 4, 5].map(j => (
            <div key={j} className="h-3 rounded" style={{ backgroundColor: GRAY_200, opacity: 0.6 }} />
          ))}
        </div>
      ))}
      <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.75)' }}>
        <span className="flex items-center gap-2 text-sm" style={{ color: SLATE_500 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke={SLATE_300} strokeWidth="2.5" />
            <path d="M12 3a9 9 0 019 9" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Loading…
        </span>
      </div>
    </div>
  )
}

// ─── State card ───────────────────────────────────────────────────────────────

function StateCard({ title, description, children, side = false }) {
  if (side) {
    return (
      <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${GRAY_200}` }}>
        <div className="flex items-stretch">
          <div className="flex flex-col justify-center gap-1.5 px-5 py-4 w-[280px] shrink-0">
            <h3 className="font-bold text-[15px]" style={{ color: NAVY }}>{title}</h3>
            <p className="text-sm" style={{ color: '#4b5563' }}>{description}</p>
          </div>
          <div className="flex-1 flex items-center justify-center p-5" style={{ backgroundColor: '#f2f6f9', borderLeft: `1px solid ${GRAY_200}` }}>
            {children}
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="font-bold text-[15px]" style={{ color: NAVY }}>{title}</h3>
        <p className="text-sm mt-0.5" style={{ color: '#4b5563' }}>{description}</p>
      </div>
      <div className="rounded-lg p-4" style={{ backgroundColor: '#f2f6f9', border: `1px solid ${GRAY_200}` }}>
        {children}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-bold text-lg border-b pb-2" style={{ color: NAVY, borderColor: GRAY_200 }}>{title}</h2>
      {children}
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocumentationPage({ onBack }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f2f6f9', fontFamily: "'Nunito Sans', sans-serif" }}>

      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10" style={{ borderColor: GRAY_200 }}>
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
            style={{ color: NAVY }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <h1 className="font-bold text-base" style={{ color: NAVY }}>Filter documentation</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-10">

        {/* ── Filter bar states ───────────────────────────────────────── */}
        <Section title="Filter bar states">

          <StateCard
            title="1. Default — no filters set"
            description="The page's initial state on load. All filter chips are inactive, the Load button is inactive, and no data is shown in the table."
          >
            <FilterBar
              chips={[
                { label: 'Status' },
                { label: 'Finance' },
                { label: 'Type' },
              ]}
            />
          </StateCard>

          <StateCard
            title="2. Filters active, not yet loaded"
            description="The user has selected values in one or more chips. The Load button becomes active (navy). The table still shows the empty state or previous results until Load is clicked."
          >
            <FilterBar
              chips={[
                { label: 'Status: Active', active: true },
                { label: 'Finance' },
                { label: 'Type' },
              ]}
              loadActive
            />
          </StateCard>

          <StateCard
            title="3. Multiple filters active"
            description="Two or more chips have selections. The Load button is active. Clicking Load will apply an AND filter across all active chips."
          >
            <FilterBar
              chips={[
                { label: 'Status: Active', active: true },
                { label: 'Finance: Yes', active: true },
                { label: 'Type' },
              ]}
              loadActive
            />
          </StateCard>

          <StateCard
            title="4. Template selected"
            description="The user has selected a saved template. The template chip shows the template name in navy. The filter chips are automatically populated with the template's saved selections and the table loads immediately."
          >
            <FilterBar
              chips={[
                { label: 'Status: Active', active: true },
                { label: 'Finance: Yes', active: true },
                { label: 'Type' },
              ]}
              templateName="Active Over 5000"
              templateSelected
              loadActive
            />
          </StateCard>

        </Section>

        {/* ── Table states ──────────────────────────────────────────────── */}
        <Section title="Table states">

          <StateCard
            title="5. Empty state (no load yet)"
            description="Shown on page load and any time no data has been requested. Column headers are always visible. The body prompts the user to set filters and click Load."
          >
            <EmptyTableState />
          </StateCard>

          <StateCard
            title="6. Loading"
            description="Shown for 2 seconds after the user clicks Load or selects a template. Previous data (if any) remains visible underneath a translucent overlay with a spinner."
          >
            <LoadingTableState />
          </StateCard>

          <StateCard
            title="7. Results loaded"
            description="The table shows the rows that match the active filter chips. The user can sort columns, drag columns to group, search, and toggle column visibility."
          >
            <LoadedTableState />
          </StateCard>

          <StateCard
            title="8. Loaded — no results"
            description="All filter chips matched zero rows. The table shows the empty-state message after the loading spinner completes."
          >
            <EmptyTableState message="No results match the selected filters." />
          </StateCard>

        </Section>

        {/* ── Dropdown & popover states ─────────────────────────────────── */}
        <Section title="Dropdown & popover states">

          <StateCard
            side
            title="9. Filter chip dropdown open"
            description="Clicking an inactive or active filter chip opens a dropdown with checkboxes for each available value. Checking a value immediately activates the chip. Unchecking all values returns the chip to its inactive state."
          >
            <div className="flex items-start gap-8">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold mb-1" style={{ color: SLATE_500 }}>Inactive chip</p>
                <ChipDropdown label="Status" values={['Active', 'Inactive', 'Pending']} />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold mb-1" style={{ color: SLATE_500 }}>Active chip (one value checked)</p>
                <ChipDropdown label="Status" values={['Active', 'Inactive', 'Pending']} checkedValues={['Active']} />
              </div>
            </div>
          </StateCard>

          <StateCard
            side
            title="10. Template menu — no filters active"
            description="When no filter chips are active, clicking the template chip shows only the list of saved templates. 'Edit template' and 'New template' are hidden because no filter state is defined to save."
          >
            <div className="flex justify-end">
              <div className="relative inline-flex flex-col items-end gap-1">
                <TemplateChip name="No template" />
                <DropdownMenu items={['Active Over 5000', 'Finance Only']} />
              </div>
            </div>
          </StateCard>

          <StateCard
            side
            title="11. Template menu — filters active, no template selected"
            description="When filters are active but no template is selected, the menu shows the template list plus a divider and 'New template'. 'Edit template' is omitted because there is no active template to edit."
          >
            <div className="flex justify-end">
              <div className="relative inline-flex flex-col items-end gap-1">
                <TemplateChip name="No template" />
                <DropdownMenu items={['Active Over 5000', 'Finance Only', '---', 'New template']} />
              </div>
            </div>
          </StateCard>

          <StateCard
            side
            title="12. Template menu — filters active, template selected"
            description="When both a template is selected and filters are active, the menu shows all options: the template list, a divider, 'Edit template' (for the current selection), and 'New template'."
          >
            <div className="flex justify-end">
              <div className="relative inline-flex flex-col items-end gap-1">
                <TemplateChip name="Active Over 5000" selected />
                <DropdownMenu items={['Active Over 5000', 'Finance Only', '---', 'Edit template', 'New template']} />
              </div>
            </div>
          </StateCard>

          <StateCard
            side
            title="13. Create template form"
            description="Accessed via 'New template' in the template menu. The user enters a name and optionally marks it visible to all users. Clicking Save stores the template with the current filter selections and selects it immediately."
          >
            <div className="flex justify-end">
              <div className="relative inline-flex flex-col items-end gap-1">
                <TemplateChip name="No template" />
                <TemplateForm />
              </div>
            </div>
          </StateCard>

          <StateCard
            side
            title="14. Edit template form"
            description="Accessed via 'Edit template' when a template is currently selected. The form is pre-populated with the template's name and settings. The user can save changes, save as a new template, or delete the template entirely."
          >
            <div className="flex justify-end">
              <div className="relative inline-flex flex-col items-end gap-1">
                <TemplateChip name="Active Over 5000" selected />
                <TemplateForm prefilled="Active Over 5000" visibleToAll isEdit />
              </div>
            </div>
          </StateCard>

        </Section>

        {/* ── Undefined / unclear states ────────────────────────────────── */}
        <Section title="Undefined or unclear states">
          <div className="rounded-lg p-5 flex flex-col gap-3" style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }}>
            <p className="text-sm font-bold" style={{ color: '#92400e' }}>The following states have no defined behavior yet:</p>
            <ul className="flex flex-col gap-2.5 text-sm" style={{ color: '#78350f' }}>
              {[
                'Filters changed after loading — if the user modifies chips after clicking Load, the table still shows the old results. It is unclear whether the Load button should re-activate or whether a "stale results" indicator should appear.',
                'Template de-selection — there is no way to deselect an active template and return to "No template" without clearing the chips manually.',
                'Template with empty selections — if a template is saved while no chips are active, selecting it will load all rows with no filtering. There is no warning that the template captures no filter state.',
                'Filters changed after template selection — if the user selects a template (which loads data) and then modifies a chip, the active template name is still shown even though the current filter state no longer matches the template.',
                '"Save as New" naming conflict — if the user types an existing template name in the edit form and clicks "Save as New", a duplicate entry will be created. There is no deduplication or warning.',
                'Load button state after clearing chips — after chips are cleared, the Load button returns to inactive, but the table still shows the previously loaded data. It is unclear whether the table should also clear.',
              ].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-0.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

      </div>
    </div>
  )
}
