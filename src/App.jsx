import { useState, useRef, useEffect } from 'react'
import DocumentationPage from './DocumentationPage'

function Toast({ message, variant = 'success' }) {
  const styles = variant === 'neutral'
    ? 'bg-gray-600 text-white'
    : 'bg-emerald-600 text-white'
  return (
    <div
      className={`fixed top-5 right-5 z-[99999] flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm font-semibold pointer-events-none ${styles}`}
      style={{ animation: 'toast-in 0.2s ease-out' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {message}
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState('main') // 'main' | 'docs'
  const [loadedData, setLoadedData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [chipSelections, setChipSelections] = useState({ status: new Set(), billingCycle: new Set(), finance: new Set(), class: new Set(), delivery: new Set() })
  const [criteriaFilter, setCriteriaFilter] = useState({ column: 'accountBalance', operator: 'Greater than', value: '' })
  const [activeOptionalFields, setActiveOptionalFields] = useState([])
  const [loadReady, setLoadReady] = useState(false)
  const [toast, setToast] = useState(null)

  function showToast(message, variant = 'success') {
    setToast({ message, variant })
    setTimeout(() => setToast(null), 3000)
  }

  if (page === 'docs') return <DocumentationPage onBack={() => setPage('main')} />

  const criteriaActive = !!(criteriaFilter.column && criteriaFilter.operator && criteriaFilter.value)
  const anyChipActive = Object.values(chipSelections).some(s => s.size > 0) || criteriaActive

  function updateChip(field, newSet) {
    setChipSelections(prev => {
      const next = { ...prev, [field]: newSet }
      setLoadReady(Object.values(next).some(s => s.size > 0) || criteriaActive)
      return next
    })
  }

  function updateCriteria(next) {
    setCriteriaFilter(next)
    const active = !!(next.column && next.operator && next.value)
    setLoadReady(Object.values(chipSelections).some(s => s.size > 0) || active)
  }

  function applyFilter(sels, criteria) {
    const filtered = ROWS.filter(row => {
      if (!Object.entries(sels).every(([field, vals]) => vals.size === 0 || vals.has(row[field]))) return false
      if (criteria?.column && criteria?.operator && criteria?.value) {
        const threshold = Number(criteria.value)
        const colDef = CRITERIA_COLUMNS.find(c => c.key === criteria.column)
        const fields = colDef?.fields ?? ['balance']
        const test = v => {
          switch (criteria.operator) {
            case 'Greater than':             return v >  threshold
            case 'Less than':                return v <  threshold
            case 'Equal to':                 return v === threshold
            case 'Greater than or equal to': return v >= threshold
            case 'Less than or equal to':    return v <= threshold
            default: return true
          }
        }
        if (!fields.some(f => test(row[f] ?? 0))) return false
      }
      return true
    })
    setIsLoading(true)
    setLoadReady(false)
    setTimeout(() => {
      setLoadedData(filtered)
      setIsLoading(false)
    }, 2000)
  }

  function handleLoad() {
    if (!anyChipActive) {
      showToast('Select at least one filter before loading.', 'neutral')
      return
    }
    applyFilter(chipSelections, criteriaFilter)
  }

  function handleSelectTemplate(template) {
    const optionals = template.selections?._optionalFields ?? []
    setActiveOptionalFields(optionals)
    const sels = {
      status:       new Set(template.selections?.status       ?? []),
      billingCycle: new Set(template.selections?.billingCycle ?? []),
      finance:      new Set(template.selections?.finance      ?? []),
      class:        new Set(template.selections?.class        ?? []),
      delivery:     new Set(template.selections?.delivery     ?? []),
    }
    const criteria = template.selections?._criteria ?? { column: 'accountBalance', operator: 'Greater than', value: '' }
    setChipSelections(sels)
    setCriteriaFilter(criteria)
    setLoadReady(true)
    applyFilter(sels, criteria)
  }

  function addOptionalField(field) {
    setActiveOptionalFields(prev => [...prev, field])
    setLoadReady(true)
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
      {toast && <Toast message={toast.message} variant={toast.variant} />}

      {/* Sidebar */}
      <aside className="w-[220px] shrink-0 flex flex-col" style={{ backgroundColor: '#1D2F5D' }}>

        {/* Logo area */}
        <div className="h-14 flex items-center px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <ElementsLogo />
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2">

          {/* Home */}
          <NavItem icon={<HomeIcon />} label="Home" />

          {/* Customers */}
          <NavItem icon={<UsersIcon />} label="Customers" />

          {/* Work Orders */}
          <NavItem icon={<ClipboardListIcon />} label="Work Orders" />

          {/* Dispatching */}
          <NavItem icon={<TruckIcon />} label="Dispatching" />

          {/* Reports (active) */}
          <NavItem icon={<BarChartIcon />} label="Reports" active />

          {/* Settings */}
          <NavItem icon={<SettingsIcon />} label="Settings" />
        </nav>

        {/* Show documentation */}
        <div className="px-3 pb-2">
          <button
            onClick={() => setPage('docs')}
            className="text-base font-bold text-left w-full px-2 py-1.5 rounded transition-colors cursor-pointer"
            style={{ color: 'rgba(255,255,255,0.85)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,100)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
          >
            Documentation
          </button>
        </div>

        {/* Collapse toggle */}
        <div className="h-10 flex items-center justify-end px-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button className="p-1 rounded" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L6 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top header */}
        <header className="h-14 shrink-0 bg-white border-b border-gray-200 flex items-center px-4 gap-3">

          {/* Page title */}
          <span className="font-bold text-sm flex-1" style={{ color: '#1D2F5D' }}>
            Receivables Management
          </span>

          {/* Right side icons */}
          <div className="flex items-center gap-1">

            {/* Search */}
            <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            {/* External link */}
            <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 3h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 14L21 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Clock */}
            <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Bar chart */}
            <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Wallet */}
            <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="13" r="1.5" fill="currentColor" />
              </svg>
            </button>

            {/* Help */}
            <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="1" />
              </svg>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* User avatar */}
            <button className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-200 overflow-hidden">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4" style={{ backgroundColor: '#f2f6f9' }}>
          <div className="bg-white rounded p-3 flex flex-col gap-3">
            {/* Filter chips */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <FilterChip label="Status"        field="status"       values={[...new Set(ROWS.map(r => r.status))]}       value={chipSelections.status}       onChange={s => updateChip('status',       s)} />
                <FilterChip label="Billing cycle" field="billingCycle" values={[...new Set(ROWS.map(r => r.billingCycle))]} value={chipSelections.billingCycle} onChange={s => updateChip('billingCycle', s)} />
                <FilterChip label="Finance"       field="finance"      values={[...new Set(ROWS.map(r => r.finance))]}      value={chipSelections.finance}      onChange={s => updateChip('finance',      s)} />
                <CriteriaChip value={criteriaFilter} onChange={updateCriteria} />
                {activeOptionalFields.map(field => {
                  const cfg = OPTIONAL_FIELDS.find(f => f.field === field)
                  return (
                    <FilterChip key={field} label={cfg.label} field={field}
                      values={[...new Set(ROWS.map(r => r[field]))]}
                      value={chipSelections[field]}
                      onChange={s => updateChip(field, s)} />
                  )
                })}
                <AddChip
                  options={OPTIONAL_FIELDS.filter(f => !activeOptionalFields.includes(f.field))}
                  onAdd={addOptionalField}
                />
              </div>
              <div className="w-px self-stretch bg-gray-200 mx-2" />
              <div className="flex items-center gap-2">
                <TemplateControl currentSelections={chipSelections} criteriaFilter={criteriaFilter} activeOptionalFields={activeOptionalFields} onSelectTemplate={handleSelectTemplate} filtersActive={anyChipActive} onToast={showToast} />
                <LoadButton onClick={() => handleLoad()} active={loadReady} />
              </div>
            </div>
            <ActivityHistoryTable loadedData={loadedData} isLoading={isLoading} />
          </div>
        </main>
      </div>
    </div>
  )
}

function NavItem({ icon, label, active, hasChevron }) {
  if (active) {
    return (
      <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded text-sm font-bold text-left bg-white" style={{ color: '#1D2F5D' }}>
        <span style={{ color: '#33a642' }}>{icon}</span>
        <span className="flex-1">{label}</span>
      </button>
    )
  }
  return (
    <button
      className="w-full flex items-center gap-2.5 px-2 py-2 rounded text-sm font-semibold text-left transition-colors"
      style={{ color: 'rgba(255,255,255,0.75)' }}
    >
      <span style={{ color: 'rgba(255,255,255,0.6)' }}>{icon}</span>
      <span className="flex-1">{label}</span>
      {hasChevron && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

function SubNavItem({ label }) {
  return (
    <button className="w-full flex items-center px-2 py-1.5 rounded text-xs text-left" style={{ color: 'rgba(255,255,255,0.55)' }}>
      {label}
    </button>
  )
}

const ROWS = [
  { customerName: 'Harvest Moon Bistro',       customerId: '9100650', user: 'Juan Gomez',   class: 'Default', billingCycle: '14 day', delivery: 'Email invoice',           status: 'Active',   finance: 'Yes', ageBal0: 0,       ageBal1: 0,       ageBal2: 18432.75,   ageBal3: 0,       ageBal4Plus: 19.00,    unapplied: 0,        balance: 18451.75   },
  { customerName: 'Blue Ridge Plumbing Co.',   customerId: '9100624', user: 'Juan Gomez',   class: 'Alpha',   billingCycle: '28 day', delivery: 'Print invoice',           status: 'Active',   finance: 'No',  ageBal0: 0,       ageBal1: 252.88,  ageBal2: 0,          ageBal3: 0,       ageBal4Plus: 0,        unapplied: -100.00,  balance: 152.88     },
  { customerName: 'Sparrow & Sons Electric',   customerId: '9100601', user: 'Juan Gomez',   class: 'Default', billingCycle: '28 day', delivery: 'Print and email invoice', status: 'Inactive', finance: 'Yes', ageBal0: 0,       ageBal1: 2.20,    ageBal2: 0,          ageBal3: 0,       ageBal4Plus: 0,        unapplied: 0,        balance: 2.20       },
  { customerName: 'Westlake Academy',          customerId: '300212',  user: 'Maria Santos', class: 'Default', billingCycle: '14 day', delivery: 'Email invoice',           status: 'Active',   finance: 'Yes', ageBal0: 0,       ageBal1: 0,       ageBal2: 0,          ageBal3: 1363.20, ageBal4Plus: 21811.20, unapplied: 0,        balance: 23174.40   },
  { customerName: 'Copper Kettle Diner',       customerId: '482901',  user: 'Maria Santos', class: 'Alpha',   billingCycle: '14 day', delivery: 'No delivery',             status: 'Active',   finance: 'No',  ageBal0: 0,       ageBal1: 0,       ageBal2: 0,          ageBal3: 0,       ageBal4Plus: 14250.00, unapplied: -6821.09, balance: 7428.91    },
  { customerName: 'Mesa Verde Roofing',        customerId: '482955',  user: 'Maria Santos', class: 'Beta',    billingCycle: '28 day', delivery: 'Print invoice',           status: 'Pending',  finance: 'No',  ageBal0: 0,       ageBal1: 0,       ageBal2: 0,          ageBal3: 0,       ageBal4Plus: 45.36,    unapplied: 0,        balance: 45.36      },
  { customerName: 'Pinecrest Dental Group',    customerId: '482988',  user: 'Maria Santos', class: 'Beta',    billingCycle: '14 day', delivery: 'Email invoice',           status: 'Active',   finance: 'Yes', ageBal0: 0,       ageBal1: 1176.12, ageBal2: 0,          ageBal3: 0,       ageBal4Plus: 0,        unapplied: 0,        balance: 1176.12    },
  { customerName: 'Summit Ridge Landscaping',  customerId: '771430',  user: 'Derek Hale',   class: 'Beta',    billingCycle: '28 day', delivery: 'Print and email invoice', status: 'Active',   finance: 'Yes', ageBal0: 0,       ageBal1: 0,       ageBal2: 0,          ageBal3: 0,       ageBal4Plus: 3435.26,  unapplied: 0,        balance: 3435.26    },
  { customerName: 'Clearwater HVAC Services',  customerId: '771488',  user: 'Derek Hale',   class: 'Default', billingCycle: '14 day', delivery: 'No delivery',             status: 'Inactive', finance: 'No',  ageBal0: 0,       ageBal1: 0,       ageBal2: 0,          ageBal3: 4130.10, ageBal4Plus: 12680.45, unapplied: 0,        balance: 16810.55   },
  { customerName: 'Pinnacle Auto Group',       customerId: '334872',  user: 'Derek Hale',   class: 'Default', billingCycle: '28 day', delivery: 'Print invoice',           status: 'Active',   finance: 'Yes', ageBal0: 0,       ageBal1: 0,       ageBal2: 0,          ageBal3: 0,       ageBal4Plus: 2801.76,  unapplied: -105.00,  balance: 2696.76    },
  { customerName: 'Ironwood Charter School',   customerId: '609115',  user: 'Maria Santos', class: 'Alpha',   billingCycle: '14 day', delivery: 'Email invoice',           status: 'Active',   finance: 'Yes', ageBal0: 1842.50, ageBal1: 0,       ageBal2: 0,          ageBal3: 0,       ageBal4Plus: 0,        unapplied: 0,        balance: 1842.50    },
  { customerName: 'Pacific Crest Logistics',   customerId: '609177',  user: 'Maria Santos', class: 'Default', billingCycle: '28 day', delivery: 'Print and email invoice', status: 'Active',   finance: 'No',  ageBal0: 0,       ageBal1: 0,       ageBal2: 4167.95,    ageBal3: 0,       ageBal4Plus: 0,        unapplied: 0,        balance: 4167.95    },
  { customerName: 'Golden Gate Bakery',        customerId: '218763',  user: 'Juan Gomez',   class: 'Beta',    billingCycle: '14 day', delivery: 'No delivery',             status: 'Pending',  finance: 'No',  ageBal0: 0,       ageBal1: 0,       ageBal2: 0,          ageBal3: 0,       ageBal4Plus: 287.01,   unapplied: 0,        balance: 287.01     },
  { customerName: 'Redwood Valley Winery',     customerId: '218800',  user: 'Juan Gomez',   class: 'Alpha',   billingCycle: '28 day', delivery: 'Email invoice',           status: 'Active',   finance: 'Yes', ageBal0: 0,       ageBal1: 0,       ageBal2: 0,          ageBal3: 0,       ageBal4Plus: 245.38,   unapplied: 0,        balance: 245.38     },
  { customerName: 'Lakeside Family Clinic',    customerId: '557294',  user: 'Derek Hale',   class: 'Default', billingCycle: '14 day', delivery: 'Print invoice',           status: 'Active',   finance: 'Yes', ageBal0: 0,       ageBal1: 0,       ageBal2: 0,          ageBal3: 0,       ageBal4Plus: 1490.16,  unapplied: 0,        balance: 1490.16    },
  { customerName: 'Northgate Hardware',        customerId: '557350',  user: 'Derek Hale',   class: 'Beta',    billingCycle: '28 day', delivery: 'Print and email invoice', status: 'Active',   finance: 'No',  ageBal0: 0,       ageBal1: 0,       ageBal2: 0,          ageBal3: 0,       ageBal4Plus: 3523.10,  unapplied: 0,        balance: 3523.10    },
  { customerName: 'Canyon View Tire & Auto',   customerId: '893041',  user: 'Maria Santos', class: 'Alpha',   billingCycle: '14 day', delivery: 'No delivery',             status: 'Inactive', finance: 'No',  ageBal0: 0,       ageBal1: 0,       ageBal2: 0,          ageBal3: 0,       ageBal4Plus: 9874.32,  unapplied: -189.90,  balance: 9684.42    },
  { customerName: 'Maplewood Prep School',     customerId: '893099',  user: 'Maria Santos', class: 'Default', billingCycle: '28 day', delivery: 'Email invoice',           status: 'Active',   finance: 'Yes', ageBal0: 0,       ageBal1: 0,       ageBal2: 0,          ageBal3: 0,       ageBal4Plus: 200.00,   unapplied: 0,        balance: 200.00     },
  { customerName: 'Frontier Pest Solutions',   customerId: '124580',  user: 'Derek Hale',   class: 'Default', billingCycle: '14 day', delivery: 'Print invoice',           status: 'Active',   finance: 'Yes', ageBal0: 0,       ageBal1: 0,       ageBal2: 0,          ageBal3: 0,       ageBal4Plus: 2.20,     unapplied: 0,        balance: 2.20       },
  { customerName: 'Starling Coffee Roasters',  customerId: '124642',  user: 'Derek Hale',   class: 'Beta',    billingCycle: '28 day', delivery: 'Print and email invoice', status: 'Pending',  finance: 'No',  ageBal0: 0,       ageBal1: 0,       ageBal2: 0,          ageBal3: 0,       ageBal4Plus: 22150.80, unapplied: 0,        balance: 22150.80   },
]

const OPTIONAL_FIELDS = [
  { field: 'class',    label: 'Class' },
  { field: 'delivery', label: 'Delivery' },
]

const COLUMNS = [
  { key: 'customerName', label: 'Customer Name', flex: '1 0 0' },
  { key: 'customerId',   label: 'Customer ID',   width: 140 },
  { key: 'class',        label: 'Class',         width: 140 },
  { key: 'status',       label: 'Status',        width: 100 },
  { key: 'balance',      label: 'Balance',       width: 120 },
]

const TEMPLATES_KEY = 'fe_templates'

function TemplateControl({ currentSelections = {}, criteriaFilter = {}, activeOptionalFields = [], onSelectTemplate, filtersActive = false, onToast }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('dropdown') // 'dropdown' | 'create' | 'edit'
  const [templates, setTemplates] = useState(() => {
    try { return JSON.parse(localStorage.getItem(TEMPLATES_KEY)) || [] } catch { return [] }
  })
  const [selectedName, setSelectedName] = useState('')
  const [editingName, setEditingName] = useState('') // original name of template being edited
  const [templateName, setTemplateName] = useState('')
  const [visibleToAll, setVisibleToAll] = useState(false)
  const ref = useRef(null)

  const selected = selectedName !== ''

  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function handleOpen() {
    setMode(templates.length > 0 ? 'dropdown' : 'create')
    setTemplateName('')
    setVisibleToAll(false)
    setOpen(v => !v)
  }

  function openEdit() {
    const t = templates.find(t => t.name === selectedName) ?? templates[0]
    if (!t) return
    setEditingName(t.name)
    setTemplateName(t.name)
    setVisibleToAll(t.visibleToAll ?? false)
    setMode('edit')
  }

  function persist(next) {
    setTemplates(next)
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(next))
  }

  function handleCreate() {
    const name = templateName.trim()
    if (!name) return
    const selections = {
      status:          [...(currentSelections.status       ?? [])],
      billingCycle:    [...(currentSelections.billingCycle ?? [])],
      finance:         [...(currentSelections.finance      ?? [])],
      class:           [...(currentSelections.class        ?? [])],
      delivery:        [...(currentSelections.delivery     ?? [])],
      _optionalFields: activeOptionalFields,
      _criteria:       criteriaFilter,
    }
    persist([...templates, { name, visibleToAll, selections }])
    setSelectedName(name)
    setOpen(false)
    onToast?.('Template saved successfully.')
  }

  function handleEditSave() {
    const name = templateName.trim()
    if (!name) return
    const selections = {
      status:          [...(currentSelections.status       ?? [])],
      billingCycle:    [...(currentSelections.billingCycle ?? [])],
      finance:         [...(currentSelections.finance      ?? [])],
      class:           [...(currentSelections.class        ?? [])],
      delivery:        [...(currentSelections.delivery     ?? [])],
      _optionalFields: activeOptionalFields,
      _criteria:       criteriaFilter,
    }
    const next = templates.map(t =>
      t.name === editingName ? { ...t, name, visibleToAll, selections } : t
    )
    persist(next)
    if (selectedName === editingName) setSelectedName(name)
    setOpen(false)
    onToast?.('Template saved successfully.')
  }

  function handleSaveAsNew() {
    const name = templateName.trim()
    if (!name) return
    const base = templates.find(t => t.name === editingName)
    const selections = {
      ...base?.selections,
      status:          [...(currentSelections.status       ?? [])],
      billingCycle:    [...(currentSelections.billingCycle ?? [])],
      finance:         [...(currentSelections.finance      ?? [])],
      class:           [...(currentSelections.class        ?? [])],
      delivery:        [...(currentSelections.delivery     ?? [])],
      _optionalFields: activeOptionalFields,
      _criteria:       criteriaFilter,
    }
    persist([...templates, { ...base, name, visibleToAll, selections }])
    setSelectedName(name)
    setOpen(false)
    onToast?.('New template saved successfully.')
  }

  function handleDelete() {
    const next = templates.filter(t => t.name !== editingName)
    persist(next)
    if (selectedName === editingName) setSelectedName('')
    setOpen(false)
    onToast?.('Template deleted.', 'neutral')
  }

  function handleSelect(template) {
    setSelectedName(template.name)
    onSelectTemplate?.(template)
    setOpen(false)
  }

  const BookmarkIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" style={{ color: selected ? '#1d2f5d' : '#62748e' }}>
      <path d="M11.3333 2C11.6869 2 12.026 2.14048 12.2761 2.39052C12.5261 2.64057 12.6666 2.97971 12.6666 3.33333V13.3333C12.6665 13.4501 12.6359 13.5648 12.5776 13.6659C12.5193 13.7671 12.4355 13.8512 12.3345 13.9098C12.2335 13.9683 12.1189 13.9994 12.0022 13.9998C11.8854 14.0002 11.7706 13.9699 11.6693 13.912L8.66125 11.1933C8.45983 11.0783 8.23188 11.0178 7.99992 11.0178C7.76795 11.0178 7.54 11.0783 7.33859 11.1933L4.33059 13.912C4.22921 13.9699 4.11441 14.0002 3.99767 13.9998C3.88092 13.9994 3.76633 13.9683 3.66535 13.9098C3.56437 13.8512 3.48055 13.7671 3.42226 13.6659C3.36398 13.5648 3.33329 13.4501 3.33325 13.3333V3.33333C3.33325 2.97971 3.47373 2.64057 3.72378 2.39052C3.97382 2.14048 4.31296 2 4.66659 2H11.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  // Shared fields panel (input-wrapper + checkbox)
  const FieldsPanel = () => (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex flex-col gap-1 w-full">
        <div className="h-6 flex items-center">
          <span className="flex-1 text-[14px] font-bold leading-5 text-[#3f3f46]">Template name</span>
        </div>
        <div className="h-10 w-full bg-white border border-[#a1a1aa] rounded-[4px] flex items-center px-3">
          <input
            autoFocus
            type="text"
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
            className="flex-1 text-[14px] font-normal leading-[1.5] text-[#3f3f46] bg-transparent outline-none"
          />
        </div>
      </div>
      <div className="flex items-start gap-1 w-full">
        <div className="flex flex-col flex-1">
          <span className="text-sm font-bold text-[#364153] pt-[11px]">Visible to all users</span>
          <p className="text-xs leading-4 text-[#4a5565]">Other users can see and load this template.</p>
        </div>
        <CheckboxPrimitive checked={visibleToAll} onChange={() => setVisibleToAll(v => !v)} />
      </div>
    </div>
  )

  return (
    <div className="relative w-fit" ref={ref}>
      {/* Chip trigger */}
      <div
        className="bg-white ring-1 ring-[#cad5e2] flex gap-1 items-center px-2 py-0.5 rounded cursor-pointer"
        onClick={handleOpen}
      >
        <BookmarkIcon />
        <span className="text-sm font-semibold whitespace-nowrap" style={{ color: selected ? '#1d2f5d' : '#62748e' }}>
          {selected ? selectedName : 'No template'}
        </span>
      </div>

      {open && mode === 'dropdown' && (
        <div className="absolute right-0 top-full mt-1 z-[9999] w-[220px] rounded-[4px] border border-[#d1d5dc] bg-white shadow-lg py-1">
          {templates.map(t => (
            <button key={t.name} className="w-full text-left px-3 py-1.5 text-sm text-[#364153] hover:bg-gray-50 flex items-center gap-2" onClick={() => handleSelect(t)}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 text-gray-400">
                <path d="M11.3333 2C11.6869 2 12.026 2.14048 12.2761 2.39052C12.5261 2.64057 12.6666 2.97971 12.6666 3.33333V13.3333C12.6665 13.4501 12.6359 13.5648 12.5776 13.6659C12.5193 13.7671 12.4355 13.8512 12.3345 13.9098C12.2335 13.9683 12.1189 13.9994 12.0022 13.9998C11.8854 14.0002 11.7706 13.9699 11.6693 13.912L8.66125 11.1933C8.45983 11.0783 8.23188 11.0178 7.99992 11.0178C7.76795 11.0178 7.54 11.0783 7.33859 11.1933L4.33059 13.912C4.22921 13.9699 4.11441 14.0002 3.99767 13.9998C3.88092 13.9994 3.76633 13.9683 3.66535 13.9098C3.56437 13.8512 3.48055 13.7671 3.42226 13.6659C3.36398 13.5648 3.33329 13.4501 3.33325 13.3333V3.33333C3.33325 2.97971 3.47373 2.64057 3.72378 2.39052C3.97382 2.14048 4.31296 2 4.66659 2H11.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t.name}
            </button>
          ))}
          {filtersActive && (
            <>
              <div className="my-1 border-t border-[#e5e7eb]" />
              {selected && (
                <button className="w-full text-left px-3 py-1.5 text-sm text-[#364153] hover:bg-gray-50" onClick={openEdit}>
                  Edit template
                </button>
              )}
              <button className="w-full text-left px-3 py-1.5 text-sm text-[#364153] hover:bg-gray-50" onClick={() => { setTemplateName(''); setVisibleToAll(false); setMode('create') }}>
                Save as new template
              </button>
            </>
          )}
        </div>
      )}

      {open && mode === 'create' && (
        <div className="absolute right-0 top-full mt-1 z-[9999] rounded-[4px] border border-[#e5e7eb] bg-white overflow-hidden min-w-[320px]">
          <FieldsPanel />
          <div className="flex justify-end px-4 py-3">
            <button className="h-8 w-[80px] min-w-[80px] px-2 py-1 rounded-[4px] bg-[#1d2f5d] text-[14px] text-white hover:bg-[#162449] transition-colors" onClick={handleCreate}>
              Save
            </button>
          </div>
        </div>
      )}

      {open && mode === 'edit' && (
        <div className="absolute right-0 top-full mt-1 z-[9999] rounded-[4px] border border-[#e5e7eb] bg-white overflow-hidden min-w-[320px]">
          <FieldsPanel />
          <div className="flex items-center gap-3 px-4 py-3">
            {/* Delete — left-aligned, red line reveals on hover */}
            <button className="group py-[6px] text-[14px] text-[#e7000b] shrink-0 cursor-pointer inline-flex flex-col items-start w-fit" onClick={handleDelete}>
              <span>Delete</span>
              <span className="block h-px w-full bg-[#e7000b] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            {/* Right-side actions */}
            <div className="flex gap-3 items-center justify-end flex-1">
              <button
                className="h-8 w-[80px] min-w-[80px] px-2 py-1 rounded-[4px] bg-[#1d2f5d] text-[14px] text-white hover:bg-[#162449] transition-colors cursor-pointer"
                onClick={handleEditSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const CHIP_COLORS = {
  default: {
    bgInactive: '#f0f9ff', bgInactiveHover: '#dff2fe', textInactive: '#00598a',
    bgActive:   '#b8e6fe', bgActiveHover:   '#74d4ff', textActive:   '#024a70',
  },
  load: {
    bgInactive: '#f3f4f6', bgInactiveHover: '#e5e7eb', textInactive: '#45556c',
    bgActive:   '#1d2f5d', bgActiveHover:   '#162449', textActive:   '#ffffff',
  },
}

function CheckboxPrimitive({ checked = false, onChange }) {
  const [hover, setHover] = useState(false)
  const boxClass = checked
    ? `bg-[#0084d1] border-2 border-[#0084d1] rounded-[2px] overflow-hidden relative size-[22px] shrink-0${hover ? ' shadow-[0px_0px_0px_4px_#dff2fe]' : ''}`
    : `bg-${hover ? '[#dff2fe]' : 'white'} border-2 border-[#99a1af] rounded-[2px] overflow-hidden size-[22px] shrink-0${hover ? ' shadow-[0px_0px_0px_4px_#dff2fe]' : ''}`
  return (
    <div
      className="p-[10px] cursor-pointer"
      onClick={onChange}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={boxClass}>
        {checked && (
          <svg className="absolute -left-[2px] -top-[2px] size-[24px]" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </div>
  )
}

function LoadButton({ onClick, active }) {
  const c = CHIP_COLORS.load
  const [hover, setHover] = useState(false)
  const bg    = active ? (hover ? c.bgActiveHover   : c.bgActive)   : (hover ? c.bgInactiveHover : c.bgInactive)
  const color = active ? c.textActive : c.textInactive
  return (
    <button
      onClick={onClick}
      className="flex items-center rounded-2xl text-sm font-semibold whitespace-nowrap transition-colors"
      style={{ backgroundColor: bg, color, paddingLeft: 12, paddingRight: 12, paddingTop: 2, paddingBottom: 2 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      Load
    </button>
  )
}

function AddChip({ options = [], onAdd }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (options.length === 0) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-center rounded-full px-3 py-1 cursor-pointer transition-colors bg-sky-50 hover:bg-sky-200 text-sky-800"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3.33325 7.99999H12.6666M7.99992 3.33333V12.6667" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-[9999] bg-white border border-[#d1d5dc] rounded shadow-lg py-1 min-w-[140px]">
          {options.map(opt => (
            <button
              key={opt.field}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 cursor-pointer"
              style={{ color: '#364153' }}
              onClick={() => { onAdd(opt.field); setOpen(false) }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const OPERATORS = [
  { label: 'Greater than',             symbol: '>' },
  { label: 'Less than',                symbol: '<' },
  { label: 'Equal to',                 symbol: '=' },
  { label: 'Greater than or equal to', symbol: '≥' },
  { label: 'Less than or equal to',    symbol: '≤' },
]

const CRITERIA_COLUMNS = [
  { label: 'All',                    key: 'all',            fields: ['ageBal0', 'ageBal1', 'ageBal2', 'ageBal3', 'ageBal4Plus', 'unapplied', 'balance'] },
  { label: 'Any Bucket',             key: 'anyBucket',      fields: ['ageBal0', 'ageBal1', 'ageBal2', 'ageBal3', 'ageBal4Plus'] },
  { divider: true },
  { label: 'Current',       key: 'current',        fields: ['ageBal0'] },
  { label: 'Aging 1+ (Past due)',    key: 'aging1Plus',     fields: ['ageBal1', 'ageBal2', 'ageBal3', 'ageBal4Plus'] },
  { label: 'Aging 2+ (30+ days)',    key: 'aging2Plus',     fields: ['ageBal2', 'ageBal3', 'ageBal4Plus'] },
  { label: 'Aging 3+ (60+ days)',    key: 'aging3Plus',     fields: ['ageBal3', 'ageBal4Plus'] },
  { label: 'Aging 4+ (90+ days)',    key: 'aging4Plus',     fields: ['ageBal4Plus'] },
  { divider: true },
  { label: 'Unapplied',              key: 'unapplied',      fields: ['unapplied'] },
  { label: 'Account Balance',        key: 'accountBalance', fields: ['balance'] },
]

function CriteriaChip({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [columnOpen, setColumnOpen] = useState(false)
  const [operatorOpen, setOperatorOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const ref = useRef(null)

  const { column, operator, value: amount } = value
  const isActive = !!(column && operator && amount)
  const colors = CHIP_COLORS.default
  const bgDefault = isActive ? colors.bgActive : colors.bgInactive
  const bgHover   = isActive ? colors.bgActiveHover : colors.bgInactiveHover
  const textColor = isActive ? colors.textActive : colors.textInactive
  const bg = hovered || (open && !isActive) ? bgHover : bgDefault

  const colDef = CRITERIA_COLUMNS.find(c => c.key === column)
  const fmt = v => '$' + Number(v).toLocaleString()
  const chipLabel = isActive ? `${colDef?.label ?? column}: ${operator} ${fmt(amount)}` : 'Criteria'

  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false); setColumnOpen(false); setOperatorOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const clear = e => {
    e.stopPropagation()
    onChange({ ...value, value: '' })
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-[6px] rounded-2xl text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer"
        style={{ backgroundColor: bg, color: textColor, paddingLeft: 12, paddingRight: isActive ? 6 : 12, paddingTop: 2, paddingBottom: 2 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {chipLabel}
        {isActive && (
          <span onClick={clear} className="flex items-center justify-center w-5 h-5 shrink-0">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-[#d1d5dc] rounded shadow-lg z-[9999] p-3 flex flex-col gap-2" style={{ minWidth: 240 }}>
          {/* Column selector */}
          <div className="relative">
            <button
              className="w-full flex items-center justify-between px-3 py-1.5 border rounded text-sm bg-white hover:bg-gray-50 cursor-pointer"
              style={{ borderColor: '#d1d5dc', color: colDef ? '#364153' : '#99a1af' }}
              onClick={() => { setColumnOpen(v => !v); setOperatorOpen(false) }}
            >
              <span>{colDef?.label || 'Select column'}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="#99a1af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {columnOpen && (
              <div className="absolute left-0 top-full mt-0.5 w-full bg-white border border-[#d1d5dc] rounded shadow-lg z-[10000] py-1">
                {CRITERIA_COLUMNS.map((col, i) =>
                  col.divider
                    ? <hr key={i} className="my-1 border-[#e5e7eb]" />
                    : <button key={col.key} className="w-full text-left px-3 py-1.5 text-sm text-[#364153] hover:bg-gray-50 cursor-pointer"
                        onClick={() => { onChange({ ...value, column: col.key }); setColumnOpen(false) }}>
                        {col.label}
                      </button>
                )}
              </div>
            )}
          </div>
          {/* Operator */}
          <div className="relative">
            <button
              className="w-full flex items-center justify-between px-3 py-1.5 border rounded text-sm bg-white hover:bg-gray-50 cursor-pointer"
              style={{ borderColor: '#d1d5dc', color: operator ? '#364153' : '#99a1af' }}
              onClick={() => { setOperatorOpen(v => !v); setColumnOpen(false) }}
            >
              <span>{operator || 'Select operator'}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="#99a1af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {operatorOpen && (
              <div className="absolute left-0 top-full mt-0.5 w-full bg-white border border-[#d1d5dc] rounded shadow-lg z-[10001] py-1">
                {OPERATORS.map(o => (
                  <button key={o.label} className="w-full text-left px-3 py-1.5 text-sm text-[#364153] hover:bg-gray-50 cursor-pointer"
                    onClick={() => { onChange({ ...value, operator: o.label }); setOperatorOpen(false) }}>
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Dollar value */}
          <div className="flex items-center border rounded overflow-hidden" style={{ borderColor: '#d1d5dc' }}>
            <span className="px-2.5 py-1.5 text-sm font-semibold bg-gray-50 border-r select-none" style={{ borderColor: '#d1d5dc', color: '#364153' }}>$</span>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={amount}
              onChange={e => onChange({ ...value, value: e.target.value })}
              className="flex-1 px-2.5 py-1.5 text-sm text-[#364153] outline-none bg-white w-full"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function FilterChip({ label, values, variant = 'default', value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const colors = CHIP_COLORS[variant]
  const selected = value ?? new Set()

  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const isActive = selected.size > 0
  const chipLabel = selected.size === 1 ? `${label}: ${[...selected][0]}` : selected.size > 1 ? `${label} (${selected.size})` : label

  const toggleValue = val => {
    const next = new Set(selected)
    next.has(val) ? next.delete(val) : next.add(val)
    onChange?.(next)
  }

  const clear = e => {
    e.stopPropagation()
    onChange?.(new Set())
    setOpen(false)
  }

  const bgDefault = isActive ? colors.bgActive   : colors.bgInactive
  const bgHover   = isActive ? colors.bgActiveHover : colors.bgInactiveHover
  const textColor = isActive ? colors.textActive  : colors.textInactive
  const bgCurrent = open && !isActive ? bgHover : bgDefault

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-[6px] rounded-2xl text-sm font-semibold whitespace-nowrap transition-colors"
        style={{ backgroundColor: bgCurrent, color: textColor, paddingLeft: 12, paddingRight: isActive ? 6 : 12, paddingTop: 2, paddingBottom: 2 }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = bgHover}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = bgCurrent}
      >
        {chipLabel}
        {isActive && (
          <span onClick={clear} className="flex items-center justify-center w-5 h-5 shrink-0">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-[#d1d5dc] rounded shadow-lg z-[9999] py-1 min-w-[160px]">
          {values.map(val => (
            <label key={val} className="flex items-start gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm text-[#364153]">
              <input
                type="checkbox"
                checked={selected.has(val)}
                onChange={() => toggleValue(val)}
                className="accent-[#0069a8] mt-0.5 shrink-0"
              />
              {val}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}


const MONEY_FIELDS = new Set(['ageBal0', 'ageBal1', 'ageBal2', 'ageBal3', 'ageBal4Plus', 'unapplied', 'balance'])
function fmtMoney(v) {
  if (v == null) return ''
  return Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const ALL_COLUMNS = [
  { field: 'customerName', title: 'Customer Name', width: 200 },
  { field: 'customerId',   title: 'Customer ID',   width: 140 },
  { field: 'status',       title: 'Status',        width: 100 },
  { field: 'finance',      title: 'Finance',       width: 100 },
  { field: 'class',        title: 'Class',         width: 140 },
  { field: 'billingCycle', title: 'Billing cycle', width: 140 },
  { field: 'delivery',    title: 'Delivery',       width: 180 },
  { field: 'ageBal0',      title: 'AgeBal0',       width: 110 },
  { field: 'ageBal1',      title: 'AgeBal1',       width: 110 },
  { field: 'ageBal2',      title: 'AgeBal2',       width: 110 },
  { field: 'ageBal3',      title: 'AgeBal3',       width: 110 },
  { field: 'ageBal4Plus',  title: 'AgeBal4+',      width: 130 },
  { field: 'unapplied',    title: 'Unapplied',     width: 120 },
  { field: 'balance',      title: 'Balance',       width: 120 },
]

function sortRows(rows, sort) {
  if (!sort || sort.length === 0) return rows
  return [...rows].sort((a, b) => {
    for (const { field, dir } of sort) {
      const av = a[field] ?? ''
      const bv = b[field] ?? ''
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv))
      if (cmp !== 0) return dir === 'asc' ? cmp : -cmp
    }
    return 0
  })
}

function ActivityHistoryTable({ loadedData, isLoading }) {
  const [sort, setSort] = useState([])
  const [search, setSearch] = useState('')
  const [visibleCols, setVisibleCols] = useState(() => new Set(ALL_COLUMNS.map(c => c.field)))
  const [showChooser, setShowChooser] = useState(false)
  const [columnFilters, setColumnFilters] = useState({}) // { [field]: Set<excluded display values> } — empty/absent = all shown
  const [activeFilter, setActiveFilter] = useState(null)
  const chooserRef = useRef(null)
  const filterRef = useRef(null)
  const hasColFilters = Object.values(columnFilters).some(s => s && s.size > 0)

  // Close chooser on outside click
  useEffect(() => {
    if (!showChooser) return
    function handler(e) {
      if (chooserRef.current && !chooserRef.current.contains(e.target)) setShowChooser(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showChooser])

  // Close column filter popover on outside click
  useEffect(() => {
    if (!activeFilter) return
    function handler(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) setActiveFilter(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [activeFilter])

  function toggleSort(field) {
    setSort(prev => {
      const existing = prev.find(s => s.field === field)
      if (!existing) return [{ field, dir: 'asc' }]
      if (existing.dir === 'asc') return [{ field, dir: 'desc' }]
      return []
    })
  }

  function toggleFilter(field) {
    setActiveFilter(prev => prev === field ? null : field)
  }

  // Toggle a single value's exclusion
  function toggleColValue(field, displayVal) {
    setColumnFilters(prev => {
      const excluded = new Set(prev[field] ?? [])
      excluded.has(displayVal) ? excluded.delete(displayVal) : excluded.add(displayVal)
      if (excluded.size === 0) { const n = { ...prev }; delete n[field]; return n }
      return { ...prev, [field]: excluded }
    })
  }

  // "All" checkbox: unchecking excludes everything, checking clears all exclusions
  function toggleAllColValues(field, allVals) {
    setColumnFilters(prev => {
      const excluded = prev[field]
      const allExcluded = excluded && excluded.size === allVals.length
      if (allExcluded) {
        // Re-check all → clear exclusions
        const n = { ...prev }; delete n[field]; return n
      } else {
        // Uncheck all → exclude everything
        return { ...prev, [field]: new Set(allVals) }
      }
    })
  }

  function clearColFilter(field) {
    setColumnFilters(prev => { const n = { ...prev }; delete n[field]; return n })
    setActiveFilter(null)
  }

  // Global search
  const baseRows = loadedData ?? []
  const searched = search
    ? baseRows.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(search.toLowerCase())))
    : baseRows

  // Per-column filters: exclude rows whose display value is in the excluded set
  const colFiltered = Object.entries(columnFilters).reduce((rows, [field, excluded]) => {
    if (!excluded || excluded.size === 0) return rows
    return rows.filter(row => {
      const display = MONEY_FIELDS.has(field) ? fmtMoney(row[field]) : String(row[field] ?? '')
      return !excluded.has(display)
    })
  }, searched)

  const sorted = sortRows(colFiltered, sort)
  const cols = ALL_COLUMNS.filter(c => visibleCols.has(c.field))

  return (
    <div className="flex flex-col gap-[11px] items-end w-full">
      <div
        className="w-full relative border border-[#d1d5dc] rounded flex flex-col"
        style={{ fontFamily: "'Nunito Sans', sans-serif", minHeight: loadedData !== null ? 'calc(100vh - 164px)' : undefined }}
      >

        {/* Grouping zone bar — visual only, dead/inactive */}
        <div className="bg-gray-100 border-b border-[#d1d5dc] px-3.5 py-3.5" style={{ paddingRight: 320 }}>
          <div className="border border-dashed border-[#99a1af] rounded-sm px-3 py-2 inline-flex items-center min-w-0">
            <span className="text-xs text-[#364153] whitespace-nowrap">Drag and drop columns here to group the results</span>
          </div>
        </div>

        {/* Search + column chooser — absolutely overlaid on the right of the grouping header */}
        <div className="absolute top-0 right-0 flex items-center gap-3 p-[10px] z-10" ref={chooserRef}>
          <div className="bg-white border border-[#858fa2] rounded flex items-center gap-[10px] px-2 py-[6px] w-[250px]">
            <SearchIcon16 className="text-[#858fa2] shrink-0" />
            <input
              className="flex-1 text-sm text-[#364153] outline-none placeholder-[#858fa2] bg-transparent"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <button
              className="bg-white border border-[#858fa2] rounded flex items-center px-2 py-[6px]"
              onClick={() => setShowChooser(v => !v)}
            >
              <ColumnsCogIcon />
            </button>
            {showChooser && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-[#d1d5dc] rounded shadow-lg z-[9999] py-1 min-w-[180px]">
                {ALL_COLUMNS.map(col => (
                  <label key={col.field} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm text-[#364153]">
                    <input
                      type="checkbox"
                      checked={visibleCols.has(col.field)}
                      onChange={() => setVisibleCols(prev => {
                        const next = new Set(prev)
                        next.has(col.field) ? next.delete(col.field) : next.add(col.field)
                        return next
                      })}
                      className="accent-[#1d2f5d]"
                    />
                    {col.title}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full border-collapse text-sm text-[#364153]">
            <thead>
              <tr className="border-b border-[#d1d5dc] bg-white">
                {cols.map(col => {
                  const s = sort.find(s => s.field === col.field)
                  const isMoney = MONEY_FIELDS.has(col.field)
                  const filterVal = columnFilters[col.field] ?? ''
                  const filterActive = !!filterVal
                  const filterOpen = activeFilter === col.field
                  return (
                    <th
                      key={col.field}
                      style={{ minWidth: col.width, width: col.width, position: 'relative' }}
                      className={`px-3 py-2.5 font-semibold text-xs text-[#364153] whitespace-nowrap select-none${isMoney ? ' text-right' : ' text-left'}`}
                    >
                      <span className={`inline-flex items-center gap-1${isMoney ? ' justify-end' : ''}`}>
                        {/* Sort — clicking title area only */}
                        <span className="cursor-pointer hover:text-[#1d2f5d] inline-flex items-center gap-1" onClick={() => toggleSort(col.field)}>
                          {col.title}
                          {s ? (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                              {s.dir === 'asc'
                                ? <path d="M6 9V3M3 6l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                : <path d="M6 3v6M3 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />}
                            </svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 text-[#99a1af]">
                              <path d="M6 7.5V1.5M3 4.5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
                              <path d="M6 4.5v6M3 7.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
                            </svg>
                          )}
                        </span>
                        {/* Filter funnel */}
                        <button
                          onClick={e => { e.stopPropagation(); toggleFilter(col.field) }}
                          className="shrink-0 flex items-center justify-center w-5 h-5 rounded cursor-pointer transition-colors"
                          style={{ backgroundColor: filterOpen ? '#e5e7eb' : 'transparent' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                            <path
                              d="M8.33336 16.6667C8.33329 16.8215 8.37637 16.9733 8.45777 17.1051C8.53917 17.2368 8.65566 17.3433 8.79419 17.4125L10.4609 18.2458C10.5879 18.3093 10.7291 18.3393 10.8711 18.3329C11.013 18.3264 11.1509 18.2838 11.2717 18.2091C11.3925 18.1344 11.4922 18.03 11.5614 17.9059C11.6305 17.7818 11.6668 17.6421 11.6667 17.5V11.6667C11.6669 11.2537 11.8204 10.8554 12.0975 10.5492L18.1167 3.89167C18.2246 3.77213 18.2955 3.6239 18.3209 3.4649C18.3464 3.3059 18.3252 3.14294 18.2599 2.99573C18.1947 2.84851 18.0882 2.72335 17.9534 2.63538C17.8185 2.5474 17.661 2.50038 17.5 2.5H2.50003C2.33886 2.50006 2.18118 2.54685 2.04607 2.6347C1.91096 2.72255 1.80422 2.84769 1.73878 2.99497C1.67334 3.14225 1.65201 3.30534 1.67738 3.46449C1.70274 3.62364 1.77371 3.77203 1.88169 3.89167L7.90252 10.5492C8.17964 10.8554 8.33317 11.2537 8.33336 11.6667V16.6667Z"
                              fill={filterActive ? '#0ea5e9' : 'none'}
                              stroke={filterActive ? '#0ea5e9' : '#6A7282'}
                              strokeWidth="1.25"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </span>

                      {/* Filter popover */}
                      {filterOpen && (() => {
                        const uniqueVals = [...new Set(
                          baseRows.map(row => MONEY_FIELDS.has(col.field) ? fmtMoney(row[col.field]) : String(row[col.field] ?? ''))
                        )].sort()
                        const excluded = columnFilters[col.field] ?? new Set()
                        const allChecked = excluded.size === 0
                        return (
                          <div
                            ref={filterRef}
                            className="absolute top-full mt-0.5 bg-white border border-[#d1d5dc] rounded shadow-lg z-[200] py-1 font-normal"
                            style={{ [isMoney ? 'right' : 'left']: 0, minWidth: 180, maxHeight: 260, overflowY: 'auto' }}
                            onClick={e => e.stopPropagation()}
                          >
                            {/* All checkbox */}
                            <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-xs text-[#364153]">
                              <input
                                type="checkbox"
                                checked={allChecked}
                                onChange={() => toggleAllColValues(col.field, uniqueVals)}
                                className="accent-[#0ea5e9]"
                              />
                              All
                            </label>
                            <div className="my-1 border-t border-[#e5e7eb]" />
                            {uniqueVals.map(val => (
                              <label key={val} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-xs text-[#364153]">
                                <input
                                  type="checkbox"
                                  checked={!excluded.has(val)}
                                  onChange={() => toggleColValue(col.field, val)}
                                  className="accent-[#0ea5e9]"
                                />
                                {val}
                              </label>
                            ))}
                          </div>
                        )
                      })()}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => (
                <tr key={i} className="border-b border-[#f3f4f6] hover:bg-gray-50">
                  {cols.map(col => (
                    <td
                      key={col.field}
                      style={{ minWidth: col.width, width: col.width }}
                      className={`px-3 py-2.5 whitespace-nowrap${MONEY_FIELDS.has(col.field) ? ' text-right tabular-nums' : ''}`}
                    >
                      {MONEY_FIELDS.has(col.field) ? fmtMoney(row[col.field]) : row[col.field]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sorted.length === 0 && (
          <div className="py-8 text-center text-sm text-[#62748e]">
            {loadedData === null
              ? 'Choose at least one filter then click Load.'
              : hasColFilters || search
                ? 'No results match the current filters.'
                : 'No results match your search.'}
          </div>
        )}

        {loadedData !== null && !isLoading && (
          <div className="px-4 py-2.5 border-t border-[#e5e7eb] text-xs text-[#62748e]">
            {hasColFilters || search
              ? `Showing ${sorted.length} of ${loadedData.length} results`
              : `Showing ${sorted.length} results`}
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/75 z-20 pointer-events-none">
            <span className="flex items-center gap-2 text-sm text-[#62748e]">
              <svg className="animate-spin shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#cad5e2" strokeWidth="2.5" />
                <path d="M12 3a9 9 0 019 9" stroke="#1d2f5d" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              Loading…
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function SearchIcon16({ className = '' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function FunnelIcon({ className = '' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M2 3h12l-4.5 5.5V13l-3-1.5V8.5L2 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ColumnsCogIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#858fa2]">
      <path d="M3 4h14M3 8h9M3 12h6M3 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="15" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 11.5V12M15 16v.5M17.5 14h-.5M13 14h-.5M16.77 12.23l-.35.35M13.58 15.42l-.35.35M16.77 15.77l-.35-.35M13.58 12.58l-.35-.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6.5V10l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ElementsLogo() {
  return (
    <div className="flex items-center gap-2.5">
      {/* Mark: green lightning-bolt style icon */}

      <span className="font-bold text-base tracking-wide text-white">Elements</span>
    </div>
  )
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ClipboardListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="8" y="2" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TruckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function BarChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
