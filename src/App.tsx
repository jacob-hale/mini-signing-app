import { Header } from './components/Header'
import { DocumentList } from './components/DocumentList'
import { DocumentEditorPage } from './pages/DocumentEditorPage'
import { TemplatesPage } from './pages/TemplatesPage'
import { AppStateProvider, useAppState } from './state/AppState'
import './App.css'

function AppRoutes() {
  const { view } = useAppState()

  if (view.name === 'editor') {
    return <DocumentEditorPage documentId={view.documentId} />
  }
  if (view.name === 'templates') {
    return <TemplatesPage />
  }
  return <DocumentList />
}

export default function App() {
  return (
    <AppStateProvider>
      <div className="app-shell">
        <Header />
        <main className="app-main">
          <AppRoutes />
        </main>
      </div>
    </AppStateProvider>
  )
}
