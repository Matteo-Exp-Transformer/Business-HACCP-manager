# ANALISI STYLING - COLLAPSIBLECARD "ELENCO STAFF COMPLETO"
## Tab 5 "Gestione AI" - HACCP Business Manager

---

## 1. BORDO E OMBRA DISTINTIVI

### Bordo Principale
```css
border-2 border-blue-300
```
- **Spessore**: 2px (border-2)
- **Colore**: Blue-300 (#93c5fd)
- **Stile**: Solido
- **Effetto**: Bordo spesso e distintivo per evidenziare l'importanza della sezione

### Ombra Base
```css
shadow-lg hover:shadow-xl
```
- **Ombra Base**: `shadow-lg` - Ombra pronunciata per profondità
- **Ombra Hover**: `shadow-xl` - Ombra più intensa al passaggio del mouse
- **Transizione**: `transition-all duration-200` - Animazione smooth di 200ms

### Bordi Interni
```css
border-b border-blue-100
```
- **Header**: Bordo inferiore blu chiaro per separazione visiva
- **Colore**: Blue-100 (#dbeafe)
- **Posizione**: Solo nella parte inferiore dell'header

---

## 2. HEADER CON INDICATORI VISIVI CHIARI

### Struttura Header
```jsx
<CardHeader className="cursor-pointer hover:bg-blue-50 transition-all duration-200 border-b border-blue-100">
```

### Layout Flex
```css
flex items-center justify-between
```
- **Allineamento**: Centrato verticalmente
- **Distribuzione**: Spazio tra elementi (icona+testo a sinistra, contatore+chevron a destra)

### Area Cliccabile
```css
cursor-pointer hover:bg-blue-50
```
- **Cursore**: Pointer per indicare interattività
- **Hover**: Sfondo blu chiaro (bg-blue-50) al passaggio del mouse
- **Transizione**: Smooth di 200ms

### Testo Header
```css
font-semibold text-gray-900
```
- **Titolo**: Peso semibold, colore grigio scuro
- **Sottotitolo**: `text-sm text-gray-600` - Dimensione ridotta, grigio medio

---

## 3. ICONA E COLORI COORDINATI

### Icona Container
```css
p-3 rounded-xl bg-blue-100 shadow-sm
```
- **Padding**: 12px (p-3)
- **Bordi**: Arrotondati (rounded-xl)
- **Sfondo**: Blue-100 (#dbeafe)
- **Ombra**: Leggera (shadow-sm)

### Icona Staff
```css
h-6 w-6 text-blue-600
```
- **Dimensione**: 24x24px
- **Colore**: Blue-600 (#2563eb)
- **Icona**: `Users` da Lucide React

### Schema Colori Coordinato
- **Primario**: Blue-600 (#2563eb)
- **Secondario**: Blue-100 (#dbeafe)
- **Accent**: Blue-300 (#93c5fd)
- **Testo**: Gray-900 (#111827) / Gray-600 (#4b5563)

---

## 4. CONTATORE CON STILE DISTINTIVO

### Badge Contatore
```css
bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-sm
```

### Caratteristiche Stile
- **Sfondo**: Blue-500 (#3b82f6) - Blu intenso
- **Testo**: Bianco, dimensione small, peso bold
- **Padding**: 12px orizzontale, 4px verticale
- **Forma**: Pill (rounded-full)
- **Ombra**: Leggera (shadow-sm)
- **Visibilità**: Solo quando count > 0

### Posizionamento
- **Posizione**: Estrema destra dell'header
- **Allineamento**: Centrato verticalmente
- **Spacing**: Gap di 8px dal chevron

---

## 5. CHEVRON CON ANIMAZIONE

### Icona Chevron
```css
h-5 w-5 text-blue-600 transition-transform duration-200
```
- **Dimensione**: 20x20px
- **Colore**: Blue-600 (#2563eb)
- **Icona**: `ChevronDown` da Lucide React

### Animazione Rotazione
```css
${isExpanded ? 'rotate-180' : ''}
```
- **Stato Chiuso**: Rotazione 0° (chevron verso il basso)
- **Stato Aperto**: Rotazione 180° (chevron verso l'alto)
- **Durata**: 200ms
- **Easing**: Default CSS (smooth)

### Comportamento
- **Iniziale**: Sempre verso il basso
- **Click**: Rotazione smooth di 180°
- **Feedback**: Indicazione visiva chiara dello stato

---

## 6. CONTENUTO CON ANIMAZIONE SMOOTH

### Container Contenuto
```css
pt-0 animate-in slide-in-from-top-2 fade-in-50 duration-300
```

### Animazioni di Entrata
- **Slide**: `slide-in-from-top-2` - Scorrimento dall'alto (8px)
- **Fade**: `fade-in-50` - Dissolvenza con opacità al 50%
- **Durata**: 300ms
- **Direzione**: Dall'alto verso il basso

### Effetti Visivi
```css
transition-all duration-200
```
- **Applicato**: A tutto il componente per transizioni smooth
- **Durata**: 200ms per hover e interazioni
- **Proprietà**: Tutte le proprietà CSS

### Contenuto Staff List
```css
space-y-4
```
- **Spacing**: Gap verticale di 16px tra elementi
- **Layout**: Stack verticale per lista staff

### Card Singolo Staff
```css
border-l-4 border-l-blue-500
```
- **Accent**: Bordo sinistro blu di 4px
- **Identificazione**: Distinzione visiva per ogni membro staff

---

## IMPLEMENTAZIONE COMPLETA

### Componente CollapsibleCard
```jsx
<CollapsibleCard
  title="Elenco Staff Completo"
  subtitle="Gestione personale e certificazioni"
  icon={Users}
  iconColor="text-blue-600"
  iconBgColor="bg-blue-100"
  count={staffStats.total}
  testId="staff-list"
  defaultExpanded={true}
>
```

### Classi CSS Applicate
```css
/* Container principale */
border-2 border-blue-300 shadow-lg hover:shadow-xl transition-all duration-200 bg-white

/* Header */
cursor-pointer hover:bg-blue-50 transition-all duration-200 border-b border-blue-100

/* Icona */
p-3 rounded-xl bg-blue-100 shadow-sm
h-6 w-6 text-blue-600

/* Contatore */
bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-sm

/* Chevron */
h-5 w-5 text-blue-600 transition-transform duration-200
${isExpanded ? 'rotate-180' : ''}

/* Contenuto */
pt-0 animate-in slide-in-from-top-2 fade-in-50 duration-300
```

---

## CARATTERISTICHE DISTINTIVE

### Design System Coerente
- **Palette**: Blu come colore primario con sfumature coordinate
- **Tipografia**: Gerarchia chiara con font-semibold per titoli
- **Spacing**: Sistema consistente con Tailwind (space-y-4, p-3, etc.)

### Interattività Avanzata
- **Hover States**: Feedback visivo su tutti gli elementi interattivi
- **Transizioni**: Smooth animations per tutte le interazioni
- **Accessibilità**: Cursori pointer e stati focus appropriati

### Performance Ottimizzata
- **Lazy Loading**: Contenuto renderizzato solo quando espanso
- **Animazioni CSS**: Hardware-accelerated con transform e opacity
- **Durata Ottimizzata**: 200-300ms per percezione naturale

---

*Analisi completa del componente CollapsibleCard per "Elenco Staff Completo" nella tab 5 "Gestione AI" dell'applicazione HACCP Business Manager.*
